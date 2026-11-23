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
- **Penyimpanan Lokal & Backup (CSV / JSON)**
  - Data awal dimuat dari seeder [`src/data/seed-assignments.csv`](src/data/seed-assignments.csv) dan semua perubahan tersimpan otomatis di `localStorage` browser.
  - Mendukung **Export CSV** (bisa diedit di Excel/Google Sheets), **Download Example CSV**, dan **Export JSON** melalui tombol **Data** (ikon database di kanan atas).
  - Saat **Import CSV / JSON**, tersedia pilihan:
    - **Tambah saja (Append):** mempertahankan data lama dan menambahkan tugas/mata kuliah baru.
    - **Hapus data lama & ganti (Flush):** menghapus data sebelumnya dan menggantinya dengan isi file.
  - **Reset ke Seeder Awal** kapan saja.
- **Light & Dark Mode**
  - Mengikuti preferensi tema sistem secara default dengan toggle manual.

## Tech Stack

- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Lucide React](https://lucide.dev/)
- [GitHub Actions](.github/workflows/deploy.yml) → GitHub Pages

## Format CSV untuk Import / Export

Klik tombol **Data** (ikon database di header kanan atas) → pilih **Download Example CSV** atau **Export CSV**. Kolom yang didukung:

| Kolom | Wajib | Keterangan / Contoh |
| --- | --- | --- |
| `course_code` | Opsional | Kode matkul, misal `ALGO` (default: `GENERAL`) |
| `course_name` | Opsional | Nama matkul, misal `Algorithm & Data Structures` |
| `course_color` | Opsional | `indigo`, `sky`, `violet`, `emerald`, `rose`, `amber`, `teal`, `fuchsia` |
| `category` | Opsional | `Personal Assignment`, `Team Assignment`, `Quiz`, `LAB Team Assignment`, `LAB Project Team` |
| `session` | Opsional | Sesi kuliah, misal `Session 3` |
| `name` | **Wajib** | Nama tugas |
| `type` | Opsional | `Individual` atau `Group` |
| `start` | **Wajib** | `YYYY-MM-DDTHH:mm`, `YYYY-MM-DD HH:mm`, atau `YYYY-MM-DD` |
| `due` | **Wajib** | `YYYY-MM-DDTHH:mm`, `YYYY-MM-DD HH:mm`, atau `YYYY-MM-DD` |
| `weight` | Opsional | Bobot nilai, misal `20%` |
| `status` | Opsional | `Not Started`, `In Progress`, `Completed` (kosongkan untuk auto-hitung dari tanggal) |
| `notes` | Opsional | Catatan tambahan |

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
