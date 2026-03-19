import Link from "next/link"

export default function Home() {
  const s = {
    page: { minHeight: "100vh", backgroundColor: "#060e14", fontFamily: "var(--font-display, Space Grotesk), sans-serif", color: "#e8f0f7", overflowX: "hidden" as const },
    nav: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 40px", borderBottom: "1px solid #0d1c2a" },
    logo: { fontSize: "18px", fontWeight: 700, color: "#e8f0f7", letterSpacing: "-0.5px" },
    logoAccent: { color: "#86EFAC" },
    signInBtn: { padding: "8px 18px", borderRadius: "7px", backgroundColor: "transparent", border: "1px solid #1a3044", color: "#e8f0f7", fontSize: "13px", fontWeight: 600, textDecoration: "none" },
    ticker: { backgroundColor: "#0a1a26", borderBottom: "1px solid #0d1c2a", borderTop: "1px solid #0d1c2a", padding: "10px 0", overflow: "hidden" as const, whiteSpace: "nowrap" as const },
    tickerInner: { display: "inline-block", animation: "ticker 30s linear infinite" },
    tickerItem: { display: "inline-block", marginRight: "48px", fontSize: "11px", fontFamily: "var(--font-mono, JetBrains Mono), monospace", color: "#3d6480", letterSpacing: "0.08em" },
    tickerAccent: { color: "#86EFAC", marginRight: "6px" },
    hero: { display: "grid", gridTemplateColumns: "1fr 1fr", alignItems: "center", padding: "80px 40px 60px", maxWidth: "1100px", margin: "0 auto", gap: "40px" },
    heroLeft: {},
    eyebrow: { fontSize: "11px", color: "#3d6480", textTransform: "uppercase" as const, letterSpacing: "0.15em", marginBottom: "24px" },
    h1: { fontSize: "52px", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-1.5px", marginBottom: "24px" },
    h1Accent: { color: "#86EFAC" },
    sub: { fontSize: "16px", color: "#3d6480", marginBottom: "36px", lineHeight: 1.7, maxWidth: "440px" },
    ctaRow: { display: "flex", gap: "12px" },
    ctaPrimary: { padding: "12px 28px", borderRadius: "8px", backgroundColor: "#22C55E", color: "#060e14", fontWeight: 700, fontSize: "14px", textDecoration: "none" },
    ctaSecondary: { padding: "12px 28px", borderRadius: "8px", border: "1px solid #1a3044", color: "#e8f0f7", fontWeight: 600, fontSize: "14px", textDecoration: "none" },
    statStrip: { display: "flex", justifyContent: "center", gap: "60px", padding: "40px", borderTop: "1px solid #0d1c2a", borderBottom: "1px solid #0d1c2a", marginBottom: "80px" },
    statVal: { fontSize: "32px", fontWeight: 800, color: "#86EFAC", fontFamily: "var(--font-mono, JetBrains Mono), monospace" },
    statLabel: { fontSize: "12px", color: "#3d6480", marginTop: "4px" },
    features: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", maxWidth: "960px", margin: "0 auto 100px", padding: "0 40px" },
    featureCard: { backgroundColor: "#0d1c2a", border: "1px solid #1a3044", borderRadius: "12px", padding: "28px" },
    featureIcon: { fontSize: "20px", marginBottom: "12px" },
    featureTitle: { fontSize: "15px", fontWeight: 700, marginBottom: "8px", color: "#e8f0f7" },
    featureDesc: { fontSize: "13px", color: "#3d6480", lineHeight: 1.6 },
    footer: { textAlign: "center" as const, padding: "40px", borderTop: "1px solid #0d1c2a", fontSize: "12px", color: "#3d6480" },
  }

  const tickerItems = [
    { label: "WIN RATE", val: "30.5%" },
    { label: "AVG R-MULTIPLE", val: "2.31R" },
    { label: "TRADES TRACKED", val: "241" },
    { label: "TOP TICKER", val: "SNDK +$266" },
    { label: "STRATEGIES", val: "ORB - MA BOUNCE - SWING" },
    { label: "OPEN POSITIONS", val: "LIVE" },
    { label: "SIGNAL", val: "STRUCTURE" },
    { label: "STRUCTURE", val: "EDGE" },
    { label: "NET PnL", val: "TRACKED" },
    { label: "DATA", val: "YOURS" },
  ]

  const stats = [
    { val: "241", label: "Trades analyzed at launch" },
    { val: "2.31R", label: "Avg R-multiple tracked" },
    { val: "100%", label: "Evidence-based" },
  ]

  const features = [
    { icon: "📋", title: "Position Log", desc: "Every trade. Symbol, strategy, entry, exit, R-multiple. Logged in seconds. Reviewed in patterns." },
    { icon: "📊", title: "KPI Dashboard", desc: "Win rate, avg R, net PnL, open exposure. The numbers that actually tell you if you have edge." },
    { icon: "🎯", title: "Strategy Breakdown", desc: "ORB vs MA Bounce vs Swing. See which setups pay and which ones you need to stop taking." },
    { icon: "📈", title: "Equity Curve", desc: "Watch your account grow or see exactly when it started breaking down. Timestamp your edge." },
    { icon: "🪪", title: "Trade Card", desc: "Your verified performance profile. Shareable. Public R-multiple and win rate. Private PnL." },
    { icon: "🔒", title: "Invite Only", desc: "No noise. No public signups. PositionBook is built for traders who are serious about their data." },
  ]

  const doubled = [...tickerItems, ...tickerItems]

  return (
    <div style={s.page}>
      <style>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes orbitSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes nodeCounter {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
      `}</style>

      <nav style={s.nav}>
        <div style={s.logo}>Position<span style={s.logoAccent}>Book</span></div>
        <Link href="/sign-in" style={s.signInBtn}>Sign In</Link>
      </nav>

      <div style={s.ticker}>
        <div style={s.tickerInner}>
          {doubled.map((item, i) => (
            <span key={i} style={s.tickerItem}>
              <span style={s.tickerAccent}>{item.label}</span>{item.val}
            </span>
          ))}
        </div>
      </div>

      <div style={s.hero}>
        <div style={s.heroLeft}>
          <div style={s.eyebrow}>signal - structure - edge</div>
          <h1 style={s.h1}>
            You are not losing.<br />You are <span style={s.h1Accent}>not tracking.</span>
          </h1>
          <p style={s.sub}>
            PositionBook logs every trade, surfaces every pattern, and shows you exactly where your edge is and where it is not.
          </p>
          <div style={s.ctaRow}>
            <Link href="/sign-in" style={s.ctaPrimary}>Request Access</Link>
            <Link href="#features" style={s.ctaSecondary}>See How It Works</Link>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "360px" }}>
          <svg width="340" height="340" viewBox="0 0 340 340" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="170" cy="170" r="120" stroke="#1a3044" strokeWidth="1" strokeDasharray="4 6" />
            <circle cx="170" cy="170" r="80" stroke="#0d2235" strokeWidth="1" />
            <circle cx="170" cy="170" r="36" fill="#0d1c2a" stroke="#22C55E" strokeWidth="1.5" />
            <text x="170" y="165" textAnchor="middle" fill="#86EFAC" fontSize="11" fontWeight="700" fontFamily="Space Grotesk, sans-serif">PB</text>
            <text x="170" y="180" textAnchor="middle" fill="#3d6480" fontSize="7" fontFamily="JetBrains Mono, monospace">POSITIONBOOK</text>

            <g style={{ transformOrigin: "170px 170px", animation: "orbitSpin 18s linear infinite" }}>
              <g transform="translate(170, 50)">
                <g style={{ transformOrigin: "0px 0px", animation: "nodeCounter 18s linear infinite" }}>
                  <circle r="28" fill="#0a1a26" stroke="#1a3044" strokeWidth="1" />
                  <text textAnchor="middle" y="-5" fill="#86EFAC" fontSize="8" fontWeight="700" fontFamily="Space Grotesk, sans-serif">POSITION</text>
                  <text textAnchor="middle" y="7" fill="#3d6480" fontSize="7" fontFamily="JetBrains Mono, monospace">LOG</text>
                </g>
              </g>

              <g transform="translate(290, 170)">
                <g style={{ transformOrigin: "0px 0px", animation: "nodeCounter 18s linear infinite" }}>
                  <circle r="28" fill="#0a1a26" stroke="#1a3044" strokeWidth="1" />
                  <text textAnchor="middle" y="-5" fill="#86EFAC" fontSize="8" fontWeight="700" fontFamily="Space Grotesk, sans-serif">EQUITY</text>
                  <text textAnchor="middle" y="7" fill="#3d6480" fontSize="7" fontFamily="JetBrains Mono, monospace">CURVE</text>
                </g>
              </g>

              <g transform="translate(230, 274)">
                <g style={{ transformOrigin: "0px 0px", animation: "nodeCounter 18s linear infinite" }}>
                  <circle r="28" fill="#0a1a26" stroke="#1a3044" strokeWidth="1" />
                  <text textAnchor="middle" y="-5" fill="#86EFAC" fontSize="8" fontWeight="700" fontFamily="Space Grotesk, sans-serif">TRADE</text>
                  <text textAnchor="middle" y="7" fill="#3d6480" fontSize="7" fontFamily="JetBrains Mono, monospace">CARD</text>
                </g>
              </g>

              <g transform="translate(110, 274)">
                <g style={{ transformOrigin: "0px 0px", animation: "nodeCounter 18s linear infinite" }}>
                  <circle r="28" fill="#0a1a26" stroke="#1a3044" strokeWidth="1" />
                  <text textAnchor="middle" y="-5" fill="#86EFAC" fontSize="8" fontWeight="700" fontFamily="Space Grotesk, sans-serif">KPI</text>
                  <text textAnchor="middle" y="7" fill="#3d6480" fontSize="7" fontFamily="JetBrains Mono, monospace">DASH</text>
                </g>
              </g>

              <g transform="translate(50, 170)">
                <g style={{ transformOrigin: "0px 0px", animation: "nodeCounter 18s linear infinite" }}>
                  <circle r="28" fill="#0a1a26" stroke="#1a3044" strokeWidth="1" />
                  <text textAnchor="middle" y="-5" fill="#86EFAC" fontSize="8" fontWeight="700" fontFamily="Space Grotesk, sans-serif">STRATEGY</text>
                  <text textAnchor="middle" y="7" fill="#3d6480" fontSize="7" fontFamily="JetBrains Mono, monospace">SPLITS</text>
                </g>
              </g>
            </g>

            <circle cx="170" cy="170" r="4" fill="#22C55E" style={{ animation: "pulse 2s ease-in-out infinite" }} />
          </svg>
        </div>
      </div>

      <div style={s.statStrip}>
        {stats.map(s2 => (
          <div key={s2.label} style={{ textAlign: "center" }}>
            <div style={s.statVal}>{s2.val}</div>
            <div style={s.statLabel}>{s2.label}</div>
          </div>
        ))}
      </div>

      <div id="features" style={s.features}>
        {features.map(f => (
          <div key={f.title} style={s.featureCard}>
            <div style={s.featureIcon}>{f.icon}</div>
            <div style={s.featureTitle}>{f.title}</div>
            <div style={s.featureDesc}>{f.desc}</div>
          </div>
        ))}
      </div>

      <div style={s.footer}>
        PositionBook - A Dropdown Logistics product - D&amp;A Analytics
      </div>
    </div>
  )
}