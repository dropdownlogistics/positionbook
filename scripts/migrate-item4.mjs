// Phase 1 Item 4 migration. Pass --execute to write; default is dry run.
//
//   1. rMultiple -> pctReturn, sign-flipped for SHORT (stored values were raw
//      price movement, not P&L). rMultiple set to null.
//   2. dataQuality backfilled from positionbook-seed.csv (last column).
//
// Idempotent: rows already carrying pctReturn are skipped.
// Writes only pctReturn, rMultiple, dataQuality. Single transaction.
import { PrismaClient } from "@prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import * as fs from "fs"

const EXECUTE = process.argv.includes("--execute")
const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL }) })
const r2 = n => Math.round(n * 100) / 100
const ALLOWED = new Set(["VERIFIED", "INFERRED", "SEED"])

// dataQuality is the final CSV column; take last field so a comma in
// contextNote cannot shift the index.
const quality = new Map()
for (const line of fs.readFileSync("positionbook-seed.csv", "utf8").trim().split("\n").slice(1)) {
  const cols = line.split(",")
  const id = cols[0].trim()
  const q = cols[cols.length - 1].trim()
  if (!ALLOWED.has(q)) { console.error(`ABORT: unexpected dataQuality "${q}" on ${id}`); process.exit(1) }
  quality.set(id, q)
}

const rows = await prisma.position.findMany({ orderBy: { id: "asc" } })
const plan = []
for (const p of rows) {
  const data = {}
  if (p.rMultiple !== null && p.pctReturn === null) {
    data.pctReturn = r2(p.rMultiple * (p.side === "SHORT" ? -1 : 1))
    data.rMultiple = null
  }
  const q = quality.get(p.id)
  if (q && p.dataQuality === null) data.dataQuality = q
  if (Object.keys(data).length) plan.push({ id: p.id, symbol: p.symbol, side: p.side, from: { rMultiple: p.rMultiple, dataQuality: p.dataQuality }, data })
}

console.log(`${EXECUTE ? "EXECUTING" : "DRY RUN"} — ${plan.length} of ${rows.length} rows would change\n`)
for (const c of plan) {
  const bits = []
  if ("pctReturn" in c.data) bits.push(`rMultiple ${c.from.rMultiple} -> null, pctReturn ${c.data.pctReturn}`)
  if ("dataQuality" in c.data) bits.push(`dataQuality -> ${c.data.dataQuality}`)
  console.log(`  ${c.symbol.padEnd(6)} ${c.side.padEnd(5)} ${bits.join("  |  ")}`)
}
const untouched = rows.filter(r => !plan.find(p => p.id === r.id))
console.log(`\nuntouched: ${untouched.length} (${untouched.map(r => r.symbol).join(", ") || "none"})`)

if (!EXECUTE) { console.log("\nNo writes performed. Re-run with --execute."); process.exit(0) }

await prisma.$transaction(plan.map(c => prisma.position.update({ where: { id: c.id }, data: c.data })))
console.log(`\nCommitted ${plan.length} row updates.`)
process.exit(0)
