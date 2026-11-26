# 🌐 All-In-One Downloader

Website downloader serbaguna yang mendukung berbagai platform populer dalam satu antarmuka. Dibangun dengan HTML, CSS, dan Vanilla JavaScript yang ringan, serta dilengkapi dengan **Vercel Serverless Function** untuk mengatasi masalah CORS (Cross-Origin Resource Sharing).

![Tampilan Website](https://img.shields.io/badge/Status-Ready%20to%20Deploy-success?style=flat-square)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white)

---

## ✨ Fitur Utama

- **Multi-Platform**: Mendukung unduhan dari Apple Music, Instagram, CapCut, TikTok, Spotify, MediaFire, dan Pinterest.
- **Bebas CORS**: Dilengkapi dengan proxy API khusus yang berjalan di Vercel untuk mencegah error CORS saat mengambil data dari API pihak ketiga.
- **Desain Modern**: Menggunakan tema hitam-putih (monokrom) yang elegan.
- **Dark/Light Mode**: Pengguna dapat beralih tema sesuai kenyamanan, dan preferensi disimpan di `localStorage`.
- **Microinteractions**: Animasi halus pada tombol, kartu layanan, dan elemen interaktif lainnya untuk pengalaman pengguna yang lebih baik.
- **Parallax Effect**: Latar belakang pada bagian *Hero* bergerak lebih lambat saat di-*scroll* untuk menciptakan efek 3D.
- **Responsif**: Tampilan yang dioptimalkan untuk perangkat mobile, tablet, dan desktop. Bug input melar di mobile telah diperbaiki.
- **Riwayat Unduhan**: Menyimpan 20 riwayat unduhan terakhir secara lokal di browser pengguna.

---

## 📂 Struktur Proyek

Pastikan struktur folder Anda terlihat seperti ini sebelum melakukan deploy:

```text
📁 proyek-downloader/
├── 📁 api/
│   └── proxy.js       # Vercel Serverless Function (Proxy CORS)
├── index.html         # File utama antarmuka website
├── vercel.json        # Konfigurasi routing dan header Vercel
└── README.md          # Dokumentasi proyek ini