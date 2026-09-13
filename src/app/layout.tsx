import type { Metadata } from "next"
import { Geist, JetBrains_Mono } from "next/font/google"

import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Live Branch",
  description: "Real-time collaborative code editor",
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${jetBrainsMono.variable} antialiased`}>
      <body>{children}</body>
    </html>
  )
}
