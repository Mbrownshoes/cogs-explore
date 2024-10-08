import { Inter } from 'next/font/google'
import 'mapbox-gl/dist/mapbox-gl.css';
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'COG Map Demo',
  description: 'Map tiles rendered from a COG',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
