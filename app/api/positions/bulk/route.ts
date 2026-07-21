import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

type IncomingPosition = {
  symbol: string
  strategy: string
  side: string
  status?: string
  entryPrice: number
  stopPrice?: number | null
  entryDate: string
  exitSignal?: string | null
  contextNote?: string | null
  dataQuality?: string | null
}

export async function POST(req: NextRequest) {
  const errors: string[] = []
  try {
    const body = await req.json() as { positions?: IncomingPosition[]; userId?: string }
    if (!body?.userId || !Array.isArray(body?.positions)) {
      return NextResponse.json({ created: 0, errors: ["positions[] and userId required"] }, { status: 400 })
    }
    if (body.positions.length === 0) {
      return NextResponse.json({ created: 0, errors: [] })
    }

    const rows = body.positions.map(p => ({
      userId: body.userId!,
      symbol: p.symbol,
      strategy: p.strategy,
      side: p.side,
      status: p.status ?? "OPEN",
      entryPrice: p.entryPrice,
      stopPrice: p.stopPrice ?? null,
      entryDate: new Date(p.entryDate),
      exitSignal: p.exitSignal ?? null,
      contextNote: p.contextNote ?? null,
      dataQuality: p.dataQuality ?? null,
    }))

    const result = await prisma.position.createMany({ data: rows })
    return NextResponse.json({ created: result.count, errors })
  } catch (error) {
    console.error("POSITIONS BULK ERROR:", error)
    errors.push(String(error))
    return NextResponse.json({ created: 0, errors }, { status: 500 })
  }
}
