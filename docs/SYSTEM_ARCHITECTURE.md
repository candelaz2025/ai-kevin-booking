# สถาปัตยกรรมระบบ (System Architecture)
## AI Kevin Workshop & Private 1-on-1 Booking System

เอกสารนี้อธิบายโครงสร้างทางสถาปัตยกรรม (Architecture) แพลตฟอร์มการจองคอร์สเรียน อบรม AI สตูดิโอ และระบบประเมินผลหลังเรียน (CMS Booking System)

---

## 1. ภาพรวมระบบ (System Overview)

ระบบถูกออกแบบมาเป็น **Full-Stack Serverless Web Application** บน Next.js 16 App Router ร่วมกับ Supabase PostgreSQL ทำงานร่วมกับระบบชำระเงิน Thai QR PromptPay, ระบบจัดการปฏิทินคลาสเรียน, ระบบประเมินหลังเรียน และระบบแจ้งเตือนทางอีเมลอัตโนมัติ

```mermaid
flowchart TD
    subgraph Client ["Client Layer (Browser)"]
        User["นักเรียน (Student / User)"]
        Admin["ผู้ดูแลระบบ (Admin CMS)"]
    end

    subgraph AppServer ["Application Layer (Next.js 16 App Router)"]
        Landing["Landing Page / Articles / Prompts"]
        BookingFlow["ระบบจอง & ตรวจสอบปฏิทิน"]
        PaymentUI["Thai QR PromptPay Voucher"]
        StudentDash["Student Dashboard & Quiz Evaluation"]
        AdminCMS["Admin Control Center (CRUD & Analytics)"]
        API["Next.js Route Handlers (/api/*)"]
    end

    subgraph Services ["External & Cloud Services"]
        Supabase[("Supabase PostgreSQL Database & RLS")]
        SMTP["Google SMTP / Nodemailer Service"]
        VercelEdge["Vercel Production Edge & Serverless"]
    end

    User --> Landing
    User --> BookingFlow
    User --> PaymentUI
    User --> StudentDash
    Admin --> AdminCMS

    Landing --> API
    BookingFlow --> API
    PaymentUI --> API
    StudentDash --> API
    AdminCMS --> API

    API --> Supabase
    API --> SMTP
    AppServer -.-> VercelEdge
```

---

## 2. เทคโนโลยีที่ใช้ (Tech Stack)

| ส่วนประกอบ | เทคโนโลยี | รายละเอียด |
| :--- | :--- | :--- |
| **Framework** | Next.js 16 (App Router) | Server Components, Turbopack, Dynamic Route Handlers |
| **UI Library** | React 19 + TypeScript 5 | Modern React Hooks, Concurrent Features, Strict Typing |
| **Styling** | Tailwind CSS v4 | CSS Variables, Dark/Modern Theme, Responsive Utility Classes |
| **Icons & Effects** | Lucide React + Canvas Confetti | Modern iconography & Celebration animation |
| **Database** | Supabase (PostgreSQL 15+) | Cloud Relational Database, Row Level Security (RLS) |
| **ORM / Client** | `@supabase/supabase-js` + SSR | Client-side & Server-side safe Supabase querying |
| **Email Service** | Nodemailer + Google SMTP | ส่งอีเมลแจ้งเตือนการจอง รหัสผ่าน และผลการประเมิน |
| **Deployment** | Vercel Serverless | Auto CI/CD, Edge CDN, Global Serverless Lambdas |

---

## 3. สถาปัตยกรรมความต่อเนื่องของข้อมูล (Data Resilience Architecture)

ระบบมีกลไกป้องกันการหยุดทำงานแบบ 2 ชั้น (**Two-Tier Data Resilience**):

1. **Primary Layer (Supabase PostgreSQL):**
   - บันทึกและดึงข้อมูลแบบ Real-time ข้ามอุปกรณ์และเครื่องของแอดมิน/นักเรียน
   - มี Row Level Security (RLS) ควบคุมความปลอดภัย
2. **Fallback Memory Store (Zero-Downtime Fallback):**
   - ในกรณีที่ Supabase Credential ยังไม่ได้ตั้งค่าหรือเครือข่ายมีปัญหา ระบบจะสลับไปใช้ In-Memory Store อัตโนมัติ ทำให้ผู้ใช้ยังสามารถทดสอบ UI, จองคลาส หรือทดลองทำแบบประเมินได้โดยไม่เกิดข้อผิดพลาด 500

---

## 4. แผนผังเส้นทางการทำงานของผู้ใช้ (User Flows)

### 4.1 การจองคลาสเรียน (Booking Journey)
```mermaid
sequenceDiagram
    autonumber
    actor Student as นักเรียน
    participant Web as เว็บไซต์ /booking
    participant API as /api/bookings
    participant DB as Supabase DB
    participant Mail as Nodemailer SMTP
    actor Admin as อาจารย์ / แอดมิน

    Student->>Web: เลือกคอร์สเรียน (Class)
    Web->>Web: ตรวจสอบวันและเวลาที่เปิดสอน (Lock วันที่ไม่เปิด)
    Student->>Web: กรอกข้อมูลผู้เรียน (ชื่อ, อีเมล, เบอร์โทร, Line)
    Student->>Web: ชำระเงินผ่าน Thai QR PromptPay Voucher
    Student->>Web: อัปโหลดสลิปการโอนเงิน (Image Slip)
    Student->>API: ส่งข้อมูล Booking (POST /api/bookings)
    API->>DB: บันทึกลงตาราง bookings (status: pending_payment)
    API->>Mail: ส่งอีเมลแจ้งเตือนแอดมินว่ามีรายการจองใหม่
    API->>Student: ยืนยันการส่งข้อมูลสำเร็จ พร้อม Booking ID
    Admin->>API: ตรวจสอบสลิป & อนุมัติการจอง (PUT /api/bookings/[id])
    API->>DB: อัปเดตสถานะเป็น confirmed
    API->>Mail: ส่งอีเมลแจ้งยืนยันพร้อมลิงก์ Google Meet และเอกสารให้นักเรียน
```

### 4.2 ระบบประเมินและแบบทดสอบหลังเรียน (Quiz Evaluation Flow)
```mermaid
sequenceDiagram
    autonumber
    actor Student as นักเรียน
    participant Dash as Student Dashboard
    participant API as /api/quizzes/submit
    participant DB as Supabase DB
    participant Mail as Nodemailer SMTP

    Student->>Dash: เข้าสู่เมนู "แบบประเมิน & ทดสอบหลังเรียน"
    Dash->>Dash: แสดงข้อสอบ 10 ข้อพร้อมตัวเลือก 4 ช้อยส์ (A, B, C, D)
    Student->>Dash: เลือกคำตอบครบทุกข้อ และกดยืนยันส่งผลสอบ
    Dash->>API: POST /api/quizzes/submit (answers, userEmail, quizId)
    API->>API: ตรวจเทียบคำตอบกับ Answer Key ในระบบ
    API->>API: คำนวณเปอร์เซ็นต์คะแนน (ผ่านเกณฑ์ >= 70%)
    API->>DB: บันทึกข้อมูลลงตาราง quiz_submissions
    API->>Mail: ส่งอีเมลสรุปผลการประเมิน พร้อมรายละเอียดคะแนนไปยังผู้เรียน
    API->>Dash: ส่งผลลัพธ์กลับมาแสดงผลทันที (Trigger Confetti หากสอบผ่าน)
```

---

## 5. ความปลอดภัยและสิทธิ์การเข้าถึง (Security & Access Control)

1. **Authentication:**
   - รองรับการเข้าสู่ระบบด้วย Email/Password พร้อมตรวจสอบความปลอดภัยของรหัสผ่าน (ขั้นต่ำ 8 ตัวอักษร มีทั้งตัวอักษรและตัวเลข)
   - รองรับการเชื่อมต่อ Google OAuth
   - ระบบ Forgot Password พร้อมส่งรหัสผ่านชั่วคราวผ่านอีเมล
2. **Role-Based Access Control (RBAC):**
   - ผู้ใช้มี 2 บทบาท: `user` (นักเรียนทั่วไป) และ `admin` (ผู้ดูแลระบบ)
   - หน้า `/admin` ตรวจสอบสถานะบทบาทจาก Auth Token และ User Context หากไม่ใช่แอดมินจะถูกปฏิเสธการเข้าถึง
3. **Data Sanitization & Anti-Spam:**
   - มีการตรวจสอบความถี่ของการส่งคำขอ (Debounce & Rate Limiting)
   - ป้องกันการกดยืนยันการจองซ้ำซ้อน (Deduplication Check)
