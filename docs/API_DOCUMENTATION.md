# คู่มือการใช้งาน API (API Documentation)
## Next.js App Router REST API Endpoints

เอกสารระบุรายละเอียด Endpoint ทั้งหมด พารามิเตอร์ Request Payload รูปแบบ Response และตัวอย่างการเรียกใช้งาน

---

## สารบัญ API (API Index)

1. [Authentication & Account API](#1-authentication--account-api)
   - `POST /api/auth` (เข้าสู่ระบบ & ลงทะเบียน)
   - `POST /api/auth/forgot-password` (ขอรหัสผ่านชั่วคราว)
2. [Classes & Courses API](#2-classes--courses-api)
   - `GET /api/classes` (ดึงรายการคลาสทั้งหมด)
   - `POST /api/classes` (สร้างคลาสใหม่)
   - `GET /api/classes/[id]` (ดึงข้อมูลคลาสตาม ID)
   - `PUT /api/classes/[id]` (แก้ไขข้อมูลคลาส)
   - `DELETE /api/classes/[id]` (ลบคลาส)
3. [Bookings API](#3-bookings-api)
   - `GET /api/bookings` (ดึงรายการจอง)
   - `POST /api/bookings` (สร้างการจองใหม่)
   - `GET /api/bookings/[id]` (ดึงข้อมูลการจอง)
   - `PUT /api/bookings/[id]` (อัปเดตสถานะการจอง / อนุมัติ / สลิป)
   - `DELETE /api/bookings/[id]` (ลบรายการจอง)
4. [Quizzes & Assessment API](#4-quizzes--assessment-api)
   - `GET /api/quizzes` (ดึงชุดแบบทดสอบ)
   - `POST /api/quizzes/submit` (ส่งผลสอบ & ส่งอีเมลแจ้งเตือน)
   - `POST /api/admin/quizzes` (Admin สร้าง/แก้ไขแบบประเมิน)
   - `POST /api/admin/quizzes/resend-email` (Admin สั่งส่งอีเมลผลสอบซ้ำ)
5. [Admin Management API](#5-admin-management-api)
   - `GET /api/admin/users` (ดึงรายชื่อนักเรียนทั้งหมด)
   - `PATCH /api/admin/users` (แก้ไขสถานะหรือรีเซ็ตรหัสผ่านนักเรียน)
   - `GET /api/admin/calendar` (ดึงตารางสอนและรอบเรียนทั้งหมด)
   - `POST /api/admin/emails` (ทดสอบส่งอีเมลจากแอดมิน)
6. [Site Settings & Upload API](#6-site-settings--upload-api)
   - `GET /api/site-settings` (ดึงการตั้งค่าเว็บ & PromptPay)
   - `POST /api/site-settings` (บันทึกการตั้งค่าเว็บ)
   - `POST /api/upload` (อัปโหลดรูปภาพ / สลิปโอนเงิน)

---

## 1. Authentication & Account API

### `POST /api/auth`
เข้าสู่ระบบหรือลงทะเบียนผู้ใช้งานใหม่
- **Request Body (Login):**
  ```json
  {
    "action": "login",
    "email": "student@example.com",
    "password": "Password123"
  }
  ```
- **Request Body (Register):**
  ```json
  {
    "action": "register",
    "name": "สมชาย ใจดี",
    "email": "student@example.com",
    "password": "Password123",
    "phone": "0812345678"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "user": {
      "id": "usr-123456",
      "name": "สมชาย ใจดี",
      "email": "student@example.com",
      "role": "user"
    }
  }
  ```

### `POST /api/auth/forgot-password`
ขอรหัสผ่านชั่วคราวผ่านอีเมล
- **Request Body:**
  ```json
  {
    "action": "request",
    "email": "student@example.com"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "ส่งรหัสผ่านใหม่ไปยังอีเมลของคุณเรียบร้อยแล้ว",
    "emailStatus": "sent"
  }
  ```

---

## 2. Classes & Courses API

### `GET /api/classes`
ดึงรายการคอร์สเรียนทั้งหมด
- **Response (200 OK):** Array ของ `ClassItem`

### `POST /api/classes`
สร้างคอร์สใหม่ (Admin Only)
- **Request Body:**
  ```json
  {
    "title": "Mastering LangGraph & Multi-Agent Systems",
    "subtitle": "คอร์สเจาะลึกการสร้าง Autonomous AI Agents",
    "description": "รายละเอียดหลักสูตร...",
    "type": "online",
    "price": 3500,
    "durationMinutes": 180,
    "maxSeats": 15,
    "availableDates": ["2026-11-20", "2026-11-27"],
    "timeSlots": ["13:00 - 16:00"],
    "topics": ["LangGraph State Machine", "Memory Systems"],
    "toolsUsed": ["LangChain", "Claude 3.7", "Python"],
    "attachments": [
      {
        "id": "att-1",
        "name": "Syllabus.pdf",
        "type": "pdf",
        "url": "https://...",
        "size": "2.4 MB"
      }
    ]
  }
  ```

---

## 3. Bookings API

### `POST /api/bookings`
สร้างการจองคอร์สใหม่
- **Request Body:**
  ```json
  {
    "classId": "ai-content-workshop",
    "classTitle": "AI Content Workshop",
    "classType": "onsite",
    "date": "2026-11-01",
    "timeSlot": "13:00 - 16:00",
    "userName": "กิตติพงษ์ รักเรียน",
    "userEmail": "student@test.com",
    "userPhone": "0891234567",
    "lineId": "student_line",
    "amount": 499,
    "paymentMethod": "promptpay_qr",
    "slipUrl": "data:image/png;base64,..."
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "booking": {
      "id": "BKG-1729012345",
      "bookingStatus": "pending_payment",
      "paymentStatus": "pending"
    }
  }
  ```

### `PUT /api/bookings/[id]`
อัปเดตสถานะการจอง (อนุมัติ, ปฏิเสธ, หรือส่งลิงก์ห้องเรียน)
- **Request Body (Approve Booking):**
  ```json
  {
    "bookingStatus": "confirmed",
    "paymentStatus": "verified",
    "onlineMeetingUrl": "https://meet.google.com/abc-defg-hij",
    "approvalMessage": "ยินดีต้อนรับเข้าสู่คลาสเรียน เตรียมโปรแกรมให้พร้อมแล้วพบกันครับ"
  }
  ```

### `DELETE /api/bookings/[id]`
ลบรายการจองออกจากระบบ (Admin Only)
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "ลบรายการจองเรียบร้อยแล้ว"
  }
  ```

---

## 4. Quizzes & Assessment API

### `GET /api/quizzes`
ดึงชุดแบบประเมินและแบบทดสอบสำหรับนักเรียน
- **Query Params:** `?classId=xxx` (เลือกชุดข้อสอบตามคลาสได้)
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "quiz": {
      "id": "quiz-master-eval",
      "title": "แบบประเมินและทดสอบความรู้หลังเรียน (AI Masterclass)",
      "passingScorePercent": 70,
      "questions": [
        {
          "id": "q1",
          "question": "Prompt รูปแบบใดที่ช่วยลด Hallucination ได้ดีที่สุด?",
          "options": ["Zero-shot", "Chain of Thought", "No instructions", "Random"],
          "correctOptionIndex": 1
        }
      ]
    }
  }
  ```

### `POST /api/quizzes/submit`
ส่งคำตอบแบบทดสอบ คำนวณคะแนน และส่งผลลัพธ์ไปยังอีเมลของผู้เรียน
- **Request Body:**
  ```json
  {
    "quizId": "quiz-master-eval",
    "userId": "usr-123",
    "userName": "สมชาย ใจดี",
    "userEmail": "student@test.com",
    "answers": [1, 2, 0, 3, 1, 0, 2, 1, 3, 0]
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "result": {
      "score": 9,
      "totalQuestions": 10,
      "scorePercent": 90,
      "passed": true,
      "emailSent": true
    }
  }
  ```

---

## 5. Site Settings API

### `GET /api/site-settings`
ดึงข้อมูลการตั้งค่าเว็บไซต์และตัวเลือกการชำระเงิน
- **Response (200 OK):**
  ```json
  {
    "siteTitle": "AI Kevin Workshop & Booking",
    "brandName": "AI Kevin",
    "promptpayAccountName": "กวิน จิตต์สมบัติ",
    "showAccountName": true,
    "promptpayNumber": "081-234-5678",
    "showPromptpayNumber": true,
    "showBankTransferDetails": true
  }
  ```

### `POST /api/site-settings`
บันทึกการตั้งค่าเว็บไซต์ (Admin Only)
- **Request Body:** รับ `SiteSettings` payload ทั้งหมดเพื่ออัปเดตแบบ Real-time
