import { CheckCircle2, Home } from "lucide-react";
import Link from "next/link";

export default function SuccessPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-slate-50 to-blue-50 p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-100 p-10 text-center relative overflow-hidden">
        
        {/* Dekorasi Animasi */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-green-100 rounded-full opacity-50 mix-blend-multiply blur-3xl"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-100 rounded-full opacity-50 mix-blend-multiply blur-3xl"></div>

        <div className="relative z-10">
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-green-200 rounded-full animate-ping opacity-20"></div>
              <CheckCircle2 className="w-20 h-20 text-green-500 relative z-10" />
            </div>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">Selesai!</h1>
          <p className="text-slate-500 mb-10 leading-relaxed">
            Terima kasih telah meluangkan waktu. Hasil assessment Anda telah berhasil direkam ke dalam sistem seleksi kami.
          </p>
          <Link 
            href="/"
            className="inline-flex items-center justify-center gap-2 w-full bg-slate-50 hover:bg-slate-100 border-2 border-slate-200 text-slate-800 font-bold py-3.5 px-6 rounded-xl transition-all hover:border-slate-300 active:scale-95"
          >
            <Home className="w-5 h-5" />
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </main>
  );
}