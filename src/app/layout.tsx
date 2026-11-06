import type { Metadata, Viewport } from 'next';
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

export const viewport: Viewport = {
  themeColor: '#09111e',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

const SITE_URL = 'https://ai-kevin-booking.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'kevinaiagent.tech — ศูนย์รวมคลาสเรียนและที่ปรึกษา AI Agent, Autonomous Workflows & Vibe Coding',
    template: '%s | kevinaiagent.tech'
  },
  description: 'เรียนรู้และประยุกต์ใช้ AI Agent, Workflow Automation, n8n, Prompt Engineering, สตูดิโอละครสั้น AI และ ChatGPT Image 2.6 สอนสด 1-on-1 และกลุ่มเล็ก โดย อ. Kevin (Sorachet N.) ผู้เชี่ยวชาญ UX/UI & AI Systems',
  keywords: [
    'kevinaiagent.tech',
    'อ. Kevin',
    'สอน AI',
    'คลาสเรียน AI',
    'ที่ปรึกษา AI Agent',
    'Autonomous AI Agents',
    'Prompt Engineering',
    'ChatGPT Image 2.6',
    'Meme GIF Animation',
    'สตูดิโอละครสั้น AI',
    'DreamScript',
    'DreamShot',
    'MiniMax H3',
    'Vibe Coding',
    'Next.js AI',
    'n8n Automation',
    'Claude 3.7',
    'AI Content Creator',
    'Swinburne M.Des'
  ],
  authors: [{ name: 'อาจารย์ สรเชษฐ์ (อ. Kevin)', url: 'https://www.linkedin.com/in/sorachetn/' }],
  creator: 'อ. Kevin (Sorachet Ngamwilaidee)',
  publisher: 'kevinaiagent.tech',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: 'kevinaiagent.tech — ศูนย์รวมคลาสเรียนและที่ปรึกษา AI Agent & Vibe Coding',
    description: 'เรียนสดตัวต่อตัวและกลุ่ม ออกแบบระบบ AI Agent อัตโนมัติ, Prompt Engineering, สตูดิโอละครสั้น AI และคลัง Prompt มีม GIF โดย อ. Kevin (Sorachet N.)',
    url: SITE_URL,
    siteName: 'kevinaiagent.tech',
    images: [
      {
        url: '/assets/brand-logo.png',
        width: 1200,
        height: 630,
        alt: 'kevinaiagent.tech AI Academy & Consulting'
      }
    ],
    locale: 'th_TH',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'kevinaiagent.tech — ศูนย์รวมคลาสเรียนและที่ปรึกษา AI Agent',
    description: 'เรียนรู้และประยุกต์ใช้ AI Agent, Workflow Automation, และ Prompt Engineering สำหรับธุรกิจและสายครีเอเตอร์',
    images: ['/assets/brand-logo.png'],
    creator: '@sorachetn',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
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
  // Global JSON-LD Schemas for Rich Snippets & AI Search engines (GEO)
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    'name': 'kevinaiagent.tech',
    'alternateName': 'Kevin AI Studio & Academy',
    'url': SITE_URL,
    'logo': `${SITE_URL}/assets/logo.png`,
    'image': `${SITE_URL}/assets/brand-logo.png`,
    'description': 'สถาบันอบรมและให้คำปรึกษาการออกแบบระบบ AI Agent, Autonomous Workflows, Vibe Coding และ Prompt Engineering',
    'founder': {
      '@type': 'Person',
      'name': 'Sorachet Ngamwilaidee',
      'alternateName': 'อ. Kevin (Sorachet N.)',
      'jobTitle': 'Lead AI System Architect & Senior UX/UI Consultant',
      'alumniOf': {
        '@type': 'CollegeOrUniversity',
        'name': 'Swinburne University of Technology'
      },
      'sameAs': [
        'https://www.linkedin.com/in/sorachetn/',
        'https://www.behance.net/candelaz2024'
      ]
    },
    'sameAs': [
      'https://www.linkedin.com/in/sorachetn/',
      'https://www.behance.net/candelaz2024'
    ]
  };

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    'name': 'kevinaiagent.tech',
    'url': SITE_URL,
    'potentialAction': {
      '@type': 'SearchAction',
      'target': `${SITE_URL}/prompts?q={search_term_string}`,
      'query-input': 'required name=search_term_string'
    }
  };

  return (
    <html lang="th" className={`${ibmPlexSansThai.variable} ${manrope.variable} scroll-smooth`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
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
