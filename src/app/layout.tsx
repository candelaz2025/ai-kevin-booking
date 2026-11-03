import type { Metadata } from 'next';
import { IBM_Plex_Sans_Thai, Manrope } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import { CartProvider } from '@/lib/cart-context';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const ibmPlexSansThai = IBM_Plex_Sans_Thai({
  subsets: ['thai', 'latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-ibm-plex-thai',
});

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-manrope',
});

export const metadata: Metadata = {
  title: 'Kevin AI Academy — ศูนย์รวมคลาสเรียนและที่ปรึกษา AI',
  description: 'Kevin AI Academy บริการที่ปรึกษา AI แบบส่วนตัวและกลุ่ม ทั้งออนไลน์และออนไซต์ จองคลาสเรียน 1-on-1 และเวิร์กช็อป AI Content & Automation',
  icons: {
    icon: '/assets/logo.png',
    shortcut: '/assets/logo.png',
    apple: '/assets/logo.png',
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={`${ibmPlexSansThai.variable} ${manrope.variable} scroll-smooth`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var host = window.location.hostname;
                  var isLocal = host === 'localhost' || host === '127.0.0.1';
                  var s = window.location.search || '';
                  var h = window.location.hash || '';
                  var hasAuth = s.indexOf('code=') !== -1 || h.indexOf('access_token=') !== -1 || h.indexOf('refresh_token=') !== -1;
                  if (isLocal && hasAuth) {
                    window.location.replace('https://ai-kevin-booking.vercel.app/auth/callback' + s + h);
                  }
                } catch(e) {}
              })();
            `
          }}
        />
      </head>
      <body className="min-h-screen bg-[#09111e] text-[#f6f7fb] font-sans antialiased flex flex-col selection:bg-amber-400 selection:text-slate-950">
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
