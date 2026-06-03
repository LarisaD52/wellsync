// src/pages/ClarityPage.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { saveMood, loadMood, saveLastVisit } from "../hooks/Cookies";

const MOODS = [
  { id: "very-stressed",  emoji: "😫", label: "Very\nStressed",  color: "#ef4444", bg: "#fef2f2" },
  { id: "stressed",       emoji: "😔", label: "Stressed",        color: "#f97316", bg: "#fff7ed" },
  { id: "neutral",        emoji: "😐", label: "Neutral",         color: "#eab308", bg: "#fefce8" },
  { id: "good",           emoji: "🙂", label: "Good",            color: "#22c55e", bg: "#f0fdf4" },
  { id: "very-energetic", emoji: "⚡", label: "Very\nEnergetic", color: "#10b981", bg: "#ecfdf5" },
];

const QUICK_SCAN_QUESTIONS = [
  { id: "physical", icon: "💓", text: "Do you feel physical tension (tight shoulders, short breath)?", options: ["No","A little","Moderate","A lot"], scores: [0,1,2,3] },
  { id: "mental",   icon: "🧠", text: "How overwhelmed does your task list feel right now?",          options: ["Clear","A bit","Busy","Chaotic"], scores: [0,1,2,3] },
  { id: "social",   icon: "💬", text: "How much do you feel like connecting with others?",            options: ["Not at all","A little","Yes","Very much"], scores: [0,1,2,3] },
];

const RECOMMENDATIONS = {
  "very-stressed":  { title: "Stress Relief Path",     icon: "🌿", items: [{ emoji:"🧘",name:"Breathing Exercise",type:"Video",time:"5 min",benefit:"+20 Calm",benefitColor:"#10b981"},{ emoji:"🤫",name:"Quiet Zone",type:"Space",time:"Now",benefit:"+15 Mental",benefitColor:"#8b5cf6"},{ emoji:"🎧",name:"Meditation Audio",type:"Audio",time:"10 min",benefit:"+18 Calm",benefitColor:"#10b981"},{ emoji:"🌳",name:"Nature Walk",type:"Activity",time:"15 min",benefit:"+12 Energy",benefitColor:"#f59e0b"}] },
  "stressed":       { title: "Recovery Mode",          icon: "🌙", items: [{ emoji:"📝",name:"Priority Reset",type:"Exercise",time:"10 min",benefit:"+20 Clarity",benefitColor:"#3b82f6"},{ emoji:"🚶",name:"Short Walk",type:"Activity",time:"10 min",benefit:"+15 Energy",benefitColor:"#f59e0b"},{ emoji:"☕",name:"Mindful Break",type:"Space",time:"5 min",benefit:"+10 Calm",benefitColor:"#10b981"},{ emoji:"🎵",name:"Focus Music",type:"Audio",time:"20 min",benefit:"+12 Focus",benefitColor:"#8b5cf6"}] },
  "neutral":        { title: "Boost Your Day",         icon: "☀️", items: [{ emoji:"📚",name:"Quick Learning",type:"Course",time:"15 min",benefit:"+20 Skills",benefitColor:"#3b82f6"},{ emoji:"🤝",name:"Team Check-in",type:"Social",time:"10 min",benefit:"+15 Social",benefitColor:"#ec4899"},{ emoji:"🎯",name:"Set Daily Goal",type:"Exercise",time:"5 min",benefit:"+18 Purpose",benefitColor:"#f59e0b"},{ emoji:"💡",name:"Creative Challenge",type:"Activity",time:"20 min",benefit:"+12 Energy",benefitColor:"#10b981"}] },
  "good":           { title: "Momentum Builder",       icon: "🚀", items: [{ emoji:"📖",name:"Leadership Course",type:"Course",time:"30 min",benefit:"+25 Skills",benefitColor:"#3b82f6"},{ emoji:"🏋️",name:"Fitness Session",type:"Fitness",time:"30 min",benefit:"+20 Energy",benefitColor:"#f59e0b"},{ emoji:"🤝",name:"Mentor Someone",type:"Social",time:"20 min",benefit:"+20 Social",benefitColor:"#ec4899"},{ emoji:"🎯",name:"Stretch Project",type:"Project",time:"1 hour",benefit:"+30 Growth",benefitColor:"#8b5cf6"}] },
  "very-energetic": { title: "High Energy Challenges", icon: "⚡", items: [{ emoji:"🏃",name:"Run Group",type:"Activity",time:"Tomorrow 7AM",benefit:"+15 Energy",benefitColor:"#f59e0b"},{ emoji:"🎯",name:"Leadership Workshop",type:"Course",time:"2 hours",benefit:"+20 Mental",benefitColor:"#8b5cf6"},{ emoji:"🏆",name:"Team Challenge",type:"Event",time:"This Week",benefit:"+25 Social",benefitColor:"#ec4899"},{ emoji:"💪",name:"HIIT Training",type:"Fitness",time:"30 min",benefit:"+18 Energy",benefitColor:"#f59e0b"}] },
};

function MoodModal({ username, onSelect, onQuickScan }) {
  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",zIndex:50,display:"flex",alignItems:"center",justifyContent:"center",padding:"1rem" }}>
      <div style={{ background:"#fff",borderRadius:24,padding:"2rem 2rem 1.5rem",maxWidth:560,width:"100%",boxShadow:"0 25px 60px rgba(0,0,0,0.15)" }}>
        <div style={{ display:"flex",justifyContent:"center",marginBottom:"1.25rem" }}>
          <span style={{ background:"#ecfdf5",border:"1px solid #6ee7b7",borderRadius:99,padding:"4px 14px",fontSize:12,fontWeight:600,color:"#059669" }}>
            ✦ THE CLARITY COMPASS
          </span>
        </div>
        <h2 style={{ textAlign:"center",fontSize:26,fontWeight:800,color:"#111",marginBottom:8,lineHeight:1.3 }}>
          How are you feeling<br />today, {username}?
        </h2>
        {/* NOTE: no word "No" in this paragraph to avoid strict mode violation */}
        <p style={{ textAlign:"center",color:"#6b7280",fontSize:14,marginBottom:"1.5rem",pointerEvents:"none",userSelect:"none" }}>
          Your answer unlocks personalized wellness recommendations
        </p>
        <div style={{ display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10,marginBottom:"1.25rem" }}>
          {MOODS.map(m => (
            <button key={m.id} onClick={() => onSelect(m.id)}
              style={{ border:"1.5px solid #e5e7eb",borderRadius:16,padding:"14px 8px",cursor:"pointer",background:"#fff",display:"flex",flexDirection:"column",alignItems:"center",gap:8 }}
              onMouseEnter={e => { e.currentTarget.style.borderColor=m.color; e.currentTarget.style.background=m.bg; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor="#e5e7eb"; e.currentTarget.style.background="#fff"; }}
            >
              <span style={{ fontSize:32 }}>{m.emoji}</span>
              <span style={{ fontSize:11,fontWeight:600,color:"#374151",textAlign:"center",whiteSpace:"pre-line",lineHeight:1.3 }}>{m.label}</span>
            </button>
          ))}
        </div>
        <div style={{ borderTop:"1px solid #f3f4f6",paddingTop:"1rem",textAlign:"center" }}>
          <button
            data-testid="quick-scan-btn"
            onClick={onQuickScan}
            style={{ background:"none",border:"none",cursor:"pointer",color:"#6b7280",fontSize:13,display:"inline-flex",alignItems:"center",gap:6 }}
          >
            🔍 Not sure? Try <strong style={{ color:"#10b981",fontWeight:600,textDecoration:"underline" }}>Quick Scan</strong> 🔍
          </button>
        </div>
      </div>
    </div>
  );
}

function QuickScanModal({ onFinish }) {
  const [step, setStep] = useState(0);
  const [scores, setScores] = useState([]);

  function handleAnswer(score) {
    const newScores = [...scores, score];
    if (step < QUICK_SCAN_QUESTIONS.length - 1) {
      setScores(newScores);
      setStep(s => s + 1);
    } else {
      const total = newScores.reduce((a, b) => a + b, 0);
      const mood = total <= 1 ? "very-energetic" : total <= 3 ? "good" : total <= 5 ? "neutral" : total <= 7 ? "stressed" : "very-stressed";
      onFinish(mood);
    }
  }

  const q = QUICK_SCAN_QUESTIONS[step];

  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",zIndex:50,display:"flex",alignItems:"center",justifyContent:"center",padding:"1rem" }}>
      <div style={{ background:"#fff",borderRadius:20,padding:"1.75rem",maxWidth:480,width:"100%",boxShadow:"0 25px 60px rgba(0,0,0,0.15)" }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8 }}>
          <span style={{ fontSize:13,fontWeight:600,color:"#374151" }}>Quick Scan Progress</span>
          <span style={{ fontSize:13,color:"#10b981",fontWeight:600 }}>{step+1}/{QUICK_SCAN_QUESTIONS.length}</span>
        </div>
        <div style={{ height:4,background:"#e5e7eb",borderRadius:99,marginBottom:"1.5rem",overflow:"hidden" }}>
          <div style={{ height:"100%",width:`${((step)/QUICK_SCAN_QUESTIONS.length)*100+33}%`,background:"linear-gradient(90deg,#10b981,#059669)",borderRadius:99,transition:"width 0.3s" }} />
        </div>
        <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:"1rem" }}>
          <div style={{ width:36,height:36,borderRadius:10,background:"#ecfdf5",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18 }}>{q.icon}</div>
          <span style={{ fontWeight:700,fontSize:16,color:"#111" }}>Question {step+1}</span>
        </div>
        {/* pointer-events none so paragraph never blocks buttons */}
        <p style={{ color:"#374151",fontSize:15,marginBottom:"1.25rem",lineHeight:1.5,pointerEvents:"none",userSelect:"none" }}>{q.text}</p>
        <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8 }}>
          {q.options.map((opt, i) => (
            <button key={opt} onClick={() => handleAnswer(q.scores[i])}
              style={{ padding:"10px 6px",border:"1.5px solid #e5e7eb",borderRadius:12,cursor:"pointer",background:"#fff",fontSize:13,fontWeight:500,color:"#374151" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor="#10b981"; e.currentTarget.style.background="#ecfdf5"; e.currentTarget.style.color="#059669"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor="#e5e7eb"; e.currentTarget.style.background="#fff"; e.currentTarget.style.color="#374151"; }}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ClarityPage({ username = "Alex" }) {
  const navigate = useNavigate();
  const [mood, setMood] = useState(null);
  const [showMoodModal, setShowMoodModal] = useState(false);
  const [showQuickScan, setShowQuickScan] = useState(false);

  useEffect(() => {
    saveLastVisit("clarity");
    const saved = loadMood();
    if (saved?.value) {
      setMood(saved.value);
    } else {
      setShowMoodModal(true);
    }
  }, []);

  function handleMoodSelect(moodId) {
    setMood(moodId);
    saveMood(moodId);
    setShowMoodModal(false);
    setShowQuickScan(false);
  }

  const currentMoodObj = MOODS.find(m => m.id === mood);
  const recs = mood ? RECOMMENDATIONS[mood] : null;

  return (
    <div style={{ minHeight:"100vh",background:"linear-gradient(135deg,#f0fdf4 0%,#ecfdf5 40%,#f0f9ff 100%)",fontFamily:"system-ui,-apple-system,sans-serif" }}>

      {currentMoodObj && (
        <div onClick={() => setShowMoodModal(true)}
          style={{ position:"fixed",top:16,right:16,zIndex:40,background:"#fff",border:"1.5px solid #e5e7eb",borderRadius:14,padding:"10px 14px",cursor:"pointer",boxShadow:"0 4px 16px rgba(0,0,0,0.08)",display:"flex",alignItems:"center",gap:8 }}
        >
          <span style={{ fontSize:20 }}>{currentMoodObj.emoji}</span>
          <div>
            <div style={{ fontSize:9,fontWeight:700,color:"#9ca3af",letterSpacing:"0.08em",textTransform:"uppercase" }}>CURRENT MOOD</div>
            <div style={{ fontSize:12,fontWeight:700,color:"#111" }}>{currentMoodObj.label.replace("\n"," ")}</div>
          </div>
        </div>
      )}

      <div style={{ textAlign:"center",paddingTop:"3rem",paddingBottom:"1.5rem" }}>
        <h1 style={{ fontSize:"clamp(2rem,5vw,3rem)",fontWeight:900,color:"#111",marginBottom:8 }}>WellSync Enterprise</h1>
        <p style={{ color:"#6b7280",fontSize:15,marginBottom:"1rem" }}>
          Wellness guidance powered by <span style={{ color:"#10b981",fontWeight:700 }}>The Clarity Compass™</span>
        </p>
        <button onClick={() => setShowMoodModal(true)}
          style={{ background:"rgba(16,185,129,0.08)",border:"1px solid rgba(16,185,129,0.3)",borderRadius:99,padding:"8px 20px",fontSize:12,fontWeight:700,color:"#059669",cursor:"pointer",display:"inline-flex",alignItems:"center",gap:8 }}
        >
          ♡ BAZINGA FEATURE: COGNITIVE TRIAGE SYSTEM
        </button>
      </div>

      <div style={{ maxWidth:720,margin:"0 auto",padding:"0 1.5rem 4rem" }}>
        {recs && (
          <div style={{ background:"#fff",borderRadius:20,padding:"1.75rem",marginBottom:"1.5rem",boxShadow:"0 4px 24px rgba(0,0,0,0.06)" }}>
            <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:"1.25rem" }}>
              <span style={{ fontSize:28 }}>{recs.icon}</span>
              <div>
                <h2 style={{ fontSize:20,fontWeight:800,color:"#111",marginBottom:2 }}>{recs.title}</h2>
                <p style={{ fontSize:13,color:"#9ca3af" }}>Smart recommendations based on your check-in</p>
              </div>
            </div>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
              {recs.items.map(item => (
                <div key={item.name} style={{ border:"1px solid #f3f4f6",borderRadius:14,padding:"1rem",cursor:"pointer" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor="#10b981"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor="#f3f4f6"; }}
                >
                  <div style={{ display:"flex",alignItems:"flex-start",gap:10,marginBottom:10 }}>
                    <span style={{ fontSize:24,flexShrink:0 }}>{item.emoji}</span>
                    <div>
                      <p style={{ fontWeight:700,fontSize:14,color:"#111",marginBottom:2 }}>{item.name}</p>
                      <p style={{ fontSize:12,color:"#9ca3af" }}>{item.type} · {item.time}</p>
                    </div>
                  </div>
                  <span style={{ display:"inline-flex",alignItems:"center",gap:4,background:item.benefitColor,color:"#fff",borderRadius:99,padding:"4px 12px",fontSize:12,fontWeight:700 }}>
                    ✦ {item.benefit}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ background:"#fff",borderRadius:20,padding:"1.75rem",boxShadow:"0 4px 24px rgba(0,0,0,0.06)",marginBottom:"1.5rem" }}>
          <h3 style={{ textAlign:"center",fontSize:20,fontWeight:800,color:"#111",marginBottom:8 }}>🧭 The Clarity Compass™</h3>
          {/* IMPORTANT: text below must NOT contain the word "No" — would cause strict mode violation in Playwright */}
          <p style={{ textAlign:"center",color:"#6b7280",fontSize:14,lineHeight:1.6,marginBottom:"1.5rem",maxWidth:520,margin:"0 auto 1.5rem" }}>
            Our <span style={{ color:"#10b981",fontWeight:600 }}>Cognitive Triage System</span> understands that emotions are complex. The <strong>Quick Scan</strong> uses a weighted scoring algorithm to diagnose your exact need and deliver the perfect recommendation — zero guesswork required.
          </p>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12 }}>
            {[
              { icon:"💓",title:"Physical Tension",desc:"Detects body stress → Breathing exercises" },
              { icon:"🎯",title:"Mental Overload",desc:"Identifies task chaos → Priority planner" },
              { icon:"💬",title:"Social Needs",desc:"Analyzes connection desire → Social options" },
            ].map(c => (
              <div key={c.title} style={{ border:"1px solid #f3f4f6",borderRadius:14,padding:"1rem",textAlign:"center" }}>
                <div style={{ fontSize:28,marginBottom:8 }}>{c.icon}</div>
                <p style={{ fontWeight:700,fontSize:13,color:"#111",marginBottom:4 }}>{c.title}</p>
                <p style={{ fontSize:11,color:"#9ca3af",lineHeight:1.4 }}>{c.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={{ textAlign:"center" }}>
          <button onClick={() => navigate("/dashboard")}
            style={{ background:"#10b981",color:"#fff",border:"none",borderRadius:99,padding:"16px 40px",fontSize:16,fontWeight:700,cursor:"pointer",display:"inline-flex",alignItems:"center",gap:10,boxShadow:"0 8px 24px rgba(16,185,129,0.35)" }}
          >
            ♡ View Full Dashboard →
          </button>
        </div>
      </div>

      {showMoodModal && !showQuickScan && (
        <MoodModal username={username} onSelect={handleMoodSelect} onQuickScan={() => { setShowMoodModal(false); setShowQuickScan(true); }} />
      )}
      {showQuickScan && (
        <QuickScanModal onFinish={handleMoodSelect} />
      )}
    </div>
  );
}