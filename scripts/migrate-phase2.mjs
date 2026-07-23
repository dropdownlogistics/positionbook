/**
 * Phase 2 migration — run ONCE after Dave visits /dashboard while signed into Clerk.
 *
 * What this does:
 *   1. Reads the newly-created User row to find Dave's Clerk ID
 *   2. Reassigns all 43 legacy positions from userId="alex" to Dave's Clerk ID
 *   3. Recalculates rMultiple for all closed positions using the correct formula:
 *      sideSign * (exitPrice - entryPrice) / Math.abs(entryPrice - stopPrice)
 *      (the original seeded values may be wrong for SHORT positions)
 *
 * Prerequisites:
 *   - Dave has visited positionbook.app/dashboard while signed into Clerk
 *     (this creates the User row that this script reads)
 *   - DATABASE_URL is set in .env (or .env.local)
 *
 * Run:
 *   node scripts/migrate-phase2.mjs
 */

import { PrismaClient } from "@prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

async function main() {
  // --- 1. Find Dave's Clerk User row ---
  const users = await prisma.user.findMany()
  console.log(`Users in DB: ${users.map(u => `${u.id} <${u.email}>`).join(", ")}`)

  const clerkUser = users.find(u => u.id !== "alex")
  if (!clerkUser) {
    console.error(
      "\nERROR: No Clerk User row found.\n" +
      "Visit positionbook.app/dashboard while signed into Clerk, then run this script again."
    )
    process.exit(1)
  }

  console.log(`\nClerk user found: ${clerkUser.id} <${clerkUser.email}>`)

  // --- 2. Reassign legacy positions from "alex" to Clerk ID ---
  const { count: reassigned } = await prisma.position.updateMany({
    where: { userId: "alex" },
    data: { userId: clerkUser.id },
  })
  console.log(`\nReassigned ${reassigned} positions from userId="alex" → "${clerkUser.id}"`)

  // --- 3. Backfill rMultiple for closed positions ---
  const closed = await prisma.position.findMany({
    where: {
      userId: clerkUser.id,
      status: "CLOSED",
      exitPrice: { not: null },
      stopPrice: { not: null },
    },
  })

  console.log(`\nBackfilling rMultiple for ${closed.length} closed positions with stopPrice...`)

  let updated = 0
  let skipped = 0

  for (const p of closed) {
    const exitPrice = p.exitPrice
    const stopPrice = p.stopPrice
    if (exitPrice === null || stopPrice === null) { skipped++; continue }

    const risk = Math.abs(p.entryPrice - stopPrice)
    if (risk === 0) { skipped++; continue }

    const sideSign = p.side === "SHORT" ? -1 : 1
    const perShare = (exitPrice - p.entryPrice) * sideSign
    const rMultiple = Math.round((perShare / risk) * 10000) / 10000

    const prev = p.rMultiple
    await prisma.position.update({
      where: { id: p.id },
      data: { rMultiple },
    })

    const changed = prev !== rMultiple
    console.log(
      `  ${p.symbol} ${p.side.padEnd(5)} entry=${p.entryPrice} exit=${exitPrice} stop=${stopPrice}` +
      ` → ${rMultiple}R${changed && prev !== null ? ` (was ${prev}R)` : ""}`
    )
    updated++
  }

  console.log(`\nBackfill complete: ${updated} updated, ${skipped} skipped (no stop or zero risk)`)

  // --- 4. Verify final state ---
  const total = await prisma.position.count({ where: { userId: clerkUser.id } })
  const alexRemaining = await prisma.position.count({ where: { userId: "alex" } })
  console.log(`\nFinal state:`)
  console.log(`  Positions owned by ${clerkUser.id}: ${total}`)
  console.log(`  Positions still under "alex": ${alexRemaining}`)

  if (alexRemaining > 0) {
    console.error("\nWARNING: Some positions still carry userId='alex'. Check above output.")
  } else {
    console.log("\nMigration complete. Safe to deploy scoped routes.")
  }
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
