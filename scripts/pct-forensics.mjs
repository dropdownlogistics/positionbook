// Read-only. Reverse-engineers how the stored rMultiple values were computed.
import { PrismaClient } from "@prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL }) })
const rows = (await prisma.position.findMany({ where: { status: "CLOSED" } }))
  .filter(p => p.rMultiple !== null && p.exitPrice !== null)

const r2 = n => Math.round(n * 100) / 100
console.log("sym    side   stored | pctOnEntry pctOnExit | signedOnEntry signedOnExit | best match")
for (const p of rows) {
  const d = p.exitPrice - p.entryPrice
  const onEntry = r2((d / p.entryPrice) * 100)
  const onExit  = r2((d / p.exitPrice) * 100)
  const sign = p.side === "SHORT" ? -1 : 1
  const sEntry = r2(onEntry * sign)
  const sExit  = r2(onExit * sign)
  const cands = { onEntry, onExit, signedOnEntry: sEntry, signedOnExit: sExit }
  const match = Object.entries(cands).filter(([, v]) => v === r2(p.rMultiple)).map(([k]) => k).join(",") || "NONE"
  console.log(
    `${p.symbol.padEnd(6)} ${p.side.padEnd(5)} ${String(p.rMultiple).padStart(6)} | ${String(onEntry).padStart(9)} ${String(onExit).padStart(9)} | ${String(sEntry).padStart(13)} ${String(sExit).padStart(12)} | ${match}`
  )
}
process.exit(0)
