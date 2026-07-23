// Read-only. Lists User rows and position counts per userId.
// Used to identify the real Clerk user id before the "alex" -> Clerk migration.
//   node --env-file=.env scripts/list-users.mjs
import { PrismaClient } from "@prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

const users = await prisma.user.findMany({
  select: { id: true, email: true, createdAt: true },
  orderBy: { createdAt: "asc" },
})

const counts = await prisma.position.groupBy({
  by: ["userId"],
  _count: { _all: true },
})

console.log("USERS")
for (const u of users) {
  console.log(`  id=${u.id}\n    email=${u.email}\n    created=${u.createdAt.toISOString()}`)
}

console.log("\nPOSITIONS BY userId")
for (const c of counts) {
  console.log(`  ${c.userId.padEnd(36)} ${c._count._all}`)
}

process.exit(0)
