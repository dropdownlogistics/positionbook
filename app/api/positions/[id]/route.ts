import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

type ClosePayload = {
  exitPrice?: number | string
  exitDate?: string
  exitSignal?: string | null
  shares?: number | string | null
  fees?: number | string | null
  broker?: string | null
}

function num(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null
  const n = typeof v === "number" ? v : parseFloat(String(v))
  return Number.isFinite(n) ? n : null
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params
    const body = await req.json().catch(() => null) as ClosePayload | null
    if (!body) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
    }

    const exitPrice = num(body.exitPrice)
    if (exitPrice === null) {
      return NextResponse.json({ error: "exitPrice is required and must be a number" }, { status: 400 })
    }

    if (!body.exitDate) {
      return NextResponse.json({ error: "exitDate is required" }, { status: 400 })
    }
    const exitDate = new Date(body.exitDate)
    if (Number.isNaN(exitDate.getTime())) {
      return NextResponse.json({ error: "exitDate is not a valid date" }, { status: 400 })
    }

    const existing = await prisma.position.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: "Position not found" }, { status: 404 })
    }

    // Caller may supply shares/fees/broker at close time; otherwise keep what
    // is already on the record.
    const shares = num(body.shares) ?? existing.shares
    const fees = num(body.fees) ?? existing.fees
    const broker = body.broker ?? existing.broker
    const exitSignal = body.exitSignal ?? existing.exitSignal

    // SHORT profits when price falls, so the per-share result is inverted.
    const sideSign = existing.side === "SHORT" ? -1 : 1
    const perShare = (exitPrice - existing.entryPrice) * sideSign

    // R-multiple = result / risk-per-share. Risk is the distance from entry to
    // stop, which is always a magnitude — the direction is already carried by
    // sideSign above. Null when there is no stop to measure risk against, or
    // when stop equals entry (zero risk is not divisible).
    let rMultiple: number | null = null
    if (existing.stopPrice !== null) {
      const risk = Math.abs(existing.entryPrice - existing.stopPrice)
      if (risk > 0) {
        rMultiple = Math.round((perShare / risk) * 10000) / 10000
      }
    }

    // Null when size is unknown — a PnL without share count would be invented.
    const netPnl = shares !== null
      ? Math.round((perShare * shares - (fees ?? 0)) * 100) / 100
      : null

    const updated = await prisma.position.update({
      where: { id },
      data: {
        status: "CLOSED",
        exitPrice,
        exitDate,
        exitSignal,
        shares,
        fees,
        broker,
        rMultiple,
        netPnl,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("POSITION PATCH ERROR:", error)
    return NextResponse.json({ error: "Failed to update position" }, { status: 500 })
  }
}
