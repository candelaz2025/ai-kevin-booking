-- ==============================================================================
-- Schema for AI Kevin Workshop & Private 1-on-1 Booking System
-- Database: Supabase (PostgreSQL)
-- ==============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. CLASSES TABLE
CREATE TABLE IF NOT EXISTS public.classes (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT DEFAULT '',
  description TEXT DEFAULT '',
  type TEXT NOT NULL CHECK (type IN ('online', 'onsite')),
  price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  duration_minutes INTEGER NOT NULL DEFAULT 120,
  location TEXT DEFAULT '',
  online_meeting_url TEXT DEFAULT '',
  max_seats INTEGER DEFAULT 20,
  available_dates JSONB DEFAULT '[]'::jsonb,
  time_slots JSONB DEFAULT '[]'::jsonb,
  topics JSONB DEFAULT '[]'::jsonb,
  tools_used JSONB DEFAULT '[]'::jsonb,
  prerequisites TEXT DEFAULT '',
  image TEXT DEFAULT '',
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. USERS / PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  image TEXT,
  phone TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  provider TEXT DEFAULT 'google',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS public.bookings (
  id TEXT PRIMARY KEY,
  class_id TEXT REFERENCES public.classes(id) ON DELETE SET NULL,
  class_title TEXT NOT NULL,
  class_type TEXT NOT NULL CHECK (class_type IN ('online', 'onsite')),
  date DATE NOT NULL,
  time_slot TEXT NOT NULL,
  user_id TEXT,
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  user_phone TEXT NOT NULL,
  line_id TEXT,
  notes TEXT,
  amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('promptpay_qr', 'stripe')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'verified', 'failed', 'refunded')),
  slip_url TEXT,
  stripe_payment_intent_id TEXT,
  booking_status TEXT NOT NULL DEFAULT 'pending_payment' CHECK (booking_status IN ('pending_payment', 'confirmed', 'cancelled', 'completed')),
  online_meeting_url TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  confirmed_at TIMESTAMPTZ
);

-- 4. SYSTEM NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.system_notifications (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  booking_id TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. EMAIL LOGS TABLE
CREATE TABLE IF NOT EXISTS public.email_logs (
  id TEXT PRIMARY KEY,
  recipient TEXT NOT NULL,
  subject TEXT NOT NULL,
  html TEXT NOT NULL,
  type TEXT NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS POLICIES (Row Level Security)
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- Allow public read of classes
CREATE POLICY "Allow public read classes" ON public.classes FOR SELECT USING (true);
CREATE POLICY "Allow all modifications on classes" ON public.classes FOR ALL USING (true);

-- Allow public read & insert of bookings
CREATE POLICY "Allow read bookings" ON public.bookings FOR SELECT USING (true);
CREATE POLICY "Allow insert bookings" ON public.bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update bookings" ON public.bookings FOR UPDATE USING (true);

-- Allow public notifications & email logs
CREATE POLICY "Allow all notifications" ON public.system_notifications FOR ALL USING (true);
CREATE POLICY "Allow all email_logs" ON public.email_logs FOR ALL USING (true);
CREATE POLICY "Allow all users" ON public.users FOR ALL USING (true);

-- ==============================================================================
-- INITIAL SEED DATA
-- ==============================================================================
INSERT INTO public.classes (id, title, subtitle, description, type, price, duration_minutes, location, online_meeting_url, max_seats, available_dates, time_slots, topics, tools_used, prerequisites, image, featured)
VALUES
(
  'ai-content-workshop',
  'AI Content Workshop — ทำคอนเทนต์และ AI Agent ในคลาสเดียว',
  'จากไอเดีย สู่คอนเทนต์ที่พร้อมเผยแพร่ ด้วย ChatGPT, Meta AI และ Grok Bot',
  'เรียนรู้การวางแผนคอนเทนต์รายวัน คิดและเขียนด้วย ChatGPT สร้างภาพและวิดีโอด้วย Meta AI พร้อมต่อยอดเวิร์กโฟลว์ AI Agent ด้วย Grok Bot และจัด Pipeline ปฏิทินด้วย Notion ฝึกปฏิบัติจริงอย่างใกล้ชิด',
  'onsite',
  499.00,
  180,
  'NEXUS Bangkok Downtown Campus (ชั้น 6 M Academy, อาคารบิ๊กซี ราชดำริ เขตปทุมวัน กทม.)',
  '',
  20,
  '["2026-11-01", "2026-11-08", "2026-11-15", "2026-11-22", "2026-12-06"]'::jsonb,
  '["13:00 - 16:00"]'::jsonb,
  '["01 PLAN: วางทิศทางคอนเทนต์ ทำ Persona & Content Pillars", "02 WRITE: คิดและเขียนด้วย ChatGPT", "03 CREATE: สร้างภาพและคอนเทนต์ด้วย Meta AI", "04 AUTOMATE: AI Agent workflow ด้วย Grok Bot", "05 PUBLISH: จัดระเบียบ Pipeline และปฏิทินด้วย Notion"]'::jsonb,
  '["ChatGPT", "Meta AI", "Grok Bot", "AI Agent", "Notion"]'::jsonb,
  'นำแล็ปท็อป (Notebook) มาใช้ฝึกปฏิบัติจริงตลอดคลาส',
  '/assets/ai-content-workshop.avif',
  true
),
(
  'ai-private-1on1-online',
  'Private 1-on-1: AI Agent & Automation Masterclass (Online)',
  'เรียนสดตัวต่อตัวผ่าน Zoom/Google Meet ออกแบบเวิร์กโฟลว์ AI สำหรับธุรกิจของคุณโดยเฉพาะ',
  'คลาสเรียน AI ส่วนตัวกับ อ. Kevin แบบจับมือทำ 1-on-1 ปรับหลักสูตรตามเป้าหมายของนักเรียน เช่น การสร้างระบบ AI Agent อัตโนมัติ, การเทรนข้อมูลเฉพาะทาง, การเชื่อมต่อ n8n / APIs และการประยุกต์ใช้ในการตลาดหรือการทำงานส่วนตัว',
  'online',
  2500.00,
  120,
  'Google Meet / Zoom (Online Live)',
  'https://meet.google.com/ai-kevin-private',
  1,
  '["2026-11-02", "2026-11-03", "2026-11-05", "2026-11-09", "2026-11-10", "2026-11-12", "2026-11-16", "2026-11-17"]'::jsonb,
  '["10:00 - 12:00", "14:00 - 16:00", "19:00 - 21:00"]'::jsonb,
  '["วิเคราะห์โจทย์ธุรกิจและเลือกสถาปัตยกรรม AI Agent ที่เหมาะสม", "สร้าง Autonomous Workflow เชื่อมต่อ ChatGPT, Claude และ Grok", "Automated Content & Research Pipelines", "การตั้งค่า Custom Knowledge Base และ RAG", "Q&A ตอบข้อสงสัยและ Review โค้ด/เวิร์กโฟลว์ของคุณแบบเรียลไทม์"]'::jsonb,
  '["Claude 3.7", "GPT-4o", "n8n", "Notion API", "Grok Bot"]'::jsonb,
  'คอมพิวเตอร์พร้อมอินเทอร์เน็ต และบัญชี AI Tools พื้นฐาน',
  '/assets/creator-workshop.webp',
  true
),
(
  'ai-creator-intensive-online',
  'AI Creator Intensive Workshop (Online Class)',
  'คลาสออนไลน์กลุ่มเล็ก เทคนิคสร้างวิดีโอและคอนเทนต์ไวรัลด้วย AI ยุคใหม่',
  'เรียนรู้ทุกกระบวนการตั้งแต่การ Generate Script, พากย์เสียงด้วย AI Voice Clone, ทำภาพประกอบ และตัดต่อจนเสร็จสมบูรณ์ พร้อมแนวทางการสร้างตัวตนบน Social Media',
  'online',
  990.00,
  150,
  'Google Meet / Zoom (Online Interactive)',
  'https://meet.google.com/creators-kevin-live',
  10,
  '["2026-11-07", "2026-11-14", "2026-11-21", "2026-11-28"]'::jsonb,
  '["14:00 - 16:30", "19:00 - 21:30"]'::jsonb,
  '["Creative Prompt Engineering สำหรับคอนเทนต์ภาษาไทย", "Text-to-Video & Image-to-Video Best Practices", "Voice Cloning & Video Localization", "สร้าง Content Machine ที่ผลิตสื่อได้อย่างต่อเนื่อง"]'::jsonb,
  '["ChatGPT", "Midjourney / Flux", "ElevenLabs", "CapCut AI"]'::jsonb,
  'คอมพิวเตอร์หรือแท็บเล็ตสำหรับเข้าร่วมห้องเรียนออนไลน์',
  '/assets/creator-workshop.webp',
  false
)
ON CONFLICT (id) DO NOTHING;
