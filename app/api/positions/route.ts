import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireUserId } from "@/lib/auth"

export async function GET() {
  try {
    const userId = await requireUserId()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    // NOT YET SCOPED to `where: { userId }`. Every existing row carries the
    // legacy userId "alex"; scoping now would render the dashboard empty.
    // Closes together with the data migration that reassigns those rows.
    const positions = await prisma.position.findMany({
      orderBy: { entryDate: "desc" },
    })
    return NextResponse.json(positions)
  } catch (error) {
    console.error("POSITIONS API ERROR:", error)
    return NextResponse.json({ error: "Failed to fetch positions", detail: String(error) }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const userId = await requireUserId()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json()
    const position = await prisma.position.create({
      data: {
        userId,
        symbol: body.symbol,
        strategy: body.strategy,
        side: body.side,
        status: body.status ?? "OPEN",
        entryPrice: parseFloat(body.entryPrice),
        entryDate: new Date(body.entryDate),
        shares: parseInt(body.shares),
        exitPrice: body.exitPrice ? parseFloat(body.exitPrice) : null,
        exitDate: body.exitDate ? new Date(body.exitDate) : null,
        exitSignal: body.exitSignal ?? null,
        rMultiple: body.rMultiple ? parseFloat(body.rMultiple) : null,
        netPnl: body.netPnl ? parseFloat(body.netPnl) : null,
        contextNote: body.contextNote ?? null,
        broker: body.broker ?? null,
        fees: body.fees ? parseFloat(body.fees) : null,
      },
    })
    return NextResponse.json(position, { status: 201 })
  } catch (error) {
    console.error("POSITIONS POST ERROR:", error)
    return NextResponse.json({ error: "Failed to create position", detail: String(error) }, { status: 500 })
  }
}