// READ-ONLY. Full dump of every Position row before the Item 4 migration.
// The 9 rMultiple values are NOT recomputable — this file is the only rollback.
import { PrismaClient } from "@prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import * as fs from "fs"
const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL }) })
const out = process.argv[2]
if (!out) { console.error("usage: node scripts/backup-preitem4.mjs <outfile>"); process.exit(1) }
const rows = await prisma.position.findMany({ orderBy: { id: "asc" } })
fs.writeFileSync(out, JSON.stringify(rows, (k, v) => typeof v === "bigint" ? String(v) : v, 2))
console.log(`wrote ${rows.length} rows -> ${out}`)
console.log(`rMultiple non-null : ${rows.filter(r => r.rMultiple !== null).length}`)
console.log(`netPnl non-null    : ${rows.filter(r => r.netPnl !== null).length}`)
console.log(`dataQuality non-null: ${rows.filter(r => r.dataQuality !== null).length}`)
process.exit(0)
