"use client"
import { useState } from "react"

const mockPositions = [
  { id: "1", symbol: "SNDK", strategy: "ORB", side: "LONG", status: "CLOSED", entryPrice: 48.20, exitPrice: 52.40, shares: 100, entryDate: "2026-03-06", exitPrice2: null, rMultiple: 2.1, netPnl: 266, broker: "Tradier", fees: 1.00, exitSignal: "HOD_STOP", contextNote: "" },
  { id: "2", symbol: "KLAC", strategy: "MA_BOUNCE", side: "LONG", status: "CLOSED", entryPrice: 182.10, exitPrice: 186.80, shares: 50, entryDate: "2026-03-04", rMultiple: 1.8, netPnl: 151, broker: "Tradier", fees: 1.00, exitSignal: "EOD_STOP", contextNote: "" },
  { id: "3", symbol: "HII", strategy: "SWING", side: "LONG", status: "CLOSED", entryPrice: 210.00, exitPrice: 213.10, shares: 30, entryDate: "2026-02-28", rMultiple: 1.2, netPnl: 62, broker: "Tradier", fees: 1.00, exitSignal: "VWAP_TP", contextNote: "" },
  { id: "4", symbol: "NVDA", strategy: "ORB", side: "SHORT", status: "OPEN", entryPrice: 875.00, exitPrice: null, shares: 20, entryDate: "2026-03-19", rMultiple: null, netPnl: null, broker: "Tradier", fees: 1.00, exitSignal: null, contextNote: "Watching VWAP" },
  { id: "5", symbol: "AMD", strategy: "ORB", side: "LONG", status: "OPEN", entryPrice: 162.40, exitPrice: null, shares: 60, entryDate: "2026-03-19", rMultiple: null, netPnl: null, broker: "Tradier", fees: 1.00, exitSignal: null, contextNote: "" },
]

const fmt = (n: number) => n >= 0
  ? `+$${n.toFixed(2)}`
  : `-$${Math.abs(n).toFixed(2)}`

export default function Dashboard() {
  const [filter, setFilter] = useState<"OPEN" | "CLOSED" | "ALL">("OPEN")
  const [showForm, setShowForm] = useState(false)

  const closed = mockPositions.filter(p => p.status === "CLOSED")
  const open = mockPositions.filter(p => p.status === "OPEN")
  const wins = closed.filter(p => (p.netPnl ?? 0) > 0)
  const winRate = closed.length ? ((wins.length / closed.length) * 100).toFixed(1) : "0.0"
  const avgR = closed.length ? (closed.reduce((a, p) => a + (p.rMultiple ?? 0), 0) / closed.length).toFixed(2) : "0.00"
  const netPnl = closed.reduce((a, p) => a + (p.netPnl ?? 0), 0)

  const visible = filter === "ALL" ? mockPositions : mockPositions.filter(p => p.status === filter)

  const kpis = [
    { label: "Total Positions", value: mockPositions.length },
    { label: "Open", value: open.length },
    { label: "Win Rate", value: `${winRate}%` },
    { label: "Avg R-Multiple", value: `${avgR}R` },
    { label: "Net PnL", value: fmt(netPnl), color: netPnl >= 0 ? "#86EFAC" : "#f87171" },
  ]

  const s = {
    page: { minHeight: "100vh", backgroundColor: "#060e14", padding: "32px 24px", fontFamily: "var(--font-display, 'Space Grotesk'), sans-serif" },
    header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" },
    title: { fontSize: "22px", fontWeight: 700, color: "#e8f0f7", letterSpacing: "-0.5px" },
    kpiRow: { display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "12px", marginBottom: "28px" },
    kpiCard: { backgroundColor: "#0d1c2a", borderRadius: "10px", padding: "18px 20px", border: "1px solid #1a3044" },
    kpiLabel: { fontSize: "11px", color: "#3d6480", textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: "8px" },
    kpiValue: { fontSize: "24px", fontWeight: 700, fontFamily: "var(--font-mono, 'JetBrains Mono'), monospace" },
    toggleRow: { display: "flex", gap: "8px", marginBottom: "16px" },
    toggleBtn: (active: boolean) => ({
      padding: "6px 16px", borderRadius: "6px", border: "1px solid #1a3044",
      backgroundColor: active ? "#22C55E" : "#0d1c2a",
      color: active ? "#060e14" : "#3d6480",
      cursor: "pointer", fontSize: "12px", fontWeight: 600,
    }),
    table: { width: "100%", borderCollapse: "collapse" as const, fontSize: "13px" },
    th: { textAlign: "left" as const, padding: "10px 12px", color: "#3d6480", fontSize: "11px", textTransform: "uppercase" as const, letterSpacing: "0.08em", borderBottom: "1px solid #1a3044" },
    td: { padding: "12px", borderBottom: "1px solid #0d1c2a", color: "#e8f0f7", fontFamily: "var(--font-mono, 'JetBrains Mono'), monospace", fontSize: "13px" },
    badge: (side: string) => ({
      padding: "2px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: 700,
      backgroundColor: side === "LONG" ? "rgba(134,239,172,0.1)" : "rgba(248,113,113,0.1)",
      color: side === "LONG" ? "#86EFAC" : "#f87171",
    }),
    addBtn: { padding: "8px 18px", borderRadius: "7px", backgroundColor: "#22C55E", color: "#060e14", border: "none", fontWeight: 700, fontSize: "13px", cursor: "pointer" },
  }

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div style={s.title}>PositionBook</div>
        <button style={s.addBtn} onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "+ Log Position"}
        </button>
      </div>

      <div style={s.kpiRow}>
        {kpis.map(k => (
          <div key={k.label} style={s.kpiCard}>
            <div style={s.kpiLabel}>{k.label}</div>
            <div style={{ ...s.kpiValue, color: (k as any).color ?? "#e8f0f7" }}>{k.value}</div>
          </div>
        ))}
      </div>

      {showForm && (
        <div style={{ backgroundColor: "#0d1c2a", border: "1px solid #1a3044", borderRadius: "10px", padding: "24px", marginBottom: "24px" }}>
          <div style={{ color: "#3d6480", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.08em" }}>Log Position — coming next session</div>
        </div>
      )}

      <div style={s.toggleRow}>
        {(["OPEN", "CLOSED", "ALL"] as const).map(f => (
          <button key={f} style={s.toggleBtn(filter === f)} onClick={() => setFilter(f)}>{f}</button>
        ))}
      </div>

      <table style={s.table}>
        <thead>
          <tr>
            {["Symbol","Side","Strategy","Entry","Exit","Shares","R","PnL","Date","Status"].map(h => (
              <th key={h} style={s.th}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {visible.map(p => (
            <tr key={p.id}>
              <td style={{ ...s.td, color: "#86EFAC", fontWeight: 700 }}>{p.symbol}</td>
              <td style={s.td}><span style={s.badge(p.side)}>{p.side}</span></td>
              <td style={{ ...s.td, color: "#3d6480" }}>{p.strategy}</td>
              <td style={s.td}>${p.entryPrice.toFixed(2)}</td>
              <td style={s.td}>{p.exitPrice ? `$${p.exitPrice.toFixed(2)}` : "—"}</td>
              <td style={s.td}>{p.shares}</td>
              <td style={s.td}>{p.rMultiple ? `${p.rMultiple}R` : "—"}</td>
              <td style={{ ...s.td, color: p.netPnl ? (p.netPnl >= 0 ? "#86EFAC" : "#f87171") : "#3d6480" }}>
                {p.netPnl ? fmt(p.netPnl) : "—"}
              </td>
              <td style={s.td}>{p.entryDate}</td>
              <td style={{ ...s.td, color: p.status === "OPEN" ? "#C49A3C" : "#3d6480" }}>{p.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
