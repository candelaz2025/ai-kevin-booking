import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'คลังบทความและคู่มือ AI Studio | AI News & Agent Tutorials',
  description: 'อัปเดตข่าวสาร AI News ล่าสุดรายวัน, เจาะลึกการสร้าง Autonomous AI Agents, เวิร์กโฟลว์ n8n, เทคนิค Vibe Coding และการใช้งาน ChatGPT Images 2.6',
  alternates: {
    canonical: 'https://ai-kevin-booking.vercel.app/articles',
  },
  openGraph: {
    title: 'คลังบทความและคู่มือ AI Studio | kevinaiagent.tech',
    description: 'อัปเดตข่าวสาร AI News ล่าสุดรายวัน, เจาะลึกการสร้าง Autonomous AI Agents และเทคนิค Vibe Coding',
    url: 'https://ai-kevin-booking.vercel.app/articles',
    type: 'website',
    images: [{ url: '/assets/brand-logo.png', width: 1200, height: 630 }],
  },
};

export default function ArticlesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
