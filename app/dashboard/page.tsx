"use client"
import { useState, useEffect } from "react"

type Position = {
  id: string
  symbol: string
  strategy: string
  side: string
  status: string
  entryPrice: number
  exitPrice: number | null
  shares: number
  entryDate: string
  rMultiple: number | null
  netPnl: number | null
  broker: string | null
  fees: number | null
  exitSignal: string | null
  contextNote: string | null
}

const fmt = (n: number) => n >= 0 ? "+$" + n.toFixed(2) : "-$" + Math.abs(n).toFixed(2)

const formLabelStyle = { fontSize: "10px", color: "#3d6480", textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: "4px" }
const inputStyle = { width: "100%", backgroundColor: "#0a1520", border: "1px solid #1a3044", borderRadius: "6px", padding: "8px 12px", color: "#e8f0f7", fontFamily: "var(--font-mono, JetBrains Mono), monospace", fontSize: "12px", outline: "none" }
const selectStyle = { width: "100%", backgroundColor: "#0a1520", border: "1px solid #1a3044", borderRadius: "6px", padding: "8px 12px", color: "#e8f0f7", fontFamily: "var(--font-mono, JetBrains Mono), monospace", fontSize: "12px", outline: "none" }

function F({ label, value, onChange, type = "text", placeholder = "" }: {
  label: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  type?: string
  placeholder?: string
}) {
  return (
    <div>
      <div style={formLabelStyle}>{label}</div>
      <input style={inputStyle} type={type} placeholder={placeholder} value={value} onChange={onChange} />
    </div>
  )
}

function Sel({ label, value, onChange, options }: {
  label: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  options: string[]
}) {
  return (
    <div>
      <div style={formLabelStyle}>{label}</div>
      <select style={selectStyle} value={value} onChange={onChange}>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )
}

export default function Dashboard() {
  const [positions, setPositions] = useState<Position[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"OPEN" | "CLOSED" | "ALL">("OPEN")
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    symbol: "", strategy: "", side: "LONG", status: "OPEN",
    entryPrice: "", entryDate: "", shares: "",
    exitPrice: "", exitDate: "", exitSignal: "",
    rMultiple: "", netPnl: "", broker: "", fees: "", contextNote: ""
  })
  const [submitting, setSubmitting] = useState(false)

  const set = (field: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm(f => ({ ...f, [field]: e.target.value }))

  const load = async () => {
    setLoading(true)
    const res = await fetch("/api/positions")
    const data = await res.json()
    setPositions(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const submit = async () => {
    if (!form.symbol || !form.entryPrice || !form.entryDate || !form.shares) return
    setSubmitting(true)
    await fetch("/api/positions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    setForm({ symbol: "", strategy: "", side: "LONG", status: "OPEN", entryPrice: "", entryDate: "", shares: "", exitPrice: "", exitDate: "", exitSignal: "", rMultiple: "", netPnl: "", broker: "", fees: "", contextNote: "" })
    setShowForm(false)
    setSubmitting(false)
    load()
  }

  const closed = positions.filter(p => p.status === "CLOSED")
  const open = positions.filter(p => p.status === "OPEN")
  const wins = closed.filter(p => (p.netPnl ?? 0) > 0)
  const winRate = closed.length ? ((wins.length / closed.length) * 100).toFixed(1) : "0.0"
  const avgR = closed.length ? (closed.reduce((a, p) => a + (p.rMultiple ?? 0), 0) / closed.length).toFixed(2) : "0.00"
  const netPnl = closed.reduce((a, p) => a + (p.netPnl ?? 0), 0)
  const visible = filter === "ALL" ? positions : positions.filter(p => p.status === filter)

  const kpis = [
    { label: "Total Positions", value: String(positions.length), color: "#e8f0f7" },
    { label: "Open", value: String(open.length), color: "#C49A3C" },
    { label: "Win Rate", value: winRate + "%", color: "#e8f0f7" },
    { label: "Avg R-Multiple", value: avgR + "R", color: "#86EFAC" },
    { label: "Net PnL", value: closed.length ? fmt(netPnl) : "-", color: netPnl >= 0 ? "#86EFAC" : "#f87171" },
  ]

  const s = {
    page: { minHeight: "100vh", backgroundColor: "#060e14", padding: "32px 24px", fontFamily: "var(--font-display, Space Grotesk), sans-serif" },
    header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" },
    title: { fontSize: "22px", fontWeight: 700, color: "#e8f0f7", letterSpacing: "-0.5px" },
    titleAccent: { color: "#86EFAC" },
    kpiRow: { display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "12px", marginBottom: "28px" },
    kpiCard: { backgroundColor: "#0d1c2a", borderRadius: "10px", padding: "18px 20px", border: "1px solid #1a3044" },
    kpiLabel: { fontSize: "11px", color: "#3d6480", textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: "8px" },
    kpiValue: { fontSize: "24px", fontWeight: 700, fontFamily: "var(--font-mono, JetBrains Mono), monospace" },
    toggleRow: { display: "flex", gap: "8px", marginBottom: "16px" },
    table: { width: "100%", borderCollapse: "collapse" as const, fontSize: "13px" },
    th: { textAlign: "left" as const, padding: "10px 12px", color: "#3d6480", fontSize: "11px", textTransform: "uppercase" as const, letterSpacing: "0.08em", borderBottom: "1px solid #1a3044" },
    td: { padding: "12px", borderBottom: "1px solid #0d1c2a", color: "#e8f0f7", fontFamily: "var(--font-mono, JetBrains Mono), monospace", fontSize: "13px" },
    addBtn: { padding: "8px 18px", borderRadius: "7px", backgroundColor: "#22C55E", color: "#060e14", border: "none", fontWeight: 700, fontSize: "13px", cursor: "pointer" },
    formGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "16px" },
  }

  const toggleBtn = (active: boolean) => ({
    padding: "6px 16px", borderRadius: "6px", border: "1px solid #1a3044",
    backgroundColor: active ? "#22C55E" : "#0d1c2a",
    color: active ? "#060e14" : "#3d6480",
    cursor: "pointer" as const, fontSize: "12px", fontWeight: 600,
  })

  const badge = (side: string) => ({
    padding: "2px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: 700,
    backgroundColor: side === "LONG" ? "rgba(134,239,172,0.1)" : "rgba(248,113,113,0.1)",
    color: side === "LONG" ? "#86EFAC" : "#f87171",
  })

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div style={s.title}>Position<span style={s.titleAccent}>Book</span></div>
        <button style={s.addBtn} onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "+ Log Position"}
        </button>
      </div>

      <div style={s.kpiRow}>
        {kpis.map(k => (
          <div key={k.label} style={s.kpiCard}>
            <div style={s.kpiLabel}>{k.label}</div>
            <div style={{ ...s.kpiValue, color: k.color }}>{loading ? "..." : k.value}</div>
          </div>
        ))}
      </div>

      {showForm && (
        <div style={{ backgroundColor: "#0d1c2a", border: "1px solid #1a3044", borderRadius: "10px", padding: "24px", marginBottom: "24px" }}>
          <div style={{ fontSize: "12px", color: "#3d6480", textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: "16px" }}>Log Position</div>
          <div style={s.formGrid}>
            <F label="Symbol" value={form.symbol} onChange={set("symbol")} placeholder="NVDA" />
            <F label="Strategy" value={form.strategy} onChange={set("strategy")} placeholder="ORB" />
            <Sel label="Side" value={form.side} onChange={set("side")} options={["LONG", "SHORT"]} />
            <Sel label="Status" value={form.status} onChange={set("status")} options={["OPEN", "CLOSED"]} />
            <F label="Entry Price" value={form.entryPrice} onChange={set("entryPrice")} type="number" placeholder="0.00" />
            <F label="Entry Date" value={form.entryDate} onChange={set("entryDate")} type="date" />
            <F label="Shares" value={form.shares} onChange={set("shares")} type="number" placeholder="100" />
            <F label="Broker" value={form.broker} onChange={set("broker")} placeholder="Tradier" />
            <F label="Exit Price" value={form.exitPrice} onChange={set("exitPrice")} type="number" placeholder="0.00" />
            <F label="Exit Date" value={form.exitDate} onChange={set("exitDate")} type="date" />
            <F label="Exit Signal" value={form.exitSignal} onChange={set("exitSignal")} placeholder="EOD_STOP" />
            <F label="R-Multiple" value={form.rMultiple} onChange={set("rMultiple")} type="number" placeholder="2.1" />
            <F label="Net PnL" value={form.netPnl} onChange={set("netPnl")} type="number" placeholder="266.00" />
            <F label="Fees" value={form.fees} onChange={set("fees")} type="number" placeholder="1.00" />
            <F label="Notes" value={form.contextNote} onChange={set("contextNote")} placeholder="optional" />
          </div>
          <button style={{ ...s.addBtn, opacity: submitting ? 0.6 : 1 }} onClick={submit} disabled={submitting}>
            {submitting ? "Saving..." : "Save Position"}
          </button>
        </div>
      )}

      <div style={s.toggleRow}>
        {(["OPEN", "CLOSED", "ALL"] as const).map(f => (
          <button key={f} style={toggleBtn(filter === f)} onClick={() => setFilter(f)}>{f}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ color: "#3d6480", fontFamily: "var(--font-mono)", fontSize: "13px", padding: "40px 0" }}>Loading...</div>
      ) : visible.length === 0 ? (
        <div style={{ color: "#3d6480", fontFamily: "var(--font-mono)", fontSize: "13px", padding: "40px 0" }}>No positions. Log your first one.</div>
      ) : (
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
                <td style={s.td}><span style={badge(p.side)}>{p.side}</span></td>
                <td style={{ ...s.td, color: "#3d6480" }}>{p.strategy}</td>
                <td style={s.td}>${p.entryPrice.toFixed(2)}</td>
                <td style={s.td}>{p.exitPrice ? "$" + Number(p.exitPrice).toFixed(2) : "-"}</td>
                <td style={s.td}>{p.shares}</td>
                <td style={s.td}>{p.rMultiple ? p.rMultiple + "R" : "-"}</td>
                <td style={{ ...s.td, color: p.netPnl ? (p.netPnl >= 0 ? "#86EFAC" : "#f87171") : "#3d6480" }}>
                  {p.netPnl ? fmt(p.netPnl) : "-"}
                </td>
                <td style={s.td}>{new Date(p.entryDate).toLocaleDateString()}</td>
                <td style={{ ...s.td, color: p.status === "OPEN" ? "#C49A3C" : "#3d6480" }}>{p.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
