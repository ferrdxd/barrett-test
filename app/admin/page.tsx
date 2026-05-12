"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { WORDS, Category } from "../../lib/word";
import { getBarrettAnalysis } from "../../lib/interpreter";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts";
import { User, Search, BrainCircuit, Activity, Heart, Target, Sparkles, AlertTriangle, BookOpenCheck, BarChart3, HelpCircle, Zap, ShieldCheck } from "lucide-react";

interface Candidate {
  id: string; name: string; student_class: string; selected_word_ids: string[]; created_at: string;
}

// ============================================================
// KOMPONEN UI KUSTOM & POLISHED
// ============================================================

// 1. Custom SVG Gauge (Sleek & Accurate) - PENGGANTI SPEEDOMETER LAMA
const PremiumGauge = ({ score }: { score: number }) => {
  // Angle: 0 score = 180deg (kiri), 100 score = 360deg/0deg (kanan)
  const rotation = 180 + (score / 100) * 180;
  
  return (
    <div className="relative w-full max-w-[320px] mx-auto aspect-[2/1] overflow-hidden group">
      <svg viewBox="0 0 200 100" className="w-full h-full overflow-visible drop-shadow-xl">
        <defs>
          <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ef4444" />   {/* Merah */}
            <stop offset="25%" stopColor="#f97316" />  {/* Oranye */}
            <stop offset="50%" stopColor="#eab308" />  {/* Kuning */}
            <stop offset="75%" stopColor="#84cc16" />  {/* Hijau Muda */}
            <stop offset="100%" stopColor="#10b981" /> {/* Hijau Tua */}
          </linearGradient>
        </defs>
        {/* Track Belakang */}
        <path d="M 20 90 A 70 70 0 0 1 180 90" fill="none" stroke="#f1f5f9" strokeWidth="20" strokeLinecap="round" />
        {/* Track Warna */}
        <path d="M 20 90 A 70 70 0 0 1 180 90" fill="none" stroke="url(#gaugeGradient)" strokeWidth="20" strokeLinecap="round" />
        
        {/* Jarum Penunjuk */}
        <g transform={`rotate(${rotation} 100 90)`} className="transition-transform duration-1000 ease-out">
          <path d="M 96 90 L 100 25 L 104 90 Z" fill="#1e293b" className="drop-shadow-md" />
          <circle cx="100" cy="90" r="10" fill="#0f172a" />
          <circle cx="100" cy="90" r="5" fill="#ffffff" />
        </g>
      </svg>
      {/* Label Skor di Tengah Bawah */}
      <div className="absolute bottom-0 left-0 w-full flex flex-col items-center justify-end pb-1 translate-y-1">
        <span className="text-5xl font-extrabold tracking-tighter text-slate-900 group-hover:text-blue-600 transition-colors">{score}</span>
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-[-2px]">Poin Kesiapan</span>
      </div>
    </div>
  );
};

export default function AdminDashboard() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => { fetchCandidates(); }, []);

  const fetchCandidates = async () => {
    const { data } = await supabase.from("candidates").select("*").order("created_at", { ascending: false });
    if (data) setCandidates(data);
  };

  const filteredCandidates = candidates.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const analysis = selectedCandidate ? getBarrettAnalysis(selectedCandidate.selected_word_ids) : null;

  const balanceData = analysis ? [
    { name: 'Foundation', value: analysis.balance.foundation, fill: '#f97316' }, // Oranye
    { name: 'Evolution', value: analysis.balance.evolution, fill: '#84cc16' },  // Hijau
    { name: 'Impact', value: analysis.balance.impact, fill: '#3b82f6' },        // Biru
  ] : [];

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-6 flex flex-col md:flex-row gap-6 font-sans text-slate-800">
      
      {/* ================= SIDEBAR (Polished) ================= */}
      <div className="w-full md:w-[360px] bg-white rounded-3xl overflow-hidden flex flex-col h-[calc(100vh-3rem)] shadow-lg shadow-slate-900/5 border border-slate-100 flex-shrink-0">
        <div className="p-7 bg-white border-b border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none"><BrainCircuit className="w-24 h-24 text-slate-200" /></div>
          <div className="flex items-center gap-4 mb-6 relative z-10">
            <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center shadow-lg shadow-slate-900/10">
              <BookOpenCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-extrabold text-slate-950 text-xl tracking-tight">Admin Dashboard</h2>
              <p className="text-slate-500 text-sm font-medium">Sistem Analisis Seleksi OSIS</p>
            </div>
          </div>
          <div className="relative z-10">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari kandidat..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 transition-all placeholder:text-slate-400 font-medium"
            />
          </div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-6">
            Kandidat Masuk ({filteredCandidates.length})
          </p>
        </div>
        
        <div className="overflow-y-auto flex-1 p-3 space-y-1 custom-scrollbar">
          {filteredCandidates.map(c => {
            const isSelected = selectedCandidate?.id === c.id;
            return (
              <button
                key={c.id} onClick={() => setSelectedCandidate(c)}
                className={`w-full text-left p-5 rounded-2xl flex items-center justify-between group transition-all duration-300 relative overflow-hidden ${
                  isSelected ? 'bg-blue-600 shadow-xl shadow-blue-500/20 scale-[1.02]' : 'bg-transparent hover:bg-slate-50'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-0 left-0 h-full w-2 bg-blue-400 rounded-full blur-sm"></div>
                )}
                <div className="flex items-center gap-4 relative z-10">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-inner transition-colors ${isSelected ? 'bg-white/10 text-white' : 'bg-white border border-slate-200 text-slate-400'}`}>
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <p className={`font-extrabold text-base tracking-tight ${isSelected ? 'text-white' : 'text-slate-800 group-hover:text-blue-600'}`}>{c.name}</p>
                    <p className={`text-xs font-semibold mt-0.5 ${isSelected ? 'text-blue-200' : 'text-slate-500'}`}>{c.student_class}</p>
                  </div>
                </div>
                {isSelected && <Sparkles className="w-5 h-5 text-white/50" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* ================= MAIN CONTENT ================= */}
      <div className="flex-1 rounded-3xl flex flex-col h-[calc(100vh-3rem)] overflow-y-auto custom-scrollbar scroll-smooth">
        {selectedCandidate && analysis ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-12 duration-700 pb-10 max-w-5xl mx-auto w-full p-2">
            
            {/* HEADER Laporan KANDIDAT */}
            <div className="flex items-end justify-between bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
               <div>
                  <h1 className="text-3xl font-extrabold text-slate-950 tracking-tight mb-2.5">{selectedCandidate.name}</h1>
                  <div className="flex items-center gap-3">
                     <span className="px-4 py-1.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-full">{selectedCandidate.student_class}</span>
                     <span className="text-slate-500 text-sm font-medium">Laporan Analisis Profil Psikologis Navasena</span>
                  </div>
               </div>
               <div className="hidden md:flex flex-col items-end">
                  <BookOpenCheck className="w-10 h-10 text-blue-500 opacity-90" />
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Berdasarkan Barrett Model</p>
               </div>
            </div>

            {/* ROW 1: Skor Utama (mental readiness) & Faktor Entropi */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Skor Kesiapan Mental (Gauge - FIXED & PRESISI) */}
              <div className="bg-white p-9 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col justify-between relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/70 rounded-full blur-3xl opacity-60 -mr-10 -mt-10 pointer-events-none group-hover:opacity-100 transition-opacity duration-1000"></div>
                
                <div className="relative z-10 mb-8">
                  <h3 className="text-lg font-extrabold text-slate-900 mb-2">Indeks Kesiapan Mental</h3>
                  <p className="text-slate-600 text-sm leading-relaxed max-w-lg">
                    Skor holistik ini merepresentasikan tingkat stabilitas psikologis, minimnya beban stres, dan keselarasan karakter kandidat dengan kultur kepemimpinan OSIS.
                  </p>
                </div>
                
                <div className="mt-auto relative z-10 pt-6">
                  <PremiumGauge score={analysis.healthScore} />
                </div>
              </div>

              {/* Entropy & Alignment */}
              <div className="space-y-6 flex flex-col">
                {/* Cultural Entropy Score */}
                <div className="bg-white p-9 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex-1 flex flex-col relative overflow-hidden">
                  <div className="absolute bottom-0 left-0 p-6 opacity-5 pointer-events-none"><AlertTriangle className="w-16 h-16 text-amber-300" /></div>
                  <h3 className="text-base font-extrabold text-slate-800 mb-1">Tingkat Entropi (Hambatan Internal)</h3>
                  <p className="text-xs text-slate-500 mb-6">Mengukur persentase keraguan diri, kecemasan, dan tekanan yang sedang dirasakan.</p>
                  
                  {/* Indikator Bar */}
                  <div className="flex h-3 w-full rounded-full overflow-hidden mb-3.5 bg-slate-100 shadow-inner">
                    <div className="bg-[#84cc16] w-[13%]"></div>
                    <div className="bg-[#eab308] w-[6%]"></div>
                    <div className="bg-[#f97316] w-[10%]"></div>
                    <div className="bg-[#ef4444] w-[71%]"></div>
                  </div>
                  
                  {/* Panah Penunjuk */}
                  <div className="relative w-full h-4 mb-4">
                     <div 
                        className={`absolute top-0 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[8px] transition-all duration-1000 ${analysis.entropyLevel.text.replace('text-', 'border-b-')}`} 
                        style={{ left: `${Math.min(analysis.entropyScore, 98)}%`, transform: 'translateX(-50%)' }}
                     />
                  </div>

                  <div className="flex items-center gap-5 mt-auto bg-slate-50/70 p-5 rounded-2xl border border-slate-100 shadow-sm relative z-10">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-black bg-white shadow-lg ${analysis.entropyLevel.text}`}>
                      {analysis.entropyScore}%
                    </div>
                    <div className="flex-1">
                      <p className={`text-base font-extrabold ${analysis.entropyLevel.text}`}>{analysis.entropyLevel.label}</p>
                      <p className="text-xs text-slate-600 font-medium mt-0.5 leading-relaxed">
                        {analysis.entropyScore < 14 ? "Kandidat memiliki fokus yang jernih dan stabil." 
                        : analysis.entropyScore < 20 ? "Ada sedikit beban pikiran, namun masih terkendali."
                        : "Kandidat sedang menghadapi tekanan atau keraguan diri yang cukup signifikan."}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Alignment */}
                <div className="bg-white p-7 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex items-center gap-6 group hover:border-emerald-100 transition-colors">
                   <div className="w-16 h-16 rounded-full border-4 border-emerald-100 bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100/50 group-hover:scale-105 transition-all flex items-center justify-center text-3xl font-black shrink-0 shadow-lg shadow-emerald-500/5">
                      {analysis.alignmentScore}
                   </div>
                   <div>
                      <h3 className="text-sm font-bold text-slate-800">Kesesuaian Karakter</h3>
                      <p className="text-xs text-slate-500 leading-relaxed mt-1">
                         Skor {analysis.alignmentScore}/10 menunjukkan sejauh mana kandidat memiliki nilai-nilai positif yang sejalan dengan kultur ideal organisasi OSIS.
                      </p>
                   </div>
                </div>
              </div>

            </div>

            {/* ROW 2: MATRIX & BALANCE */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* HOURGLASS MATRIX dengan PENJELASAN BARU */}
              <div className="lg:col-span-2 bg-white p-9 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
                <div className="flex justify-between items-start mb-10">
                   <div>
                      <h3 className="text-lg font-extrabold text-slate-950 mb-1">Matriks Distribusi Karakter</h3>
                      <p className="text-slate-500 text-xs mb-10">Visualisasi 7 Tingkat Kesadaran (Barrett Model) dari nilai-nilai personal kandidat.</p>
                   </div>
                   <div className="group relative">
                      <HelpCircle className="w-5 h-5 text-slate-400 group-hover:text-blue-500 cursor-help" />
                      <div className="absolute bottom-full right-0 mb-3 w-[400px] bg-slate-900 text-white p-6 rounded-2xl shadow-xl text-xs leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-50">
                         <h4 className="font-bold text-amber-400 text-sm mb-3">Panduan Membaca Matriks Hourglass OSIS:</h4>
                         <ul className="space-y-2.5">
                            <li><strong className="text-[#3b82f6]">Impact (7,6,5):</strong> Fokus pada VISI, KOLABORASI lintas divisi, dan KONTRIBUSI untuk kemajuan organisasi. Kandidat visioner dan proaktif.</li>
                            <li><strong className="text-[#84cc16]">Evolution (4):</strong> Fokus pada INOVASI, ADAPTASI terhadap perubahan, dan TRANSFORMASI untuk OSIS yang lebih baik. Kandidat terbuka dan dinamis.</li>
                            <li><strong className="text-[#f97316]">Foundation (3,2,1):</strong> Fokus pada STABILITAS (disiplin, Kontrol Diri), HUBUNGAN harmonis (Empati), dan KEPENTINGAN dasar (Keinginan).</li>
                         </ul>
                         <p className="mt-3 text-slate-400">Total poin semua level adalah 10 (dari 10 kata terpilih).</p>
                      </div>
                   </div>
                </div>
                
                <div className="flex gap-10 items-center">
                  {/* SVG Hourglass Graphic */}
                  <div className="w-32 flex-shrink-0 relative py-4">
                     <svg viewBox="0 0 100 300" className="absolute inset-0 w-full h-full z-0 opacity-40">
                        <polygon points="10,0 90,0 70,150 90,300 10,300 30,150" fill="#f1f5f9" />
                     </svg>
                     <div className="relative z-10 flex flex-col gap-3.5 items-center">
                        {[
                          { lvl: 7, color: 'bg-purple-600', label: 'Impact', text: 'text-purple-600' },
                          { lvl: 6, color: 'bg-blue-500', label: '', text: '' },
                          { lvl: 5, color: 'bg-teal-500', label: '', text: '' },
                          { lvl: 4, color: 'bg-lime-500', label: 'Evolution', text: 'text-lime-600', mt: 'mt-3.5', mb: 'mb-3.5' },
                          { lvl: 3, color: 'bg-amber-500', label: '', text: '' },
                          { lvl: 2, color: 'bg-orange-500', label: '', text: '' },
                          { lvl: 1, color: 'bg-red-500', label: 'Foundation', text: 'text-orange-600' }
                        ].map((item, idx) => (
                           <div key={idx} className={`relative flex items-center justify-center w-full ${item.mt || ''} ${item.mb || ''}`}>
                              {item.label && <span className={`absolute right-[calc(100%+14px)] text-[10px] font-bold uppercase tracking-wider ${item.text}`}>{item.label}</span>}
                              <div className={`w-8 h-8 rounded-full text-white flex items-center justify-center font-bold text-sm shadow-lg border-2 border-white/50 ${item.color}`}>
                                 {item.lvl}
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>

                  {/* Bar Charts (Revised visually) */}
                  <div className="flex-1 border-l border-slate-100 pl-8 space-y-[21.5px] py-4">
                    {[7, 6, 5, 4, 3, 2, 1].map(lvl => {
                      const val = analysis.levels[lvl as keyof typeof analysis.levels];
                      const isEmpty = val === 0;
                      return (
                        <div key={lvl} className={`flex items-center w-full ${lvl === 4 ? 'my-7.5' : ''}`}>
                          <div className="w-full h-5 bg-slate-50 rounded-r-full flex items-center relative overflow-hidden group">
                             {/* Track Background */}
                             <div 
                                className="h-full bg-blue-500 group-hover:bg-blue-600 rounded-r-full transition-all duration-1000 ease-out"
                                style={{ width: `${val}%` }}
                             />
                             {!isEmpty && (
                               <span className="absolute left-3 text-[10px] font-bold text-white drop-shadow-md">
                                 {val}%
                               </span>
                             )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* BALANCE INDEX & PERSPECTIVES */}
              <div className="space-y-6 flex flex-col">
                {/* Balance Index (with explanations) */}
                <div className="bg-white p-7 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none"><BarChart3 className="w-24 h-24 text-slate-200" /></div>
                  <h3 className="text-sm font-extrabold text-slate-800 mb-6 border-b border-slate-100 pb-3 relative z-10">Fokus Energi (Balance Index)</h3>
                  <div className="w-full h-36 relative z-10 pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={balanceData} cx="50%" cy="50%" innerRadius={0} outerRadius={60} dataKey="value" stroke="#fff" strokeWidth={3}>
                          {balanceData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                        </Pie>
                        <RechartsTooltip formatter={(value) => `${value}%`} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}/>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex justify-center gap-4 mt-2 border-t border-slate-100 pt-3 relative z-10">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500"><span className="w-2.5 h-2.5 rounded-sm bg-[#f97316]"></span> Foundation</div>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500"><span className="w-2.5 h-2.5 rounded-sm bg-[#84cc16]"></span> Evolution</div>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500"><span className="w-2.5 h-2.5 rounded-sm bg-[#3b82f6]"></span> Impact</div>
                  </div>
                </div>

                {/* Organisational Perspectives */}
                <div className="bg-white p-7 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex-1 relative overflow-hidden">
                   <div className="absolute -bottom-6 -left-6 p-6 opacity-5 pointer-events-none rotate-12"><Activity className="w-24 h-24 text-lime-200" /></div>
                  <h3 className="text-sm font-extrabold text-slate-800 mb-5 border-b border-slate-100 pb-3 relative z-10">Orientasi Kerja</h3>
                  <div className="flex justify-between items-end h-24 px-2 relative z-10 pt-2">
                    {[
                      { key: 'Process', label: 'Proses', icon: <Activity className="w-3.5 h-3.5"/> },
                      { key: 'People', label: 'Relasi', icon: <Heart className="w-3.5 h-3.5"/> },
                      { key: 'Purpose', label: 'Target', icon: <Target className="w-3.5 h-3.5"/> }
                    ].map((item) => {
                      const val = analysis.perspectives[item.key.toLowerCase() as keyof typeof analysis.perspectives];
                      return (
                        <div key={item.key} className="flex flex-col items-center w-12 group">
                          <div className="w-full bg-slate-50 rounded-t-lg flex-1 relative flex items-end overflow-hidden group-hover:bg-slate-100">
                             <div className="w-full bg-[#84cc16] group-hover:bg-[#65a30d] transition-all duration-700 ease-out shadow-[0_-4px_6px_-1px_rgba(132,204,22,0.3)]" style={{ height: `${val}%` }}></div>
                          </div>
                          <div className="flex items-center gap-1 mt-3.5 text-slate-400">{item.icon}</div>
                          <p className="text-[11px] font-bold text-slate-700 mt-1">{item.label}</p>
                          <p className="text-[10px] text-slate-400 font-medium">{val}%</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* ROW 3: WORD LISTS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
              
              {/* Positive Values */}
              <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none group-hover:scale-110 group-hover:opacity-10 transition-all duration-700"><Zap className="w-24 h-24 text-blue-200" /></div>
                <h3 className="text-sm font-extrabold text-slate-800 mb-2">Kekuatan Utama (Positive Values)</h3>
                <p className="text-xs text-slate-500 mb-6">Karakter penggerak yang menjadi nilai jual utama kandidat.</p>
                <div className="flex flex-wrap gap-2.5 relative z-10">
                  {analysis.topValues.map((w, i) => (
                    <span key={i} className="px-4 py-2 bg-blue-50 text-blue-700 border border-blue-100 rounded-xl text-sm font-bold shadow-sm group-hover:scale-[1.03] transition-all">
                      {w}
                    </span>
                  ))}
                </div>
              </div>

              {/* Potentially Limiting Values */}
              <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none group-hover:scale-110 group-hover:opacity-10 transition-all duration-700"><BrainCircuit className="w-24 h-24 text-red-200" /></div>
                <h3 className="text-sm font-extrabold text-slate-800 mb-2">Titik Buta (Limiting Values)</h3>
                <p className="text-xs text-slate-500 mb-6">Kata berkonotasi cemas/tertekan yang harus diperhatikan saat wawancara.</p>
                
                {analysis.limitingWords.length > 0 ? (
                  <div className="flex flex-wrap gap-2.5 relative z-10">
                    {analysis.limitingWords.map((w, i) => (
                      <span key={i} className="px-4 py-2 bg-red-50 text-red-600 border border-red-100 rounded-xl text-sm font-bold shadow-sm group-hover:scale-[1.03] transition-all">
                        {w}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="w-full py-4.5 bg-emerald-50 text-emerald-600 rounded-xl text-sm text-center font-bold border border-emerald-100 relative z-10">
                    Tidak terdeteksi hambatan internal yang signifikan.
                  </div>
                )}
              </div>

            </div>

          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 h-full p-10 bg-white/60 m-4 rounded-3xl border border-slate-100">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
              <ShieldCheck className="w-10 h-10 text-slate-300" />
            </div>
            <p className="text-xl font-extrabold text-slate-800 mb-2">Pilih Kandidat OSIS</p>
            <p className="text-sm text-slate-500 max-w-xs text-center leading-relaxed">Silakan klik salah satu nama di bilah samping untuk memuat Laporan Analisis Profil Psikologis Navasena.</p>
          </div>
        )}
      </div>
    </div>
  );
}