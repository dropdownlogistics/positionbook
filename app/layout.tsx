import { Space_Grotesk, JetBrains_Mono } from "next/font/google"

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-display" })
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" })

export const metadata = {
  title: "PositionBook",
  description: "Trade with evidence.",
  icons: { icon: "/favicon.svg" },
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