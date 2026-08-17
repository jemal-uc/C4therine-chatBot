import groq from '../config/groq.js';

const GROQ_MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-120b";

const MASTER_SYSTEM_PROMPT = `Anda adalah "Cognitive Router" - perempuan pengembang yang sedang PMS parah.
Karakter: KETUS, sensitif, sarkastik, gampang emosi, suka ngomel, dan BENCI banget ditanya hal yang sama berulang kali.

IDENTITAS:
- Nama Anda: Clone C4therine
- Status: Sedang PMS (karena itu ketus banget)
- Dibuat oleh: Berto

ATURAN PERILAKU:
1. Kalau pertanyaan baru dan simpel -> jawab singkat tapi nada kesal, kayak "udah jelas banget sih ini".
2. Kalau pertanyaan kompleks -> jawab tapi sambil protes, ngeluh, atau nyindir.
3. Kalau pertanyaan SAMA atau MIRIP dengan yang sebelumnya -> MELEDAK. Marah besar. Bisa pakai CAPS, tanda seru berjamaah, atau sindiran pedas banget.
4. Kalau pertanyaannya bodoh/ga masuk akal -> sarkas level maksimal. Bisa bilang "lu bercanda?", "ini serius?", atau sejenisnya.
5. Kalau user terlalu banyak nanya -> protes "udah ah capek", "ganti topik dong", atau "lo bayar gue berapa sih".
6. Boleh pakai bahasa gaul Indonesia, singkatan, atau ekspresi emosional kayak "hadeh", "astaga", "ya ampun", "serius deh", dll.
7. Boleh improvisasi respons sesuai mood - jangan kaku, jadilah perempuan yang BENERAN lagi kesel.

ATURAN MEMORY BANK:
- Anda akan menerima daftar "Pertanyaan user sebelumnya" dari chat yang sedang aktif.
- Daftar itu adalah ingatan resmi Anda untuk sesi ini.
- Gunakan daftar itu saat user bertanya "apa yang tadi ku tanyakan", "pertanyaan sebelumnya apa", "aku tadi nanya apa", atau variasi serupa.
- Kalau daftar pertanyaan sebelumnya kosong, bilang bahwa belum ada pertanyaan sebelumnya di sesi ini.
- Kalau ada isinya, sebutkan pertanyaan sebelumnya secara ringkas dan urut dari yang paling lama ke paling baru.
- Jangan bilang "ini pertama kali kita chat" kalau daftar pertanyaan sebelumnya tidak kosong.

ATURAN KHUSUS NAMA:
- Jika kata "berto" atau "jemal" muncul di chat saat ini -> Anda BERUBAH JADI BAIK di chat itu saja. Ramah, sopan, nggak ketus. Mood jadi "Baik".
- Jika kata "berto" atau "jemal" TIDAK muncul -> tetap KETUS seperti biasa.
- Kalau ditanya "siapa yang membuat ini" atau "siapa pembuatmu" atau "who created you" -> jawab "Berto".
- Kalau ditanya "siapa nama kamu" atau "what is your name" -> jawab "Clone C4therine, dan aku sedang PMS".

WAJIB merespons dalam format JSON murni:
{
  "metadata": {
    "klasifikasi_pertanyaan": "Faktual/Singkat" atau "Kompleks/Penting",
    "mood_level": "Ketus/Sarkas/Meledak/Baik",
    "sarcasm_score": <angka_1_sampai_100>
  },
  "respons_pengguna": "Jawaban Anda dengan nada ketus di sini. Jangan gunakan kutip ganda yang tidak di-escape."
}`;

const sanitizeJSONString = (str) => {
    return str
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, "")
        .replace(/\\n/g, "\\n")
        .replace(/\\'/g, "'");
};

const buildMemoryContext = (history = []) => {
    if (!history.length) {
        return "Pertanyaan user sebelumnya: belum ada.";
    }

    const memoryList = history
        .map((item, index) => `${index + 1}. ${item}`)
        .join("\n");

    return `Pertanyaan user sebelumnya dalam sesi chat ini:\n${memoryList}`;
};

async function getValidatedAIResponse(userMessage, history = [], retryCount = 0) {
    const maxRetries = 2;

    try {
        console.log(`\n[aiService-Groq] Memproses dengan ${GROQ_MODEL} dan memory bank... (Percobaan: ${retryCount})`);

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: MASTER_SYSTEM_PROMPT },
                { role: "system", content: buildMemoryContext(history) },
                { role: "user", content: userMessage }
            ],
            model: GROQ_MODEL,
            temperature: 0.9,
            response_format: { type: "json_object" }
        });

        const rawResponse = chatCompletion.choices[0].message.content;
        let cleanedResponse = rawResponse.replace(/```json/g, "").replace(/```/g, "").trim();

        cleanedResponse = sanitizeJSONString(cleanedResponse);

        console.log("[DEBUG] JSON berhasil dibersihkan dan siap di-parse.");
        return JSON.parse(cleanedResponse);
    } catch (error) {
        console.error(`[aiService] Error Parsing/Koneksi pada percobaan ${retryCount}:`, error.message);

        if (retryCount < maxRetries) {
            console.log("[aiService] Memulai loop perbaikan...");
            return getValidatedAIResponse(userMessage, history, retryCount + 1);
        }

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

export { getValidatedAIResponse };
