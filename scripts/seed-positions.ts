import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import * as fs from "fs"
import * as path from "path"

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  const csv = fs.readFileSync(path.join(process.cwd(), "positionbook-seed.csv"), "utf8")
  const lines = csv.trim().split("\n").slice(1)
  let seeded = 0

  for (const line of lines) {
    const cols = line.split(",")
    const [id, userId, symbol, strategy, side, entryPrice, entryDate,
           exitPrice, exitDate, shares, status, exitSignal, rMultiple,
           netPnl, contextNote] = cols

    await prisma.position.upsert({
      where: { id: id.trim() },
      update: {},
      create: {
        id: id.trim(),
        userId: "alex",
        symbol: symbol.trim(),
        strategy: strategy.trim(),
        side: side.trim(),
        status: status.trim(),
        entryPrice: entryPrice.trim() ? parseFloat(entryPrice.trim()) : 0,
        entryDate: entryDate.trim() ? new Date(entryDate.trim()) : new Date("2026-01-02"),
        exitPrice: exitPrice?.trim() ? parseFloat(exitPrice.trim()) : null,
        exitDate: exitDate?.trim() ? new Date(exitDate.trim()) : null,
        shares: shares?.trim() ? parseInt(shares.trim()) : null,
        exitSignal: exitSignal?.trim() || null,
        rMultiple: rMultiple?.trim() ? parseFloat(rMultiple.trim()) : null,
        netPnl: netPnl?.trim() ? parseFloat(netPnl.trim()) : null,
        contextNote: contextNote?.trim() || null,
      }
    })
    console.log("Seeded:", symbol.trim())
    seeded++
  }
  console.log("Total seeded:", seeded)
}

main()
  .then(() => { console.log("Done"); process.exit(0) })
  .catch((e) => { console.error(e); process.exit(1) })
