// Read-only. Reconciles live Position rows against positionbook-seed.csv.
import { PrismaClient } from "@prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import * as fs from "fs"

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

const rows = await prisma.position.findMany({ orderBy: [{ createdAt: "asc" }] })

const csv = fs.readFileSync("positionbook-seed.csv", "utf8").trim().split("\n").slice(1)
const seedIds = new Set(csv.map(l => l.split(",")[0].trim()))

const fromSeed = rows.filter(r => seedIds.has(r.id))
const notFromSeed = rows.filter(r => !seedIds.has(r.id))

console.log(`TOTAL ${rows.length}   from-seed ${fromSeed.length}   NOT-from-seed ${notFromSeed.length}`)

console.log("\n=== ROWS NOT IN SEED CSV ===")
for (const r of notFromSeed) {
  console.log(`  ${r.symbol.padEnd(6)} ${r.strategy.padEnd(10)} ${r.side.padEnd(5)} ${r.status.padEnd(6)} entry=${String(r.entryPrice).padEnd(9)} stop=${String(r.stopPrice ?? "-").padEnd(9)} entryDate=${r.entryDate.toISOString().slice(0,10)} created=${r.createdAt.toISOString().slice(0,16)}`)
}

console.log("\n=== CLOSED ROWS: what is actually in rMultiple / netPnl ? ===")
const closed = rows.filter(r => r.status === "CLOSED")
console.log(`closed count: ${closed.length}`)
for (const r of closed) {
  console.log(`  ${r.symbol.padEnd(6)} ${r.side.padEnd(5)} entry=${String(r.entryPrice).padEnd(9)} exit=${String(r.exitPrice ?? "-").padEnd(9)} stop=${String(r.stopPrice ?? "-").padEnd(7)} rMultiple=${String(r.rMultiple ?? "null").padEnd(8)} netPnl=${String(r.netPnl ?? "null").padEnd(8)} quality=${r.dataQuality ?? "-"}`)
}

console.log("\n=== DUPLICATE CHECK (userId, symbol, entryDate, strategy) ===")
const seen = new Map()
for (const r of rows) {
  const k = `${r.symbol}|${r.entryDate.toISOString().slice(0,10)}|${r.strategy}|${r.side}`
  seen.set(k, (seen.get(k) ?? 0) + 1)
}
const dupes = [...seen.entries()].filter(([, n]) => n > 1)
if (!dupes.length) console.log("  no duplicates")
else for (const [k, n] of dupes) console.log(`  x${n}  ${k}`)

process.exit(0)
