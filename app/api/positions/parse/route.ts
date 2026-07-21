import { NextRequest, NextResponse } from "next/server"

type Strategy = "ORB" | "SWING" | "MA_BOUNCE"

type ParsedPosition = {
  userId: string
  symbol: string
  strategy: Strategy
  side: "LONG" | "SHORT"
  status: "OPEN"
  entryPrice: number
  stopPrice: number | null
  entryDate: string
  exitSignal: null
  contextNote: null
}

const TOKEN_RE = /([A-Z][A-Z0-9.\-]{0,6})\s+(\d+(?:\.\d+)?)(?:\s*\(([\d.]+)\))?/g

// Section headers. Accepts the separator variants a human actually types:
// "MA BOUNCE:", "MA_BOUNCE:", "MA-BOUNCE". Normalized to the canonical
// strategy value stored in the DB.
const SECTION_HEADERS: { re: RegExp; strategy: Strategy }[] = [
  { re: /^ORB\s*:?\s*$/i, strategy: "ORB" },
  { re: /^SWING\s*:?\s*$/i, strategy: "SWING" },
  { re: /^MA[\s_-]*BOUNCE\s*:?\s*$/i, strategy: "MA_BOUNCE" },
]

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
  let section: Strategy | null = null

  for (const line of lines) {
    const d = parseDate(line)
    if (d) { entryDate = d; continue }

    const header = SECTION_HEADERS.find(h => h.re.test(line))
    if (header) { section = header.strategy; continue }

    if (/^EV\b/i.test(line)) continue
    if (/\bWL\b|watchlist/i.test(line)) { skipped.push(line); continue }

    const sideMatch = line.match(/^(LONG|SHORT)\s*:\s*(.*)$/i)
    if (sideMatch) {
      if (!section || !entryDate) { skipped.push(line); continue }
      const side = sideMatch[1].toUpperCase() as "LONG" | "SHORT"
      const tokens = parseTokens(sideMatch[2])
      for (const t of tokens) {
        parsed.push({
          userId: body.userId,
          symbol: t.symbol,
          strategy: section,
          side,
          status: "OPEN",
          entryPrice: t.entryPrice,
          stopPrice: t.stopPrice,
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
