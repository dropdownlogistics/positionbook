import { ImageResponse } from "next/og"

// Static OG card for PositionBook. next/og renders this to a 1200x630 PNG at
// build — a real raster image that social/link unfurlers (iMessage, Slack,
// X, etc.) actually render, unlike an SVG. OG audit remediation.
export const alt = "PositionBook — Verified trading record"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

const BG = "#060e14"
const CREAM = "#e8f0f7"
const GOLD = "#C49A3C"
const GREEN = "#22C55E"
const DIM = "rgba(232,240,247,0.55)"

export default function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: BG,
          color: CREAM,
          padding: "72px 80px",
          fontFamily: "sans-serif",
          border: "1px solid rgba(196,154,60,0.25)",
        }}
      >
        {/* top row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 22, letterSpacing: 4, color: DIM }}>DROPDOWN LOGISTICS</div>
          <div style={{ display: "flex", alignItems: "center", gap: 14, color: GREEN, fontSize: 26, letterSpacing: 2 }}>
            <div style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: GREEN }} />
            <div>VERIFIED</div>
          </div>
        </div>

        {/* center wordmark */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 128, fontWeight: 700, letterSpacing: -3, lineHeight: 1 }}>PositionBook</div>
          <div style={{ height: 4, width: 120, backgroundColor: GOLD, margin: "34px 0 26px" }} />
          <div style={{ fontSize: 40, color: "rgba(232,240,247,0.8)" }}>Verified trading record</div>
        </div>

        {/* bottom faux-ledger row */}
        <div style={{ display: "flex", gap: 44, fontSize: 22, color: DIM, fontFamily: "monospace" }}>
          <div>ENTRY · timestamped</div>
          <div>SIZE · logged</div>
          <div>PROOF · immutable</div>
        </div>
      </div>
    ),
    { ...size }
  )
}
