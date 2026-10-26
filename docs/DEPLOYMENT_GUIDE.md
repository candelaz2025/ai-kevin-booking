# คู่มือการติดตั้งและการดีพลอย (Deployment & Setup Guide)
## Vercel Production & Supabase Setup

เอกสารนี้รวบรวมขั้นตอนการติดตั้งระบบบนเครื่อง Local Development และการนำขึ้น Production บน Vercel พร้อมฐานข้อมูล Supabase

---

## 1. ข้อกำหนดของระบบ (Prerequisites)

- **Node.js:** เวอร์ชั่น 18.18 ขึ้นไป (แนะนำ Node.js 20 LTS)
- **Package Manager:** `npm`, `yarn`, หรือ `pnpm`
- **Database:** Supabase Project (PostgreSQL)
- **Deployment Platform:** Vercel Account

---

## 2. การติดตั้งบนเครื่องพัฒนา (Local Development)

```bash
# 1. Clone หรือเปิดโฟลเดอร์โปรเจกต์
cd "CMS Booking "

# 2. ติดตั้ง Dependencies
npm install

# 3. คัดลอกไฟล์ Environment Variables
cp .env.example .env.local

# 4. รันระบบเซิร์ฟเวอร์จำลองสำหรับนักพัฒนา
npm run dev
```

เปิดเบราว์เซอร์ไปที่: `http://localhost:3000`

---

## 3. รายการตัวแปรสภาพแวดล้อม (Environment Variables Checklist)

สร้างไฟล์ `.env.local` สำหรับ Local หรือใส่ใน Environment Variables บน Vercel:

```env
# -------------------------------------------------------------
# 1. SUPABASE DATABASE CONFIGURATION
# -------------------------------------------------------------
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI...

# -------------------------------------------------------------
# 2. EMAIL & GOOGLE SMTP CONFIGURATION
# -------------------------------------------------------------
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your_email@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx
EMAIL_FROM="อ. Kevin AI Studio <your_email@gmail.com>"

# -------------------------------------------------------------
# 3. BASE URL
# -------------------------------------------------------------
NEXT_PUBLIC_SITE_URL=https://ai-kevin-booking.vercel.app
```

---

## 4. การติดตั้งฐานข้อมูล Supabase (Database Initialization)

1. เข้าสู่แดชบอร์ดของ Supabase: [supabase.com](https://supabase.com)
2. ไปที่เมนู **SQL Editor**
3. คัดลอกเนื้อหาจากไฟล์ `supabase-schema.sql` ในโปรเจกต์
4. นำไปวางใน SQL Editor แล้วกดปุ่ม **RUN**
5. ตรวจสอบที่เมนู **Table Editor** จะพบตารางทั้งหมด:
   - `classes`
   - `bookings`
   - `users`
   - `quizzes`
   - `quiz_submissions`
   - `site_settings`
   - `email_logs`
   - `system_notifications`

---

## 5. การสร้างและทดสอบ Build (Production Build Test)

ก่อนดีพลอยขึ้น Production ควรทดสอบคอมไพล์โค้ดในเครื่อง:

```bash
npm run build
```

ผลลัพธ์ควรแสดงสถานะ `Compiled successfully` โดยไม่มีข้อผิดพลาดทาง TypeScript หรือ Lint

---

## 6. การดีพลอยขึ้น Vercel (Deploying to Vercel)

### วิธีที่ 1: ผ่าน Vercel CLI (เร็วที่สุด)
```bash
# ติดตั้ง Vercel CLI หากยังไม่มี
npm i -g vercel

# ดีพลอยขึ้น Production
vercel --prod
```

### วิธีที่ 2: ผ่าน GitHub Integration
1. Push โค้ดทั้งหมดขึ้น GitHub Repository:
   ```bash
   git add .
   git commit -m "feat: complete cms booking system"
   git push origin main
   ```
2. ใน Vercel Dashboard เลือก **"Import Project"** จาก GitHub
3. ตั้งค่า **Environment Variables** ให้ครบถ้วนตามรายการในข้อ 3
4. คลิก **"Deploy"** ระบบจะทำการ Build และเปิดใช้งานให้ทันที
