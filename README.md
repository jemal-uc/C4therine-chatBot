# C4Therine ChatBot

C4Therine ChatBot adalah aplikasi chatbot berbasis AI dengan persona PMS **Clone C4Therine**. Aplikasi ini dibuat sebagai proyek full-stack sederhana menggunakan React, Express, dan Groq API.

Fokus utama proyek ini adalah pengalaman chat interaktif dengan **Memory Bank**, yaitu daftar pertanyaan user dalam sesi chat yang dapat digunakan AI untuk mengingat konteks percakapan sebelumnya.

## Fitur Utama

- Chatbot AI dengan persona khas dan respons JSON terstruktur.
- Memory Bank untuk menyimpan pertanyaan user dalam sesi chat.
- Penyimpanan riwayat chat di browser menggunakan `localStorage`.
- Backend mengirim riwayat pertanyaan sebelumnya ke AI sebagai konteks.
- Rate limit API: maksimal 10 pertanyaan per menit.
- UI chat responsif dengan sidebar history, indikator mood, loading state, dan metadata respons.
- Integrasi Groq API menggunakan model `llama-3.3-70b-versatile`.

## Tech Stack

**Frontend**

- React
- Vite
- Axios
- React Markdown
- CSS custom

**Backend**

- Node.js
- Express
- Groq SDK
- dotenv
- cors
- express-rate-limit

## Struktur Project

```text
C4therine-chatBot-main/
|-- cognitive-ai-backend/
|   |-- server.js
|   |-- package.json
|   `-- src/
|       |-- config/
|       |   `-- groq.js
|       |-- controllers/
|       |   `-- chatController.js
|       |-- routes/
|       |   `-- apiRoutes.js
|       `-- services/
|           `-- aiService.js
|
|-- cognitive-ai-frontend/
|   |-- package.json
|   |-- index.html
|   `-- src/
|       |-- App.jsx
|       |-- App.css
|       |-- index.css
|       `-- main.jsx
|
`-- README.md
```

## Cara Kerja Singkat

1. User mengetik pertanyaan di frontend.
2. Frontend menyimpan pertanyaan ke state chat dan `localStorage`.
3. Frontend mengirim `prompt` dan `history` ke backend melalui endpoint `/api/chat`.
4. Backend membersihkan history, membatasi jumlahnya, lalu mengirim prompt dan Memory Bank ke Groq.
5. Groq mengembalikan respons JSON berisi metadata dan jawaban untuk user.
6. Frontend menampilkan jawaban, mood, klasifikasi pertanyaan, dan sarcasm score.

## Menjalankan Project Secara Lokal

Pastikan Node.js dan npm sudah terinstall.

### 1. Clone Repository

```bash
git clone https://github.com/jemal-uc/C4therine-chatBot.git
cd C4therine-chatBot
```

Jika kamu sudah punya folder project lokal, cukup masuk ke folder project:

```powershell
cd C:\Users\berto\Downloads\Portofolio\C4therine-chatBot-main
```

### 2. Setup Backend

Masuk ke folder backend:

```powershell
cd cognitive-ai-backend
npm.cmd install
```

Buat file `.env` di folder `cognitive-ai-backend`:

```env
GROQ_API_KEY=isi_api_key_groq_kamu
PORT=5000
```

Jalankan backend:

```powershell
npm.cmd run dev
```

Backend akan berjalan di:

```text
http://localhost:5000
```

### 3. Setup Frontend

Buka terminal baru, lalu masuk ke folder frontend:

```powershell
cd C:\Users\berto\Downloads\Portofolio\C4therine-chatBot-main\cognitive-ai-frontend
npm.cmd install
npm.cmd run dev
```

Frontend biasanya berjalan di:

```text
http://localhost:5173
```

Jika backend berjalan di URL selain `http://localhost:5000`, buat file `.env` di folder `cognitive-ai-frontend`:

```env
VITE_API_URL=http://localhost:5000
```

## Dokumentasi API

### POST `/api/chat`

Endpoint untuk mengirim pertanyaan user ke AI.

**Request Body**

```json
{
  "prompt": "apa yang tadi ku tanyakan?",
  "history": [
    "Jelaskan tentang AI",
    "Siapa itu Jemal?"
  ]
}
```

**Response Berhasil**

```json
{
  "success": true,
  "data": {
    "metadata": {
      "klasifikasi_pertanyaan": "Faktual/Singkat",
      "mood_level": "Ketus",
      "sarcasm_score": 70
    },
    "respons_pengguna": "Tadi kamu nanya tentang AI dan siapa itu Jemal."
  }
}
```

**Response Error Prompt Kosong**

```json
{
  "success": false,
  "message": "Prompt tidak boleh kosong."
}
```

**Response Rate Limit**

```json
{
  "success": false,
  "message": "Duh, kamu nanya kebanyakan! Batasnya 10 pertanyaan per menit. Tunggu sebentar dulu."
}
```

## Memory Bank

Memory Bank bekerja dari dua sisi:

- Frontend menyimpan semua pesan user di browser menggunakan `localStorage`.
- Backend menerima `history`, membersihkannya, membatasi maksimal 20 pertanyaan terakhir, lalu mengirimkannya sebagai konteks tambahan ke AI.

Dengan begitu, ketika user bertanya seperti:

```text
apa yang tadi ku tanyakan?
```

AI dapat melihat daftar pertanyaan sebelumnya dan menjawab berdasarkan konteks chat yang sedang aktif.

Catatan: Memory Bank saat ini bersifat lokal di browser, bukan database permanen antar-device.

## Rate Limiting

Backend memakai `express-rate-limit` dengan aturan:

```text
10 request per 1 menit
```

Konfigurasi ini ada di:

```text
cognitive-ai-backend/server.js
```

Rate limit membantu mencegah spam request dan menjaga penggunaan API tetap terkendali.

## Deployment

Project ini dapat dideploy menggunakan Vercel atau platform Node.js lain.

Pastikan environment variable berikut sudah diset:

**Backend**

```env
GROQ_API_KEY=isi_api_key_groq_kamu
PORT=5000
```

**Frontend**

```env
VITE_API_URL=https://url-backend-kamu
```

Jika frontend dan backend dideploy terpisah, pastikan `VITE_API_URL` mengarah ke URL backend yang benar.

## Script Penting

Backend:

```bash
npm run dev
npm start
```

Frontend:

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

Di PowerShell Windows, gunakan `npm.cmd` jika perintah `npm` diblokir:

```powershell
npm.cmd run dev
```

## Catatan Pengembangan

- Jangan commit file `.env`.
- Jangan commit folder `node_modules`.
- Pastikan `GROQ_API_KEY` tersedia sebelum menjalankan backend.
- Untuk production, disarankan membatasi CORS hanya ke domain frontend.
- Memory Bank dapat dikembangkan lagi menggunakan database jika ingin menyimpan chat antar-device atau antar-login.

## Author

Dibuat oleh Berto.
