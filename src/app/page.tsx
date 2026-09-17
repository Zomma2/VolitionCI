import Wizard from "@/components/wizard/Wizard";
import Image from "next/image";
import logoImg from "../../public/logo.png";

export default function Home() {
  return (
    <div className="min-h-screen text-white flex flex-col relative overflow-hidden animated-gradient">
      {/* Background Orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div 
          className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full opacity-[0.07]"
          style={{ background: "radial-gradient(circle, #7c3aed 0%, transparent 70%)" }}
        />
        <div 
          className="absolute -bottom-60 -right-40 w-[700px] h-[700px] rounded-full opacity-[0.05]"
          style={{ background: "radial-gradient(circle, #4f46e5 0%, transparent 70%)" }}
        />
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] opacity-[0.03]"
          style={{ background: "radial-gradient(ellipse, #a78bfa 0%, transparent 60%)" }}
        />
      </div>

      <header className="flex-shrink-0 relative z-10">
        <div className="max-w-screen-xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-cyan-500/20 blur-md" />
                <Image 
                  src={logoImg} 
                  alt="VolitionCI Logo" 
                  width={30} 
                  height={30} 
                  className="relative object-contain drop-shadow-[0_0_8px_rgba(56,189,248,0.4)]"
                  priority
                />
              </div>
              <span className="font-bold text-[15px] tracking-tight">
                Volition<span className="text-violet-400">CI</span>
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-violet-500/10 text-violet-300 border border-violet-500/20">
                BETA
              </span>
            </div>
            
            <div className="hidden md:flex items-center gap-6">
              {["Docs", "Examples", "Changelog"].map(item => (
                <a key={item} href="#" className="text-xs font-medium text-white/30 hover:text-white/70 transition-colors">
                  {item}
                </a>
              ))}
            </div>

            <div className="flex items-center gap-2.5">
              <button className="px-4 py-1.5 rounded-full text-xs font-semibold text-white border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/[0.14] transition-all">
                GitHub ↗
              </button>
            </div>
          </div>
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-white/[0.07] to-transparent" />
      </header>

      <div className="flex-shrink-0 relative z-10 pt-6 pb-5 text-center px-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] shadow-[0_0_30px_rgba(124,58,237,0.15)] mb-4 hover:border-white/[0.14] transition-colors">
          <Image
            src={logoImg}
            alt="VolitionCI"
            width={14}
            height={14}
            className="object-contain drop-shadow-[0_0_6px_rgba(56,189,248,0.5)]"
            priority
          />
          <span className="text-[11px] font-medium text-white/70">
            Autonomous Delivery &amp; Cloud Infrastructure
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.1] text-white">
          Agentic DevSecOps <br/>
          <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, #a78bfa 0%, #818cf8 50%, #60a5fa 100%)" }}>
            Pipeline Generator
          </span>
        </h1>
        <p className="mt-2.5 text-white/40 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
          Autonomous repository analysis. Interactive architectural interrogation. Self-healing CI/CD synthesis.
        </p>
      </div>

      <main className="flex-1 relative z-10 max-w-5xl xl:max-w-6xl mx-auto w-full px-4 sm:px-6 pb-8">
        <Wizard />
      </main>

      <footer className="flex-shrink-0 relative z-10">
        <div className="h-px bg-gradient-to-r from-transparent via-white/[0.05] to-transparent" />
        <div className="max-w-screen-xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src={logoImg} alt="VolitionCI" width={14} height={14} className="object-contain opacity-50" />
            <span className="text-[11px] text-white/25">
              VolitionCI &copy; {new Date().getFullYear()}
            </span>
          </div>
          <span className="text-[11px] text-white/20">
            Next.js · Groq · Monaco Editor · Tailwind CSS
          </span>
        </div>
      </footer>
    </div>
  );
}
