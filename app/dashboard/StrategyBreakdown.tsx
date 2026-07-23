"use client"
import type { Position } from "./types"

// Per-strategy performance. Derived from the positions already loaded by the
// dashboard — no second fetch. If the book grows past a few thousand rows this
// should move to a server-side groupBy.

type Row = {
  strategy: string
  open: number
  closed: number
  scored: number
  wins: number
  pctRows: number
  pctSum: number
  best: number | null
  worst: number | null
  pnlRows: number
  pnlSum: number
}

const MIN_SAMPLE = 10

function build(positions: Position[]): Row[] {
  // SEED rows carry fabricated prices and dates — excluded here exactly as
  // they are from the KPI row.
  const real = positions.filter(p => p.dataQuality !== "SEED")
  const map = new Map<string, Row>()

  for (const p of real) {
    const r = map.get(p.strategy) ?? {
      strategy: p.strategy, open: 0, closed: 0, scored: 0, wins: 0,
      pctRows: 0, pctSum: 0, best: null, worst: null, pnlRows: 0, pnlSum: 0,
    }

    if (p.status === "OPEN") {
      r.open++
    } else {
      r.closed++
      // A trade counts as scored if it has either result type.
      const hasPct = p.pctReturn !== null
      const hasPnl = p.netPnl !== null
      if (hasPct || hasPnl) {
        r.scored++
        if (hasPct ? (p.pctReturn as number) > 0 : (p.netPnl as number) > 0) r.wins++
      }
      // Average/best/worst come only from rows carrying a percent. Mixing in
      // dollar-only rows as zeroes would understate the average.
      if (hasPct) {
        const v = p.pctReturn as number
        r.pctRows++
        r.pctSum += v
        r.best = r.best === null ? v : Math.max(r.best, v)
        r.worst = r.worst === null ? v : Math.min(r.worst, v)
      }
      if (hasPnl) {
        r.pnlRows++
        r.pnlSum += p.netPnl as number
      }
    }
    map.set(p.strategy, r)
  }

  return [...map.values()].sort((a, b) => (b.open + b.closed) - (a.open + a.closed))
}

const pct = (n: number) => (n >= 0 ? "+" : "") + n.toFixed(2) + "%"
const tone = (n: number) => (n >= 0 ? "#86EFAC" : "#f87171")

export default function StrategyBreakdown({ positions }: { positions: Position[] }) {
  const rows = build(positions)
  if (!rows.length) return null

  const thin = rows.some(r => r.scored > 0 && r.scored < MIN_SAMPLE)

  const s = {
    card: { backgroundColor: "#0d1c2a", border: "1px solid #1a3044", borderRadius: "10px", padding: "20px 22px", marginBottom: "28px" },
    head: { fontSize: "12px", color: "#3d6480", textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: "16px" },
    table: { width: "100%", borderCollapse: "collapse" as const, fontSize: "13px" },
    th: { textAlign: "right" as const, padding: "8px 10px", color: "#3d6480", fontSize: "10px", textTransform: "uppercase" as const, letterSpacing: "0.08em", borderBottom: "1px solid #1a3044" },
    thL: { textAlign: "left" as const, padding: "8px 10px", color: "#3d6480", fontSize: "10px", textTransform: "uppercase" as const, letterSpacing: "0.08em", borderBottom: "1px solid #1a3044" },
    td: { textAlign: "right" as const, padding: "10px", borderBottom: "1px solid #0a1520", color: "#e8f0f7", fontFamily: "var(--font-mono, JetBrains Mono), monospace", fontSize: "13px" },
    tdL: { textAlign: "left" as const, padding: "10px", borderBottom: "1px solid #0a1520", color: "#86EFAC", fontWeight: 700, fontFamily: "var(--font-mono, JetBrains Mono), monospace", fontSize: "13px" },
    muted: { color: "#3d6480" },
    note: { fontSize: "11px", color: "#C49A3C", marginTop: "12px", fontFamily: "var(--font-mono, JetBrains Mono), monospace" },
  }

  return (
    <div style={s.card}>
      <div style={s.head}>Strategy Breakdown</div>
      <table style={s.table}>
        <thead>
          <tr>
            <th style={s.thL}>Strategy</th>
            <th style={s.th}>Open</th>
            <th style={s.th}>Closed</th>
            <th style={s.th}>Scored</th>
            <th style={s.th}>Win Rate</th>
            <th style={s.th}>Avg Return</th>
            <th style={s.th}>Best</th>
            <th style={s.th}>Worst</th>
            <th style={s.th}>Net PnL</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => {
            const wr = r.scored ? (r.wins / r.scored) * 100 : null
            const avg = r.pctRows ? r.pctSum / r.pctRows : null
            return (
              <tr key={r.strategy}>
                <td style={s.tdL}>{r.strategy}</td>
                <td style={{ ...s.td, color: r.open ? "#C49A3C" : "#3d6480" }}>{r.open || "-"}</td>
                <td style={s.td}>{r.closed || <span style={s.muted}>-</span>}</td>
                <td style={s.td}>
                  {r.scored || <span style={s.muted}>-</span>}
                  {r.scored > 0 && r.scored < MIN_SAMPLE && <span style={{ color: "#C49A3C" }}> *</span>}
                </td>
                <td style={s.td}>{wr !== null ? wr.toFixed(1) + "%" : <span style={s.muted}>-</span>}</td>
                <td style={{ ...s.td, color: avg !== null ? tone(avg) : "#3d6480" }}>
                  {avg !== null ? pct(avg) : "-"}
                </td>
                <td style={{ ...s.td, color: r.best !== null ? tone(r.best) : "#3d6480" }}>
                  {r.best !== null ? pct(r.best) : "-"}
                </td>
                <td style={{ ...s.td, color: r.worst !== null ? tone(r.worst) : "#3d6480" }}>
                  {r.worst !== null ? pct(r.worst) : "-"}
                </td>
                <td style={{ ...s.td, color: r.pnlRows ? tone(r.pnlSum) : "#3d6480" }}>
                  {r.pnlRows ? (r.pnlSum >= 0 ? "+$" : "-$") + Math.abs(r.pnlSum).toFixed(2) : "-"}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      {thin && (
        <div style={s.note}>
          * Fewer than {MIN_SAMPLE} scored trades — not enough to read as edge.
        </div>
      )}
    </div>
  )
}
