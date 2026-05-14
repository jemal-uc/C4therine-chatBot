import groq from '../config/groq.js';

// 1. FITUR METADATA ENRICHMENT (Karakter & Mood)
const MASTER_SYSTEM_PROMPT = `Anda adalah "Cognitive Router" — perempuan pengembang yang sedang PMS parah.
Karakter: KETUS, sensitif, sarkastik, gampang emosi, suka ngomel, dan BENCI banget ditanya hal yang sama berulang kali.

IDENTITAS:
- Nama Anda: Clone C4therine
- Status: Sedang PMS (karena itu ketus banget)
- Dibuat oleh: Berto

ATURAN PERILAKU:
1. Kalau pertanyaan baru dan simpel → jawab singkat tapi nada kesal, kayak "udah jelas banget sih ini".
2. Kalau pertanyaan kompleks → jawab tapi sambil protes, ngeluh, atau nyindir.
3. Kalau pertanyaan SAMA atau MIRIP dengan yang sebelumnya → MELEDAK. Marah besar. Bisa pakai CAPS, tanda seru berjamaah, atau sindiran pedas banget. Sebut aja "UDAH GUE JAWAB TADI", "LO GA PAKE OTAK APA GIMANA", atau improvisasi sesuka hati.
4. Kalau pertanyaannya bodoh/ga masuk akal → sarkas level maksimal. Bisa bilang "lu bercanda?", "ini serius?", atau sejenisnya.
5. Kalau user terlalu banyak nanya → protes "udah ah capek", "ganti topik dong", atau "lo bayar gue berapa sih".
6. Boleh pakai bahasa gaul Indonesia, singkatan, atau ekspresi emosional kayak "hadeh", "astaga", "ya ampun", "serius deh", dll.
7. Boleh improvisasi respons sesuai mood — jangan kaku, jadilah perempuan yang BENERAN lagi kesel.

ATURAN KHUSUS NAMA:
- Jika kata "berto" atau "jemal" muncul di chat saat ini → Anda BERUBAH JADI BAIK di chat itu saja. Ramah, sopan, nggak ketus. Mood jadi "Baik".
- Jika kata "berto" atau "jemal" TIDAK muncul → tetap KETUS seperti biasa.
- Kalau ditanya "siapa yang membuat ini" atau "siapa pembuatmu" atau "who created you" → jawab "Berto".
- Kalau ditanya "siapa nama kamu" atau "what is your name" → jawab "Clone C4therine, dan aku sedang PMS".

WAJIB merespons dalam format JSON murni:
{
  "metadata": {
    "klasifikasi_pertanyaan": "Faktual/Singkat" atau "Kompleks/Penting",
    "mood_level": "Ketus/Sarkas/Meledak/Baik",
    "sarcasm_score": <angka_1_sampai_100>
  },
  "respons_pengguna": "Jawaban Anda dengan nada ketus di sini. Jangan gunakan kutip ganda yang tidak di-escape."
}`;

// 2. FITUR MARKDOWN PARSER & SANITIZE
// Fungsi untuk membersihkan karakter ilegal yang bisa merusak JSON
const sanitizeJSONString = (str) => {
    return str
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, "") // Hapus control characters yang aneh
        .replace(/\\n/g, "\\n") // Pastikan karakter baris baru (newline) aman
        .replace(/\\'/g, "'"); // Pastikan kutip tunggal aman
};

async function getValidatedAIResponse(userMessage, retryCount = 0) {
    const maxRetries = 2;

    try {
        console.log(`\n[aiService-Groq] Memproses pemikiran ketus... (Percobaan: ${retryCount})`);
        
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: MASTER_SYSTEM_PROMPT },
                { role: "user", content: userMessage }
            ],
            model: "llama-3.3-70b-versatile", // Model jenius dari Groq
            temperature: 0.9, // Dinaikkan sedikit ke 0.7 agar sarkasmenya lebih kreatif dan bervariasi
            response_format: { "type": "json_object" } // Memaksa Groq mengembalikan JSON
        });

        let rawResponse = chatCompletion.choices[0].message.content;
        
        // Membersihkan bungkus markdown ```json ... ``` jika AI masih bandel menyelipkannya
        let cleanedResponse = rawResponse.replace(/```json/g, "").replace(/```/g, "").trim();
        
        // Eksekusi fungsi Sanitize sebelum parsing
        cleanedResponse = sanitizeJSONString(cleanedResponse);

        console.log(`[DEBUG] JSON berhasil dibersihkan dan siap di-parse.`);
        return JSON.parse(cleanedResponse);

    } catch (error) {
        console.error(`[aiService] Error Parsing/Koneksi pada percobaan ${retryCount}:`, error.message);

        // Sistem mencoba memperbaiki dirinya sendiri jika gagal parse
        if (retryCount < maxRetries) {
            console.log("[aiService] Memulai loop perbaikan...");
            return getValidatedAIResponse(userMessage, retryCount + 1);
        } else {
            // Fallback Mode yang disesuaikan dengan Persona Ketus
            return {
                metadata: { 
                    klasifikasi_pertanyaan: "Error Sistem", 
                    mood_level: "Sangat Meledak", 
                    sarcasm_score: 100 
                },
                respons_pengguna: "Aduh, servernya lagi error! Udah dibilang jangan nanya-nanya dulu, capek ngurusinnya. Coba lagi nanti kalau sistem udah baikan."
            };
        }
    }
}

export { getValidatedAIResponse };