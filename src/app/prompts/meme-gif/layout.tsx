import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Meme GIF Animation Prompt Studio — ChatGPT Image 2.6 (220+ Presets)',
  description: 'คลัง 220+ Prompt เจนมีม GIF แอนิเมชันลูป สำหรับ ChatGPT Image 2.6 เสกภาพถ่ายและสติกเกอร์เป็น Meme Animation ขยับได้จริงพร้อมเอฟเฟกต์มังงะญี่ปุ่น คัดลอกฟรีในคลิกเดียว',
  keywords: [
    'ChatGPT Image 2.6',
    'Meme GIF',
    'AI GIF Animation',
    'Looping GIF',
    'Manga Meme Effects',
    'Sprite Sheet AI',
    'Prompt Engineering',
    'kevinaiagent.tech'
  ],
  alternates: {
    canonical: 'https://ai-kevin-booking.vercel.app/prompts/meme-gif',
  },
  openGraph: {
    title: 'Meme GIF Animation Prompt Studio — ChatGPT Image 2.6 (220+ Presets)',
    description: 'คลัง 220+ Prompt เจนมีม GIF แอนิเมชันลูป สำหรับ ChatGPT Image 2.6 เสกภาพถ่ายเป็น Meme Animation ขยับได้จริงพร้อมเอฟเฟกต์มังงะ',
    url: 'https://ai-kevin-booking.vercel.app/prompts/meme-gif',
    images: [{ url: '/blog/chatgpt-images-2-6/cover.png', width: 1200, height: 675, alt: 'Meme GIF Animation Studio' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Meme GIF Animation Prompt Studio — ChatGPT Image 2.6',
    description: 'คลัง 220+ Prompt เจนมีม GIF แอนิเมชันลูป สำหรับ ChatGPT Image 2.6 พร้อมใช้ทันที',
    images: ['/blog/chatgpt-images-2-6/cover.png'],
  }
};

export default function MemeGifLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
