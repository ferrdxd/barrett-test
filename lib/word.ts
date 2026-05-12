export type Category = 
  | "Kontrol Diri" | "Keinginan" | "Empati" | "Tekanan" 
  | "Kepercayaan Diri" | "Keaslian" | "Ketangguhan" | "Fokus" 
  | "Kecemasan" | "Energi";

export interface Word {
  id: string;
  word: string;
  category: Category;
}

export const WORDS: Word[] = [
  // --- Kategori 1: Kontrol Diri ---
  { id: "kd1", word: "Tenang", category: "Kontrol Diri" }, // [cite: 1]
  { id: "kd2", word: "Sabar", category: "Kontrol Diri" }, // [cite: 2]
  { id: "kd3", word: "Stabil", category: "Kontrol Diri" }, // [cite: 3]
  { id: "kd4", word: "Terkendali", category: "Kontrol Diri" }, // [cite: 4]
  { id: "kd5", word: "Waspada", category: "Kontrol Diri" }, // [cite: 5]
  { id: "kd6", word: "Disiplin", category: "Kontrol Diri" }, // [cite: 6]
  { id: "kd7", word: "Objektif", category: "Kontrol Diri" }, // [cite: 7]
  { id: "kd8", word: "Hati-hati", category: "Kontrol Diri" }, // [cite: 8]
  { id: "kd9", word: "Rasional", category: "Kontrol Diri" }, // [cite: 9]
  { id: "kd10", word: "Menahan", category: "Kontrol Diri" }, // [cite: 10]

  // --- Kategori 2: Keinginan ---
  { id: "kg1", word: "Ambisi", category: "Keinginan" }, // [cite: 11]
  { id: "kg2", word: "Terpacu", category: "Keinginan" }, // [cite: 12]
  { id: "kg3", word: "Kompetitif", category: "Keinginan" }, // [cite: 13]
  { id: "kg4", word: "Dominan", category: "Keinginan" }, // [cite: 14]
  { id: "kg5", word: "Inisiatif", category: "Keinginan" }, // [cite: 15]
  { id: "kg6", word: "Haus (akan pencapaian)", category: "Keinginan" }, // [cite: 16]
  { id: "kg7", word: "Lapar (akan tantangan)", category: "Keinginan" }, // [cite: 17]
  { id: "kg8", word: "Mengejar", category: "Keinginan" }, // [cite: 18]
  { id: "kg9", word: "Membuktikan", category: "Keinginan" }, // [cite: 19]
  { id: "kg10", word: "Menguasai", category: "Keinginan" }, // [cite: 20]

  // --- Kategori 3: Empati ---
  { id: "em1", word: "Iba", category: "Empati" }, // [cite: 21]
  { id: "em2", word: "Empati", category: "Empati" }, // [cite: 22]
  { id: "em3", word: "Peduli", category: "Empati" }, // [cite: 23]
  { id: "em4", word: "Peka", category: "Empati" }, // [cite: 24]
  { id: "em5", word: "Merangkul", category: "Empati" }, // [cite: 25]
  { id: "em6", word: "Simpati", category: "Empati" }, // [cite: 26]
  { id: "em7", word: "Terhubung", category: "Empati" }, // [cite: 27]
  { id: "em8", word: "Solider", category: "Empati" }, // [cite: 28]
  { id: "em9", word: "Mendengar", category: "Empati" }, // [cite: 29]
  { id: "em10", word: "Memahami", category: "Empati" }, // [cite: 30]

  // --- Kategori 4: Tekanan ---
  { id: "tk1", word: "Tertekan", category: "Tekanan" }, // [cite: 31]
  { id: "tk2", word: "Tegang", category: "Tekanan" }, // [cite: 32]
  { id: "tk3", word: "Berat", category: "Tekanan" }, // [cite: 33]
  { id: "tk4", word: "Terbebani", category: "Tekanan" }, // [cite: 34]
  { id: "tk5", word: "Sesak", category: "Tekanan" }, // [cite: 35]
  { id: "tk6", word: "Lelah", category: "Tekanan" }, // [cite: 36]
  { id: "tk7", word: "Muak", category: "Tekanan" }, // [cite: 37]
  { id: "tk8", word: "Panik", category: "Tekanan" }, // [cite: 38]
  { id: "tk9", word: "Bimbang", category: "Tekanan" }, // [cite: 39]
  { id: "tk10", word: "Rentan", category: "Tekanan" }, // [cite: 40]

  // --- Kategori 5: Kepercayaan Diri ---
  { id: "pd1", word: "Yakin", category: "Kepercayaan Diri" }, // [cite: 41]
  { id: "pd2", word: "Berani", category: "Kepercayaan Diri" }, // [cite: 42]
  { id: "pd3", word: "Mampu", category: "Kepercayaan Diri" }, // [cite: 43]
  { id: "pd4", word: "Sanggup", category: "Kepercayaan Diri" }, // [cite: 44]
  { id: "pd5", word: "Optimis", category: "Kepercayaan Diri" }, // [cite: 45]
  { id: "pd6", word: "Tegas", category: "Kepercayaan Diri" }, // [cite: 46]
  { id: "pd7", word: "Mandiri", category: "Kepercayaan Diri" }, // [cite: 47]
  { id: "pd8", word: "Bangga", category: "Kepercayaan Diri" }, // [cite: 48]
  { id: "pd9", word: "Berharga", category: "Kepercayaan Diri" }, // [cite: 49]
  { id: "pd10", word: "Siap", category: "Kepercayaan Diri" }, // [cite: 50]

  // --- Kategori 6: Keaslian ---
  { id: "as1", word: "Jujur", category: "Keaslian" }, // [cite: 51]
  { id: "as2", word: "Spontan", category: "Keaslian" }, // [cite: 52]
  { id: "as3", word: "Tulus", category: "Keaslian" }, // [cite: 53]
  { id: "as4", word: "Terbuka", category: "Keaslian" }, // [cite: 54]
  { id: "as5", word: "Asli", category: "Keaslian" }, // [cite: 55]
  { id: "as6", word: "Murni", category: "Keaslian" }, // [cite: 56]
  { id: "as7", word: "Nyata", category: "Keaslian" }, // [cite: 57]
  { id: "as8", word: "Bebas", category: "Keaslian" }, // [cite: 58]
  { id: "as9", word: "Mengalir", category: "Keaslian" }, // [cite: 59]
  { id: "as10", word: "Blak-blakan", category: "Keaslian" }, // [cite: 60]

  // --- Kategori 7: Ketangguhan ---
  { id: "kt1", word: "Bertahan", category: "Ketangguhan" }, // [cite: 61]
  { id: "kt2", word: "Kuat", category: "Ketangguhan" }, // [cite: 62]
  { id: "kt3", word: "Tangguh", category: "Ketangguhan" }, // [cite: 63]
  { id: "kt4", word: "Kebal", category: "Ketangguhan" }, // [cite: 64]
  { id: "kt5", word: "Keras", category: "Ketangguhan" }, // [cite: 65]
  { id: "kt6", word: "Gigih", category: "Ketangguhan" }, // [cite: 66]
  { id: "kt7", word: "Bangkit", category: "Ketangguhan" }, // [cite: 67]
  { id: "kt8", word: "Melawan", category: "Ketangguhan" }, // [cite: 68]
  { id: "kt9", word: "Konsisten", category: "Ketangguhan" }, // [cite: 69]
  { id: "kt10", word: "Siaga", category: "Ketangguhan" }, // [cite: 70]

  // --- Kategori 8: Fokus ---
  { id: "fk1", word: "Fokus", category: "Fokus" }, // [cite: 71]
  { id: "fk2", word: "Jernih", category: "Fokus" }, // [cite: 72]
  { id: "fk3", word: "Tajam", category: "Fokus" }, // [cite: 73]
  { id: "fk4", word: "Paham", category: "Fokus" }, // [cite: 74]
  { id: "fk5", word: "Teliti", category: "Fokus" }, // [cite: 75]
  { id: "fk6", word: "Sigap", category: "Fokus" }, // [cite: 76]
  { id: "fk7", word: "Analitis", category: "Fokus" }, // [cite: 77]
  { id: "fk8", word: "Terpusat", category: "Fokus" }, // [cite: 78]
  { id: "fk9", word: "Logis", category: "Fokus" }, // [cite: 79]
  { id: "fk10", word: "Penasaran", category: "Fokus" }, // [cite: 80]

  // --- Kategori 9: Kecemasan ---
  { id: "kc1", word: "Cemas", category: "Kecemasan" }, // [cite: 81]
  { id: "kc2", word: "Takut", category: "Kecemasan" }, // [cite: 82]
  { id: "kc3", word: "Ragu", category: "Kecemasan" }, // [cite: 83]
  { id: "kc4", word: "Gugup", category: "Kecemasan" }, // [cite: 84]
  { id: "kc5", word: "Khawatir", category: "Kecemasan" }, // [cite: 85]
  { id: "kc6", word: "Segan", category: "Kecemasan" }, // [cite: 86]
  { id: "kc7", word: "Malu", category: "Kecemasan" }, // [cite: 87]
  { id: "kc8", word: "Waswas", category: "Kecemasan" }, // [cite: 88]
  { id: "kc9", word: "Pesimis", category: "Kecemasan" }, // [cite: 89]
  { id: "kc10", word: "Terancam", category: "Kecemasan" }, // [cite: 90]

  // --- Kategori 10: Energi ---
  { id: "en1", word: "Semangat", category: "Energi" }, // [cite: 91]
  { id: "en2", word: "Aktif", category: "Energi" }, // [cite: 92]
  { id: "en3", word: "Bergairah", category: "Energi" }, // [cite: 93]
  { id: "en4", word: "Dinamis", category: "Energi" }, // [cite: 94]
  { id: "en5", word: "Antusias", category: "Energi" }, // [cite: 95]
  { id: "en6", word: "Segar", category: "Energi" }, // [cite: 96]
  { id: "en7", word: "Hidup", category: "Energi" }, // [cite: 97]
  { id: "en8", word: "Ceria", category: "Energi" }, // [cite: 98]
  { id: "en9", word: "Berapi-api", category: "Energi" }, // [cite: 99]
  { id: "en10", word: "Gesit", category: "Energi" }, // Kata tambahan untuk melengkapi 100 
];