import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'จองคลาสเรียนและเวิร์กช็อป AI Studio | Booking Masterclass',
  description: 'เลือกคอร์สเรียน AI และจองรอบเรียนสดกับ อ. Kevin (Sorachet N.) ทั้งแบบ Private 1-on-1 และกลุ่มเล็ก เจาะลึก AI Agent, Automation, Vibe Coding และ Prompt Engineering',
  keywords: [
    'จองคลาสเรียน AI',
    'เรียน AI ตัวต่อตัว',
    'Private AI Mentoring',
    'คอร์สเรียน AI Agent',
    'เวิร์กช็อป AI กรุงเทพ',
    'kevinaiagent.tech'
  ],
  alternates: {
    canonical: 'https://ai-kevin-booking.vercel.app/booking',
  },
  openGraph: {
    title: 'จองคลาสเรียนและเวิร์กช็อป AI Studio | kevinaiagent.tech',
    description: 'เลือกคอร์สเรียน AI และจองรอบเรียนสดกับ อ. Kevin ทั้งแบบ Private 1-on-1 และกลุ่มเล็ก',
    url: 'https://ai-kevin-booking.vercel.app/booking',
    images: [{ url: '/assets/brand-logo.png', width: 1200, height: 630 }],
    type: 'website',
  },
};

export default function BookingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
