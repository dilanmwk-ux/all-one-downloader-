export async function checkLimit(scope, ip, max, windowSec = 60) {
  const base = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (!base || !token) return { ok: true };

  try {
    // IP di-hash supaya tidak disimpan mentah
    const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(ip));
    const id = [...new Uint8Array(bytes)].slice(0, 12).map(b => b.toString(16).padStart(2, '0')).join('');
    const now = Math.floor(Date.now() / 1000);
    const key = `rl:${scope}:${id}:${Math.floor(now / windowSec)}`;

    const res = await fetch(`${base}/pipeline`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify([['INCR', key], ['EXPIRE', key, windowSec]]),
      signal: AbortSignal.timeout(1500)
    });
    if (!res.ok) throw new Error(`Upstash HTTP ${res.status}`);
    const [first] = await res.json();
    if (typeof first?.result !== 'number') throw new Error(first?.error || 'Respons Upstash tidak dikenali');

    return { ok: first.result <= max, retryAfter: windowSec - (now % windowSec) };
  } catch (e) {
    console.error('Rate limit dilewati:', e.message);
    return { ok: true };
  }
}
