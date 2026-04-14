export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

import type { Metadata, Viewport } from 'next'
import { Poppins } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/lib/theme-context'
import PWAInstallPrompt from '@/app/components/PWAInstallPrompt'
import CookieConsent from '@/app/components/CookieConsent'

const poppins = Poppins({
    subsets: ['latin'],
    weight: ['300', '400', '500', '600', '700'],
    variable: '--font-poppins',
    display: 'swap',
})

export const viewport: Viewport = {
    themeColor: '#182B3F',
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
}

export const metadata: Metadata = {
    title: 'Marina Dubson Stenographic Services — Client & Court Reporter Portal',
    description: 'Professional court reporting booking, transcript management, and team coordination for Marina Dubson Stenographic Services, LLC.',
    // manifest: '/manifest.json',
    // appleWebApp: {
    //     capable: true,
    //     statusBarStyle: 'default',
    //     title: 'Marina Dubson',
    // },
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" suppressHydrationWarning className={poppins.variable}>
            <head>
                <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
                <link rel="apple-touch-icon" href="/favicon.svg" />
            </head>
            <body className="font-poppins bg-white min-h-screen flex flex-col">
                <ThemeProvider>
                    <main className="flex-1 flex flex-col">
                        {children}
                    </main>
                    <CookieConsent />
                    {/* <PWAInstallPrompt /> */}
                </ThemeProvider>
            </body>
        </html>
    )
}
