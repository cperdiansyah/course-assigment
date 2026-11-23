# Course Assignment Timeline Tracker

Aplikasi web untuk melacak jadwal, progres, dan tenggat waktu tugas kuliah dengan tampilan **Timeline (Gantt)**, **Agenda**, dan **Perjalanan**.

- **Live Demo:** https://cperdiansyah.github.io/course-assigment/
- **Repository:** https://github.com/cperdiansyah/course-assigment

## Fitur Utama

- **3 Mode Tampilan**
  - **Timeline:** Gantt chart horizontal dengan rentang tanggal dinamis, kolom mata kuliah sticky, penanda hari ini real-time, zoom (`+/-`), dan tooltip detail saat hover.
  - **Agenda:** Daftar tugas yang dikelompokkan berdasarkan urgensi (*Mendesak & Terlewat*, *Berjalan & Mendatang*, *Selesai*) dengan quick-toggle status.
  - **Perjalanan:** Timeline vertikal kronologis lengkap dengan penanda posisi hari ini dan ringkasan progres milestone.
- **Manajemen Tugas & Mata Kuliah**
  - Tambah, edit, dan hapus tugas (termasuk bobot nilai, sesi, kategori, tipe Individual/Group, dan catatan).
  - Status pengerjaan otomatis mengikuti tanggal mulai & deadline terhadap hari ini, dengan opsi override manual.
  - Kelola mata kuliah custom (nama, kode, dan warna).
- **Filter & Pencarian Cepat**
  - Pencarian real-time berdasarkan nama tugas, mata kuliah, atau sesi, serta filter tipe dan status.
- **Penyimpanan Lokal & Backup**
  - Data tersimpan otomatis di `localStorage` browser.
  - Mendukung **Export JSON**, **Import JSON**, dan **Reset ke Default**.
- **Light & Dark Mode**
  - Mengikuti preferensi tema sistem secara default dengan toggle manual.

## Tech Stack

- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Lucide React](https://lucide.dev/)
- [GitHub Actions](.github/workflows/deploy.yml) → GitHub Pages

## Menjalankan Secara Lokal

```bash
# 1. Install dependencies
npm install

# 2. Jalankan development server
npm run dev

# 3. Build untuk production
npm run build

# 4. Preview hasil build
npm run preview
```

## Deployment

Setiap push ke branch `main` akan otomatis di-build dan di-deploy ke GitHub Pages melalui workflow [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).
