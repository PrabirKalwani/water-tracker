import { useState, useEffect, useRef, useCallback } from "react";
import { SignInButton, SignUpButton, UserButton, useAuth, useUser } from "@clerk/clerk-react";

const TODAY = new Date().toISOString().slice(0, 10);
const API = "http://localhost:3001/api/water";

function getDateISO(offset = 0) {
  const d = new Date(); d.setDate(d.getDate() - offset);
  return d.toISOString().slice(0, 10);
}

async function apiFetch(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

const styles = {
  container: {
    maxWidth: 400, margin: "0 auto", padding: "20px 0 60px",
    display: "flex", flexDirection: "column", gap: 20,
  },
  header: {
    display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
    padding: "4px 0",
  },
  logoMark: {
    width: 32, height: 32, borderRadius: 8,
    background: "linear-gradient(135deg, #3b82f6, #2563eb)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 18, fontWeight: 700, color: "#fff",
  },
  title: {
    fontSize: 20, fontWeight: 700, letterSpacing: "-0.02em",
    color: "var(--text-primary)",
  },
  dateChip: {
    fontSize: 12, color: "var(--text-tertiary)", fontWeight: 500,
    background: "var(--bg-card)", padding: "4px 12px", borderRadius: 99,
    border: "1px solid var(--border-color)",
  },
  glassWrapper: {
    position: "relative", width: 160, height: 240,
    margin: "0 auto",
  },
  glassMetrics: {
    position: "absolute", inset: 0,
    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
    pointerEvents: "none", zIndex: 2,
  },
  countBig: {
    fontSize: 48, fontWeight: 700, letterSpacing: "-0.03em",
    lineHeight: 1, color: "var(--text-primary)",
  },
  countLabel: {
    fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", marginTop: 4,
  },
  countMl: {
    fontSize: 11, color: "var(--text-tertiary)", marginTop: 2,
  },
  btnPrimary: {
    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
    width: "100%", maxWidth: 260, margin: "0 auto",
    padding: "14px 28px", fontSize: 15, fontWeight: 600,
    color: "#fff", borderRadius: "var(--radius-md)",
    background: "linear-gradient(135deg, #3b82f6, #2563eb)",
    boxShadow: "0 4px 20px rgba(59, 130, 246, 0.3), 0 1px 3px rgba(0,0,0,0.2)",
    transition: "transform 0.15s, box-shadow 0.15s",
    letterSpacing: "-0.01em",
  },
  btnGhost: {
    background: "none", color: "var(--text-secondary)", fontSize: 13,
    padding: "8px 20px", fontWeight: 500,
    borderRadius: "var(--radius-sm)",
    transition: "color 0.15s, background 0.15s",
  },
  statGrid: {
    display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10,
  },
  statCard: {
    background: "var(--bg-card)", borderRadius: "var(--radius-md)",
    padding: "16px", border: "1px solid var(--border-color)",
    transition: "border-color 0.2s",
  },
  statLabel: {
    fontSize: 10, fontWeight: 600, textTransform: "uppercase",
    letterSpacing: "0.08em", color: "var(--text-tertiary)", marginBottom: 8,
  },
  statValue: {
    fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em",
    color: "var(--text-primary)", lineHeight: 1.1,
  },
  statSub: {
    fontSize: 12, color: "var(--text-tertiary)", marginTop: 4,
  },
  streakBar: {
    display: "flex", alignItems: "center", gap: 10,
    padding: "14px 16px", background: "var(--bg-card)",
    borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)",
  },
  streakIcon: {
    width: 36, height: 36, borderRadius: 10,
    background: "linear-gradient(135deg, rgba(234,179,8,0.2), rgba(234,179,8,0.05))",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 18, flexShrink: 0,
  },
  sectionLabel: {
    fontSize: 10, fontWeight: 600, textTransform: "uppercase",
    letterSpacing: "0.08em", color: "var(--text-tertiary)",
  },
  weekGrid: {
    display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6,
  },
  dayCell: {
    display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
  },
  dayLabel: {
    fontSize: 9, fontWeight: 600, textTransform: "uppercase",
    letterSpacing: "0.05em", color: "var(--text-tertiary)",
  },
  barOuter: {
    width: 34, height: 48, borderRadius: 6, overflow: "hidden",
    position: "relative",
    border: "1px solid var(--border-color-strong)",
    background: "var(--bg-secondary)",
  },
  barToday: {
    outline: "2px solid var(--accent)", outlineOffset: "-1px",
  },
  barInner: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    transition: "height 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
  },
  checkMark: {
    position: "absolute", inset: 0, display: "flex",
    alignItems: "center", justifyContent: "center",
    fontSize: 12, fontWeight: 700, color: "#fff", zIndex: 1,
  },
  dayCount: {
    fontSize: 9, fontWeight: 500, color: "var(--text-secondary)",
  },
  settingsCard: {
    background: "var(--bg-card)", borderRadius: "var(--radius-md)",
    padding: "16px", border: "1px solid var(--border-color)",
    display: "flex", flexDirection: "column", gap: 16,
  },
  settingRow: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
  },
  settingLabel: {
    fontSize: 13, fontWeight: 500, color: "var(--text-primary)",
  },
  stepper: {
    display: "flex", alignItems: "center", gap: 10,
  },
  stepperBtn: {
    width: 30, height: 30, borderRadius: "50%",
    border: "1px solid var(--border-color-strong)",
    background: "var(--bg-secondary)", color: "var(--text-secondary)",
    fontSize: 16, fontWeight: 500,
    display: "flex", alignItems: "center", justifyContent: "center",
    transition: "border-color 0.15s, color 0.15s",
  },
  stepperVal: {
    fontSize: 15, fontWeight: 600, minWidth: 36, textAlign: "center",
    color: "var(--text-primary)",
  },
  presetWrap: {
    display: "flex", gap: 6, flexWrap: "wrap",
  },
  presetBtn: (active) => ({
    fontSize: 11, fontWeight: 500, padding: "5px 12px",
    borderRadius: 99, cursor: "pointer",
    background: active ? "var(--accent)" : "var(--bg-secondary)",
    color: active ? "#fff" : "var(--text-secondary)",
    border: active ? "none" : "1px solid var(--border-color-strong)",
    transition: "all 0.15s",
  }),
  signInContainer: {
    maxWidth: 400, margin: "0 auto", padding: "40px 20px",
    textAlign: "center",
    display: "flex", flexDirection: "column", alignItems: "center", gap: 24,
  },
  clerkBtn: {
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    padding: "12px 32px", fontSize: 15, fontWeight: 600,
    borderRadius: "var(--radius-md)", cursor: "pointer",
    border: "none",
    color: "#fff",
    transition: "transform 0.15s, box-shadow 0.15s",
  },
  clerkBtnPrimary: {
    background: "linear-gradient(135deg, #3b82f6, #2563eb)",
    boxShadow: "0 4px 20px rgba(59, 130, 246, 0.3)",
  },
  clerkBtnOutline: {
    background: "transparent",
    border: "1px solid var(--border-color-strong)",
    color: "var(--text-primary)",
  },
  navBar: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "0 0 16px",
  },
};

function GlassSVG({ pct, animate }) {
  const glassH = 180;
  const topY = 195 - pct * glassH;
  const waveRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!animate || pct <= 0 || pct >= 1) {
      if (waveRef.current) waveRef.current.setAttribute("d", "");
      return;
    }
    let start = null;
    function frame(ts) {
      if (!start) start = ts;
      const t = (ts - start) / 800;
      if (!waveRef.current) return;
      if (ts - start > 2000) { waveRef.current.setAttribute("d", ""); return; }
      const pts = [];
      for (let x = 18; x <= 142; x += 6) {
        const prog = (x - 18) / 124;
        const y = topY + Math.sin(prog * Math.PI * 2 + t) * 4;
        pts.push(`${x} ${y}`);
      }
      waveRef.current.setAttribute(
        "d",
        `M 16 ${topY} L ${pts.join(" L ")} L 144 ${topY} L 138 190 L 22 190 Z`
      );
      rafRef.current = requestAnimationFrame(frame);
    }
    rafRef.current = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafRef.current);
  }, [animate, pct, topY]);

  return (
    <svg viewBox="0 0 160 200" style={{ width: "100%", height: "100%", filter: "drop-shadow(0 8px 24px rgba(59, 130, 246, 0.15))" }}>
      <defs>
        <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>
        <linearGradient id="glassStroke" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#93c5fd" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
        <clipPath id="gc">
          <path d="M24 12 L136 12 L128 190 L32 190 Z" />
        </clipPath>
        <filter id="glassGlow">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <path
        d="M24 12 L136 12 L128 190 L32 190 Z"
        fill="none"
        stroke="url(#glassStroke)"
        strokeWidth="2.5"
        strokeLinejoin="round"
        opacity="0.6"
      />

      <rect
        x="25" y={topY} width="110"
        height={pct * glassH}
        fill="url(#waterGrad)"
        clipPath="url(#gc)"
        opacity="0.85"
      />

      <path ref={waveRef} fill="url(#waterGrad)" clipPath="url(#gc)" opacity="0.9" d="" />

      <path
        d="M30 190 L30 18"
        stroke="rgba(255,255,255,0.12)"
        strokeWidth="6"
        strokeLinecap="round"
        clipPath="url(#gc)"
      />
    </svg>
  );
}

function WeekGrid({ goal, todayCount, weekDays }) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const iso = getDateISO(6 - i);
    const count = iso === TODAY ? todayCount : (weekDays[iso] || 0);
    const label = new Date(iso + "T12:00").toLocaleDateString(undefined, { weekday: "short" }).slice(0, 2);
    return { iso, count, label, isToday: iso === TODAY };
  });

  return (
    <div style={styles.weekGrid}>
      {days.map(d => {
        const p = Math.min(d.count / goal, 1);
        const done = d.count >= goal;
        return (
          <div key={d.iso} style={styles.dayCell}>
            <span style={styles.dayLabel}>{d.label}</span>
            <div style={{ ...styles.barOuter, ...(d.isToday ? styles.barToday : {}) }}>
              <div
                style={{
                  ...styles.barInner,
                  height: `${Math.round(p * 44)}px`,
                  borderRadius: "0 0 5px 5px",
                  background: done
                    ? "linear-gradient(180deg, #3b82f6, #2563eb)"
                    : p > 0
                      ? "linear-gradient(180deg, #60a5fa, #3b82f6)"
                      : "transparent",
                }}
              />
              {done && <div style={styles.checkMark}>✓</div>}
            </div>
            <span style={styles.dayCount}>{d.count}</span>
          </div>
        );
      })}
    </div>
  );
}

function SignInScreen() {
  return (
    <div style={styles.signInContainer}>
      <div style={{ fontSize: 48, marginBottom: 8 }}>💧</div>
      <h1 style={{ ...styles.title, fontSize: 28 }}>Hydro</h1>
      <p style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.6 }}>
        Track your daily water intake. Sign in to save your progress.
      </p>
      <div style={{ display: "flex", gap: 12 }}>
        <SignInButton mode="modal">
          <button
            style={{ ...styles.clerkBtn, ...styles.clerkBtnPrimary }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ""; }}
          >
            Sign In
          </button>
        </SignInButton>
        <SignUpButton mode="modal">
          <button
            style={{ ...styles.clerkBtn, ...styles.clerkBtnOutline }}
            onMouseEnter={e => { e.currentTarget.style.background = "var(--bg-card)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
          >
            Sign Up
          </button>
        </SignUpButton>
      </div>
    </div>
  );
}

export default function App() {
  const { isSignedIn, isLoaded, getToken } = useAuth();
  const { user } = useUser();

  const [goal, setGoalState] = useState(8);
  const [ml, setMlState] = useState(250);
  const [count, setCountState] = useState(0);
  const [animate, setAnimate] = useState(false);
  const [weekDays, setWeekDays] = useState({});
  const [loading, setLoading] = useState(true);

  const getAuthFetch = useCallback(async (path, options = {}) => {
    const token = await getToken();
    return apiFetch(path, {
      ...options,
      headers: { ...options.headers, Authorization: `Bearer ${token}` },
    });
  }, [getToken]);

  useEffect(() => {
    if (!isSignedIn) { setLoading(false); return; }
    (async () => {
      try {
        const data = await getAuthFetch("/");
        setGoalState(data.goal);
        setMlState(data.ml);
        const days = {};
        for (const d of data.days) days[d.date] = d.count;
        setWeekDays(days);
        setCountState(days[TODAY] || 0);
      } catch (e) {
        console.error("Failed to load data:", e);
      }
      setLoading(false);
    })();
  }, [isSignedIn, getAuthFetch]);

  const syncCount = useCallback(async (newCount) => {
    setCountState(newCount);
    try {
      await getAuthFetch(`/day/${TODAY}`, {
        method: "PUT",
        body: JSON.stringify({ count: newCount }),
      });
    } catch (e) {
      console.error("Failed to sync:", e);
    }
  }, [getAuthFetch]);

  const syncSettings = useCallback(async (newGoal, newMl) => {
    try {
      await getAuthFetch("/settings", {
        method: "PUT",
        body: JSON.stringify({ goal: newGoal, ml: newMl }),
      });
    } catch (e) {
      console.error("Failed to sync settings:", e);
    }
  }, [getAuthFetch]);

  function setGoal(v) { setGoalState(v); syncSettings(v, ml); }
  function setMl(v) { setMlState(v); syncSettings(goal, v); }

  function drink() { if (count >= goal * 2) return; const next = count + 1; syncCount(next); setAnimate(true); setTimeout(() => setAnimate(false), 2100); }
  function undo() { if (count <= 0) return; syncCount(count - 1); }

  if (!isLoaded || loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", color: "var(--text-tertiary)" }}>
        Loading...
      </div>
    );
  }

  if (!isSignedIn) return <SignInScreen />;

  const pct = Math.min(count / goal, 1);
  const rem = Math.max(goal - count, 0);

  let streak = 0;
  for (let i = 1; i <= 60; i++) {
    const iso = getDateISO(i);
    const c = weekDays[iso] || 0;
    if (c >= goal) streak++;
    else break;
  }
  if (count >= goal) streak++;

  const dateStr = new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });

  return (
    <div style={styles.container}>
      <div style={styles.navBar}>
        <div style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 500 }}>
          {user?.primaryEmailAddress?.emailAddress}
        </div>
        <UserButton afterSignOutUrl="/" />
      </div>

      <div style={styles.header}>
        <div style={styles.logoMark}>💧</div>
        <h1 style={styles.title}>Hydro</h1>
      </div>
      <div style={{ textAlign: "center" }}>
        <span style={styles.dateChip}>{dateStr}</span>
      </div>

      <div style={{ marginTop: 4 }}>
        <div style={styles.glassWrapper}>
          <GlassSVG pct={pct} animate={animate} />
          <div style={styles.glassMetrics}>
            <span style={styles.countBig}>{count}</span>
            <span style={styles.countLabel}>of {goal} glasses</span>
            <span style={styles.countMl}>{count * ml} / {goal * ml} ml</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, marginTop: 12 }}>
          <button
            onClick={drink}
            style={styles.btnPrimary}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 28px rgba(59, 130, 246, 0.4), 0 1px 3px rgba(0,0,0,0.2)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 4px 20px rgba(59, 130, 246, 0.3), 0 1px 3px rgba(0,0,0,0.2)"; }}
          >
            💧 Drink a glass
          </button>
          <button
            onClick={undo}
            style={styles.btnGhost}
            onMouseEnter={e => { e.currentTarget.style.color = "var(--text-primary)"; e.currentTarget.style.background = "var(--bg-card)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "var(--text-secondary)"; e.currentTarget.style.background = "none"; }}
          >
            Undo last
          </button>
        </div>
      </div>

      <div style={styles.statGrid}>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Remaining</div>
          <div style={styles.statValue}>{rem} glasses</div>
          <div style={styles.statSub}>{rem * ml} ml to go</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Today</div>
          <div style={styles.statValue}>{count * ml} ml</div>
          <div style={styles.statSub}>{Math.round(pct * 100)}% of goal</div>
        </div>
      </div>

      <div style={styles.streakBar}>
        <div style={styles.streakIcon}>🔥</div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>{streak} day streak</div>
          <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 1 }}>
            {streak > 0 ? "Keep it going!" : "Start your streak today"}
          </div>
        </div>
      </div>

      <div>
        <div style={{ ...styles.sectionLabel, marginBottom: 10 }}>This Week</div>
        <WeekGrid goal={goal} todayCount={count} weekDays={weekDays} />
      </div>

      <div>
        <div style={{ ...styles.sectionLabel, marginBottom: 10 }}>Settings</div>
        <div style={styles.settingsCard}>
          {[
            { label: "Daily goal", unit: "glasses", presets: [6, 8, 10, 12], val: goal, set: setGoal, step: 1, min: 1, max: 20 },
            { label: "Glass size", unit: "ml", presets: [200, 250, 330, 500], val: ml, set: setMl, step: 50, min: 50, max: 1000 },
          ].map((s, i) => (
            <div key={s.label} style={{ paddingBottom: i === 0 ? 16 : 0, borderBottom: i === 0 ? "1px solid var(--border-color)" : "none" }}>
              <div style={styles.settingRow}>
                <span style={styles.settingLabel}>{s.label}</span>
                <div style={styles.stepper}>
                  <button
                    onClick={() => s.set(Math.max(s.min, s.val - s.step))}
                    style={styles.stepperBtn}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.color = "#fff"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border-color-strong)"; e.currentTarget.style.color = "var(--text-secondary)"; }}
                  >
                    −
                  </button>
                  <span style={styles.stepperVal}>{s.val}</span>
                  <button
                    onClick={() => s.set(Math.min(s.max, s.val + s.step))}
                    style={styles.stepperBtn}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.color = "#fff"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border-color-strong)"; e.currentTarget.style.color = "var(--text-secondary)"; }}
                  >
                    +
                  </button>
                </div>
              </div>
              <div style={styles.presetWrap}><span style={{ fontSize: 11, color: "var(--text-tertiary)", marginRight: 4, display: "flex", alignItems: "center" }}>{s.unit}:</span>
                {s.presets.map(v => (
                  <button
                    key={v}
                    onClick={() => s.set(v)}
                    style={styles.presetBtn(v === s.val)}
                    onMouseEnter={e => { if (v !== s.val) { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.color = "#fff"; } }}
                    onMouseLeave={e => { if (v !== s.val) { e.currentTarget.style.borderColor = "var(--border-color-strong)"; e.currentTarget.style.color = "var(--text-secondary)"; } }}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
