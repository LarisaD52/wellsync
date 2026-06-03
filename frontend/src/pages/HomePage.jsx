import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div      className="min-h-screen relative overflow-hidden flex flex-col page-enter"
      style={{
        backgroundImage: "url('/assets/bg-leaves.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-white/25" />

      <nav className="relative z-10 flex items-center justify-between px-8 py-5">
        <div className="w-14 h-14 rounded-full border-2 border-gray-400 flex items-center justify-center bg-white/60 backdrop-blur shadow overflow-hidden anim-fade-in delay-1">
          <img src="/assets/logo-leaf.png" alt="WellSync Logo" className="w-10 h-10 object-contain" />
        </div>

        <div
          className="flex items-center bg-white/60 backdrop-blur border border-white/80 rounded-full shadow-md overflow-hidden anim-fade-in delay-2"
          style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.07)" }}
        >
          <button
            onClick={() => navigate("/signup")}
            className="px-12 py-3 text-base font-medium text-gray-600 hover:bg-white/70 transition-all hover-press"
          >
            Sign Up
          </button>
          <button
            onClick={() => navigate("/login")}
            className="px-12 py-3 text-base font-medium text-gray-600 hover:bg-white/70 transition-all hover-press"
          >
            Login
          </button>
        </div>
      </nav>

      <main className="relative z-10 flex flex-col items-center justify-center flex-1 px-6 pb-16">
        <div
          className="relative w-full max-w-4xl anim-scale-in delay-2 hover-glow hero-card"
          style={{
            background: "rgba(235,245,235,0.55)",
            backdropFilter: "blur(16px)",
            borderRadius: "28px",
            border: "2px solid #6dcc6d",
            boxShadow: "0 0 0 8px rgba(120,210,120,0.10), 0 8px 40px rgba(0,0,0,0.06)",
            padding: "52px 64px 80px 64px",
          }}
        >
          <div className="text-center mb-10">
            <h1
              className="font-bold mb-4 hero-title anim-fade-up delay-3"
              style={{
                color: "#5a9a5a",
                fontFamily: "Georgia, serif",
                fontSize: "clamp(2.8rem, 5vw, 4rem)",
                letterSpacing: "-0.5px",
              }}
            >
              WellSync Enterprise
            </h1>
            <p
              className="font-bold italic mb-6 anim-fade-up delay-4"
              style={{
                color: "#c9a227",
                fontFamily: "Georgia, serif",
                fontSize: "clamp(1.3rem, 2.5vw, 1.9rem)",
              }}
            >
              Harmonizing Work and Wellbeing
            </p>
            <p className="text-gray-500 text-base max-w-xl mx-auto leading-relaxed anim-fade-up delay-5">
              Three pillars of integrated and innovative solutions:<br />
              Smart Monitoring, Educational Hub, and Activity Ecosystem<br />
              help you reach activity management.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-5 hero-pillars">
            
            <div
              className="flex items-center gap-4 px-5 py-5 rounded-2xl hover-lift anim-fade-up delay-6"
              style={{ background: "rgba(255,255,255,0.72)", border: "1px solid rgba(100,200,100,0.30)" }}
            >
              <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center">
                <svg viewBox="0 0 40 40" className="w-9 h-9" fill="none">
                  <circle cx="20" cy="20" r="13" stroke="#5a9a5a" strokeWidth="2.2"/>
                  <path d="M9 20 Q13 13 17 20 Q20 25 23 20 Q27 13 31 20" stroke="#5a9a5a" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
                </svg>
              </div>
              <span className="text-sm font-semibold text-gray-700 leading-tight flex-1">Smart<br/>Monitoring</span>
              <span className="w-2.5 h-2.5 rounded-full bg-green-400 flex-shrink-0" />
            </div>

            <div
              className="flex items-center gap-4 px-5 py-5 rounded-2xl hover-lift anim-fade-up delay-7"
              style={{ background: "rgba(255,255,255,0.72)", border: "1px solid rgba(100,200,100,0.30)" }}
            >
              <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center">
                <svg viewBox="0 0 40 40" className="w-9 h-9" fill="none">
                  <path d="M20 8L36 17L20 26L4 17Z" stroke="#5a9a5a" strokeWidth="2.2" strokeLinejoin="round"/>
                  <path d="M11 22V30C14 33 18 34 20 34C22 34 26 33 29 30V22" stroke="#5a9a5a" strokeWidth="2.2" strokeLinecap="round"/>
                  <line x1="36" y1="17" x2="36" y2="27" stroke="#5a9a5a" strokeWidth="2.2" strokeLinecap="round"/>
                  <circle cx="36" cy="28" r="1.5" fill="#5a9a5a"/>
                </svg>
              </div>
              <span className="text-sm font-semibold text-gray-700 leading-tight flex-1">Educational<br/>Hub</span>
              <span className="w-2.5 h-2.5 rounded-full bg-green-400 flex-shrink-0" />
            </div>

            <div
              className="flex items-center gap-4 px-5 py-5 rounded-2xl hover-lift anim-fade-up delay-8"
              style={{ background: "rgba(255,255,255,0.72)", border: "1px solid rgba(100,200,100,0.30)" }}
            >
              <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center">
                <svg viewBox="0 0 40 40" className="w-9 h-9" fill="none">
                  <circle cx="27" cy="9" r="3" stroke="#5a9a5a" strokeWidth="2.2"/>
                  <path d="M23 14L19 21L23 26L20 34" stroke="#5a9a5a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M23 14L29 19L34 17" stroke="#5a9a5a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M19 21L13 24" stroke="#5a9a5a" strokeWidth="2.2" strokeLinecap="round"/>
                </svg>
              </div>
              <span className="text-sm font-semibold text-gray-700 leading-tight flex-1">Activity<br/>Ecosystem</span>
              <span className="w-2.5 h-2.5 rounded-full bg-green-400 flex-shrink-0" />
            </div>
          </div>
        </div>

      
        <div className="relative -mt-7 z-20 anim-fade-up delay-8">
          <button
            onClick={() => navigate("/login")}
            className="px-24 py-5 rounded-full font-bold text-gray-800 transition-all hover-press hover-shine"
            style={{
              background: "linear-gradient(135deg, #a8e06a 0%, #7ecf4a 50%, #5bb82a 100%)",
              boxShadow: "0 6px 28px rgba(100,200,60,0.45)",
              fontFamily: "Georgia, serif",
              fontSize: "clamp(1.5rem, 2.5vw, 2rem)",
            }}
          >
            Start Now
          </button>
        </div>
      </main>
    </div>
  );
}