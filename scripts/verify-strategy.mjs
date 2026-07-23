// Mirrors build() in app/dashboard/StrategyBreakdown.tsx against live data.
import { PrismaClient } from "@prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL }) })
const real = (await prisma.position.findMany()).filter(p => p.dataQuality !== "SEED")
const map = new Map()
for (const p of real) {
  const r = map.get(p.strategy) ?? { strategy: p.strategy, open: 0, closed: 0, scored: 0, wins: 0, pctRows: 0, pctSum: 0, best: null, worst: null, pnlRows: 0, pnlSum: 0 }
  if (p.status === "OPEN") r.open++
  else {
    r.closed++
    const hasPct = p.pctReturn !== null, hasPnl = p.netPnl !== null
    if (hasPct || hasPnl) { r.scored++; if (hasPct ? p.pctReturn > 0 : p.netPnl > 0) r.wins++ }
    if (hasPct) { const v = p.pctReturn; r.pctRows++; r.pctSum += v; r.best = r.best === null ? v : Math.max(r.best, v); r.worst = r.worst === null ? v : Math.min(r.worst, v) }
    if (hasPnl) { r.pnlRows++; r.pnlSum += p.netPnl }
  }
  map.set(p.strategy, r)
}
const pct = n => (n >= 0 ? "+" : "") + n.toFixed(2) + "%"
console.log("strategy    open closed scored  winRate   avgRet     best    worst     netPnl")
for (const r of [...map.values()].sort((a,b)=>(b.open+b.closed)-(a.open+a.closed))) {
  const wr = r.scored ? ((r.wins/r.scored)*100).toFixed(1)+"%" : "-"
  const avg = r.pctRows ? pct(r.pctSum/r.pctRows) : "-"
  console.log(`${r.strategy.padEnd(11)} ${String(r.open).padStart(4)} ${String(r.closed).padStart(6)} ${String(r.scored).padStart(6)}${r.scored>0&&r.scored<10?" *":"  "} ${wr.padStart(7)} ${avg.padStart(8)} ${(r.best!==null?pct(r.best):"-").padStart(8)} ${(r.worst!==null?pct(r.worst):"-").padStart(8)} ${(r.pnlRows?"+$"+r.pnlSum.toFixed(2):"-").padStart(10)}`)
}
process.exit(0)
