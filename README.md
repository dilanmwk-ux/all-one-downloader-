# All-In-One Downloader

Web downloader multi-platform dengan tampilan seperti aplikasi. Dibuat dengan HTML, CSS, dan JavaScript tanpa framework, serta Vercel Functions untuk proxy API dan unduhan.

## Platform
YouTube, Apple Music, Instagram, CapCut, TikTok, Spotify, MediaFire, Facebook, dan Pinterest.

| Platform | Sumber API |
|---|---|
| TikTok | `tikwm.com` |
| Facebook | `api.ikyyxd.my.id` |
| Platform lainnya | `api.nexadev.my.id` |

Ketersediaan unduhan bergantung pada API pihak ketiga tersebut.

## Fitur
- Tampilan aplikasi dengan menu **Beranda**, **Riwayat**, dan **Info**
- Pilih layanan lewat ikon, atau terdeteksi otomatis dari link
- Tombol Paste dan hapus input
- Mode terang dan gelap
- Riwayat hingga 20 item, tersimpan di browser (**Hapus Semua** langsung menghapus tanpa konfirmasi)
- Unduh file lewat `api/download.js`
- Preview Demo lewat tombol petir
- Bisa ditambahkan ke layar utama HP (belum mendukung offline, bukan APK)

## Struktur Proyek
```text
├── api/
│   ├── download.js        # Mengalirkan file untuk diunduh
│   └── proxy.js           # Proxy CORS untuk API
├── index.html             # Tampilan dan logika web
├── manifest.webmanifest   # Pengaturan pemasangan di HP
├── icon-192.png
├── icon-512.png
├── vercel.json
└── README.md
```

## Deploy ke Vercel
1. Upload semua file ke repository GitHub dengan struktur di atas.
2. Di Vercel, pilih **Add New > Project**, lalu impor repository.
3. Biarkan pengaturan build bawaan, lalu klik **Deploy**.

Membuka `index.html` langsung dari file tidak menjalankan folder `api/`. Untuk mencoba di komputer, gunakan `vercel dev`.

## Pasang di HP
- **Android (Chrome):** menu ⋮ > **Tambahkan ke layar utama** atau **Instal aplikasi**.
- **iPhone (Safari):** tombol Bagikan > **Tambah ke Layar Utama**.

## Menambah Domain API
Setiap domain API baru harus dimasukkan ke `allowedHosts` di `api/proxy.js`. Jika tidak, request ditolak dengan pesan "Domain tidak diizinkan".

## Catatan
- Pinterest: link streaming `.m3u8` tidak bisa diunduh sebagai satu file video.
- Unduh hanya konten milikmu atau yang kamu punya izin untuk menyimpannya, dan patuhi ketentuan tiap platform.
