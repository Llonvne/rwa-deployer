import type { Metadata } from 'next'
import './globals.css'
import { Web3Provider } from '@/providers/Web3Provider'

export const metadata: Metadata = {
  title: 'RWA DeFi App',
  description: 'Real World Asset DeFi Application with Contract Deployment',
  keywords: ['RWA', 'DeFi', 'Ethereum', 'Smart Contracts', 'Real World Assets'],
  authors: [{ name: 'RWA DeFi Team' }],
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <Web3Provider>
          <div className="min-h-screen flex flex-col">
            {children}
          </div>
        </Web3Provider>
      </body>
    </html>
  )
}
