# BiodataSaya — Future Interface Edition

Portofolio statis berbasis HTML, CSS, dan JavaScript biasa. Project ini sengaja tidak menggunakan framework atau build step, sehingga bisa langsung di-host sebagai static site di Vercel.

## Deploy ke Vercel

1. Ekstrak ZIP ini. Pastikan `index.html`, `style.css`, `site.js`, dan `vercel.json` berada di root folder project.
2. Push semua isi folder ke repository GitHub.
3. Di Vercel, pilih **Add New → Project**, lalu impor repository tersebut.
4. Framework Preset: **Other**.
5. Build Command: kosongkan / **Override** menjadi kosong.
6. Output Directory: `.`
7. Install Command: kosongkan bila Vercel meminta konfigurasi manual.
8. Klik **Deploy**.

`vercel.json` sudah mengatur project sebagai situs statis. Tidak ada environment variable yang diperlukan.

## Struktur utama

- `index.html` — homepage dengan intro animasi.
- `tentang.html`, `hobi.html`, `gaming.html`, `fitness.html`, `musik.html`, `cita-cita.html`, `kontak.html` — halaman portofolio yang tetap terpisah dan bisa diakses lewat navbar.
- `pacar.html` — halaman My Love, dengan musik khususnya sendiri.
- `style.css` — design system utama, layout responsif, navbar, audio dock, efek hover, scroll reveal, progress line, dan detail visual futuristic.
- `pacar.css` — gaya khusus halaman My Love.
- `site.js` — music dock untuk halaman umum, scroll progress, back-to-top, active navigation, dan scroll reveal.
- `particles.js` — canvas particle/constellation engine ringan tanpa library eksternal.
- `pacar.js` — interaksi pesan rahasia, animasi hati, dan kontrol musik khusus My Love.
- `intro.js` — pengontrol intro homepage.
- `vercel.json` — konfigurasi deployment statis.

## Musik

- Semua halaman selain `pacar.html` memakai `https://files.catbox.moe/z33zfv.mp3` melalui satu elemen audio per halaman. Pengunjung harus menekan **Play Music**; tidak ada autoplay.
- `pacar.html` memakai sumber berbeda sesuai permintaan: `https://files.catbox.moe/7gt0cz.mp3`.
- Audio eksternal memerlukan koneksi internet dan ketersediaan host Catbox. Jika host tidak tersedia, kontrol akan menampilkan status gagal dan bisa dicoba lagi.
- Pemutaran tidak dijanjikan terus berjalan antarhalaman karena setiap HTML merupakan dokumen terpisah.

## Visual dan aksesibilitas

- Palette terang monokrom dengan aksen biru elektrik dan cyan.
- Space Grotesk untuk display/body dan IBM Plex Mono untuk detail teknis.
- Canvas partikel responsif dengan koneksi antartitik, efek pointer, dan pause saat tab tersembunyi.
- Navbar sticky, navigasi horizontal yang dapat digeser pada layar sempit, progress scroll, tombol kembali ke atas, dan reveal ketika bagian masuk viewport.
- Mendukung `prefers-reduced-motion` dan kontrol keyboard.

## Catatan pengujian

Pemeriksaan lokal meliputi syntax JavaScript dengan Node.js, parsing semua HTML, keseimbangan kurung CSS, referensi aset lokal, integritas ZIP, dan pembandingan hash aset gambar/audio dengan arsip sumber. Pengujian browser end-to-end, pemutaran audio live, dan deployment ke akun Vercel belum dijalankan dari lingkungan ini.
