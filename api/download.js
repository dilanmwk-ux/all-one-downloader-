import { checkLimit } from './_limit.js';

export const config = { runtime: 'edge' };

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const EXT = {
  'video/mp4': 'mp4', 'video/webm': 'webm', 'video/quicktime': 'mov',
  'audio/mpeg': 'mp3', 'audio/mp3': 'mp3', 'audio/mp4': 'm4a', 'audio/x-m4a': 'm4a', 'audio/aac': 'aac',
  'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif',
  'application/zip': 'zip', 'application/pdf': 'pdf',
  'application/vnd.android.package-archive': 'apk'
};

// Tolak alamat IP dan host internal (cegah SSRF)
function isAllowed(u) {
  const h = u.hostname.toLowerCase();
  if (!/^https?:$/.test(u.protocol) || u.username || u.password || u.port) return false;
  if (!h.includes('.') || h.startsWith('[')) return false;
  if (/^[\d.]+$/.test(h)) return false;
  if (/(^|\.)(localhost|local|internal)\.?$/.test(h)) return false;
  return true;
}

function fail(status, message, target) {
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const open = target ? `<p><a href="${esc(target)}" rel="noreferrer">Buka link asli</a></p>` : '';
  return new Response(
    `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><body style="font-family:sans-serif;padding:24px"><h3>Download gagal</h3><p>${esc(message)}</p>${open}<p><a href="/">Kembali</a></p>`,
    { status, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } }
  );
}

export default async function handler(req) {
  if (req.method !== 'GET') return fail(405, 'Metode tidak diizinkan.');
  // Jangan biarkan situs lain menumpang bandwidth proxy ini
  if (req.headers.get('sec-fetch-site') === 'cross-site') return fail(403, 'Akses dari situs lain ditolak.');

  // Batas 60 request per menit per IP (pemutar video juga bisa memakai jalur ini)
  const ip = (req.headers.get('x-real-ip') || req.headers.get('x-forwarded-for') || 'unknown').split(',')[0].trim();
  const limit = await checkLimit('download', ip, 60);
  if (!limit.ok) return fail(429, `Terlalu banyak permintaan. Coba lagi dalam ${limit.retryAfter} detik.`);

  const params = new URL(req.url).searchParams;
  let target;
  try { target = new URL(params.get('url')); } catch { return fail(400, 'URL tidak valid.'); }

  const abort = new AbortController();
  const timer = setTimeout(() => abort.abort(), 20000); // hanya untuk menunggu header
  try {
    let upstream;
    for (let hop = 0; ; hop++) {
      if (!isAllowed(target)) return fail(403, 'Alamat file tidak diizinkan.');
      upstream = await fetch(target.href, {
        headers: { 'User-Agent': UA, Accept: '*/*', 'Accept-Encoding': 'identity' },
        redirect: 'manual',
        signal: abort.signal
      });
      const location = upstream.headers.get('location');
      if (upstream.status < 300 || upstream.status >= 400 || !location) break;
      if (hop >= 5) return fail(502, 'Terlalu banyak pengalihan.', target.href);
      target = new URL(location, target);
    }
    clearTimeout(timer);

    if (!upstream.ok) return fail(502, `Server file menjawab HTTP ${upstream.status}. Link mungkin sudah kedaluwarsa, proses ulang tautannya.`, target.href);

    const type = (upstream.headers.get('content-type') || 'application/octet-stream').split(';')[0].trim().toLowerCase();
    if (/html|javascript|xml|svg|json/.test(type)) {
      return fail(415, 'Link ini berupa halaman web, bukan file media.', target.href);
    }

    let base = (params.get('name') || 'download')
      .replace(/[\\/:*?"<>|\u0000-\u001f]+/g, ' ').replace(/\s+/g, ' ').trim();
    base = Array.from(base).slice(0, 80).join('') || 'download';

    // Pakai ekstensi dari content-type, lalu dari header asli, lalu dari path
    const original = upstream.headers.get('content-disposition') || '';
    const ext = EXT[type]
      || original.match(/filename[^;]*\.([a-z0-9]{1,5})["']?\s*(;|$)/i)?.[1]
      || target.pathname.match(/\.([a-z0-9]{1,5})$/i)?.[1]
      || params.get('ext')?.match(/^[a-z0-9]{1,5}$/i)?.[0]
      || 'bin';
    if (!base.toLowerCase().endsWith('.' + ext.toLowerCase())) base += '.' + ext;

    const wellFormed = base.toWellFormed ? base.toWellFormed() : base;
    const ascii = wellFormed.replace(/[^\x20-\x7e]/g, '_');
    const encoded = encodeURIComponent(wellFormed).replace(/['()*]/g, c => '%' + c.charCodeAt(0).toString(16));
    const headers = new Headers({
      'Content-Type': type,
      'Content-Disposition': `attachment; filename="${ascii}"; filename*=UTF-8''${encoded}`,
      'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy': 'sandbox',
      'Cache-Control': 'no-store'
    });
    const length = upstream.headers.get('content-length');
    if (length && !upstream.headers.get('content-encoding')) headers.set('Content-Length', length);

    return new Response(upstream.body, { status: 200, headers });
  } catch {
    clearTimeout(timer);
    return fail(502, 'Tidak bisa menghubungi server file. Coba lagi.');
  }
}
