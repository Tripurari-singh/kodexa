"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useInView, AnimatePresence } from "framer-motion";

/* ─────────────────────────────────────────────────────────────────────────────
   DESIGN TOKENS  (xAI system, remapped for Kodexa)
   ─────────────────────────────────────────────────────────────────────────── */
const TOKENS = {
  void:     "#0a0a0f",   // canvas — near-black with violet undertone
  graphite: "#16161e",   // card bg
  rim:      "#1e1e2e",   // hairline borders
  smoke:    "#3a3a52",   // secondary borders / button outlines
  ash:      "#6e6e8a",   // muted text
  mist:     "#9a9ab0",   // sub-muted labels
  white:    "#ffffff",   // primary text
  accent:   "#7c6af7",   // Kodexa purple — signature brand accent
  accentHi: "#a78bfa",   // lighter tint for gradients
  accentGlow:"rgba(124,106,247,0.18)",
  horizonGrad: "linear-gradient(to top, rgba(124,106,247,0.12), rgba(99,91,255,0.06), transparent)",
};

/* ─────────────────────────────────────────────────────────────────────────────
   GLOBAL STYLES  (inject once as a <style> tag)
   ─────────────────────────────────────────────────────────────────────────── */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500&family=JetBrains+Mono:wght@400&display=swap');

    :root {
      --void:        #0a0a0f;
      --graphite:    #16161e;
      --rim:         #1e1e2e;
      --smoke:       #3a3a52;
      --ash:         #6e6e8a;
      --mist:        #9a9ab0;
      --white:       #ffffff;
      --accent:      #7c6af7;
      --accent-hi:   #a78bfa;
      --accent-glow: rgba(124,106,247,0.18);

      --font-sans: 'Inter', ui-sans-serif, system-ui, sans-serif;
      --font-mono: 'JetBrains Mono', ui-monospace, monospace;

      --text-display:    clamp(52px, 8vw, 88px);
      --text-heading-lg: clamp(32px, 5vw, 52px);
      --text-heading:    clamp(24px, 3.5vw, 36px);
      --text-body-lg:    20px;
      --text-body:       16px;
      --text-label:      14px;
      --text-badge:      12px;

      --track-display:  -2.5px;
      --track-heading:  -1.2px;
      --track-mono:      0.08em;
    }

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    html { scroll-behavior: smooth; }

    body {
      background: var(--void);
      color: var(--white);
      font-family: var(--font-sans);
      font-weight: 400;
      font-size: var(--text-body);
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
      overflow-x: hidden;
    }

    /* Selection accent */
    ::selection { background: var(--accent); color: #fff; }

    /* Scrollbar */
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: var(--smoke); border-radius: 2px; }

    .kodexa-home { position: relative; }

    /* Ghost pill button base */
    .pill-btn {
      display: inline-flex; align-items: center; gap: 6px;
      font-family: var(--font-sans); font-size: var(--text-label); font-weight: 400;
      letter-spacing: -0.2px; color: var(--white); text-decoration: none;
      border: 1px solid var(--white); border-radius: 9999px;
      padding: 8px 20px; background: transparent; cursor: pointer;
      transition: background 0.2s, border-color 0.2s;
    }
    .pill-btn:hover { background: rgba(255,255,255,0.06); }
    .pill-btn.secondary { border-color: var(--smoke); color: var(--white); }
    .pill-btn.secondary:hover { border-color: var(--mist); background: rgba(255,255,255,0.04); }
    .pill-btn.accent {
      border-color: var(--accent); color: var(--white);
      background: linear-gradient(135deg, var(--accent) 0%, #635bff 100%);
    }
    .pill-btn.accent:hover { filter: brightness(1.1); }

    /* Eyebrow label */
    .eyebrow {
      font-family: var(--font-mono); font-size: var(--text-badge);
      letter-spacing: var(--track-mono); color: var(--ash);
      text-transform: uppercase;
    }

    /* Nav link */
    .nav-link {
      font-family: var(--font-mono); font-size: var(--text-label);
      letter-spacing: var(--track-mono); color: var(--white); text-decoration: none;
      text-transform: uppercase; opacity: 0.75; transition: opacity 0.2s;
    }
    .nav-link:hover { opacity: 1; }

    /* Section layout */
    .section {
      max-width: 1200px; margin: 0 auto;
      padding: 0 clamp(20px, 4vw, 48px);
    }

    /* Card — no bg fill, defined by rim border */
    .card {
      border: 1px solid var(--rim);
      border-radius: 2px;
      padding: 32px;
    }
    .card:hover { border-color: var(--smoke); }

    /* Grid */
    .grid-3 {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0;
    }
    @media (max-width: 900px) {
      .grid-3 { grid-template-columns: 1fr 1fr; }
    }
    @media (max-width: 600px) {
      .grid-3 { grid-template-columns: 1fr; }
    }
    .grid-2 {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 24px;
    }
    @media (max-width: 700px) { .grid-2 { grid-template-columns: 1fr; } }

    /* Reduced motion */
    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
    }
  `}</style>
);

/* ─────────────────────────────────────────────────────────────────────────────
   GRID CANVAS — the signature background element (animated code-grid)
   ─────────────────────────────────────────────────────────────────────────── */
const GridCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;
    let t = 0;

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      const W = canvas.offsetWidth;
      const H = canvas.offsetHeight;
      ctx.clearRect(0, 0, W, H);

      const cols = Math.ceil(W / 48) + 2;
      const rows = Math.ceil(H / 48) + 2;
      const cell = 48;

      // Draw grid lines with pulse
      for (let i = 0; i <= cols; i++) {
        const x = i * cell;
        const pulse = 0.04 + 0.03 * Math.sin(t * 0.5 + i * 0.3);
        ctx.strokeStyle = `rgba(124,106,247,${pulse})`;
        ctx.lineWidth = 0.5;
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (let j = 0; j <= rows; j++) {
        const y = j * cell;
        const pulse = 0.04 + 0.03 * Math.sin(t * 0.5 + j * 0.25);
        ctx.strokeStyle = `rgba(124,106,247,${pulse})`;
        ctx.lineWidth = 0.5;
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }

      // Glowing intersection dots — only a few active at a time
      for (let i = 0; i <= cols; i++) {
        for (let j = 0; j <= rows; j++) {
          const wave = Math.sin(t * 0.8 + i * 0.6 + j * 0.4);
          if (wave > 0.82) {
            const x = i * cell;
            const y = j * cell;
            const intensity = (wave - 0.82) / 0.18;
            ctx.beginPath();
            ctx.arc(x, y, 1.5 * intensity, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(167,139,250,${0.6 * intensity})`;
            ctx.fill();

            // Glow ring
            ctx.beginPath();
            ctx.arc(x, y, 6 * intensity, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(124,106,247,${0.08 * intensity})`;
            ctx.fill();
          }
        }
      }

      // Fade top and sides with gradient
      const gradT = ctx.createLinearGradient(0, 0, 0, H);
      gradT.addColorStop(0, "rgba(10,10,15,0.0)");
      gradT.addColorStop(0.6, "rgba(10,10,15,0.0)");
      gradT.addColorStop(1,   "rgba(10,10,15,1.0)");
      ctx.fillStyle = gradT;
      ctx.fillRect(0, 0, W, H);

      t += 0.016;
      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute", inset: 0,
        width: "100%", height: "100%",
        pointerEvents: "none", opacity: 0.9,
      }}
    />
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   HERO LIGHT BLOOM
   ─────────────────────────────────────────────────────────────────────────── */
const HeroBloom = () => (
  <div
    style={{
      position: "absolute",
      top: "50%", left: "50%",
      transform: "translate(-50%, -60%)",
      width: "900px", height: "600px",
      background: "radial-gradient(ellipse at 50% 40%, rgba(124,106,247,0.22) 0%, rgba(99,91,255,0.08) 35%, transparent 70%)",
      pointerEvents: "none",
      filter: "blur(1px)",
    }}
  />
);

/* ─────────────────────────────────────────────────────────────────────────────
   NAVBAR
   ─────────────────────────────────────────────────────────────────────────── */
const NAV_LINKS = ["Product", "Templates", "Pricing", "Docs", "Blog"];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        height: 72,
        display: "flex", alignItems: "center",
        background: scrolled ? "rgba(10,10,15,0.88)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(30,30,46,0.8)" : "1px solid transparent",
        transition: "background 0.4s, border-color 0.4s, backdrop-filter 0.4s",
      }}
    >
      <div className="section" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
        {/* Wordmark */}
        <a href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
          <KodexaMark />
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: 15,
            letterSpacing: "0.06em", color: "var(--white)",
            textTransform: "uppercase", fontWeight: 400,
          }}>
            Kodexa
          </span>
        </a>

        {/* Nav links — desktop */}
        <div style={{ display: "flex", gap: 32, alignItems: "center" }}
          className="nav-links-desktop"
        >
          {NAV_LINKS.map(l => (
            <a key={l} href="#" className="nav-link">{l}</a>
          ))}
        </div>

        {/* CTA */}
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <a href="#" className="nav-link" style={{ marginRight: 4 }}>Sign in</a>
          <a href="#" className="pill-btn">
            Start building <Arrow />
          </a>
        </div>
      </div>
    </motion.nav>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   KODEXA MARK SVG (geometric K in a square grid)
   ─────────────────────────────────────────────────────────────────────────── */
const KodexaMark = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <rect x="0.5" y="0.5" width="27" height="27" rx="3" stroke="rgba(124,106,247,0.6)" strokeWidth="0.8" fill="none"/>
    {/* Grid lines */}
    <line x1="9.3" y1="1" x2="9.3" y2="27" stroke="rgba(124,106,247,0.2)" strokeWidth="0.5"/>
    <line x1="18.7" y1="1" x2="18.7" y2="27" stroke="rgba(124,106,247,0.2)" strokeWidth="0.5"/>
    <line x1="1" y1="9.3" x2="27" y2="9.3" stroke="rgba(124,106,247,0.2)" strokeWidth="0.5"/>
    <line x1="1" y1="18.7" x2="27" y2="18.7" stroke="rgba(124,106,247,0.2)" strokeWidth="0.5"/>
    {/* K letterform */}
    <path d="M8 6 L8 22 M8 14 L20 6 M8 14 L20 22" stroke="#a78bfa" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
  </svg>
);

/* ─────────────────────────────────────────────────────────────────────────────
   TINY HELPERS
   ─────────────────────────────────────────────────────────────────────────── */
const Arrow = ({ size = 10 }) => (
  <svg width={size} height={size} viewBox="0 0 10 10" fill="none" style={{ flexShrink: 0 }}>
    <path d="M1 9L9 1M9 1H2M9 1V8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const FadeIn = ({ children, delay = 0, y = 20, style = {}, ...rest }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      style={style}
      {...rest}
    >
      {children}
    </motion.div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   HERO
   ─────────────────────────────────────────────────────────────────────────── */
const Hero = () => {
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 600], [0, -80]);
  const heroOpacity = useTransform(scrollY, [0, 500], [1, 0]);

  return (
    <motion.section
      style={{
        position: "relative", minHeight: "100vh",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        textAlign: "center", overflow: "hidden",
        paddingTop: 72,
        y: heroY,
        opacity: heroOpacity,
      }}
    >
      {/* Ambient bg grid */}
      <GridCanvas />
      <HeroBloom />

      <div className="section" style={{ position: "relative", zIndex: 1 }}>
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          style={{ marginBottom: 40, display: "flex", justifyContent: "center" }}
        >
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: "var(--text-badge)",
            letterSpacing: "var(--track-mono)", color: "var(--accent-hi)",
            border: "1px solid rgba(124,106,247,0.35)",
            borderRadius: 9999, padding: "6px 16px",
            background: "rgba(124,106,247,0.08)",
            textTransform: "uppercase",
          }}>
            [ New → Visual AI Components in v2.0 ]
          </span>
        </motion.div>

        {/* Wordmark — the hero */}
        <motion.h1
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          style={{
            fontFamily: "var(--font-sans)", fontWeight: 400,
            fontSize: "var(--text-display)", lineHeight: 1.0,
            letterSpacing: "var(--track-display)", color: "var(--white)",
            marginBottom: 28,
          }}
        >
          Build websites
          <br />
          <GradientWord>without limits.</GradientWord>
        </motion.h1>

        {/* Subhead */}
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          style={{
            fontFamily: "var(--font-sans)", fontSize: "var(--text-body-lg)",
            lineHeight: 1.5, letterSpacing: "-0.5px",
            color: "var(--ash)", maxWidth: 540, margin: "0 auto 48px",
          }}
        >
          The visual website builder for developers who want{" "}
          <em style={{ color: "var(--mist)", fontStyle: "normal" }}>full control</em> and{" "}
          <em style={{ color: "var(--mist)", fontStyle: "normal" }}>zero friction.</em>
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.48, ease: [0.22, 1, 0.36, 1] }}
          style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}
        >
          <a href="#" className="pill-btn accent" style={{ fontSize: 15, padding: "10px 28px" }}>
            Start for free <Arrow size={11} />
          </a>
          <a href="#" className="pill-btn secondary" style={{ fontSize: 15, padding: "10px 28px" }}>
            View templates
          </a>
        </motion.div>

        {/* Social proof */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          style={{
            marginTop: 56, display: "flex", alignItems: "center", justifyContent: "center",
            gap: 24, flexWrap: "wrap",
          }}
        >
          {["50,000+ sites built", "99.9% uptime", "Free forever plan"].map(s => (
            <span key={s} style={{
              fontFamily: "var(--font-mono)", fontSize: "var(--text-badge)",
              letterSpacing: "var(--track-mono)", color: "var(--ash)", textTransform: "uppercase",
            }}>
              {s}
            </span>
          ))}
        </motion.div>
      </div>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.6 }}
        style={{
          position: "absolute", bottom: 40, left: "50%", transform: "translateX(-50%)",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
        }}
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
          style={{ width: 1, height: 48, background: "linear-gradient(to bottom, transparent, var(--ash))" }}
        />
      </motion.div>
    </motion.section>
  );
};

/* Gradient word component */
const GradientWord = ({ children }) => (
  <span style={{
    background: "linear-gradient(135deg, #ffffff 0%, #a78bfa 50%, #7c6af7 100%)",
    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  }}>
    {children}
  </span>
);

/* ─────────────────────────────────────────────────────────────────────────────
   FEATURE CARDS SECTION
   ─────────────────────────────────────────────────────────────────────────── */
const FEATURES = [
  {
    eyebrow: "[ 01 / VISUAL ]",
    title: "Design in the browser.",
    desc: "A canvas that feels like Figma but ships real HTML. Drag, resize, and style — every pixel maps to clean, exportable code.",
    icon: <CanvasIcon />,
    cta: "Explore the canvas",
  },
  {
    eyebrow: "[ 02 / CODE ]",
    title: "Code when you want to.",
    desc: "Drop into code mode at any point. Kodexa never locks you out of your own markup — it's your site, your rules.",
    icon: <CodeIcon />,
    cta: "See the editor",
  },
  {
    eyebrow: "[ 03 / DEPLOY ]",
    title: "Ship in one click.",
    desc: "Edge-deployed globally in seconds. Custom domains, SSL, and instant rollbacks — no DevOps required.",
    icon: <DeployIcon />,
    cta: "View deployment",
  },
];

function CanvasIcon() {
  return (
    <svg width="200" height="140" viewBox="0 0 200 140" fill="none" style={{ opacity: 0.7 }}>
      <rect x="10" y="20" width="180" height="100" rx="2" stroke="rgba(124,106,247,0.3)" strokeWidth="0.8"/>
      <rect x="24" y="34" width="60" height="40" rx="1" stroke="rgba(124,106,247,0.5)" strokeWidth="0.7"/>
      <rect x="24" y="82" width="90" height="26" rx="1" stroke="rgba(124,106,247,0.35)" strokeWidth="0.7"/>
      <rect x="100" y="34" width="78" height="74" rx="1" stroke="rgba(124,106,247,0.4)" strokeWidth="0.7"/>
      <circle cx="54" cy="54" r="3" fill="rgba(167,139,250,0.6)"/>
      <line x1="24" y1="74" x2="84" y2="74" stroke="rgba(124,106,247,0.25)" strokeWidth="0.5"/>
      {/* Resize handle */}
      <rect x="178" y="118" width="6" height="6" rx="1" fill="rgba(167,139,250,0.5)"/>
      <rect x="171" y="125" width="6" height="3" rx="0.5" fill="rgba(124,106,247,0.3)"/>
    </svg>
  );
}

function CodeIcon() {
  return (
    <svg width="200" height="140" viewBox="0 0 200 140" fill="none" style={{ opacity: 0.7 }}>
      <rect x="10" y="16" width="180" height="108" rx="2" stroke="rgba(124,106,247,0.25)" strokeWidth="0.7"/>
      {/* Terminal dots */}
      <circle cx="26" cy="30" r="3" fill="rgba(124,106,247,0.4)"/>
      <circle cx="38" cy="30" r="3" fill="rgba(124,106,247,0.25)"/>
      <circle cx="50" cy="30" r="3" fill="rgba(124,106,247,0.2)"/>
      <line x1="10" y1="40" x2="190" y2="40" stroke="rgba(30,30,46,1)" strokeWidth="0.5"/>
      {/* Code lines */}
      {[50,60,70,80,90,100,110].map((y, i) => (
        <line key={y} x1="24" y1={y} x2={24 + [80,120,60,100,40,110,55][i]} y2={y}
          stroke={i % 3 === 0 ? "rgba(167,139,250,0.5)" : i % 3 === 1 ? "rgba(124,106,247,0.3)" : "rgba(110,110,138,0.25)"}
          strokeWidth="1" strokeLinecap="round"/>
      ))}
      {/* Cursor blink */}
      <rect x="104" y="86" width="1" height="10" rx="0.5" fill="rgba(167,139,250,0.8)"/>
    </svg>
  );
}

function DeployIcon() {
  return (
    <svg width="200" height="140" viewBox="0 0 200 140" fill="none" style={{ opacity: 0.7 }}>
      {/* Globe wireframe */}
      <circle cx="100" cy="70" r="52" stroke="rgba(124,106,247,0.3)" strokeWidth="0.7"/>
      <ellipse cx="100" cy="70" rx="28" ry="52" stroke="rgba(124,106,247,0.2)" strokeWidth="0.5"/>
      <ellipse cx="100" cy="70" rx="52" ry="18" stroke="rgba(124,106,247,0.2)" strokeWidth="0.5"/>
      <line x1="48" y1="70" x2="152" y2="70" stroke="rgba(124,106,247,0.2)" strokeWidth="0.5"/>
      <line x1="100" y1="18" x2="100" y2="122" stroke="rgba(124,106,247,0.2)" strokeWidth="0.5"/>
      {/* Upload arrow */}
      <path d="M100 80 L100 56 M92 64 L100 56 L108 64" stroke="rgba(167,139,250,0.8)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      {/* Signal rings */}
      <circle cx="100" cy="70" r="62" stroke="rgba(124,106,247,0.08)" strokeWidth="0.5" strokeDasharray="3 3"/>
      <circle cx="100" cy="70" r="72" stroke="rgba(124,106,247,0.05)" strokeWidth="0.5" strokeDasharray="3 5"/>
    </svg>
  );
}

const FeatureCard = ({ feature, index }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRight: index < 2 ? "1px solid var(--rim)" : "none",
        borderBottom: "1px solid var(--rim)",
        borderTop: "1px solid var(--rim)",
        borderLeft: index === 0 ? "1px solid var(--rim)" : "none",
        padding: 32,
        background: hovered ? "rgba(124,106,247,0.03)" : "transparent",
        transition: "background 0.3s",
        cursor: "default",
        display: "flex", flexDirection: "column",
      }}
    >
      {/* Eyebrow */}
      <span className="eyebrow" style={{ marginBottom: 24 }}>{feature.eyebrow}</span>

      {/* Title */}
      <h3 style={{
        fontFamily: "var(--font-sans)", fontWeight: 400,
        fontSize: "var(--text-heading)", lineHeight: 1.15,
        letterSpacing: "var(--track-heading)", color: "var(--white)",
        marginBottom: 14,
      }}>
        {feature.title}
      </h3>

      {/* Desc */}
      <p style={{
        fontFamily: "var(--font-sans)", fontSize: "var(--text-body)",
        lineHeight: 1.65, color: "var(--ash)",
        marginBottom: 32, flex: 1,
      }}>
        {feature.desc}
      </p>

      {/* Abstract illustration */}
      <div style={{
        display: "flex", justifyContent: "center", alignItems: "center",
        height: 160, marginBottom: 28,
        borderRadius: 2, background: "rgba(22,22,30,0.5)",
        border: "1px solid var(--rim)",
        overflow: "hidden",
        transition: "border-color 0.3s",
        ...(hovered && { borderColor: "rgba(124,106,247,0.3)" }),
      }}>
        <motion.div
          animate={hovered ? { scale: 1.04 } : { scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          {feature.icon}
        </motion.div>
      </div>

      {/* CTA */}
      <a href="#" style={{
        display: "inline-flex", alignItems: "center", gap: 8,
        fontFamily: "var(--font-sans)", fontSize: "var(--text-label)",
        color: "var(--white)", textDecoration: "none",
        opacity: 0.7, transition: "opacity 0.2s",
        borderRadius: 9999, border: "1px solid var(--smoke)",
        padding: "8px 18px", width: "fit-content",
      }}
        onMouseEnter={e => e.currentTarget.style.opacity = "1"}
        onMouseLeave={e => e.currentTarget.style.opacity = "0.7"}
      >
        {feature.cta} <Arrow size={9} />
      </a>
    </motion.div>
  );
};

const FeaturesSection = () => (
  <section style={{ paddingBottom: 0, marginTop: -1 }}>
    <div className="section" style={{ marginBottom: 64 }}>
      <FadeIn delay={0}>
        <span className="eyebrow">[ PRODUCT ]</span>
      </FadeIn>
      <FadeIn delay={0.08}>
        <h2 style={{
          fontFamily: "var(--font-sans)", fontWeight: 400,
          fontSize: "var(--text-heading-lg)", lineHeight: 1.1,
          letterSpacing: "var(--track-heading)", color: "var(--white)",
          marginTop: 16, maxWidth: 600,
        }}>
          Everything you need to build the web.
        </h2>
      </FadeIn>
    </div>
    <div className="section">
      <div className="grid-3">
        {FEATURES.map((f, i) => (
          <FeatureCard key={f.title} feature={f} index={i} />
        ))}
      </div>
    </div>
  </section>
);

/* ─────────────────────────────────────────────────────────────────────────────
   STATS STRIP
   ─────────────────────────────────────────────────────────────────────────── */
const STATS = [
  { value: "50K+", label: "Sites published" },
  { value: "< 1s",  label: "Avg. load time" },
  { value: "200+",  label: "Component blocks" },
  { value: "99.9%", label: "Uptime SLA" },
];

const StatsStrip = () => (
  <FadeIn>
    <section style={{ paddingTop: 96, paddingBottom: 96 }}>
      <div className="section">
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          borderTop: "1px solid var(--rim)",
          borderLeft: "1px solid var(--rim)",
        }}>
          {STATS.map((s, i) => (
            <div key={s.label} style={{
              padding: "40px 32px",
              borderRight: "1px solid var(--rim)",
              borderBottom: "1px solid var(--rim)",
              textAlign: "center",
            }}>
              <div style={{
                fontFamily: "var(--font-sans)", fontWeight: 400,
                fontSize: "clamp(36px,5vw,56px)", lineHeight: 1.0,
                letterSpacing: "-2px", color: "var(--white)",
                marginBottom: 8,
              }}>
                <CountUp value={s.value} />
              </div>
              <span className="eyebrow">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  </FadeIn>
);

const CountUp = ({ value }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <motion.span
      ref={ref}
      initial={{ opacity: 0, y: 12 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      {value}
    </motion.span>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   HOW IT WORKS — PROCESS STEPS
   ─────────────────────────────────────────────────────────────────────────── */
const STEPS = [
  { num: "01", title: "Pick a template", desc: "Start from 200+ professionally designed templates or a blank canvas. Every layout is production-ready." },
  { num: "02", title: "Customise visually", desc: "Drag components, adjust styles, and connect your data — all in a browser-native canvas with live preview." },
  { num: "03", title: "Connect & extend", desc: "Integrate CMSs, APIs, and custom code. Kodexa stays out of your way and plays well with everything." },
  { num: "04", title: "Publish anywhere", desc: "Deploy to our global edge network or export clean HTML/CSS and host anywhere you want." },
];

const ProcessSection = () => (
  <section style={{ paddingTop: 96, paddingBottom: 96 }}>
    <div className="section">
      <FadeIn><span className="eyebrow">[ HOW IT WORKS ]</span></FadeIn>
      <FadeIn delay={0.08}>
        <h2 style={{
          fontFamily: "var(--font-sans)", fontWeight: 400,
          fontSize: "var(--text-heading-lg)", lineHeight: 1.1,
          letterSpacing: "var(--track-heading)", color: "var(--white)",
          marginTop: 16, marginBottom: 64, maxWidth: 500,
        }}>
          From idea to live site in minutes.
        </h2>
      </FadeIn>

      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {STEPS.map((step, i) => (
          <FadeIn key={step.num} delay={i * 0.1}>
            <div style={{
              display: "flex", alignItems: "flex-start", gap: 40,
              padding: "32px 0",
              borderBottom: i < STEPS.length - 1 ? "1px solid var(--rim)" : "none",
              borderTop: i === 0 ? "1px solid var(--rim)" : "none",
            }}>
              {/* Number */}
              <span style={{
                fontFamily: "var(--font-mono)", fontSize: "var(--text-body)",
                letterSpacing: "var(--track-mono)", color: "var(--accent)",
                minWidth: 32, flexShrink: 0, paddingTop: 3,
              }}>
                {step.num}
              </span>

              {/* Title */}
              <h3 style={{
                fontFamily: "var(--font-sans)", fontWeight: 400,
                fontSize: "var(--text-heading)", lineHeight: 1.2,
                letterSpacing: "-0.8px", color: "var(--white)",
                minWidth: 240, flex: "0 0 240px",
              }}>
                {step.title}
              </h3>

              {/* Desc */}
              <p style={{
                fontFamily: "var(--font-sans)", fontSize: "var(--text-body)",
                lineHeight: 1.65, color: "var(--ash)", maxWidth: 480,
              }}>
                {step.desc}
              </p>
            </div>
          </FadeIn>
        ))}
      </div>
    </div>
  </section>
);

/* ─────────────────────────────────────────────────────────────────────────────
   TESTIMONIALS
   ─────────────────────────────────────────────────────────────────────────── */
const TESTIMONIALS = [
  {
    quote: "Kodexa is the first builder where I never feel like I'm fighting the tool. It just gets out of the way.",
    name: "Priya Mehta",
    role: "Freelance Designer",
  },
  {
    quote: "We replaced an entire Figma-to-code workflow. Our dev time dropped by 60%.",
    name: "James Lin",
    role: "CTO @ Strata",
  },
  {
    quote: "The code export is actually usable. That alone made me switch from every other builder I tried.",
    name: "Sofia Andersen",
    role: "Full-stack Developer",
  },
  {
    quote: "The component library is vast and the animations are silky. Nothing else comes close.",
    name: "Arjun Verma",
    role: "Product Lead @ Lumio",
  },
];

const TestimonialsSection = () => (
  <section style={{ paddingTop: 96, paddingBottom: 96, background: "rgba(22,22,30,0.4)", borderTop: "1px solid var(--rim)", borderBottom: "1px solid var(--rim)" }}>
    <div className="section">
      <FadeIn><span className="eyebrow" style={{ marginBottom: 56, display: "block" }}>[ WHAT PEOPLE SAY ]</span></FadeIn>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 0 }}>
        {TESTIMONIALS.map((t, i) => (
          <FadeIn key={t.name} delay={i * 0.1}>
            <div style={{
              padding: "40px 32px",
              borderRight: i % 2 === 0 ? "1px solid var(--rim)" : "none",
              borderBottom: i < 2 ? "1px solid var(--rim)" : "none",
            }}>
              <p style={{
                fontFamily: "var(--font-sans)", fontSize: "var(--text-body-lg)",
                lineHeight: 1.55, letterSpacing: "-0.4px",
                color: "var(--white)", marginBottom: 28,
              }}>
                &ldquo;{t.quote}&rdquo;
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{
                  fontFamily: "var(--font-sans)", fontSize: "var(--text-body)",
                  color: "var(--white)", letterSpacing: "-0.3px",
                }}>
                  {t.name}
                </span>
                <span className="eyebrow">{t.role}</span>
              </div>
            </div>
          </FadeIn>
        ))}
      </div>
    </div>
  </section>
);

/* ─────────────────────────────────────────────────────────────────────────────
   PRICING — 3 tiers
   ─────────────────────────────────────────────────────────────────────────── */
const PLANS = [
  {
    name: "Hobby",
    price: "Free",
    sub: "forever",
    features: ["3 published sites", "Kodexa subdomain", "200 components", "Community support"],
    cta: "Get started",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$24",
    sub: "per month",
    features: ["Unlimited sites", "Custom domains", "CMS collections", "Priority support", "Code export"],
    cta: "Start Pro",
    highlight: true,
  },
  {
    name: "Team",
    price: "$79",
    sub: "per month",
    features: ["Everything in Pro", "5 seats included", "Team assets library", "Custom components", "SLA guarantee"],
    cta: "Talk to us",
    highlight: false,
  },
];

const PricingSection = () => (
  <section style={{ paddingTop: 96, paddingBottom: 96 }}>
    <div className="section">
      <FadeIn><span className="eyebrow">[ PRICING ]</span></FadeIn>
      <FadeIn delay={0.08}>
        <h2 style={{
          fontFamily: "var(--font-sans)", fontWeight: 400,
          fontSize: "var(--text-heading-lg)", lineHeight: 1.1,
          letterSpacing: "var(--track-heading)", color: "var(--white)",
          marginTop: 16, marginBottom: 64,
        }}>
          Simple, honest pricing.
        </h2>
      </FadeIn>

      <div className="grid-3" style={{ border: "1px solid var(--rim)" }}>
        {PLANS.map((plan, i) => (
          <FadeIn key={plan.name} delay={i * 0.1}>
            <div style={{
              padding: "40px 32px",
              borderRight: i < 2 ? "1px solid var(--rim)" : "none",
              background: plan.highlight ? "rgba(124,106,247,0.05)" : "transparent",
              display: "flex", flexDirection: "column", height: "100%",
              position: "relative",
            }}>
              {plan.highlight && (
                <span style={{
                  position: "absolute", top: -1, left: "50%", transform: "translateX(-50%)",
                  fontFamily: "var(--font-mono)", fontSize: "var(--text-badge)",
                  letterSpacing: "var(--track-mono)", color: "var(--accent-hi)",
                  background: "rgba(124,106,247,0.15)",
                  border: "1px solid rgba(124,106,247,0.3)", borderTop: "none",
                  padding: "4px 14px", borderRadius: "0 0 4px 4px",
                  textTransform: "uppercase",
                }}>
                  Most popular
                </span>
              )}

              {/* Plan name */}
              <span className="eyebrow" style={{ marginBottom: 24 }}>[ {plan.name} ]</span>

              {/* Price */}
              <div style={{ marginBottom: 32 }}>
                <span style={{
                  fontFamily: "var(--font-sans)", fontWeight: 400,
                  fontSize: 48, lineHeight: 1.0, letterSpacing: "-2px", color: "var(--white)",
                }}>
                  {plan.price}
                </span>
                <span style={{
                  fontFamily: "var(--font-mono)", fontSize: "var(--text-badge)",
                  color: "var(--ash)", marginLeft: 8, letterSpacing: "var(--track-mono)",
                }}>
                  / {plan.sub}
                </span>
              </div>

              {/* Features */}
              <ul style={{ listStyle: "none", marginBottom: 40, flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
                {plan.features.map(f => (
                  <li key={f} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M1 6l3.5 3.5L11 2" stroke="rgba(124,106,247,0.7)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span style={{ fontFamily: "var(--font-sans)", fontSize: "var(--text-body)", color: "var(--ash)" }}>
                      {f}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <a href="#" className={`pill-btn ${plan.highlight ? "accent" : "secondary"}`}
                style={{ justifyContent: "center", fontSize: 15 }}>
                {plan.cta} <Arrow size={10} />
              </a>
            </div>
          </FadeIn>
        ))}
      </div>
    </div>
  </section>
);

/* ─────────────────────────────────────────────────────────────────────────────
   CTA FOOTER BANNER
   ─────────────────────────────────────────────────────────────────────────── */
const CTABanner = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section style={{ paddingBottom: 0 }}>
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 40 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="section"
        style={{ textAlign: "center", paddingTop: 96, paddingBottom: 96 }}
      >
        <span className="eyebrow" style={{ marginBottom: 28, display: "block" }}>[ START TODAY ]</span>
        <h2 style={{
          fontFamily: "var(--font-sans)", fontWeight: 400,
          fontSize: "var(--text-display)", lineHeight: 1.0,
          letterSpacing: "var(--track-display)", color: "var(--white)",
          marginBottom: 24, maxWidth: 800, margin: "0 auto 24px",
        }}>
          Your next site starts here.
        </h2>
        <p style={{
          fontFamily: "var(--font-sans)", fontSize: "var(--text-body-lg)",
          color: "var(--ash)", letterSpacing: "-0.4px", lineHeight: 1.5,
          maxWidth: 440, margin: "0 auto 48px",
        }}>
          No credit card. No lock-in. Just a powerful canvas waiting for your ideas.
        </p>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <a href="#" className="pill-btn accent" style={{ fontSize: 16, padding: "12px 32px" }}>
            Start building — it&apos;s free <Arrow />
          </a>
          <a href="#" className="pill-btn secondary" style={{ fontSize: 16, padding: "12px 32px" }}>
            Book a demo
          </a>
        </div>
      </motion.div>
    </section>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   FOOTER
   ─────────────────────────────────────────────────────────────────────────── */
const FOOTER_COLS = [
  { head: "PRODUCT",  links: ["Features", "Templates", "Integrations", "Changelog", "Roadmap"] },
  { head: "RESOURCES", links: ["Documentation", "Blog", "Tutorials", "Community", "Status"] },
  { head: "COMPANY",  links: ["About", "Careers", "Press", "Partners", "Contact"] },
  { head: "LEGAL",    links: ["Privacy", "Terms", "Cookie policy", "Security"] },
];

const Footer = () => (
  <footer style={{
    position: "relative",
    borderTop: "1px solid var(--rim)",
    overflow: "hidden",
  }}>
    {/* Horizon glow */}
    <div style={{
      position: "absolute", bottom: 0, left: 0, right: 0, height: 320,
      background: TOKENS.horizonGrad, pointerEvents: "none",
    }}/>

    <div className="section" style={{ paddingTop: 80, paddingBottom: 64, position: "relative" }}>
      {/* Top row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 64, flexWrap: "wrap", gap: 40 }}>
        {/* Brand */}
        <div style={{ maxWidth: 280 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <KodexaMark />
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 14, letterSpacing: "0.06em", color: "var(--white)", textTransform: "uppercase" }}>
              Kodexa
            </span>
          </div>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: "var(--text-body)", color: "var(--ash)", lineHeight: 1.6 }}>
            The website builder for people who build things.
          </p>
        </div>

        {/* Link columns */}
        <div style={{ display: "flex", gap: 60, flexWrap: "wrap" }}>
          {FOOTER_COLS.map(col => (
            <div key={col.head}>
              <span style={{
                fontFamily: "var(--font-mono)", fontSize: "var(--text-badge)",
                letterSpacing: "var(--track-mono)", color: "var(--white)",
                display: "block", marginBottom: 20, textTransform: "uppercase",
              }}>
                {col.head}
              </span>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 12 }}>
                {col.links.map(l => (
                  <li key={l}>
                    <a href="#" style={{
                      fontFamily: "var(--font-sans)", fontSize: "var(--text-body)",
                      color: "var(--ash)", textDecoration: "none",
                      transition: "color 0.2s",
                    }}
                      onMouseEnter={e => e.currentTarget.style.color = "var(--white)"}
                      onMouseLeave={e => e.currentTarget.style.color = "var(--ash)"}
                    >
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        paddingTop: 24, borderTop: "1px solid var(--rim)", flexWrap: "wrap", gap: 12,
      }}>
        <span className="eyebrow">© {new Date().getFullYear()} Kodexa, Inc.</span>
        <span className="eyebrow">Made for builders everywhere</span>
      </div>
    </div>
  </footer>
);

/* ─────────────────────────────────────────────────────────────────────────────
   ROOT COMPONENT
   ─────────────────────────────────────────────────────────────────────────── */
export default function KodexaHome() {
  return (
    <>
      <GlobalStyles />
      <div className="kodexa-home">
        <Navbar />
        <Hero />
        <FeaturesSection />
        <StatsStrip />
        <ProcessSection />
        <TestimonialsSection />
        <PricingSection />
        <CTABanner />
        <Footer />
      </div>
    </>
  );
}

/*
 ══════════════════════════════════════════════════════════════════════
  USAGE INSTRUCTIONS
 ══════════════════════════════════════════════════════════════════════

 1. Install Framer Motion:
      npm install framer-motion

 2. Place this file at:
      /app/page.jsx   (Next.js App Router)
    OR
      /pages/index.jsx  (Next.js Pages Router)

 3. The "use client" directive at the top handles App Router.
    For Pages Router remove it.

 4. Fonts are loaded via Google Fonts in the GlobalStyles component.
    For production, use next/font instead:

      import { Inter, JetBrains_Mono } from 'next/font/google';
      const inter = Inter({ subsets: ['latin'], weight: ['400', '500'] });
      const jetbrains = JetBrains_Mono({ subsets: ['latin'], weight: ['400'] });

    Then pass the className to the body instead of the CSS import.

 5. Design Tokens Quick Reference:
      --void:     #0a0a0f   (canvas)
      --rim:      #1e1e2e   (borders)
      --smoke:    #3a3a52   (secondary borders)
      --ash:      #6e6e8a   (muted text)
      --accent:   #7c6af7   (Kodexa purple)
      --accent-hi:#a78bfa   (light purple)

 6. CSS Variables are injected via the GlobalStyles component.
    In production, move these to globals.css.

 ══════════════════════════════════════════════════════════════════════
*/