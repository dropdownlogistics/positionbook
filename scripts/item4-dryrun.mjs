// READ-ONLY dry run. Shows exactly what Item 4 would write. Writes nothing.
import { PrismaClient } from "@prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL }) })
const r2 = n => Math.round(n * 100) / 100
const rows = (await prisma.position.findMany({ where: { status: "CLOSED" } }))
  .filter(p => p.rMultiple !== null)
  .sort((a, b) => a.side.localeCompare(b.side) || a.symbol.localeCompare(b.symbol))

console.log("INTERPRETATION (A): stored value = price movement. SHORT sign flips to become P&L.\n")
console.log("sym    side  stored -> pctReturn  result   price move check")
let w = 0, l = 0
for (const p of rows) {
  const flip = p.side === "SHORT" ? -1 : 1
  const pct = r2(p.rMultiple * flip)
  const res = pct > 0 ? "WIN " : "LOSS"
  if (pct > 0) w++; else l++
  const moved = p.exitPrice > p.entryPrice ? "up  " : "down"
  console.log(`${p.symbol.padEnd(6)} ${p.side.padEnd(5)} ${String(p.rMultiple).padStart(6)} -> ${String(pct).padStart(6)}     ${res}    price ${moved} (${p.entryPrice} -> ${p.exitPrice})`)
}
console.log(`\nRecord on these ${rows.length}: ${w} wins / ${l} losses  = ${((w/rows.length)*100).toFixed(1)}% win rate`)
console.log("\nSanity: every SHORT whose price ROSE must be a LOSS; every SHORT whose price FELL must be a WIN.")
const bad = rows.filter(p => {
  const pct = r2(p.rMultiple * (p.side === "SHORT" ? -1 : 1))
  const up = p.exitPrice > p.entryPrice
  const shouldWin = p.side === "SHORT" ? !up : up
  return (pct > 0) !== shouldWin
})
console.log(bad.length ? `  FAILED on: ${bad.map(b => b.symbol).join(", ")}` : "  PASS — all 9 rows internally consistent under (A)")
process.exit(0)
