import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- SUB-COMPONENTS (DECLARED OUTSIDE OF RENDER) ---
// This prevents component state resets and resolves the React error permanently
const NumberSelector = ({ value, setValue }) => (
  <div className="flex bg-black/40 border border-white/5 p-1 rounded-xl justify-between overflow-hidden">
    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
      const isSelected = value === num;
      return (
        <button
          key={num}
          type="button"
          onClick={() => setValue(num)}
          className={`relative flex-1 py-2 text-xs font-mono font-bold transition-colors duration-200 ${
            isSelected ? 'text-[#050505]' : 'text-white/40 hover:text-white/80'
          }`}
        >
          <span className="relative z-10">{num}</span>
          {isSelected && (
            <motion.div 
              layoutId="glowingIndicator" 
              className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 rounded-lg shadow-[0_0_15px_rgba(52,211,153,0.5)]"
              transition={{ type: "spring", stiffness: 400, damping: 28 }}
            />
          )}
        </button>
      );
    })}
  </div>
);

// --- MAIN CORE APPLICATION ENGINE ---
function App() {
  const [activeProfile, setActiveProfile] = useState('football');
  const [aiWorkout, setAiWorkout] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // --- GYM STATE ---
  const [gymEnergy, setGymEnergy] = useState(5);
  const [sleep, setSleep] = useState(7);
  const [soreMuscles, setSoreMuscles] = useState('');

  // --- FOOTBALL STATE ---
  const [matchIntensity, setMatchIntensity] = useState(5);
  const [sessionType, setSessionType] = useState('solo');

  const handleGenerateWorkout = async () => {
    setIsLoading(true);
    
    const validatedSleep = Math.max(1, Math.min(24, Number(sleep) || 7));
    const normalizedSoreness = soreMuscles.trim() || 'None';

    const payload = activeProfile === 'football' 
      ? { profile: 'football', intensity: matchIntensity, session_type: sessionType }
      : { profile: 'gym', energy_level: gymEnergy, sleep_hours: validatedSleep, sore_muscles: normalizedSoreness };

    try {
      const response = await fetch('http://127.0.0.1:8000/api/generate-workout/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      setAiWorkout(data.workout);
    } catch (error) {
      console.error("Error connecting to backend:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getDynamicStatus = () => {
    const score = activeProfile === 'football' ? matchIntensity : gymEnergy;
    
    const gradientMap = {
      1: { text: "CRITICAL RECOVERY DEPOT", color: "text-red-500 border-red-500/20 bg-red-500/5", desc: "System is running on empty. Absolute minimal load forced to shield joints and tissue." },
      2: { text: "RESTRICTED ENERGY ALERT", color: "text-red-400 border-red-400/20 bg-red-400/5", desc: "Significant fatigue signature present. Keeping operations heavily dialed back." },
      3: { text: "CONSERVATIVE PROTOCOL", color: "text-orange-400 border-orange-400/20 bg-orange-400/5", desc: "Lower capacity thresholds. Shift forced onto core foundational mechanics." },
      4: { text: "MODERATE CAPACITY", color: "text-amber-500 border-amber-500/20 bg-amber-500/5", desc: "Recovering state. Steady technical work authorized with controlled tempos." },
      5: { text: "BALANCED ENERGY INDEX", color: "text-amber-400 border-amber-400/20 bg-amber-400/5", desc: "Perfect baseline metrics. Standard target loads can be processed normally." },
      6: { text: "STABLE READINESS PROFILE", color: "text-yellow-400 border-yellow-400/20 bg-yellow-400/5", desc: "Energy trend is climbing upward. Ready to increase work speed or volume sets." },
      7: { text: "ADVANCED PERFORMANCE STATE", color: "text-lime-400 border-lime-400/20 bg-lime-400/5", desc: "Highly optimized tissue metrics. Strong response window for power loading." },
      8: { text: "PEAK ADAPTATION CORE", color: "text-green-400 border-green-400/20 bg-green-400/5", desc: "Supercharged system readings. Elite capacity zone to set new performance milestones." },
      9: { text: "MAXIMUM NEUROMUSCULAR DRIVE", color: "text-emerald-400 border-emerald-400/20 bg-emerald-400/5", desc: "Total physical synchronization. Perfect environment for max speed and strength outputs." },
      10: { text: "APEX SYSTEM SUPREMACY", color: "text-[#00E676] border-[#00E676]/30 bg-[#00E676]/5", desc: "Flawless biometric readings. Fully unlocked state to completely dominate the session." }
    };

    return gradientMap[score] || gradientMap[5];
  };

  const status = getDynamicStatus();

  return (
    <div className="relative min-h-screen bg-[#050505] text-white font-sans overflow-hidden selection:bg-green-500/30">
      
      {/* Background Ambience */}
      <div className="fixed top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-green-900/10 rounded-full blur-[120px] ambient-light pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-blue-900/10 rounded-full blur-[100px] ambient-light pointer-events-none" style={{ animationDelay: '2s' }}></div>

      {/* Top Navbar */}
      <nav className="relative z-20 border-b border-white/5 bg-black/20 backdrop-blur-md px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 bg-green-400 rounded-sm shadow-[0_0_8px_#4ade80]"></div>
          <h1 className="text-lg font-bold tracking-[0.25em] text-white">APEX<span className="text-white/30 font-light ml-2">// LABS</span></h1>
        </div>
        
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
          <button onClick={() => { if(!isLoading) { setActiveProfile('football'); setAiWorkout(null); } }} className={`px-5 py-1.5 rounded-lg text-sm font-medium transition-all ${activeProfile === 'football' ? 'bg-white/10 text-white shadow-md' : 'text-white/40 hover:text-white/80'} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
            ⚽ Football
          </button>
          <button onClick={() => { if(!isLoading) { setActiveProfile('gym'); setAiWorkout(null); } }} className={`px-5 py-1.5 rounded-lg text-sm font-medium transition-all ${activeProfile === 'gym' ? 'bg-white/10 text-white shadow-md' : 'text-white/40 hover:text-white/80'} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
            🏋️ Gym
          </button>
        </div>
      </nav>

      {/* Main Grid Workspace */}
      <div className="relative z-10 max-w-[90rem] mx-auto px-6 py-8 h-[calc(100vh-80px)]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full items-start">
          
          {/* CONTROL MODULE INPUT PANEL */}
          <div className="lg:col-span-5 backdrop-blur-xl bg-white/5 border border-white/10 p-8 rounded-3xl shadow-2xl flex flex-col h-[76vh] relative overflow-hidden">
            
            {/* Smooth Granular Status Badge */}
            <div className={`border rounded-xl p-4 mb-6 backdrop-blur-md transition-all duration-500 ease-out ${status.color}`}>
              <div className="flex items-center gap-2 mb-1">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-current"></span>
                </span>
                <span className="text-[11px] uppercase tracking-widest font-black">{status.text}</span>
              </div>
              <p className="text-xs text-white/50 leading-relaxed font-light">{status.desc}</p>
            </div>
            
            <div className="flex-1 relative mt-1">
              <AnimatePresence mode="wait">
                
                {/* FOOTBALL PROFILE FORM */}
                {activeProfile === 'football' && (
                  <motion.div key="football" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="space-y-6 absolute inset-0">
                    <div>
                      <h2 className="text-xl font-bold mb-1 tracking-tight">Pre-Pitch Tactical Engine</h2>
                      <p className="text-xs text-white/40">Calibrate movement architectures prior to pitch deployment.</p>
                    </div>

                    <div className="space-y-3">
                      <label className="block text-xs font-bold uppercase tracking-wider text-white/40">Leg Readiness & System Energy</label>
                      <NumberSelector value={matchIntensity} setValue={setMatchIntensity} />
                      <div className="flex justify-between text-[10px] font-mono text-white/30 px-1">
                        <span>1 = Heavy / Exhausted Legs</span>
                        <span>10 = Fully Explosive & Fresh</span>
                      </div>
                    </div>

                    <div className="space-y-3 pt-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-white/40">Today's Field Training Structure</label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          disabled={isLoading}
                          onClick={() => setSessionType('solo')}
                          className={`p-4 rounded-xl border transition-all duration-300 text-left relative overflow-hidden group ${
                            sessionType === 'solo' 
                              ? 'bg-white/10 border-white/30 text-white shadow-xl scale-[1.01]' 
                              : 'bg-black/20 border-white/5 text-white/40 hover:text-white/60 hover:border-white/10'
                          }`}
                        >
                          <span className="block text-sm font-bold">🎯 Solo Sharpness</span>
                          <span className="block text-[10px] opacity-50 font-light mt-0.5">Individual cone drills & touch work</span>
                        </button>
                        <button
                          type="button"
                          disabled={isLoading}
                          onClick={() => setSessionType('match')}
                          className={`p-4 rounded-xl border transition-all duration-300 text-left relative overflow-hidden group ${
                            sessionType === 'match' 
                              ? 'bg-white/10 border-white/30 text-white shadow-xl scale-[1.01]' 
                              : 'bg-black/20 border-white/5 text-white/40 hover:text-white/60 hover:border-white/10'
                          }`}
                        >
                          <span className="block text-sm font-bold">⚔️ Match Ignition</span>
                          <span className="block text-[10px] opacity-50 font-light mt-0.5">Pre-game team warmup & sprints</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* GYM PROFILE FORM */}
                {activeProfile === 'gym' && (
                  <motion.div key="gym" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="space-y-6 absolute inset-0">
                    <div>
                      <h2 className="text-xl font-bold mb-1 tracking-tight">Strength Readiness Matrix</h2>
                      <p className="text-xs text-white/40">Measure mechanical equipment training variables.</p>
                    </div>

                    <div className="space-y-3">
                      <label className="block text-xs font-bold uppercase tracking-wider text-white/40">System Energy Index</label>
                      <NumberSelector value={gymEnergy} setValue={setGymEnergy} />
                      <div className="flex justify-between text-[10px] font-mono text-white/30 px-1">
                        <span>1 = Totally Drained</span>
                        <span>10 = Fully Supercharged</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 pt-1">
                      <div className="space-y-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-white/40">Last Night's Sleep (Hours)</label>
                        <input type="number" min="1" max="24" value={sleep} onChange={(e) => setSleep(e.target.value)} disabled={isLoading} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-400/30 transition-all disabled:opacity-40" />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-white/40">Any Sore / Tired Body Parts?</label>
                        <input type="text" placeholder="e.g., Shoulders, lower back..." value={soreMuscles} onChange={(e) => setSoreMuscles(e.target.value)} disabled={isLoading} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-green-400/30 transition-all disabled:opacity-40" />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button 
              onClick={handleGenerateWorkout} 
              disabled={isLoading}
              className="w-full mt-auto bg-white/10 hover:bg-white/20 border border-white/20 text-white py-4 rounded-xl font-bold text-sm tracking-wide transition-all duration-300 backdrop-blur-md flex justify-center items-center gap-2 group z-10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Running Calibration..." : "Generate Routine"}
              {!isLoading && <span className="group-hover:translate-x-1 transition-transform">→</span>}
            </button>
          </div>

          {/* DISPLAY RENDERING OUTPUT PANEL WITH HOLOGRAPHIC LOADING EXPERIENCE */}
          <div className="lg:col-span-7 backdrop-blur-xl bg-gradient-to-b from-white/5 to-transparent border border-white/10 p-8 rounded-3xl shadow-2xl flex flex-col h-[76vh] overflow-y-auto relative">
            
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8 my-auto py-4">
                  <div className="border-b border-white/5 pb-6 space-y-3">
                    <div className="h-7 w-2/3 bg-white/10 rounded-md animate-pulse"></div>
                    <div className="h-4 w-full bg-white/5 rounded-md animate-pulse"></div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-3 w-24 bg-white/10 rounded animate-pulse mb-4"></div>
                    <div className="h-5 w-full bg-white/5 rounded-md animate-pulse"></div>
                    <div className="h-5 w-5/6 bg-white/5 rounded-md animate-pulse"></div>
                  </div>
                  <div className="space-y-4 pt-4">
                    <div className="h-3 w-32 bg-white/10 rounded animate-pulse mb-4"></div>
                    <div className="h-16 w-full bg-white/5 border border-white/5 rounded-xl animate-pulse"></div>
                    <div className="h-16 w-full bg-white/5 border border-white/5 rounded-xl animate-pulse"></div>
                  </div>
                </motion.div>
              ) : aiWorkout ? (
                <motion.div key="output" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
                  <div className="border-b border-white/10 pb-5">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent tracking-tight mb-2">
                      {aiWorkout.focus}
                    </h2>
                    <p className="text-white/60 leading-relaxed text-sm font-light">{aiWorkout.notes}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3">Activation Sequence</h3>
                    <ul className="space-y-2.5">
                      {aiWorkout.warmup.map((item, idx) => (
                        <li key={idx} className="flex items-center text-sm text-white/80"><span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-3 shadow-[0_0_8px_#4ade80]"></span>{item}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="pb-4">
                    <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3 mt-4">Targeted Movement Splits</h3>
                    <div className="space-y-3">
                      {aiWorkout.exercises.map((ex, idx) => (
                        <div key={idx} className="bg-black/20 border border-white/5 p-4 rounded-xl flex justify-between items-center hover:bg-black/40 hover:border-white/10 transition-all duration-200">
                          <span className="font-medium text-white/90 text-sm tracking-wide">{ex.name}</span>
                          <div className="text-right">
                            <span className="block text-green-400 font-bold text-sm font-mono">{ex.sets && ex.reps ? `${ex.sets}x${ex.reps}` : ex.reps || 'Active'}</span>
                            <span className="block text-[11px] text-white/40 mt-0.5 font-mono">Rest: {ex.rest}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="empty" className="text-center text-white/20 my-auto py-12">
                  <div className="w-16 h-16 mx-auto mb-4 border border-white/5 rounded-full flex items-center justify-center bg-white/5 shadow-inner">
                    <svg className="w-6 h-6 opacity-30 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium tracking-wide text-white/40">Lock In Your Strategy</p>
                  <p className="text-xs mt-1 text-white/20">Select your energy profile to render today's dynamic target split.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </div>
  );
}

export default App;