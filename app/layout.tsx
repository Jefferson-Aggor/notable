import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from 'sonner';

import { ConvexClientProvider } from '@/components/providers/convex.provider';

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Notable.',
  description: 'Notable is a versatile and intuitive platform designed to empower users in organizing their ideas, tasks, and projects seamlessly.',
  icons: {
    icon: [
      {
        media: "(prefers-color-scheme: light)",
        url: "/white-logo.png",
        href: '/white-logo.png'
      },
      {
        media: "(prefers-color-scheme: dark)",
        url: "/dark-logo.png",
        href: "/dark-logo.png"
      }
    ]
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ConvexClientProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Toaster position='top-right' />
            {children}
          </ThemeProvider>
        </ConvexClientProvider>

      </body>
    </html>
  );
}
