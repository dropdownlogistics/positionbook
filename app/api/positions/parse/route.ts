import { NextRequest, NextResponse } from "next/server"

type ParsedPosition = {
  userId: string
  symbol: string
  strategy: "ORB" | "SWING"
  side: "LONG" | "SHORT"
  status: "OPEN"
  entryPrice: number
  entryDate: string
  exitSignal: null
  contextNote: null
}

const TOKEN_RE = /([A-Z][A-Z0-9.\-]{0,6})\s+(\d+(?:\.\d+)?)(?:\s*\(([\d.]+)\))?/g

function parseDate(line: string): string | null {
  const m = line.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/)
  if (!m) return null
  const mo = parseInt(m[1], 10)
  const da = parseInt(m[2], 10)
  let yr = parseInt(m[3], 10)
  if (yr < 100) yr += 2000
  const d = new Date(Date.UTC(yr, mo - 1, da))
  return d.toISOString()
}

function parseTokens(rest: string) {
  const out: { symbol: string; entryPrice: number; stopPrice: number | null }[] = []
  TOKEN_RE.lastIndex = 0
  let m: RegExpExecArray | null
  while ((m = TOKEN_RE.exec(rest)) !== null) {
    out.push({
      symbol: m[1],
      entryPrice: parseFloat(m[2]),
      stopPrice: m[3] ? parseFloat(m[3]) : null,
    })
  }
  return out
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null) as { text?: string; userId?: string } | null
  if (!body?.text || !body?.userId) {
    return NextResponse.json({ error: "text and userId required" }, { status: 400 })
  }

  const lines = body.text.split(/\r?\n/).map(l => l.trim()).filter(Boolean)
  const parsed: ParsedPosition[] = []
  const skipped: string[] = []
  let entryDate: string | null = null
  let section: "ORB" | "SWING" | null = null

  for (const line of lines) {
    const d = parseDate(line)
    if (d) { entryDate = d; continue }

    if (/^ORB\s*:?\s*$/i.test(line)) { section = "ORB"; continue }
    if (/^SWING\s*:?\s*$/i.test(line)) { section = "SWING"; continue }

    if (/^EV\b/i.test(line)) continue
    if (/\bWL\b|watchlist/i.test(line)) { skipped.push(line); continue }

    const sideMatch = line.match(/^(LONG|SHORT)\s*:\s*(.*)$/i)
    if (sideMatch) {
      if (!section || !entryDate) { skipped.push(line); continue }
      const side = sideMatch[1].toUpperCase() as "LONG" | "SHORT"
      const tokens = parseTokens(sideMatch[2])
      for (const t of tokens) {
        if (t.stopPrice !== null) {
          console.log(`stopPrice discarded (not in schema): ${t.symbol} stop=${t.stopPrice}`)
        }
        parsed.push({
          userId: body.userId,
          symbol: t.symbol,
          strategy: section,
          side,
          status: "OPEN",
          entryPrice: t.entryPrice,
          entryDate: entryDate,
          exitSignal: null,
          contextNote: null,
        })
      }
      continue
    }

    skipped.push(line)
  }

  return NextResponse.json({ parsed, count: parsed.length, skipped })
}
