"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "../../lib/supabase";
import { WORDS, Category } from "../../lib/word";
import { getBarrettAnalysis } from "../../lib/interpreter";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from "recharts";
import {
  User, Search, BrainCircuit, Activity, Heart, Target, Sparkles,
  AlertTriangle, BookOpenCheck, BarChart3, HelpCircle, Zap, ShieldCheck,
  TrendingUp, Users, Award, Calendar, ChevronRight, SlidersHorizontal,
  RefreshCw, ArrowLeftRight, FileSpreadsheet, Info, CheckCircle2,
  XCircle, Lightbulb, HelpCircle as HelpIcon, ArrowUpDown
} from "lucide-react";

interface Candidate {
  id: string;
  name: string;
  student_class: string;
  selected_word_ids: string[];
  created_at: string;
}

// 7 Tingkat Kesadaran Barrett Model Definition
const BARRETT_LEVELS = [
  { lvl: 7, name: "Contribution (Kontribusi)", color: "bg-purple-600", border: "border-purple-600", text: "text-purple-600", bg: "bg-purple-50", desc: "Fokus pada pengabdian tulus, visi jangka panjang, dan memberikan warisan positif bagi sekolah." },
  { lvl: 6, name: "Collaboration (Kolaborasi)", color: "bg-blue-600", border: "border-blue-600", text: "text-blue-600", bg: "bg-blue-50", desc: "Fokus pada kemitraan strategis, kolaborasi lintas divisi, dan membangun hubungan harmonis dalam OSIS." },
  { lvl: 5, name: "Alignment (Keselarasan)", color: "bg-teal-500", border: "border-teal-500", text: "text-teal-600", bg: "bg-teal-50", desc: "Fokus pada kejujuran, keaslian diri, hidup selaras dengan nilai-nilai, serta integritas moral tinggi." },
  { lvl: 4, name: "Evolution (Evolusi)", color: "bg-lime-500", border: "border-lime-500", text: "text-lime-600", bg: "bg-lime-50", desc: "Fokus pada inovasi, adaptasi terhadap perubahan, keberanian mengambil risiko, dan pengembangan diri." },
  { lvl: 3, name: "Performance (Kinerja)", color: "bg-amber-500", border: "border-amber-500", text: "text-amber-600", bg: "bg-amber-50", desc: "Fokus pada kompetensi, disiplin, pencapaian target, keunggulan profesional, dan keteraturan sistem." },
  { lvl: 2, name: "Relationship (Hubungan)", color: "bg-orange-500", border: "border-orange-500", text: "text-orange-600", bg: "bg-orange-50", desc: "Fokus pada empati, komunikasi interpersonal, saling menghormati, kepedulian, dan rasa memiliki kelompok." },
  { lvl: 1, name: "Survival (Ketahanan Dasar)", color: "bg-red-500", border: "border-red-500", text: "text-red-600", bg: "bg-red-50", desc: "Fokus pada stabilitas fisik, kontrol stres, rasa aman secara dasar, serta pemenuhan kebutuhan vital." }
];

const levelMapping: Record<Category, number> = {
  "Tekanan": 1, "Kecemasan": 1,
  "Empati": 2,
  "Kontrol Diri": 3, "Keinginan": 3,
  "Ketangguhan": 4, "Kepercayaan Diri": 4,
  "Keaslian": 5,
  "Energi": 6,
  "Fokus": 7
};

// Helper to count selected words per category (percentage)
const getCategoryScore = (selectedWordIds: string[], category: string) => {
  const count = selectedWordIds
    .map(id => WORDS.find(w => w.id === id))
    .filter(w => w && w.category === category).length;
  return (count / 10) * 100;
};

// Premium Gauge component
const PremiumGauge = ({ score }: { score: number }) => {
  const rotation = 180 + (score / 100) * 180;
  
  return (
    <div className="relative w-full max-w-[280px] mx-auto aspect-[2/1] overflow-hidden group">
      <svg viewBox="0 0 200 100" className="w-full h-full overflow-visible drop-shadow-[0_10px_20px_rgba(99,102,241,0.06)]">
        <defs>
          <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f43f5e" />   {/* Red */}
            <stop offset="25%" stopColor="#f97316" />  {/* Orange */}
            <stop offset="50%" stopColor="#eab308" />  {/* Yellow */}
            <stop offset="75%" stopColor="#84cc16" />  {/* Lime */}
            <stop offset="100%" stopColor="#10b981" /> {/* Emerald */}
          </linearGradient>
        </defs>
        {/* Track Belakang */}
        <path d="M 20 90 A 70 70 0 0 1 180 90" fill="none" stroke="#f1f5f9" strokeWidth="18" strokeLinecap="round" />
        {/* Track Warna */}
        <path d="M 20 90 A 70 70 0 0 1 180 90" fill="none" stroke="url(#gaugeGradient)" strokeWidth="18" strokeLinecap="round" />
        
        {/* Jarum */}
        <g transform={`rotate(${rotation} 100 90)`} className="transition-transform duration-1000 ease-out">
          <path d="M 96 90 L 100 20 L 104 90 Z" fill="#0f172a" className="drop-shadow-md" />
          <circle cx="100" cy="90" r="10" fill="#1e293b" />
          <circle cx="100" cy="90" r="4" fill="#ffffff" />
        </g>
      </svg>
      {/* Label di Tengah */}
      <div className="absolute bottom-0 left-0 w-full flex flex-col items-center justify-end pb-1 translate-y-1">
        <span className="text-4xl font-extrabold tracking-tighter text-slate-900 group-hover:text-indigo-600 transition-colors duration-300">{score}</span>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-[-2px]">Poin Kesiapan</span>
      </div>
    </div>
  );
};

export default function AdminDashboard() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Navigation & UI Tabs
  const [activeTab, setActiveTab] = useState<"overview" | "report" | "compare" | "guide">("overview");

  // Sidebar sorting and filtering states
  const [sortBy, setSortBy] = useState<"newest" | "name" | "health_desc" | "entropy_asc">("newest");
  const [filterClass, setFilterClass] = useState<string>("all");
  const [filterEntropy, setFilterEntropy] = useState<string>("all");

  // Comparison mode states
  const [compareA, setCompareA] = useState<string>("");
  const [compareB, setCompareB] = useState<string>("");

  // Interactive Hourglass Matrix hovered/selected level details
  const [activeHourglassLvl, setActiveHourglassLvl] = useState<number | null>(null);

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    const { data } = await supabase.from("candidates").select("*").order("created_at", { ascending: false });
    if (data) {
      setCandidates(data);
      // Auto populate comparison states if candidates are available
      if (data.length > 0) {
        setCompareA(data[0].id);
        if (data.length > 1) {
          setCompareB(data[1].id);
        }
      }
    }
  };

  // Run interpretation for each candidate to gather full statistics
  const analyzedCandidates = useMemo(() => {
    return candidates.map(c => {
      const analysis = getBarrettAnalysis(c.selected_word_ids);
      return {
        ...c,
        analysis
      };
    });
  }, [candidates]);

  // Compute Global Analytics across all candidates
  const globalStats = useMemo(() => {
    const count = analyzedCandidates.length;
    if (count === 0) {
      return {
        total: 0,
        avgHealth: 0,
        avgEntropy: 0,
        avgAlignment: 0,
        entropyGroups: [],
        avgLevels: [],
        categoryData: [],
        topPositive: [],
        topLimiting: [],
        registrationTrend: []
      };
    }

    const sumHealth = analyzedCandidates.reduce((sum, ac) => sum + ac.analysis.healthScore, 0);
    const sumEntropy = analyzedCandidates.reduce((sum, ac) => sum + ac.analysis.entropyScore, 0);
    const sumAlignment = analyzedCandidates.reduce((sum, ac) => sum + ac.analysis.alignmentScore, 0);

    // Entropy groups
    let healthy = 0, focus = 0, significant = 0, critical = 0;
    analyzedCandidates.forEach(ac => {
      const score = ac.analysis.entropyScore;
      if (score < 14) healthy++;
      else if (score < 20) focus++;
      else if (score < 29) significant++;
      else critical++;
    });

    const entropyGroups = [
      { name: "Healthy (Stabel)", value: healthy, fill: "#10b981" },
      { name: "Perlu Fokus", value: focus, fill: "#eab308" },
      { name: "Isu Signifikan", value: significant, fill: "#f97316" },
      { name: "Kritis", value: critical, fill: "#ef4444" }
    ].filter(g => g.value > 0);

    // Barrett Average levels 1-7
    const levelSums = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 };
    analyzedCandidates.forEach(ac => {
      for (let lvl = 1; lvl <= 7; lvl++) {
        levelSums[lvl as keyof typeof levelSums] += ac.analysis.levels[lvl] || 0;
      }
    });
    const avgLevels = Object.entries(levelSums).map(([lvl, sum]) => ({
      name: `Level ${lvl}`,
      RataRata: Math.round(sum / count)
    }));

    // Category Selections (Popularity)
    const categoryCounts: Record<string, number> = {};
    analyzedCandidates.forEach(ac => {
      ac.selected_word_ids.forEach(wordId => {
        const w = WORDS.find(word => word.id === wordId);
        if (w) {
          categoryCounts[w.category] = (categoryCounts[w.category] || 0) + 1;
        }
      });
    });
    const categoryData = Object.entries(categoryCounts)
      .map(([category, count]) => ({ category, Frekuensi: count }))
      .sort((a, b) => b.Frekuensi - a.Frekuensi);

    // Top words selected collectively
    const positiveWordCounts: Record<string, number> = {};
    const limitingWordCounts: Record<string, number> = {};
    analyzedCandidates.forEach(ac => {
      ac.analysis.topValues.forEach(val => {
        positiveWordCounts[val] = (positiveWordCounts[val] || 0) + 1;
      });
      ac.analysis.limitingWords.forEach(val => {
        limitingWordCounts[val] = (limitingWordCounts[val] || 0) + 1;
      });
    });
    const topPositive = Object.entries(positiveWordCounts)
      .map(([word, count]) => ({ word, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    const topLimiting = Object.entries(limitingWordCounts)
      .map(([word, count]) => ({ word, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Registration trend by date
    const dateCounts: Record<string, number> = {};
    analyzedCandidates.forEach(ac => {
      const date = new Date(ac.created_at).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short"
      });
      dateCounts[date] = (dateCounts[date] || 0) + 1;
    });
    const registrationTrend = Object.entries(dateCounts).map(([date, count]) => ({
      date,
      Kandidat: count
    }));

    return {
      total: count,
      avgHealth: Math.round(sumHealth / count),
      avgEntropy: Math.round(sumEntropy / count),
      avgAlignment: Number((sumAlignment / count).toFixed(1)),
      entropyGroups,
      avgLevels,
      categoryData,
      topPositive,
      topLimiting,
      registrationTrend
    };
  }, [analyzedCandidates]);

  // Extract unique classes for filtering
  const classesList = useMemo(() => {
    const classes = new Set(candidates.map(c => c.student_class));
    return Array.from(classes).sort();
  }, [candidates]);

  // Dynamic candidate list filtering and sorting
  const filteredCandidates = useMemo(() => {
    return analyzedCandidates
      .filter(ac => {
        const matchesSearch = ac.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              ac.student_class.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesClass = filterClass === "all" || ac.student_class === filterClass;

        let entropyCat = "Healthy";
        if (ac.analysis.entropyScore >= 29) entropyCat = "Critical";
        else if (ac.analysis.entropyScore >= 20) entropyCat = "Significant";
        else if (ac.analysis.entropyScore >= 14) entropyCat = "Focus";

        const matchesEntropy = filterEntropy === "all" || entropyCat === filterEntropy;

        return matchesSearch && matchesClass && matchesEntropy;
      })
      .sort((a, b) => {
        if (sortBy === "name") return a.name.localeCompare(b.name);
        if (sortBy === "health_desc") return b.analysis.healthScore - a.analysis.healthScore;
        if (sortBy === "entropy_asc") return a.analysis.entropyScore - b.analysis.entropyScore;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime(); // newest
      });
  }, [analyzedCandidates, searchQuery, sortBy, filterClass, filterEntropy]);

  // Selected candidate analysis
  const activeCandidate = useMemo(() => {
    if (!selectedCandidate) return null;
    return analyzedCandidates.find(c => c.id === selectedCandidate.id) || null;
  }, [selectedCandidate, analyzedCandidates]);

  const balanceData = activeCandidate ? [
    { name: "Foundation", value: activeCandidate.analysis.balance.foundation, fill: "#f97316" }, // Orange
    { name: "Evolution", value: activeCandidate.analysis.balance.evolution, fill: "#84cc16" },  // Lime
    { name: "Impact", value: activeCandidate.analysis.balance.impact, fill: "#4f46e5" },        // Indigo
  ] : [];

  // Data for single candidate 10-dimensional Radar Chart
  const individualRadarData = useMemo(() => {
    if (!activeCandidate) return [];
    const radarCategories = [
      "Kontrol Diri", "Keinginan", "Empati", "Kepercayaan Diri", 
      "Keaslian", "Ketangguhan", "Fokus", "Energi", "Tekanan", "Kecemasan"
    ];
    return radarCategories.map(cat => ({
      subject: cat,
      Kandidat: getCategoryScore(activeCandidate.selected_word_ids, cat),
      fullMark: 100
    }));
  }, [activeCandidate]);

  // Candidates for Comparison
  const candidateAData = useMemo(() => {
    return analyzedCandidates.find(c => c.id === compareA) || null;
  }, [analyzedCandidates, compareA]);

  const candidateBData = useMemo(() => {
    return analyzedCandidates.find(c => c.id === compareB) || null;
  }, [analyzedCandidates, compareB]);

  // Combined Radar Chart for Comparison Mode
  const radarComparisonData = useMemo(() => {
    if (!candidateAData || !candidateBData) return [];
    const radarCategories = [
      "Kontrol Diri", "Keinginan", "Empati", "Kepercayaan Diri", 
      "Keaslian", "Ketangguhan", "Fokus", "Energi", "Tekanan", "Kecemasan"
    ];
    return radarCategories.map(cat => {
      const scoreA = getCategoryScore(candidateAData.selected_word_ids, cat);
      const scoreB = getCategoryScore(candidateBData.selected_word_ids, cat);
      return {
        subject: cat,
        [candidateAData.name]: scoreA,
        [candidateBData.name]: scoreB,
        fullMark: 100
      };
    });
  }, [candidateAData, candidateBData]);

  // Recruiter Interview Guide (Tailored Questions based on Limiting Values)
  const interviewQuestions = useMemo(() => {
    if (!activeCandidate) return [];
    const limiting = activeCandidate.analysis.limitingWords;
    const questionsList: { word: string; category: string; question: string; lookFor: string }[] = [];

    const questionsDict: Record<string, { q: string; lf: string; cat: string }> = {
      "Tertekan": {
        q: "Bagaimana Anda menyeimbangkan tuntutan akademis sekolah dengan tanggung jawab besar yang ada di OSIS secara sehat?",
        lf: "Kemampuan manajemen prioritas, ketahanan stres, dan kemauan mencari bantuan bila diperlukan.",
        cat: "Tekanan"
      },
      "Tegang": {
        q: "Ceritakan situasi saat dinamika kelompok dalam rapat kepanitiaan berjalan kaku atau menegangkan. Bagaimana Anda mencairkannya?",
        lf: "Kecerdasan emosional, diplomasi, dan kemampuan meredakan konflik interpersonal.",
        cat: "Tekanan"
      },
      "Berat": {
        q: "Bila diberikan tanggung jawab program kerja yang berskala besar, bagaimana langkah Anda memilahnya menjadi tindakan yang realistis?",
        lf: "Pendekatan logis dan analitis terhadap perencanaan taktis, tidak panik menghadapi tantangan besar.",
        cat: "Tekanan"
      },
      "Terbebani": {
        q: "Jika Anda merasa terbebani dengan tugas kepengurusan, apakah Anda bersedia mendelegasikan tugas atau cenderung menanggungnya sendiri?",
        lf: "Sifat kolaboratif, kemampuan bersandar pada tim, pemahaman atas pentingnya delegasi terarah.",
        cat: "Tekanan"
      },
      "Lelah": {
        q: "Kelelahan fisik dan mental sering melanda pengurus OSIS di tengah masa bakti. Bagaimana cara Anda menjaga komitmen dan motivasi saat energi Anda berada di titik terendah?",
        lf: "Kesadaran diri (self-awareness) untuk memulihkan energi dan ketangguhan komitmen jangka panjang.",
        cat: "Tekanan"
      },
      "Muak": {
        q: "Ketika menghadapi sikap apatis dari siswa lain atau penolakan administratif dari pihak sekolah, bagaimana cara Anda menjaga antusiasme dan tidak lekas jenuh?",
        lf: "Resilience mental, ketegaran visi kepemimpinan, dan kontrol dorongan frustrasi.",
        cat: "Tekanan"
      },
      "Panik": {
        q: "Bila di tengah acara hari-H terjadi kendala teknis krusial, apa langkah pertama yang Anda ambil untuk menenangkan diri dan mengarahkan panitia lainnya?",
        lf: "Ketenangan di bawah tekanan, inisiatif problem solving cepat, serta ketegasan instruksi darurat.",
        cat: "Tekanan"
      },
      "Bimbang": {
        q: "Ketika Anda menghadapi perdebatan sengit tentang konsep acara yang terpecah menjadi dua opini kuat, bagaimana Anda mengambil keputusan yang tegas dan objektif?",
        lf: "Metode pengambilan keputusan berbasis data, ketegasan memimpin, serta keluwesan kompromi.",
        cat: "Tekanan"
      },
      "Rentan": {
        q: "Dalam area kepemimpinan apa Anda merasa paling membutuhkan bimbingan atau dukungan dari pengurus OSIS lain untuk melengkapi kelemahan Anda?",
        lf: "Kerendahan hati untuk belajar, keterbukaan diri, dan kecocokan bekerja dalam kolaborasi kelompok.",
        cat: "Tekanan"
      },
      "Cemas": {
        q: "Bagaimana cara Anda meredam kecemasan akan kegagalan sebuah program kerja agar tidak menghambat kreativitas Anda saat merancang ide awal?",
        lf: "Mengubah cemas menjadi mitigasi risiko terencana, pemikiran antisipatif yang strategis.",
        cat: "Kecemasan"
      },
      "Takut": {
        q: "Ceritakan saat di mana Anda harus mengemukakan usulan yang tidak populer kepada rekan sebaya demi kebaikan bersama meskipun ada rasa takut akan penolakan.",
        lf: "Integritas nilai moral, keberanian berbicara (speak up), dan komunikasi asertif yang sopan.",
        cat: "Kecemasan"
      },
      "Gugup": {
        q: "Bagaimana cara Anda menstabilkan diri saat harus melakukan presentasi besar atau memimpin forum siswa di depan ratusan pasang mata?",
        lf: "Teknik pengendalian kecemasan panggung (stage fright) dan kesiapan persiapan mental personal.",
        cat: "Kecemasan"
      },
      "Khawatir": {
        q: "Ketika terjadi kesalahpahaman informasi di grup koordinasi, bagaimana Anda menyaring kekhawatiran pribadi agar tidak memperkeruh situasi di tim?",
        lf: "Objektivitas, kemampuan menenangkan keresahan kelompok, serta klarifikasi berbasis fakta.",
        cat: "Kecemasan"
      },
      "Segan": {
        q: "Bagaimana Anda akan menyampaikan ide kritis yang bertentangan dengan kebijakan senior atau Pembina OSIS secara sopan namun tetap jelas?",
        lf: "Asertivitas profesional, adab berkomunikasi dengan otoritas senior, serta keyakinan berargumen.",
        cat: "Kecemasan"
      },
      "Malu": {
        q: "Sebagai perwakilan OSIS, Anda akan berhadapan dengan beragam latar belakang siswa. Bagaimana cara Anda merangkul siswa yang paling pasif atau tertutup agar merasa dihargai?",
        lf: "Kemampuan interaksi inklusif, inisiatif menyapa terlebih dahulu, dan kehangatan personal.",
        cat: "Kecemasan"
      },
      "Waswas": {
        q: "Bagaimana Anda memastikan kepastian atas kesiapan setiap pos kepanitiaan sehingga tidak diliputi rasa khawatir/was-was saat acara berlangsung?",
        lf: "Penerapan sistem checklist kontrol ketat dan kebiasaan melakukan koordinasi berkala.",
        cat: "Kecemasan"
      },
      "Pesimis": {
        q: "Jika target partisipan program kerja Anda gagal dicapai di tengah jalan, bagaimana langkah Anda membalikkan keputusasaan panitia lain menjadi semangat bangkit?",
        lf: "Kepemimpinan transformasional, optimisme logis, dan kemampuan merekayasa ulang rencana alternatif.",
        cat: "Kecemasan"
      },
      "Terancam": {
        q: "Bagaimana Anda memisahkan masukan kritis yang bersifat keras terhadap program kerja Anda agar tidak dianggap sebagai serangan pribadi terhadap harga diri Anda?",
        lf: "Kedewasaan menyikapi kritik (maturity), objektivitas berorganisasi, dan ego terkendali.",
        cat: "Kecemasan"
      }
    };

    limiting.forEach(word => {
      if (questionsDict[word]) {
        questionsList.push({
          word,
          category: questionsDict[word].cat,
          question: questionsDict[word].q,
          lookFor: questionsDict[word].lf
        });
      }
    });

    // If candidate has no limiting words, offer high-quality leadership questions based on positive scores
    if (questionsList.length === 0) {
      if (activeCandidate.analysis.topValues.includes("Fokus") || activeCandidate.analysis.topValues.includes("Objektif")) {
        questionsList.push({
          word: "Fokus / Objektif",
          category: "Analisis Positif",
          question: "Kandidat memiliki fokus & ketelitian luar biasa. Bagaimana Anda menjaga agar ketelitian pada detail teknis ini tidak membuat Anda abai terhadap gambaran besar (big picture) visi OSIS?",
          lookFor: "Keseimbangan antara visi strategis jangka panjang dengan eksekusi operasional yang presisi."
        });
      }
      if (activeCandidate.analysis.topValues.includes("Berani") || activeCandidate.analysis.topValues.includes("Ambisi")) {
        questionsList.push({
          word: "Berani / Ambisi",
          category: "Analisis Positif",
          question: "Karakter Anda sangat didorong oleh keberanian mengambil risiko dan dorongan maju. Bagaimana Anda menyelaraskan keputusan berisiko tinggi dengan kepatuhan etis aturan sekolah?",
          lookFor: "Manajemen risiko terukur, kepatuhan struktural, dan kebijaksanaan kepemimpinan."
        });
      }
      if (activeCandidate.analysis.topValues.includes("Empati") || activeCandidate.analysis.topValues.includes("Peduli")) {
        questionsList.push({
          word: "Empati / Peduli",
          category: "Analisis Positif",
          question: "Anda menonjol dalam empati dan kepedulian antarsesama. Bagaimana Anda mempertahankan ketegasan organisasi saat harus mengevaluasi rekan panitia terdekat yang melakukan kelalaian kerja?",
          lookFor: "Ketegasan objektif yang dibalut kebaikan interpersonal (firm yet compassionate leadership)."
        });
      }
      // Add a generic fallback question
      questionsList.push({
        word: "Profil Mental Stabil",
        category: "Kesiapan Umum",
        question: "Berdasarkan hasil tes, kesiapan mental Anda tergolong sangat kokoh tanpa hambatan psikologis internal yang signifikan. Apa visi perubahan terbesar yang ingin Anda letakkan sebagai pondasi kepengurusan OSIS?",
        lookFor: "Visi orisinal yang berorientasi kemajuan, antusiasme nyata, dan keselarasan idealisme personal."
      });
    }

    return questionsList;
  }, [activeCandidate]);

  // Auto scroll/select when a candidate is clicked
  const handleSelectCandidate = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setActiveTab("report");
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col md:flex-row gap-6 font-sans">
      
      {/* ============================================================
          BILAH SAMPING / SIDEBAR (Premium Modern)
          ============================================================ */}
      <div className="w-full md:w-[380px] bg-slate-950/80 backdrop-blur-xl border-r border-slate-800 flex flex-col h-screen md:sticky top-0 flex-shrink-0 z-30">
        
        {/* Header Sidebar */}
        <div className="p-6 border-b border-slate-800 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20 animate-pulse">
              <BrainCircuit className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-extrabold text-white text-lg tracking-tight flex items-center gap-1.5">
                NAVASENA <span className="text-[10px] font-bold tracking-widest px-1.5 py-0.5 bg-indigo-500/20 text-indigo-400 rounded-full">PRO</span>
              </h2>
              <p className="text-slate-400 text-xs font-semibold">Analisis Psikometri OSIS</p>
            </div>
          </div>

          {/* Kolom Pencarian */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Cari nama atau kelas..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-500 font-medium text-slate-200"
            />
          </div>

          {/* Panel Akordion Filter */}
          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400">
              <span className="flex items-center gap-1.5"><SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" /> KONTROL DILAH</span>
              <button 
                onClick={() => { setFilterClass("all"); setFilterEntropy("all"); setSortBy("newest"); setSearchQuery(""); }} 
                className="text-[10px] text-slate-500 hover:text-indigo-400 transition-colors uppercase font-black"
              >
                Reset
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {/* Filter Kelas */}
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Kelas</label>
                <select
                  value={filterClass}
                  onChange={(e) => setFilterClass(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg text-xs p-1.5 text-slate-300 font-medium focus:outline-none focus:border-indigo-500"
                >
                  <option value="all">Semua Kelas</option>
                  {classesList.map(cls => <option key={cls} value={cls}>{cls}</option>)}
                </select>
              </div>
              {/* Filter Status Entropi */}
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Entropi</label>
                <select
                  value={filterEntropy}
                  onChange={(e) => setFilterEntropy(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg text-xs p-1.5 text-slate-300 font-medium focus:outline-none focus:border-indigo-500"
                >
                  <option value="all">Semua Status</option>
                  <option value="Healthy">Sehat (Healthy)</option>
                  <option value="Focus">Perlu Fokus</option>
                  <option value="Significant">Signifikan</option>
                  <option value="Critical">Kritis (Critical)</option>
                </select>
              </div>
            </div>
            {/* Urutan */}
            <div className="flex flex-col gap-1 mt-1 border-t border-slate-800/60 pt-1.5">
              <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Urutkan</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-slate-950 border border-slate-800 rounded-lg text-xs p-1.5 text-slate-300 font-medium focus:outline-none focus:border-indigo-500"
              >
                <option value="newest">Terbaru Masuk</option>
                <option value="name">Nama A - Z</option>
                <option value="health_desc">Kesiapan Tertinggi</option>
                <option value="entropy_asc">Hambatan Terkecil</option>
              </select>
            </div>
          </div>

          <div className="flex justify-between items-center text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
            <span>Daftar Kandidat ({filteredCandidates.length})</span>
            {activeTab !== "overview" && (
              <button 
                onClick={() => setActiveTab("overview")} 
                className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-black transition-colors"
              >
                <BarChart3 className="w-3 h-3" /> LIHAT STATS GRUP
              </button>
            )}
          </div>
        </div>
        
        {/* Daftar Kandidat */}
        <div className="overflow-y-auto flex-1 p-3 space-y-2 custom-scrollbar bg-slate-950/20">
          {filteredCandidates.length === 0 ? (
            <div className="text-center py-10 text-slate-600 text-xs font-semibold">
              Tidak ada kandidat cocok filter
            </div>
          ) : (
            filteredCandidates.map(c => {
              const isSelected = selectedCandidate?.id === c.id;
              
              // Determine Entropy indicator color
              const entropy = c.analysis.entropyScore;
              let statusColor = "bg-emerald-500 ring-emerald-500/20";
              let statusLabel = "Healthy";
              if (entropy >= 29) {
                statusColor = "bg-rose-500 ring-rose-500/20";
                statusLabel = "Critical";
              } else if (entropy >= 20) {
                statusColor = "bg-amber-500 ring-amber-500/20";
                statusLabel = "Significant";
              } else if (entropy >= 14) {
                statusColor = "bg-yellow-400 ring-yellow-400/20";
                statusLabel = "Focus";
              }

              return (
                <button
                  key={c.id} 
                  onClick={() => handleSelectCandidate(c)}
                  className={`w-full text-left p-4 rounded-xl flex items-center justify-between group transition-all duration-300 relative border overflow-hidden ${
                    isSelected 
                      ? 'bg-gradient-to-r from-indigo-900 to-indigo-950 border-indigo-700/60 shadow-lg shadow-indigo-950/40 scale-[1.01]' 
                      : 'bg-slate-900/40 hover:bg-slate-900 border-slate-800/80 hover:border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3 relative z-10">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors relative shrink-0 ${
                      isSelected 
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-slate-800 border border-slate-700 text-slate-400 group-hover:text-white group-hover:bg-slate-700'
                    }`}>
                      <User className="w-5 h-5" />
                      {/* Entropy Dot */}
                      <span className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-slate-950 ring-4 ${statusColor}`}></span>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className={`font-bold text-sm tracking-tight transition-colors truncate max-w-[150px] ${
                          isSelected ? 'text-white' : 'text-slate-200 group-hover:text-indigo-400'
                        }`}>
                          {c.name}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-black text-slate-400">{c.student_class}</span>
                        <span className="text-[8px] font-extrabold uppercase px-1.5 py-0.2 bg-slate-800 text-slate-400 rounded-md border border-slate-700">
                          Ready: {c.analysis.healthScore}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1.5 relative z-10 shrink-0">
                    {isSelected ? (
                      <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ============================================================
          KONTEN UTAMA (Professional Tabs)
          ============================================================ */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        
        {/* Top Navbar */}
        <div className="bg-slate-950/40 border-b border-slate-800 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 backdrop-blur-md z-20">
          <div>
            <h1 className="text-xl font-black bg-gradient-to-r from-white via-slate-100 to-indigo-400 bg-clip-text text-transparent">
              {activeTab === "overview" && "Dashboard Analisis Komparatif OSIS"}
              {activeTab === "report" && `Laporan Profil Psikologis: ${activeCandidate?.name || ""}`}
              {activeTab === "compare" && "Kamera Komparasi Kandidat"}
              {activeTab === "guide" && "Panduan Interpretasi Barrett Model"}
            </h1>
            <p className="text-slate-400 text-xs font-semibold mt-0.5">
              {activeTab === "overview" && "Hasil Pengukuran Karakteristik Kolektif & Tren Pendaftaran"}
              {activeTab === "report" && `Detail Profil Barrett 7 Tingkat Kesadaran Kelas ${activeCandidate?.student_class || ""}`}
              {activeTab === "compare" && "Bandingkan Nilai Karakteristik Dua Kandidat Berdampingan"}
              {activeTab === "guide" && "Bagaimana Memahami Level 1 - 7 untuk Perekrutan Pengurus OSIS"}
            </p>
          </div>

          {/* Tab Button Menu */}
          <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs font-bold gap-1 self-start sm:self-center">
            <button 
              onClick={() => setActiveTab("overview")}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                activeTab === "overview" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" /> Overview
            </button>
            <button 
              onClick={() => activeCandidate && setActiveTab("report")}
              disabled={!activeCandidate}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                !activeCandidate ? "opacity-40 cursor-not-allowed" : ""
              } ${activeTab === "report" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"}`}
            >
              <User className="w-3.5 h-3.5" /> Profil Detail
            </button>
            <button 
              onClick={() => setActiveTab("compare")}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                activeTab === "compare" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              <ArrowLeftRight className="w-3.5 h-3.5" /> Bandingkan
            </button>
            <button 
              onClick={() => setActiveTab("guide")}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                activeTab === "guide" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              <Info className="w-3.5 h-3.5" /> Panduan
            </button>
          </div>
        </div>

        {/* Tab Content Wrapper */}
        <div className="p-6 flex-1">
          
          {/* ============================================================
              TAB 1: OVERVIEW & KOLEKTIF ANALYTICS
              ============================================================ */}
          {activeTab === "overview" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-500 pb-10">
              
              {/* KPI STATS ROW */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* 1. Total Pelamar */}
                <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800 relative overflow-hidden group hover:border-slate-700 transition-colors">
                  <div className="absolute right-3 top-3 p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-indigo-400 group-hover:scale-105 transition-transform shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Pelamar OSIS</p>
                  <h3 className="text-3xl font-extrabold text-white mt-1.5">{globalStats.total}</h3>
                  <div className="flex items-center gap-1 mt-2 text-[10px] text-emerald-400 font-bold">
                    <TrendingUp className="w-3.5 h-3.5" /> +100% data aktif
                  </div>
                </div>

                {/* 2. Rerata Mental Kesiapan */}
                <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800 relative overflow-hidden group hover:border-slate-700 transition-colors">
                  <div className="absolute right-3 top-3 p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-emerald-400 group-hover:scale-105 transition-transform shrink-0">
                    <Activity className="w-5 h-5" />
                  </div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Avg Kesiapan Mental</p>
                  <h3 className="text-3xl font-extrabold text-white mt-1.5">{globalStats.avgHealth} <span className="text-xs font-bold text-slate-500">/ 100</span></h3>
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span className="text-[10px] text-emerald-400 font-extrabold uppercase">Sangat Siap</span>
                  </div>
                </div>

                {/* 3. Rerata Entropi Budaya */}
                <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800 relative overflow-hidden group hover:border-slate-700 transition-colors">
                  <div className="absolute right-3 top-3 p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-rose-400 group-hover:scale-105 transition-transform shrink-0">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Avg Hambatan (Entropi)</p>
                  <h3 className="text-3xl font-extrabold text-white mt-1.5">{globalStats.avgEntropy}%</h3>
                  <div className="flex items-center gap-1 mt-2 text-[10px] text-slate-400 font-semibold">
                    Rentang keraguan internal kolektif
                  </div>
                </div>

                {/* 4. Rerata Alignment OSIS */}
                <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800 relative overflow-hidden group hover:border-slate-700 transition-colors">
                  <div className="absolute right-3 top-3 p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-amber-400 group-hover:scale-105 transition-transform shrink-0">
                    <Award className="w-5 h-5" />
                  </div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Kesesuaian Karakter</p>
                  <h3 className="text-3xl font-extrabold text-white mt-1.5">{globalStats.avgAlignment} <span className="text-xs font-bold text-slate-500">/ 10</span></h3>
                  <div className="flex items-center gap-1 mt-2 text-[10px] text-amber-400 font-bold">
                    Kecocokan terhadap kultur OSIS
                  </div>
                </div>

              </div>

              {/* DIAGRAMS MAIN ROW 1 */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* 1. Tren Pendaftaran */}
                <div className="lg:col-span-2 bg-slate-950/40 p-6 rounded-3xl border border-slate-800 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white mb-1 tracking-wide uppercase">Tren Pendaftaran Kandidat</h3>
                    <p className="text-[11px] text-slate-400 mb-6">Frekuensi penambahan data baru di setiap harinya.</p>
                  </div>
                  <div className="w-full h-[220px]">
                    {globalStats.registrationTrend.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-slate-600 text-xs">Belum ada tren waktu</div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={globalStats.registrationTrend}>
                          <defs>
                            <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4}/>
                              <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.5} />
                          <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                          <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} allowDecimals={false} />
                          <RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }} />
                          <Area type="monotone" dataKey="Kandidat" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorTrend)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>

                {/* 2. Distribusi Hambatan (Entropy Donut) */}
                <div className="bg-slate-950/40 p-6 rounded-3xl border border-slate-800 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white mb-1 tracking-wide uppercase">Distribusi Entropi Kelompok</h3>
                    <p className="text-[11px] text-slate-400 mb-4">Pengelompokan tingkat beban kecemasan kandidat.</p>
                  </div>
                  <div className="w-full h-[180px] relative">
                    {globalStats.entropyGroups.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-slate-600 text-xs">Tidak ada data status</div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie 
                            data={globalStats.entropyGroups} 
                            cx="50%" 
                            cy="50%" 
                            innerRadius={45} 
                            outerRadius={65} 
                            paddingAngle={3}
                            dataKey="value"
                          >
                            {globalStats.entropyGroups.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} stroke="#0f172a" strokeWidth={2} />
                            ))}
                          </Pie>
                          <RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                  <div className="flex flex-wrap justify-center gap-x-3 gap-y-1.5 text-[9px] font-black text-slate-400 mt-2 border-t border-slate-800/80 pt-3">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-emerald-500"></span> Healthy</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-yellow-400"></span> Focus</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-orange-500"></span> Significant</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-rose-500"></span> Critical</span>
                  </div>
                </div>

              </div>

              {/* DIAGRAMS MAIN ROW 2 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* 1. Barrett Levels Average (Collective Conscious) */}
                <div className="bg-slate-950/40 p-6 rounded-3xl border border-slate-800 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white mb-1 tracking-wide uppercase">Profil Nilai Kolektif (Barrett 7 Levels)</h3>
                    <p className="text-[11px] text-slate-400 mb-6">Rata-rata tingkat kesadaran kolektif dari seluruh pendaftar OSIS.</p>
                  </div>
                  <div className="w-full h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={globalStats.avgLevels}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.5} />
                        <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                        <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} unit="%" />
                        <RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }} />
                        <Bar dataKey="RataRata" radius={[6, 6, 0, 0]}>
                          {globalStats.avgLevels.map((entry, idx) => {
                            // Assign standard levels colors
                            const colors = ["#ef4444", "#f97316", "#eab308", "#84cc16", "#0d9488", "#2563eb", "#9333ea"];
                            return <Cell key={`cell-${idx}`} fill={colors[idx] || "#4f46e5"} />;
                          })}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* 2. Sebaran Kategori Nilai Terpopuler */}
                <div className="bg-slate-950/40 p-6 rounded-3xl border border-slate-800 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white mb-1 tracking-wide uppercase">Popularitas Kategori Nilai</h3>
                    <p className="text-[11px] text-slate-400 mb-6">Dimensi kepribadian yang paling sering terpilih di database pendaftar.</p>
                  </div>
                  <div className="w-full h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={globalStats.categoryData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.5} />
                        <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                        <YAxis dataKey="category" type="category" tick={{ fill: '#94a3b8', fontSize: 9 }} width={90} />
                        <RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }} />
                        <Bar dataKey="Frekuensi" fill="#6366f1" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>

              {/* COLLECTIVE CORE STRENGTHS & LIMITING FIELDS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Kolektif Positive Core Values */}
                <div className="bg-indigo-950/20 border border-indigo-900/60 p-6 rounded-3xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-5 text-indigo-400 group-hover:opacity-10 transition-opacity pointer-events-none">
                    <Zap className="w-24 h-24" />
                  </div>
                  <h3 className="text-sm font-bold text-indigo-400 mb-1 tracking-wide uppercase flex items-center gap-1.5">
                    <Zap className="w-4 h-4" /> Top 5 Nilai Positif Kolektif
                  </h3>
                  <p className="text-xs text-indigo-300/60 mb-5 font-semibold">Kekuatan pendorong utama yang paling dominan di antara para pelamar.</p>
                  <div className="flex flex-col gap-3">
                    {globalStats.topPositive.length === 0 ? (
                      <div className="text-slate-600 text-xs">Belum ada data pendaftar</div>
                    ) : (
                      globalStats.topPositive.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-slate-950/40 border border-indigo-900/20 rounded-xl">
                          <span className="font-bold text-sm text-slate-100 flex items-center gap-2">
                            <span className="w-5 h-5 rounded-md bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 text-xs font-black flex items-center justify-center">{idx+1}</span>
                            {item.word}
                          </span>
                          <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest px-2.5 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-md">
                            Dipilih {item.count} Kali
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Kolektif Limiting Values */}
                <div className="bg-rose-950/20 border border-rose-900/60 p-6 rounded-3xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-5 text-rose-400 group-hover:opacity-10 transition-opacity pointer-events-none">
                    <AlertTriangle className="w-24 h-24" />
                  </div>
                  <h3 className="text-sm font-bold text-rose-400 mb-1 tracking-wide uppercase flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" /> Top 5 Hambatan Internal Kolektif
                  </h3>
                  <p className="text-xs text-rose-300/60 mb-5 font-semibold">Beban kecemasan dan tekanan yang paling sering dirasakan pendaftar OSIS.</p>
                  <div className="flex flex-col gap-3">
                    {globalStats.topLimiting.length === 0 ? (
                      <div className="text-slate-600 text-xs py-5 text-center">Tidak terdeteksi hambatan internal kolektif yang signifikan</div>
                    ) : (
                      globalStats.topLimiting.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-slate-950/40 border border-rose-900/20 rounded-xl">
                          <span className="font-bold text-sm text-slate-100 flex items-center gap-2">
                            <span className="w-5 h-5 rounded-md bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-black flex items-center justify-center">{idx+1}</span>
                            {item.word}
                          </span>
                          <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest px-2.5 py-1 bg-rose-500/10 border border-rose-500/20 rounded-md">
                            Terasa {item.count} Kali
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>

              {/* QUICK INSTRUCTION CARD */}
              <div className="p-6 bg-slate-950/60 rounded-3xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5">
                    <Info className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-base">Butuh detail kandidat tertentu?</h4>
                    <p className="text-xs text-slate-400 leading-relaxed mt-1 max-w-2xl">
                      Gunakan bilah samping (sidebar) di sebelah kiri untuk mencari, memfilter berdasarkan kelas atau status, dan klik nama kandidat untuk memuat data laporan psikologis mendalam serta daftar pertanyaan wawancara adaptif.
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    if (candidates.length > 0) {
                      handleSelectCandidate(candidates[0]);
                    }
                  }} 
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-3 px-6 rounded-xl transition-all shadow-md shrink-0 flex items-center gap-1.5"
                >
                  Pilih Kandidat Pertama <ChevronRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          )}

          {/* ============================================================
              TAB 2: DETAIL INDIVIDU & INTERACTIVE HOURGLASS
              ============================================================ */}
          {activeTab === "report" && activeCandidate && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-500 pb-10 max-w-6xl mx-auto w-full">
              
              {/* GLASSMORPHIC KANDIDAT HEADER */}
              <div className="bg-slate-950/60 p-6 md:p-8 rounded-3xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity duration-1000"></div>
                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-indigo-600/25">
                    {activeCandidate.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">{activeCandidate.name}</h2>
                    <div className="flex flex-wrap items-center gap-2.5 mt-2">
                      <span className="px-3 py-1 bg-indigo-500/25 text-indigo-300 text-xs font-black rounded-lg border border-indigo-500/25">{activeCandidate.student_class}</span>
                      <span className="text-slate-400 text-xs font-semibold flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" /> Terdaftar pada {new Date(activeCandidate.created_at).toLocaleDateString("id-ID", { day: '2-digit', month: 'long', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 relative z-10 shrink-0 self-stretch md:self-center">
                  <button 
                    onClick={() => {
                      setCompareA(activeCandidate.id);
                      setActiveTab("compare");
                    }}
                    className="flex-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 font-bold text-xs py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-1.5"
                  >
                    <ArrowLeftRight className="w-4 h-4 text-indigo-400" /> Bandingkan
                  </button>
                  <button 
                    onClick={() => window.print()}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5"
                  >
                    <FileSpreadsheet className="w-4 h-4" /> Cetak PDF
                  </button>
                </div>
              </div>

              {/* THREE MAIN KPI FLOATING ROW */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* 1. Indeks Kesiapan Mental */}
                <div className="bg-slate-950/40 p-6 rounded-3xl border border-slate-800 flex flex-col justify-between min-h-[300px] relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
                  <div>
                    <h3 className="text-sm font-bold text-white mb-1.5 tracking-wide uppercase">Indeks Kesiapan Mental</h3>
                    <p className="text-slate-400 text-xs leading-relaxed font-semibold">
                      Skor holistik mewakili stabilitas psikologis, pengendalian beban stres, dan keselarasan karakter ideal OSIS.
                    </p>
                  </div>
                  <div className="my-auto pt-4 relative z-10">
                    <PremiumGauge score={activeCandidate.analysis.healthScore} />
                  </div>
                </div>

                {/* 2. Tingkat Entropi Budaya */}
                <div className="bg-slate-950/40 p-6 rounded-3xl border border-slate-800 flex flex-col justify-between min-h-[300px] relative overflow-hidden group">
                  <div className="absolute bottom-0 left-0 p-6 opacity-5 pointer-events-none"><AlertTriangle className="w-20 h-20 text-yellow-500" /></div>
                  
                  <div>
                    <h3 className="text-sm font-bold text-white mb-1.5 tracking-wide uppercase">Tingkat Entropi (Internal Risk)</h3>
                    <p className="text-slate-400 text-xs leading-relaxed font-semibold">Mengukur persentase rasa ragu, kecemasan, dan tekanan batin.</p>
                  </div>

                  <div className="my-auto py-6 space-y-4">
                    {/* Progress Bar Entropi */}
                    <div className="flex h-3 w-full rounded-full overflow-hidden bg-slate-900 border border-slate-800 shadow-inner">
                      <div className="bg-emerald-500" style={{ width: `${Math.max(0, 100 - activeCandidate.analysis.entropyScore)}%` }}></div>
                      <div className="bg-rose-500" style={{ width: `${activeCandidate.analysis.entropyScore}%` }}></div>
                    </div>
                    
                    <div className="flex items-center gap-4 bg-slate-950/50 p-4 rounded-xl border border-slate-900 relative z-10">
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-lg font-black shrink-0 ${activeCandidate.analysis.entropyLevel.text} bg-slate-900 border border-slate-800`}>
                        {activeCandidate.analysis.entropyScore}%
                      </div>
                      <div>
                        <p className={`text-xs font-black uppercase ${activeCandidate.analysis.entropyLevel.text}`}>{activeCandidate.analysis.entropyLevel.label}</p>
                        <p className="text-[10px] text-slate-400 font-semibold mt-0.5 leading-relaxed">
                          {activeCandidate.analysis.entropyScore < 14 ? "Kandidat sangat stabil secara emosional." 
                          : activeCandidate.analysis.entropyScore < 20 ? "Ada sedikit kekhawatiran terkendali."
                          : "Sedang mengalami tekanan mental yang cukup menonjol."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Kesesuaian Karakter (Alignment) */}
                <div className="bg-slate-950/40 p-6 rounded-3xl border border-slate-800 flex flex-col justify-between min-h-[300px] relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
                  <div>
                    <h3 className="text-sm font-bold text-white mb-1.5 tracking-wide uppercase">Kesesuaian Karakter (Alignment)</h3>
                    <p className="text-slate-400 text-xs leading-relaxed font-semibold">Tingkat kepemilikan nilai-nilai positif yang ideal untuk keharmonisan tim OSIS.</p>
                  </div>
                  
                  <div className="my-auto flex flex-col items-center justify-center py-4">
                    <div className="w-24 h-24 rounded-full border-[6px] border-emerald-500/10 bg-emerald-500/5 text-emerald-400 flex items-center justify-center text-3xl font-black shrink-0 shadow-lg shadow-emerald-500/5 transition-transform duration-500 group-hover:scale-105">
                      {activeCandidate.analysis.alignmentScore} <span className="text-xs font-bold text-slate-500 ml-0.5">/ 10</span>
                    </div>
                    <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mt-3.5 bg-emerald-500/10 px-2 py-0.5 border border-emerald-500/20 rounded-md">
                      Poin Keselarasan
                    </span>
                  </div>
                </div>

              </div>

              {/* PROFIL PSIKOLOGIS RADAR & BARRETT BALANCE */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* 1. Radar Chart 10 Dimensi */}
                <div className="lg:col-span-2 bg-slate-950/40 p-6 rounded-3xl border border-slate-800 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white mb-1 tracking-wide uppercase">Siluet Karakter 10 Dimensi</h3>
                    <p className="text-[11px] text-slate-400 mb-6">Pemetaan psikometri di 10 aspek nilai kepribadian.</p>
                  </div>
                  <div className="w-full h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={individualRadarData}>
                        <PolarGrid stroke="#334155" opacity={0.6} />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 700 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#475569', fontSize: 8 }} />
                        <Radar name={activeCandidate.name} dataKey="Kandidat" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} />
                        <RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* 2. Focus Energi (Balance Index) & Perspectives */}
                <div className="space-y-6 flex flex-col justify-between">
                  {/* Balance Index */}
                  <div className="bg-slate-950/40 p-6 rounded-3xl border border-slate-800 flex-1 flex flex-col justify-between relative overflow-hidden">
                    <h3 className="text-xs font-bold text-slate-300 mb-4 uppercase border-b border-slate-800 pb-2.5">Fokus Energi (Balance Index)</h3>
                    <div className="w-full h-[120px] relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={balanceData} cx="50%" cy="50%" innerRadius={0} outerRadius={45} dataKey="value" stroke="#0f172a" strokeWidth={2}>
                            {balanceData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                          </Pie>
                          <RechartsTooltip formatter={(value) => `${value}%`} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center gap-3 text-[9px] font-black text-slate-400 mt-2 border-t border-slate-800/80 pt-2.5">
                      <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-[#f97316]"></span> Foundation</div>
                      <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-[#84cc16]"></span> Evolution</div>
                      <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-[#4f46e5]"></span> Impact</div>
                    </div>
                  </div>

                  {/* Orientasi Kerja */}
                  <div className="bg-slate-950/40 p-6 rounded-3xl border border-slate-800 flex-1 flex flex-col justify-between">
                    <h3 className="text-xs font-bold text-slate-300 mb-4 uppercase border-b border-slate-800 pb-2.5">Orientasi Kerja (Perspektif)</h3>
                    <div className="flex justify-between items-end h-[100px] px-2 pt-2">
                      {[
                        { key: 'Process', label: 'Proses', icon: <Activity className="w-3.5 h-3.5 text-emerald-400"/> },
                        { key: 'People', label: 'Relasi', icon: <Heart className="w-3.5 h-3.5 text-rose-400"/> },
                        { key: 'Purpose', label: 'Target', icon: <Target className="w-3.5 h-3.5 text-amber-400"/> }
                      ].map((item) => {
                        const val = activeCandidate.analysis.perspectives[item.key.toLowerCase() as keyof typeof activeCandidate.analysis.perspectives];
                        return (
                          <div key={item.key} className="flex flex-col items-center w-12 group">
                            <div className="w-full bg-slate-900 border border-slate-800 rounded-t-lg flex-1 relative flex items-end overflow-hidden">
                              <div className="w-full bg-indigo-600 transition-all duration-700 ease-out shadow-[0_-4px_6px_-1px_rgba(99,102,241,0.2)]" style={{ height: `${val}%` }}></div>
                            </div>
                            <div className="flex items-center gap-1 mt-2.5 text-slate-500">{item.icon}</div>
                            <p className="text-[10px] font-extrabold text-slate-300 mt-1">{item.label}</p>
                            <p className="text-[9px] text-indigo-400 font-bold">{val}%</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

              </div>

              {/* INTERACTIVE BARRETT HOURGLASS MATRIX */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Visual Hourglass */}
                <div className="lg:col-span-2 bg-slate-950/40 p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row gap-8 items-center justify-between">
                  <div className="flex-1 space-y-4">
                    <h3 className="text-sm font-bold text-white mb-1 tracking-wide uppercase">Interactive Barrett Hourglass</h3>
                    <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">
                      Matriks 7 tingkat kesadaran Barrett Model. <span className="text-indigo-400 font-bold">Sorot atau klik pada bar tingkat kesadaran</span> untuk membaca arti penting porsi nilai tersebut serta melihat kata-kata yang dipilih kandidat secara real-time.
                    </p>
                    
                    {/* Deskripsi level aktif jika ada */}
                    {activeHourglassLvl !== null ? (
                      <div className="p-4 bg-slate-900 border border-indigo-800/40 rounded-xl space-y-2 animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center gap-2">
                          <span className={`w-3 h-3 rounded-full ${BARRETT_LEVELS.find(l => l.lvl === activeHourglassLvl)?.color}`}></span>
                          <h4 className="font-extrabold text-white text-xs">{BARRETT_LEVELS.find(l => l.lvl === activeHourglassLvl)?.name}</h4>
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                          {BARRETT_LEVELS.find(l => l.lvl === activeHourglassLvl)?.desc}
                        </p>
                        
                        {/* Kata terpilih di level ini */}
                        <div className="border-t border-slate-800/80 pt-2 mt-2">
                          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Pilihan Kata Kandidat:</p>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {(() => {
                              const words = activeCandidate.selected_word_ids
                                .map(id => WORDS.find(w => w.id === id))
                                .filter(w => w && levelMapping[w.category] === activeHourglassLvl)
                                .map(w => w?.word);
                              
                              if (words.length === 0) {
                                return <span className="text-[10px] text-slate-600 font-semibold italic">Tidak ada kata terpilih di level ini</span>;
                              }
                              return words.map((w, idx) => (
                                <span key={idx} className="text-[10px] font-bold px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 rounded-md">
                                  {w}
                                </span>
                              ));
                            })()}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-5 bg-slate-900/40 border border-slate-800 border-dashed rounded-xl flex items-center justify-center text-center text-slate-500 text-xs font-semibold">
                        Arahkan kursor atau klik salah satu level untuk menampilkan info interpretasi detail.
                      </div>
                    )}
                  </div>

                  {/* SVG Hourglass */}
                  <div className="w-[180px] flex-shrink-0 relative py-4 flex flex-col gap-2 items-center">
                    <svg viewBox="0 0 100 240" className="absolute inset-0 w-full h-full z-0 opacity-10">
                      <polygon points="15,0 85,0 70,120 85,240 15,240 30,120" fill="#38bdf8" />
                    </svg>
                    
                    {BARRETT_LEVELS.map((item) => {
                      const val = activeCandidate.analysis.levels[item.lvl as keyof typeof activeCandidate.analysis.levels] || 0;
                      const isHovered = activeHourglassLvl === item.lvl;
                      const hasWords = activeCandidate.selected_word_ids
                        .map(id => WORDS.find(w => w.id === id))
                        .filter(w => w && levelMapping[w.category] === item.lvl).length > 0;
                      
                      return (
                        <button
                          key={item.lvl}
                          onMouseEnter={() => setActiveHourglassLvl(item.lvl)}
                          onClick={() => setActiveHourglassLvl(item.lvl)}
                          className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg border text-left relative z-10 transition-all ${
                            isHovered 
                              ? 'bg-slate-900 border-slate-700 shadow-md shadow-slate-950' 
                              : 'bg-slate-950/40 border-slate-900/60'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className={`w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center shadow-md ${item.color} ${
                              hasWords ? "ring-2 ring-white/20 animate-pulse" : "opacity-60"
                            }`}>
                              {item.lvl}
                            </div>
                            <span className="text-[10px] font-extrabold text-slate-300">Level {item.lvl}</span>
                          </div>
                          
                          {/* Persentase */}
                          <span className={`text-[10px] font-black ${val > 0 ? item.text : "text-slate-600"}`}>
                            {val}%
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Level Distribution Sidebar Details */}
                <div className="bg-slate-950/40 p-6 rounded-3xl border border-slate-800 flex flex-col justify-between">
                  <h3 className="text-xs font-bold text-slate-300 mb-4 uppercase border-b border-slate-800 pb-2.5">Distribusi Tingkat Kesadaran</h3>
                  <div className="space-y-3.5">
                    {BARRETT_LEVELS.map((item) => {
                      const val = activeCandidate.analysis.levels[item.lvl as keyof typeof activeCandidate.analysis.levels] || 0;
                      return (
                        <div key={item.lvl} className="space-y-1">
                          <div className="flex items-center justify-between text-[10px] font-black text-slate-400">
                            <span className="truncate max-w-[130px]">{item.name}</span>
                            <span>{val}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${item.color}`} style={{ width: `${val}%` }}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* WORD CLOUD PILLS GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Positive Values */}
                <div className="bg-indigo-950/15 border border-indigo-900/40 p-6 rounded-3xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-5 text-indigo-400 group-hover:scale-105 transition-transform pointer-events-none"><Zap className="w-24 h-24" /></div>
                  <h3 className="text-sm font-bold text-indigo-400 mb-1 tracking-wide uppercase flex items-center gap-1.5">
                    <Zap className="w-4 h-4" /> Kekuatan Karakter Utama (Positive Values)
                  </h3>
                  <p className="text-xs text-indigo-300/50 mb-5 font-semibold">Kata-kata positif pilihan kandidat yang mewakili core kekuatan mental.</p>
                  
                  <div className="flex flex-wrap gap-2 relative z-10">
                    {activeCandidate.analysis.topValues.map((w, idx) => (
                      <span key={idx} className="px-3.5 py-1.5 bg-slate-900/80 hover:bg-slate-900 border border-indigo-900/30 text-slate-100 text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" /> {w}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Potentially Limiting Values */}
                <div className="bg-rose-950/15 border border-rose-900/40 p-6 rounded-3xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-5 text-rose-400 group-hover:scale-105 transition-transform pointer-events-none"><AlertTriangle className="w-24 h-24" /></div>
                  <h3 className="text-sm font-bold text-rose-400 mb-1 tracking-wide uppercase flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" /> Hambatan Potensial (Limiting Values)
                  </h3>
                  <p className="text-xs text-rose-300/50 mb-5 font-semibold">Indikator kecemasan/tekanan mental internal yang perlu diklarifikasi.</p>
                  
                  {activeCandidate.analysis.limitingWords.length > 0 ? (
                    <div className="flex flex-wrap gap-2 relative z-10">
                      {activeCandidate.analysis.limitingWords.map((w, idx) => (
                        <span key={idx} className="px-3.5 py-1.5 bg-slate-900/80 border border-rose-900/30 text-rose-300 text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5">
                          <XCircle className="w-3.5 h-3.5 text-rose-400" /> {w}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="w-full p-5 bg-emerald-500/10 text-emerald-400 rounded-xl text-xs text-center font-bold border border-emerald-500/20 relative z-10">
                      Luar Biasa! Tidak terdeteksi hambatan internal psikologis.
                    </div>
                  )}
                </div>

              </div>

              {/* ============================================================
                  AI RECRUITER'S INTERVIEW TOOLKIT (Adaptif & Premium)
                  ============================================================ */}
              <div className="bg-gradient-to-br from-indigo-950/30 via-slate-900/60 to-violet-950/30 border border-indigo-500/20 p-6 md:p-8 rounded-3xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
                
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <Lightbulb className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white uppercase tracking-wide">Recruiter's Interview Toolkit</h3>
                    <p className="text-[11px] text-indigo-300/80 font-bold uppercase mt-0.5">Panduan Pertanyaan Wawancara Adaptif Navasena</p>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mb-6 font-semibold">
                  Sistem mendeteksi <span className="text-indigo-400 font-bold">{activeCandidate.analysis.limitingWords.length} kata pembatas</span> dari pilihan kandidat. Gunakan daftar pertanyaan perilaku adaptif di bawah ini saat wawancara mendalam untuk mengklarifikasi kematangan mental kandidat:
                </p>

                <div className="space-y-4">
                  {interviewQuestions.map((q, idx) => (
                    <div key={idx} className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800/80 hover:border-indigo-900/40 transition-colors space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest px-2.5 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-md">
                          Indikator: {q.word} ({q.category})
                        </span>
                        <span className="text-[10px] text-slate-500 font-bold">PERTANYAAN {idx+1}</span>
                      </div>
                      
                      <h4 className="font-extrabold text-sm text-slate-100 leading-relaxed border-l-2 border-indigo-500 pl-3">
                        "{q.question}"
                      </h4>

                      <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 text-[11px] leading-relaxed">
                        <strong className="text-emerald-400 font-bold uppercase tracking-wider block mb-1">Panduan Jawaban Ideal:</strong>
                        <span className="text-slate-400 font-semibold">{q.lookFor}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* ============================================================
              TAB 3: COMPARE KANDIDAT MODE (Side by Side)
              ============================================================ */}
          {activeTab === "compare" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-500 pb-10">
              
              {/* Dual Selector Card */}
              <div className="bg-slate-950/60 p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row gap-6 items-center justify-between">
                
                {/* Selector A */}
                <div className="flex-1 w-full space-y-2">
                  <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block">Kandidat Pembanding A</label>
                  <select
                    value={compareA}
                    onChange={(e) => setCompareA(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    {analyzedCandidates.map(c => <option key={c.id} value={c.id}>{c.name} ({c.student_class})</option>)}
                  </select>
                </div>

                {/* VS Divider */}
                <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 font-black flex items-center justify-center shrink-0 shadow-inner">
                  VS
                </div>

                {/* Selector B */}
                <div className="flex-1 w-full space-y-2">
                  <label className="text-[10px] font-black text-rose-400 uppercase tracking-widest block">Kandidat Pembanding B</label>
                  <select
                    value={compareB}
                    onChange={(e) => setCompareB(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 font-bold focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                  >
                    {analyzedCandidates.map(c => <option key={c.id} value={c.id}>{c.name} ({c.student_class})</option>)}
                  </select>
                </div>

              </div>

              {/* Side by Side Comparison Layout */}
              {candidateAData && candidateBData ? (
                <div className="space-y-6">
                  
                  {/* MAIN COMPARATIVE KPI METRICS GRID */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Candidate A Card */}
                    <div className="bg-slate-950/40 p-6 rounded-3xl border border-indigo-900/30 space-y-6 relative overflow-hidden">
                      <div className="absolute top-0 right-0 -mt-20 -mr-20 w-40 h-40 bg-indigo-500/5 rounded-full blur-3xl"></div>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-indigo-600/25 border border-indigo-500/40 rounded-xl flex items-center justify-center text-indigo-300 text-lg font-black shrink-0">A</div>
                        <div>
                          <h3 className="text-lg font-black text-white truncate max-w-[250px]">{candidateAData.name}</h3>
                          <span className="px-2.5 py-0.5 bg-indigo-500/10 text-indigo-400 text-[10px] font-black rounded border border-indigo-500/25">{candidateAData.student_class}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-800/80">
                        <div className="text-center p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                          <p className="text-[9px] font-black text-slate-500 uppercase">Kesiapan</p>
                          <p className="text-2xl font-black text-white mt-1">{candidateAData.analysis.healthScore}</p>
                        </div>
                        <div className="text-center p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                          <p className="text-[9px] font-black text-slate-500 uppercase">Entropi</p>
                          <p className="text-2xl font-black text-rose-400 mt-1">{candidateAData.analysis.entropyScore}%</p>
                        </div>
                        <div className="text-center p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                          <p className="text-[9px] font-black text-slate-500 uppercase">Kesesuaian</p>
                          <p className="text-2xl font-black text-emerald-400 mt-1">{candidateAData.analysis.alignmentScore}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Kekuatan Utama:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {candidateAData.analysis.topValues.map((w, idx) => (
                            <span key={idx} className="text-[10px] font-bold px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 rounded-md">{w}</span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Candidate B Card */}
                    <div className="bg-slate-950/40 p-6 rounded-3xl border border-rose-900/30 space-y-6 relative overflow-hidden">
                      <div className="absolute top-0 right-0 -mt-20 -mr-20 w-40 h-40 bg-rose-500/5 rounded-full blur-3xl"></div>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-rose-600/25 border border-rose-500/40 rounded-xl flex items-center justify-center text-rose-300 text-lg font-black shrink-0">B</div>
                        <div>
                          <h3 className="text-lg font-black text-white truncate max-w-[250px]">{candidateBData.name}</h3>
                          <span className="px-2.5 py-0.5 bg-rose-500/10 text-rose-400 text-[10px] font-black rounded border border-rose-500/25">{candidateBData.student_class}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-800/80">
                        <div className="text-center p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                          <p className="text-[9px] font-black text-slate-500 uppercase">Kesiapan</p>
                          <p className="text-2xl font-black text-white mt-1">{candidateBData.analysis.healthScore}</p>
                        </div>
                        <div className="text-center p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                          <p className="text-[9px] font-black text-slate-500 uppercase">Entropi</p>
                          <p className="text-2xl font-black text-rose-400 mt-1">{candidateBData.analysis.entropyScore}%</p>
                        </div>
                        <div className="text-center p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                          <p className="text-[9px] font-black text-slate-500 uppercase">Kesesuaian</p>
                          <p className="text-2xl font-black text-emerald-400 mt-1">{candidateBData.analysis.alignmentScore}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Kekuatan Utama:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {candidateBData.analysis.topValues.map((w, idx) => (
                            <span key={idx} className="text-[10px] font-bold px-2 py-0.5 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-md">{w}</span>
                          ))}
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* OVERLAID COMPARATIVE RADAR CHART */}
                  <div className="bg-slate-950/40 p-6 rounded-3xl border border-slate-800 flex flex-col justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white mb-1 tracking-wide uppercase">Analisis Benturan Siluet Karakter</h3>
                      <p className="text-[11px] text-slate-400 mb-6">Visualisasi tumpang tindih dari 10 dimensi psikologis kedua kandidat.</p>
                    </div>
                    
                    <div className="w-full h-[320px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarComparisonData}>
                          <PolarGrid stroke="#334155" opacity={0.6} />
                          <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 700 }} />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#475569', fontSize: 8 }} />
                          <Radar name={candidateAData.name} dataKey={candidateAData.name} stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} />
                          <Radar name={candidateBData.name} dataKey={candidateBData.name} stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.25} />
                          <Legend wrapperStyle={{ paddingTop: 10 }} />
                          <RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                </div>
              ) : (
                <div className="text-center py-10 text-slate-500 text-xs font-semibold">
                  Silakan pilih pendaftar OSIS pada kolom drop-down pembanding di atas.
                </div>
              )}

            </div>
          )}

          {/* ============================================================
              TAB 4: PANDUAN INTERPRETASI BARRETT MODEL
              ============================================================ */}
          {activeTab === "guide" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-500 pb-10 max-w-4xl mx-auto w-full text-slate-300">
              
              <div className="bg-slate-950/60 p-6 rounded-3xl border border-slate-800 space-y-4">
                <h3 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Info className="w-5 h-5 text-indigo-400" /> Mengenal Barrett Model 7 Tingkat Kesadaran
                </h3>
                <p className="text-xs leading-relaxed text-slate-400 font-semibold">
                  Barrett Model membagi fokus kesadaran psikologis pendaftar menjadi 7 tingkat. Dalam perekrutan pengurus OSIS, pemahaman atas sebaran ini membantu kita menempatkan kandidat pada posisi kepengurusan yang tepat (*Right Man in the Right Place*):
                </p>

                <div className="space-y-4 pt-4 border-t border-slate-800/80">
                  {BARRETT_LEVELS.map((item) => (
                    <div key={item.lvl} className="flex gap-4 p-4 bg-slate-900/60 border border-slate-800 rounded-2xl">
                      <div className={`w-10 h-10 rounded-xl text-white text-base font-black flex items-center justify-center shrink-0 ${item.color} shadow-md`}>
                        {item.lvl}
                      </div>
                      <div className="space-y-1.5">
                        <h4 className="font-extrabold text-sm text-slate-100">{item.name}</h4>
                        <p className="text-xs text-slate-400 leading-relaxed font-semibold">{item.desc}</p>
                        
                        <div className="text-[10px] text-indigo-300 font-extrabold bg-indigo-500/10 px-2 py-0.5 border border-indigo-500/20 rounded inline-block">
                          {item.lvl === 7 && "Saran Posisi: Ketua OSIS / Pembuat Visi / Humas Hubungan Luar"}
                          {item.lvl === 6 && "Saran Posisi: Wakil Ketua / Kordinator Lintas Sekbid / Hubungan Internal"}
                          {item.lvl === 5 && "Saran Posisi: Sekbid Keagamaan / Pengawas Kode Etik / MPK"}
                          {item.lvl === 4 && "Saran Posisi: Sekbid Inovasi / R&D / Kreatif / Kewirausahaan"}
                          {item.lvl === 3 && "Saran Posisi: Sekretaris / Bendahara / Sekbid Dokumentasi & Administrasi"}
                          {item.lvl === 2 && "Saran Posisi: Hubungan Siswa / Pengelola Konflik / Sekbid Olahraga & Seni"}
                          {item.lvl === 1 && "Saran Posisi: Perlengkapan / Logistik / Sekbid Keamanan & Disiplin Lapangan"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}