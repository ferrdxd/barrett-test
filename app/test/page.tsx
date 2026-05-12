"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { WORDS } from "../../lib/word";
import { supabase } from "../../lib/supabase";
import { CheckCircle2, AlertCircle, Sparkles } from "lucide-react";

export default function AssessmentPage() {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [candidateInfo, setCandidateInfo] = useState<{ name: string; class: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const info = sessionStorage.getItem("candidateInfo");
    if (!info) router.push("/");
    else setCandidateInfo(JSON.parse(info));
  }, [router]);

  const toggleWord = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((wordId) => wordId !== id));
    } else if (selectedIds.length < 10) {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleSubmit = async () => {
    if (selectedIds.length !== 10 || !candidateInfo) return;
    setIsSubmitting(true);

    const { error } = await supabase.from("candidates").insert([
      {
        name: candidateInfo.name,
        student_class: candidateInfo.class,
        selected_word_ids: selectedIds,
      },
    ]);

    if (!error) {
      sessionStorage.removeItem("candidateInfo");
      router.push("/success");
    } else {
      alert("Gagal mengirim data. Silakan coba lagi.");
      setIsSubmitting(false);
    }
  };

  const isComplete = selectedIds.length === 10;
  const progressPercentage = (selectedIds.length / 10) * 100;

  return (
    <main className="min-h-screen bg-slate-50 pb-32">
      <div className="max-w-5xl mx-auto p-5 pt-10">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Pilih Kata Sifat</h1>
          <p className="text-slate-500 mt-3 flex items-center justify-center gap-2 max-w-lg mx-auto bg-blue-50/50 py-2 px-4 rounded-full border border-blue-100">
            <AlertCircle className="w-4 h-4 text-blue-500" />
            Pilih tepat <strong className="text-blue-700">10 kata</strong> yang paling mendeskripsikan dirimu.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 lg:gap-4">
          {WORDS.map((w: any) => {
            const isSelected = selectedIds.includes(w.id);
            const isDisabled = !isSelected && isComplete;

            return (
              <button
                key={w.id}
                onClick={() => toggleWord(w.id)}
                disabled={isDisabled}
                className={`
                  relative px-2 py-4 rounded-xl border-2 text-sm md:text-base font-bold transition-all duration-300 text-center flex items-center justify-center min-h-[4rem]
                  ${isSelected 
                    ? "border-blue-600 bg-blue-600 text-white shadow-[0_8px_16px_-6px_rgba(37,99,235,0.4)] scale-[1.03] z-10" 
                    : "border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:shadow-md hover:-translate-y-1"}
                  ${isDisabled && "opacity-40 cursor-not-allowed hover:transform-none hover:shadow-none hover:border-slate-200"}
                `}
              >
                {w.word}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sticky Bottom Bar dengan Glassmorphism */}
      <div className="fixed bottom-0 left-0 w-full bg-white/80 backdrop-blur-md border-t border-slate-200 shadow-[0_-8px_30px_rgba(0,0,0,0.04)] z-50">
        {/* Progress Bar Line */}
        <div className="h-1 w-full bg-slate-100 absolute top-0 left-0">
          <div 
            className="h-full bg-blue-600 transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        <div className="max-w-5xl mx-auto flex items-center justify-between p-4 md:px-5">
          <div className="flex items-center gap-4">
            <div className={`flex items-center justify-center w-12 h-12 rounded-full font-black text-xl transition-colors duration-300 ${isComplete ? 'bg-green-100 text-green-600 ring-4 ring-green-50' : 'bg-blue-100 text-blue-700 ring-4 ring-blue-50'}`}>
              {selectedIds.length}
            </div>
            <div>
              <p className="text-slate-900 font-bold text-lg leading-tight">Kata Terpilih</p>
              <p className="text-slate-500 text-sm font-medium">Dari 10 kata yang wajib</p>
            </div>
          </div>
          
          <button
            onClick={handleSubmit}
            disabled={!isComplete || isSubmitting}
            className={`
              flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold transition-all duration-300 shadow-sm
              ${isComplete 
                ? "bg-slate-900 hover:bg-blue-600 text-white shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 active:scale-95" 
                : "bg-slate-100 text-slate-400 cursor-not-allowed"}
            `}
          >
            {isSubmitting ? "Memproses..." : "Kirim Jawaban"}
            {isComplete && <Sparkles className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </main>
  );
}