import { checkLimit } from './_limit.js';

export default async function handler(req, res) {
  // 1. Tangani Preflight CORS
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  // 2. Ambil URL target dari query parameter
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'Parameter URL wajib diisi' });
  }

  // 3. Keamanan: Cegah proxy terbuka. Daftar domain yang diizinkan.
  try {
    const parsedUrl = new URL(url);
    const allowedHosts = [
      'api.nexadev.my.id',
      'api.ikyyxd.my.id',
      'www.tikwm.com',
      'tikwm.com'
    ];
    
    if (!allowedHosts.includes(parsedUrl.hostname)) {
      return res.status(403).json({ error: 'Domain tidak diizinkan' });
    }
  } catch (e) {
    return res.status(400).json({ error: 'Format URL tidak valid' });
  }

  // Batas 30 request per menit per IP
  const ip = String(req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || 'unknown').split(',')[0].trim();
  const limit = await checkLimit('proxy', ip, 30);
  if (!limit.ok) {
    res.setHeader('Retry-After', String(limit.retryAfter));
    return res.status(429).json({ error: `Terlalu banyak permintaan. Coba lagi dalam ${limit.retryAfter} detik.` });
  }

  // 4. Lakukan Fetch ke API
  try {
    const response = await fetch(url, {
      method: 'GET',
      signal: AbortSignal.timeout(19000),
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    const data = await response.json().catch(() => null);
    if (data === null) {
      return res.status(502).json({ error: `Server API mengirim respons tidak valid (HTTP ${response.status})` });
    }

    // 5. Kembalikan data dengan Header CORS terbuka
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');
    
    // TikWM menggunakan "code" dan "msg", bukan "status" dan "error"
    if (!response.ok && !data.error && !data.msg) {
      data.error = `Server API error (HTTP ${response.status})`;
    }
    
    return res.status(response.status).json(data);

  } catch (error) {
    return res.status(500).json({ 
      error: 'Gagal mengambil data dari server utama', 
      details: error.message 
    });
  }
}
