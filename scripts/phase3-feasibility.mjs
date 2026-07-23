import { PrismaClient } from "@prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL }) })
const all = await prisma.position.findMany()
const real = all.filter(p => p.dataQuality !== "SEED")

console.log("=== BY STRATEGY ===")
const by = {}
for (const p of real) {
  const k = p.strategy
  by[k] ??= { open: 0, closed: 0, scored: 0, wins: 0, sum: 0 }
  if (p.status === "OPEN") by[k].open++
  else {
    by[k].closed++
    if (p.pctReturn !== null) { by[k].scored++; by[k].sum += p.pctReturn; if (p.pctReturn > 0) by[k].wins++ }
    else if (p.netPnl !== null && p.netPnl > 0) { by[k].scored++; by[k].wins++ }
  }
}
for (const [k, v] of Object.entries(by)) {
  const wr = v.scored ? ((v.wins / v.scored) * 100).toFixed(1) + "%" : "-"
  const avg = v.scored ? (v.sum / v.scored).toFixed(2) + "%" : "-"
  console.log(`  ${k.padEnd(11)} open=${String(v.open).padStart(2)}  closed=${String(v.closed).padStart(2)}  scored=${String(v.scored).padStart(2)}  winRate=${wr.padStart(6)}  avgRet=${avg.padStart(7)}`)
}

console.log("\n=== EQUITY CURVE FEASIBILITY ===")
const withExit = real.filter(p => p.status === "CLOSED" && p.exitDate)
const dates = [...new Set(withExit.map(p => p.exitDate.toISOString().slice(0, 10)))].sort()
console.log(`  closed rows with an exitDate: ${withExit.length}`)
console.log(`  distinct exit dates: ${dates.length} -> ${dates.join(", ")}`)
console.log(`  closed rows with netPnl (dollar curve): ${real.filter(p => p.status === "CLOSED" && p.netPnl !== null).length}`)

console.log("\n=== OPEN EXPOSURE (entry notional needs shares; shares present?) ===")
console.log(`  open rows: ${real.filter(p => p.status === "OPEN").length}, of which with shares: ${real.filter(p => p.status === "OPEN" && p.shares !== null).length}`)
process.exit(0)
