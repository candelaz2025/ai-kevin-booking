import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Prompt Generator & Studio Hub | คลัง Prompt มืออาชีพ',
  description: 'ศูนย์รวม Prompt คุณภาพสูงสำหรับสร้างวิดีโอ ละคร มีม GIF แอนิเมชัน เว็บไซต์ดีไซน์ และโมเดล MiniMax H3 คัดลอกฟรีพร้อมเทคนิคการปรับแต่ง',
  alternates: {
    canonical: 'https://ai-kevin-booking.vercel.app/prompts',
  },
  openGraph: {
    title: 'AI Prompt Generator & Studio Hub | kevinaiagent.tech',
    description: 'ศูนย์รวม Prompt คุณภาพสูงสำหรับสร้างวิดีโอ ละคร มีม GIF แอนิเมชัน และเว็บไซต์ดีไซน์',
    url: 'https://ai-kevin-booking.vercel.app/prompts',
    images: [{ url: '/assets/brand-logo.png', width: 1200, height: 630 }],
    type: 'website',
  },
};

export default function PromptsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
