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

  // 3. Keamanan: Cegah proxy terbuka. Hanya izinkan domain api.nexadev.my.id
  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.hostname !== 'api.nexadev.my.id') {
      return res.status(403).json({ error: 'Domain tidak diizinkan' });
    }
  } catch (e) {
    return res.status(400).json({ error: 'Format URL tidak valid' });
  }

  // 4. Lakukan Fetch ke API NexaDev
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
    if (!response.ok && !data.error) data.error = data.message || `Server API error (HTTP ${response.status})`;
    return res.status(response.status).json(data);

  } catch (error) {
    return res.status(500).json({ 
      error: 'Gagal mengambil data dari server utama', 
      details: error.message 
    });
  }
}
