# AI Kevin Workshop & Private 1-on-1 Booking Platform

> ระบบจัดการการจองคอร์สเรียน AI เวิร์กช็อป ปฏิทินรอบเรียน ระบบชำระเงิน Thai QR PromptPay และระบบประเมินผล/แบบทดสอบความรู้หลังเรียน พร้อมส่งผลคะแนนผ่านอีเมลอัตโนมัติ

[![Next.js 16](https://img.shields.io/badge/Next.js-16.4.0-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.3.0-blue?style=flat&logo=react)](https://react.dev/)
[![Tailwind CSS 4](https://img.shields.io/badge/TailwindCSS-v4-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Database-Supabase-3ECF8E?style=flat&logo=supabase)](https://supabase.com/)
[![Production Status](https://img.shields.io/badge/Deploy-Production%20Active-success)](https://ai-kevin-booking.vercel.app)

🌐 **Production URL:** [ai-kevin-booking.vercel.app](https://ai-kevin-booking.vercel.app)

---

## 🌟 จุดเด่นและฟังก์ชันสำคัญ (Key Features)

### 1. ระบบจองคอร์สและปฏิทินอัจฉริยะ (Smart Booking & Calendar)
- **Class Date Auto-Lock:** เมื่อผู้เรียนเลือกคลาส ระบบจะล็อกปฏิทินให้คลิกเลือกได้เฉพาะวันที่และรอบเวลาที่คลาสนั้นเปิดสอน ป้องกันการเลือกวันผิดพลาด
- **Multi-Format Courses:** รองรับทั้งคลาส Onsite Workshop (จำกัด 20 ที่นั่ง) และ Private 1-on-1 Online (Google Meet)
- **Course Attachments:** ผู้สอนสามารถแนบเอกสาร PDF, สไลด์, และวิดีโอประกอบการเรียนได้สูงสุด 4 รายการต่อคลาส

### 2. บัตรชำระเงินมาตรฐาน Fintech (Thai QR PromptPay Voucher)
- **Official PromptPay Proportions:** การ์ดชำระเงินดีไซน์สัดส่วนมาตรฐาน พร้อมกรอบสแกน 4 มุม
- **Instant Actions:** ปุ่มดาวน์โหลด QR Code ลงเครื่อง และปุ่มคัดลอกเบอร์พร้อมเพย์ / เลขบัญชีธนาคาร
- **Admin CMS Visibility Toggles:** แอดมินสามารถเปิด/ปิดการแสดงผลชื่อบัญชี, หมายเลขพร้อมเพย์ และรายละเอียดธนาคารได้แบบเรียลไทม์ พร้อม Live Preview

### 3. ระบบประเมินและแบบทดสอบหลังเรียน (Student Evaluation & Quiz)
- **10-Question Assessment:** แบบทดสอบ 10 ข้อ ช้อยส์ 4 ตัวเลือก (A, B, C, D) ในหน้าแดชบอร์ดนักเรียน
- **Instant Grading & Confetti:** ตรวจและคิดคะแนนทันที พร้อมอนิเมชั่นพลุฉลองเมื่อผ่านเกณฑ์ (>= 70%)
- **Automated Email Report:** ส่งอีเมลรายงานสรุปผลการประเมินและคะแนนสอบไปยังอีเมลของนักเรียนโดยอัตโนมัติ
- **Admin Quiz Management:** แอดมินสามารถสร้าง แก้ไข กำหนดเฉลย และกดส่งอีเมลผลสอบซ้ำได้ตลอดเวลา

### 4. ระบบจัดการผู้ดูแลระบบ (Admin CMS Control Center)
- **Booking Operations:** ตรวจสอบสลิป, อนุมัติการจองพร้อมแนบลิงก์ Google Meet, ปฏิเสธ, หรือลบรายการจอง (Delete Booking)
- **Student Management:** ตรวจสอบรายชื่อนักเรียนและสั่งรีเซ็ตรหัสผ่านส่งทางอีเมลได้ในคลิกเดียว
- **Site CMS Customization:** ปรับแต่งเนื้อหา แบนเนอร์ ข้อมูลผู้สอน สถานที่จัดงาน และแบรนด์ดิ้งทั่วทั้งเว็บ

### 5. ระบบอีเมลและการแจ้งเตือน (Email Notification Engine)
- ทำงานผ่าน Google SMTP (Nodemailer) หรือ Resend
- เทมเพลตอีเมล HTML ดีไซน์สวยงามระดับมืออาชีพ
- มีระบบบันทึกประวัติการส่งอีเมล (`email_logs`) ตรวจสอบย้อนหลังได้ตลอดเวลา

---

## 📚 เอกสารประกอบระบบทั้งหมด (Documentation Index)

คู่มือและเอกสารเชิงเทคนิคฉบับสมบูรณ์ถูกจัดเก็บไว้ในโฟลเดอร์ `docs/`:

| เอกสาร | หัวข้อ | คำอธิบาย |
| :--- | :--- | :--- |
| 📋 [SYSTEM_PRD.md](./docs/SYSTEM_PRD.md) | **Product Requirements & Skill PRD** | ข้อกำหนดระบบฉบับสมบูรณ์ User Personas, Database, APIs, Business Rules |
| 📖 [SYSTEM_ARCHITECTURE.md](./docs/SYSTEM_ARCHITECTURE.md) | **สถาปัตยกรรมระบบ** | โครงสร้าง Serverless, Data Resilience 2 ชั้น, แผนผัง Flowchart |
| 🗄️ [DATABASE_SCHEMA.md](./docs/DATABASE_SCHEMA.md) | **โครงสร้างฐานข้อมูล** | ตารางทั้งหมดใน Supabase, Data Types, Constraints และนโยบาย RLS |
| 🔌 [API_DOCUMENTATION.md](./docs/API_DOCUMENTATION.md) | **คู่มือ REST API** | Endpoints ทั้งหมด พารามิเตอร์ Request Payload และตัวอย่าง Response |
| 👑 [ADMIN_MANUAL.md](./docs/ADMIN_MANUAL.md) | **คู่มือผู้ดูแลระบบ (CMS)** | การจัดการคลาส, ปฏิทิน, สลิปโอนเงิน, สร้างข้อสอบ 10 ข้อ และตั้งค่าเว็บ |
| 🎓 [STUDENT_USER_GUIDE.md](./docs/STUDENT_USER_GUIDE.md) | **คู่มือนักเรียน** | ขั้นตอนสมัครสมาชิก, จองคอร์ส, ชำระเงิน, ทำแบบทดสอบ และรับแต้ม |
| 📝 [POST_CLASS_QUIZ_SYSTEM.md](./docs/POST_CLASS_QUIZ_SYSTEM.md) | **ระบบแบบประเมินผล** | รายละเอียดเกณฑ์คะแนน, การส่งผลตรวจอัตโนมัติ, และการส่งอีเมลผลสอบ |
| 💳 [PAYMENT_PROMPTPAY_SYSTEM.md](./docs/PAYMENT_PROMPTPAY_SYSTEM.md) | **ระบบชำระเงิน PromptPay** | สัดส่วนบัตร Voucher, ปุ่มคัดลอก, สวิตช์ซ่อน/แสดงชื่อ, และการตรวจสลิป |
| 📧 [EMAIL_NOTIFICATION_SYSTEM.md](./docs/EMAIL_NOTIFICATION_SYSTEM.md) | **ระบบแจ้งเตือนทางอีเมล** | การตั้งค่า Google SMTP, เทมเพลต HTML และการ Audit ผ่าน email_logs |
| 🚀 [DEPLOYMENT_GUIDE.md](./docs/DEPLOYMENT_GUIDE.md) | **คู่มือการติดตั้งและดีพลอย** | ติดตั้ง Local, รัน SQL บน Supabase, ตั้งค่า Env และดีพลอยขึ้น Vercel |

---

## 🛠️ โครงสร้างโฟลเดอร์โปรเจกต์ (Project Structure)

```
.
├── docs/                             # เอกสารคู่มือระบบทั้งหมด (.md)
│   ├── ADMIN_MANUAL.md               # คู่มือการใช้งานสำหรับแอดมิน
│   ├── API_DOCUMENTATION.md          # รายละเอียด REST API Endpoints
│   ├── DATABASE_SCHEMA.md            # โครงสร้างตารางและนโยบาย RLS Supabase
│   ├── DEPLOYMENT_GUIDE.md           # ขั้นตอนการติดตั้งและดีพลอยขึ้น Vercel
│   ├── EMAIL_NOTIFICATION_SYSTEM.md  # ระบบส่งอีเมลแจ้งเตือน
│   ├── PAYMENT_PROMPTPAY_SYSTEM.md   # ระบบชำระเงินและสวิตช์ซ่อนแสดง PromptPay
│   ├── POST_CLASS_QUIZ_SYSTEM.md     # ระบบประเมินและแบบทดสอบหลังเรียน 10 ข้อ
│   ├── STUDENT_USER_GUIDE.md         # คู่มือสำหรับนักเรียน
│   └── SYSTEM_ARCHITECTURE.md        # สถาปัตยกรรมระบบโดยรวม
├── public/                           # ไฟล์ภาพและ Static Assets
│   └── assets/                       # โลโก้แบรนด์ 3D Mascot และภาพประกอบ
├── src/
│   ├── app/                          # Next.js 16 App Router Pages & APIs
│   │   ├── admin/                    # หน้า Admin Control Center
│   │   ├── api/                      # Backend API Route Handlers
│   │   ├── booking/                  # หน้าจองคลาสเรียนและชำระเงิน
│   │   ├── dashboard/                # หน้าแดชบอร์ดนักเรียน & แบบทดสอบ Quiz
│   │   ├── login/                    # หน้าเข้าสู่ระบบและสมัครสมาชิก
│   │   └── page.tsx                  # Landing Page หน้าแรก
│   ├── components/                   # UI Components (Calendar, Payment, Nav, Footer)
│   └── lib/                          # Data Store, Email Engine, Supabase, Types
├── supabase-schema.sql               # โค้ด SQL สำหรับสร้างฐานข้อมูล Supabase
├── package.json                      # รายการ Dependencies และ Scripts
└── README.md                         # ดัชนีหลักของระบบ
```

---

## 🚀 เริ่มต้นใช้งานอย่างรวดเร็ว (Quick Start)

### 1. ติดตั้ง Dependencies
```bash
npm install
```

### 2. ตั้งค่าไฟล์สภาพแวดล้อม (.env.local)
```bash
cp .env.example .env.local
```

กรอกข้อมูล Supabase URL, Anon Key และรหัสผ่าน Google App Password สำหรับส่งอีเมล

### 3. รันโปรเจกต์สำหรับ Development
```bash
npm run dev
```

เปิด [http://localhost:3000](http://localhost:3000) บนเบราว์เซอร์

### 4. บิลด์สำหรับ Production
```bash
npm run build
```

---

## 🔐 บัญชีเข้าสู่ระบบเริ่มต้น (Default Accounts)

- **ผู้ดูแลระบบ (Admin Portal):**
  - **Email:** `admin@kevin-booking.com`
  - **Password:** `Admin@Kevin2026`
- **ผู้ใช้งานทดสอบ (Student Account):**
  - **Email:** `student@example.com`
  - **Password:** `Student@Kevin2026`

---

## 📄 ใบอนุญาต (License)

สงวนลิขสิทธิ์ © 2026 **อ. Kevin AI Studio**. All Rights Reserved.
