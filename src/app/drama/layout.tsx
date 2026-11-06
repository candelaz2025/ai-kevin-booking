import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'สตูดิโอละครสั้น AI Generator — DreamScript & DreamShot',
  description: 'ระบบสตูดิโอสร้างละครสั้นและซีรีส์สั้นด้วย AI พร้อมระบบ AI Suggestion สุ่มกว่า 200 รูปแบบ เขียนบท ออกแบบตัวละคร สตอรี่บอร์ด คุมมุมกล้อง และพากย์เสียงครบวงจร',
  keywords: [
    'สตูดิโอละครสั้น AI',
    'DreamScript',
    'DreamShot',
    'Anycook',
    'AI Drama Generator',
    'Short Film AI',
    'Storyboard AI',
    'kevinaiagent.tech'
  ],
  alternates: {
    canonical: 'https://ai-kevin-booking.vercel.app/drama',
  },
  openGraph: {
    title: 'สตูดิโอละครสั้น AI Generator — DreamScript & DreamShot | kevinaiagent.tech',
    description: 'ระบบสร้างละครสั้น AI อัจฉริยะ วางสตอรี่บอร์ด สุ่มพล็อตกว่า 200 แบบ และสร้างเสียงใหม่ครบรูปแบบ',
    url: 'https://ai-kevin-booking.vercel.app/drama',
    images: [{ url: '/assets/brand-logo.png', width: 1200, height: 630 }],
    type: 'website',
  },
};

export default function DramaLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
