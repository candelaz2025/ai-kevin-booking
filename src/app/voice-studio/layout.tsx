import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Voice & Audio Studio — ห้องพากย์และสังเคราะห์เสียง AI',
  description: 'สตูดิโอพากย์เสียง AI สังเคราะห์เสียงพูดและโคลนเสียงตัวละคร สำหรับคอนเทนต์วิดีโอ ละครสั้น และงานมีเดียยุคใหม่',
  alternates: {
    canonical: 'https://ai-kevin-booking.vercel.app/voice-studio',
  },
  openGraph: {
    title: 'AI Voice & Audio Studio | kevinaiagent.tech',
    description: 'สตูดิโอพากย์เสียง AI สังเคราะห์เสียงพูดและโคลนเสียงตัวละคร',
    url: 'https://ai-kevin-booking.vercel.app/voice-studio',
    images: [{ url: '/assets/brand-logo.png', width: 1200, height: 630 }],
    type: 'website',
  },
};

export default function VoiceStudioLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
