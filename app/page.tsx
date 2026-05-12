"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, BookOpen, BrainCircuit, ArrowRight } from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: "", class: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.class) {
      sessionStorage.setItem("candidateInfo", JSON.stringify(formData));
      router.push("/test");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-4">
      <div className="max-w-md w-full bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8 relative overflow-hidden">
        {/* Dekorasi Background */}
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-blue-500 rounded-full mix-blend-multiply filter blur-2xl opacity-20"></div>
        <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-24 h-24 bg-purple-500 rounded-full mix-blend-multiply filter blur-2xl opacity-20"></div>

        <div className="text-center mb-10 relative z-10">
          <div className="bg-blue-100 w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-6 shadow-inner text-blue-600">
            <BrainCircuit className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
            Assessment Profil
          </h1>
          <p className="text-slate-500 text-sm">
            Kenali potensimu. Masukkan data diri untuk memulai proses seleksi.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div className="space-y-1">
            <label className="block text-sm font-semibold text-slate-700 ml-1">Nama Lengkap</label>
            <div className="relative group">
              <User className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                required
                className="w-full pl-12 pr-4 py-3 bg-white/50 border-2 border-slate-200 rounded-xl focus:ring-0 focus:border-blue-500 outline-none transition-all placeholder:text-slate-500 text-slate-900 font-medium"
                placeholder="Misal: Maulana Ferdi"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-semibold text-slate-700 ml-1">Kelas</label>
            <div className="relative group">
              <BookOpen className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                required
                className="w-full pl-12 pr-4 py-3 bg-white/50 border-2 border-slate-200 rounded-xl focus:ring-0 focus:border-blue-500 outline-none transition-all placeholder:text-slate-500 text-slate-900 font-medium"
                placeholder="Misal: XI.2"
                value={formData.class}
                onChange={(e) => setFormData({ ...formData, class: e.target.value })}
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full group bg-slate-900 hover:bg-blue-600 text-white font-semibold py-3.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-blue-500/30 active:scale-[0.98] mt-2"
          >
            Mulai Assessment
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>
      </div>
    </main>
  );
}