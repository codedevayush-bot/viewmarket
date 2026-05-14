import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import AuthSessionProvider from './components/SessionProvider';
import { ThemeProvider } from './providers/ThemeProvider';
import { auth } from '@/auth';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'View Market',
    template: 'View Market | %s',
  },
  description:
    'ViewMarket — Algorithmic trading platform with 30+ broker integrations',
  icons: {
    icon: '/icon.svg',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("vm-theme"),s=window.matchMedia("(prefers-color-scheme:dark)").matches,r=t==="light"?"light":t==="system"?s?"dark":"light":"dark";document.documentElement.setAttribute("data-theme",r)}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <AuthSessionProvider session={session}>
            {children}
          </AuthSessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
