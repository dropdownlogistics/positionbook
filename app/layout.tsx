import { Space_Grotesk, JetBrains_Mono } from "next/font/google"

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-display" })
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" })

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://positionbook.vercel.app"

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: "PositionBook — Verified trading record",
  description:
    "A verified trading record. Every position logged, timestamped, and provable. From Dropdown Logistics.",
  icons: { icon: "/favicon.svg" },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "PositionBook",
    title: "PositionBook — Verified trading record",
    description: "Every position logged, timestamped, and provable.",
  },
  twitter: {
    card: "summary_large_image",
    title: "PositionBook — Verified trading record",
    description: "Every position logged, timestamped, and provable.",
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${jetbrainsMono.variable}`}>
      <body style={{
        margin: 0, padding: 0,
        backgroundColor: "#060e14",
        color: "#e8f0f7",
        fontFamily: "var(--font-display), sans-serif",
        minHeight: "100vh",
      }}>
        {children}
      </body>
    </html>
  )
}
