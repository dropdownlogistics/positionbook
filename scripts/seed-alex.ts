import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  const user = await prisma.user.upsert({
    where: { id: "alex" },
    update: {},
    create: {
      id: "alex",
      email: "alex@positionbook.local",
    },
  })
  console.log("Seeded:", user.id, user.email)
}

main()
  .then(() => { console.log("Done"); process.exit(0) })
  .catch((e) => { console.error(e); process.exit(1) })
