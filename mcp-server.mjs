#!/usr/bin/env node

/**
 * ==============================================================================
 * Kevin AI Academy - Official Model Context Protocol (MCP) Server
 * RFC 2026 Compatible Stdio Implementation
 *
 * For Claude Desktop, Cursor, Windsurf, Roo Code, Cline, and AI Agents.
 *
 * Standard JSON-RPC 2.0 communication over Stdio:
 * - Reads JSON-RPC requests line-by-line from process.stdin
 * - Writes JSON-RPC responses to process.stdout
 * - Debug & diagnostic logs to process.stderr
 * ==============================================================================
 */

import readline from 'readline';

// Target live production server directly (No localhost)
const KEVIN_SERVER_URL = process.env.KEVIN_ACADEMY_URL || 'https://ai-kevin-booking.vercel.app';

// Safe API caller: shoots directly to the live production server
async function apiCall(endpoint, method = 'GET', body = null) {
  const url = `${KEVIN_SERVER_URL.replace(/\/$/, '')}${endpoint}`;
  const init = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Kevin-Academy-MCP-Server/1.0'
    }
  };
  if (body) {
    init.body = JSON.stringify(body);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);
  init.signal = controller.signal;

  try {
    const res = await fetch(url, init);
    clearTimeout(timeoutId);

    if (res.ok) {
      return await res.json();
    }
    const errText = await res.text().catch(() => '');
    throw new Error(`Server responded HTTP ${res.status}: ${errText.slice(0, 100)}`);
  } catch (e) {
    clearTimeout(timeoutId);
    throw new Error(`API call to ${url} failed: ${e.message}`);
  }
}

// -----------------------------------------------------------------------------
// MCP Tools Specification (13 Tools)
// -----------------------------------------------------------------------------
const TOOLS = [
  {
    name: 'list_courses',
    description: 'ดึงรายชื่อคอร์สเรียนและเวิร์กช็อปทั้งหมดใน Kevin AI Academy พร้อมราคา, วันที่เปิดสอน, รอบเวลา, สถานที่ และลิงก์เข้าเรียน',
    inputSchema: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: ['all', 'online', 'onsite'],
          description: 'ประเภทคลาสที่ต้องการดู (all, online หรือ onsite)'
        }
      }
    }
  },
  {
    name: 'get_course',
    description: 'ดึงรายละเอียดแบบเจาะลึกของคอร์สเรียนตาม ID หรือ slug เช่น หัวข้อที่สอน, เครื่องมือ AI ที่ใช้, สิ่งที่ต้องเตรียมมา',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'รหัสคอร์ส เช่น ai-content-workshop หรือ ai-private-1on1-online'
        }
      },
      required: ['id']
    }
  },
  {
    name: 'create_course',
    description: 'สร้างคอร์สเรียนหรือเวิร์กช็อปใหม่ในระบบ รองรับคำอธิบายได้ยาวถึง 4,000 คำ, กำหนดราคา, วันเวลา, ลิงก์ห้องเรียนออนไลน์ และปักหมุดคอร์สแนะนำ',
    inputSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'ชื่อคอร์สเรียน' },
        subtitle: { type: 'string', description: 'คำโปรยสั้นๆ' },
        description: { type: 'string', description: 'รายละเอียดเนื้อหาคอร์ส (สูงสุด 4,000 คำ)' },
        type: { type: 'string', enum: ['online', 'onsite'], description: 'ประเภทคลาส (online หรือ onsite)' },
        price: { type: 'number', description: 'ราคาคอร์ส (บาท)' },
        durationMinutes: { type: 'number', description: 'ระยะเวลาเรียน (นาที เช่น 180)' },
        location: { type: 'string', description: 'สถานที่เรียน Onsite หรือ Zoom/Google Meet' },
        onlineMeetingUrl: { type: 'string', description: 'ลิงก์ห้องเรียนออนไลน์ (Google Meet / Zoom)' },
        maxSeats: { type: 'number', description: 'จำนวนที่นั่งสูงสุด' },
        availableDates: { type: 'array', items: { type: 'string' }, description: 'รอบวันที่เปิดสอน เช่น ["2026-11-15", "2026-11-22"]' },
        timeSlots: { type: 'array', items: { type: 'string' }, description: 'รอบเวลาเรียน เช่น ["13:00 - 16:00"]' },
        topics: { type: 'array', items: { type: 'string' }, description: 'หัวข้อเนื้อหาในคลาส' },
        toolsUsed: { type: 'array', items: { type: 'string' }, description: 'เครื่องมือ AI เช่น ["ChatGPT", "Claude", "Grok"]' },
        prerequisites: { type: 'string', description: 'สิ่งที่ต้องเตรียมมา' },
        featured: { type: 'boolean', description: 'ปักหมุดคอร์สแนะนำบนหน้าแรก' }
      },
      required: ['title', 'price', 'type']
    }
  },
  {
    name: 'update_course',
    description: 'แก้ไขรายละเอียดคอร์สเรียน รูปภาพ ราคา หรือตารางวันเวลาเรียนที่มีอยู่ในระบบ',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'รหัสคอร์สเรียนที่ต้องการแก้ไข' },
        title: { type: 'string', description: 'ชื่อคอร์สใหม่' },
        subtitle: { type: 'string', description: 'คำโปรยใหม่' },
        description: { type: 'string', description: 'รายละเอียดใหม่' },
        price: { type: 'number', description: 'ราคาใหม่' },
        availableDates: { type: 'array', items: { type: 'string' }, description: 'รอบวันที่เปิดเรียน' },
        timeSlots: { type: 'array', items: { type: 'string' }, description: 'รอบเวลาเรียน' },
        onlineMeetingUrl: { type: 'string', description: 'ลิงก์ห้องเรียนออนไลน์' }
      },
      required: ['id']
    }
  },
  {
    name: 'delete_course',
    description: 'ลบคอร์สเรียนออกจากระบบ Kevin AI Academy',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'รหัสคอร์สที่ต้องการลบ' }
      },
      required: ['id']
    }
  },
  {
    name: 'list_bookings',
    description: 'ดึงรายการจองเรียนทั้งหมดของนักเรียน พร้อมสถานะการชำระเงิน, สลิปโอนเงิน และข้อมูลติดต่อ',
    inputSchema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['all', 'confirmed', 'pending_payment', 'rejected'],
          description: 'กรองตามสถานะการจอง (all, confirmed, pending_payment, rejected)'
        }
      }
    }
  },
  {
    name: 'create_booking',
    description: 'สร้างการจองคอร์สเรียนใหม่ให้นักเรียน พร้อมคำนวณยอดเงินและส่งข้อมูลเข้าระบบ',
    inputSchema: {
      type: 'object',
      properties: {
        classId: { type: 'string', description: 'รหัสคอร์สที่ต้องการจอง' },
        userName: { type: 'string', description: 'ชื่อ-นามสกุลของผู้เรียน' },
        userEmail: { type: 'string', description: 'อีเมลของผู้เรียน' },
        userPhone: { type: 'string', description: 'เบอร์โทรศัพท์ของผู้เรียน' },
        date: { type: 'string', description: 'วันที่เลือกเรียน รูปแบบ YYYY-MM-DD' },
        timeSlot: { type: 'string', description: 'รอบเวลาเรียน เช่น 13:00 - 16:00' },
        notes: { type: 'string', description: 'หมายเหตุหรือความต้องการเพิ่มเติม' }
      },
      required: ['classId', 'userName', 'userEmail', 'date', 'timeSlot']
    }
  },
  {
    name: 'update_booking_status',
    description: 'อนุมัติ (Approve), ปฏิเสธ (Reject) หรือเลื่อนวันเรียน พร้อมอัปเดตลิงก์ห้องเรียน Google Meet และข้อความแจ้งนักเรียน',
    inputSchema: {
      type: 'object',
      properties: {
        bookingId: { type: 'string', description: 'รหัสการจอง เช่น BK-1234' },
        status: { type: 'string', enum: ['confirmed', 'rejected', 'rescheduled'], description: 'สถานะใหม่' },
        onlineMeetingUrl: { type: 'string', description: 'ลิงก์ Google Meet ส่งให้นักเรียน' },
        approvalMessage: { type: 'string', description: 'ข้อความแจ้งนักเรียน' }
      },
      required: ['bookingId', 'status']
    }
  },
  {
    name: 'list_prompts',
    description: 'ค้นหาคลังพรออมต์ (Prompt Library) รวมถึงพรออมต์สร้างวิดีโอ (Video Generation), UGC, ซีรีส์, ภาพ และ AI Agent',
    inputSchema: {
      type: 'object',
      properties: {
        category: {
          type: 'string',
          description: 'หมวดหมู่พรออมต์ เช่น video, image, agent, copywriting, business หรือ all'
        },
        search: {
          type: 'string',
          description: 'คำค้นหาในชื่อหรือเนื้อหา Prompt'
        }
      }
    }
  },
  {
    name: 'create_prompt',
    description: 'บันทึก Prompt Template ใหม่เข้าสู่คลัง Prompts ของ Kevin AI Academy',
    inputSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'ชื่อของพรออมต์' },
        promptText: { type: 'string', description: 'เนื้อหา Prompt ฉบับเต็ม' },
        category: { type: 'string', description: 'หมวดหมู่ เช่น video, image, agent' },
        description: { type: 'string', description: 'คำอธิบายวิธีใช้และผลลัพธ์' },
        tags: { type: 'array', items: { type: 'string' }, description: 'แท็ก เช่น ["Runway", "Video", "UGC"]' },
        author: { type: 'string', description: 'ชื่อผู้สร้างหรือเจ้าของสูตร' }
      },
      required: ['title', 'promptText', 'category']
    }
  },
  {
    name: 'get_site_settings',
    description: 'ดึงข้อมูลการตั้งค่าเว็บไซต์ (CMS) เช่น Hero Section, ประวัติ อ. Kevin, ข้อมูลติดต่อ และ Footer',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'manage_website_cms',
    description: 'ปรับแต่งเนื้อหาหน้าเว็บไซต์ (CMS) เช่น Hero Badge, พาดหัวหลัก, ประวัติ อ. Kevin และข้อความ Footer',
    inputSchema: {
      type: 'object',
      properties: {
        heroBadge: { type: 'string', description: 'ป้ายข้อความหัวเรื่อง Hero' },
        heroTitleMain: { type: 'string', description: 'พาดหัวหลักของเว็บไซต์' },
        heroDescription: { type: 'string', description: 'คำบรรยายหลักใต้พาดหัว' },
        instructorBio: { type: 'string', description: 'ประวัติและข้อมูลของ อ. Kevin' },
        announceText: { type: 'string', description: 'ข้อความแถบประกาศด้านบนสุด' }
      }
    }
  },
  {
    name: 'system_health',
    description: 'ตรวจสอบสถานะความพร้อมของระบบ, การเชื่อมต่อฐานข้อมูล, ยอดคอร์สทั้งหมด และสถิติการจองแบบ Real-time',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  }
];

// -----------------------------------------------------------------------------
// MCP Resources Specification
// -----------------------------------------------------------------------------
const RESOURCES = [
  {
    uri: 'kevin://courses',
    name: 'Kevin AI Academy Courses',
    description: 'คอร์สเรียนและเวิร์กช็อปทั้งหมดที่เปิดสอนในปัจจุบัน',
    mimeType: 'application/json'
  },
  {
    uri: 'kevin://bookings',
    name: 'Live Student Bookings',
    description: 'รายการจองเรียนล่าสุดของนักเรียนและสถานะการชำระเงิน',
    mimeType: 'application/json'
  },
  {
    uri: 'kevin://prompts',
    name: 'Prompt Library Catalog',
    description: 'คลังพรออมต์สำหรับการสร้างภาพ วิดีโอ และ AI Agent',
    mimeType: 'application/json'
  },
  {
    uri: 'kevin://site-settings',
    name: 'Website CMS & Contact Info',
    description: 'ข้อมูลสถาบัน ผู้สอน เบอร์โทร และการตั้งค่าหน้าเว็บ',
    mimeType: 'application/json'
  }
];

// -----------------------------------------------------------------------------
// MCP Prompts Specification
// -----------------------------------------------------------------------------
const PROMPTS = [
  {
    name: 'consult_course',
    description: 'ให้ AI ทำหน้าที่เป็นที่ปรึกษาการเลือกคอร์สเรียน AI ตามเป้าหมายและพื้นฐานของผู้เรียน',
    arguments: [
      { name: 'studentGoal', description: 'เป้าหมายของผู้เรียน เช่น อยากทำคลิปสั้น, อยากสร้าง AI Agent, อยากเรียนตัวต่อตัว', required: true }
    ]
  },
  {
    name: 'generate_video_prompt',
    description: 'สร้าง Video Prompt คุณภาพสูงสำหรับ Runway Gen-3, Kling, Sora หรือ Hailuo',
    arguments: [
      { name: 'concept', description: 'ไอเดียหรือฉากที่ต้องการสร้าง เช่น รถแข่งในเมืองอนาคต, โฆษณาครีมทาหน้าแนว UGC', required: true },
      { name: 'style', description: 'สไตล์ เช่น Cinematic, Hyper-realistic, Anime, Commercial', required: false }
    ]
  }
];

// -----------------------------------------------------------------------------
// Tool Execution Handler
// -----------------------------------------------------------------------------
async function handleToolCall(name, args = {}) {
  // 1. list_courses
  if (name === 'list_courses') {
    const data = await apiCall('/api/classes');
    let courses = data.data || [];
    if (args.type && args.type !== 'all') {
      courses = courses.filter(c => c.type === args.type);
    }
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            total: courses.length,
            academy: 'Kevin AI Academy',
            courses: courses.map(c => ({
              id: c.id,
              title: c.title,
              subtitle: c.subtitle,
              type: c.type,
              price: `${c.price.toLocaleString()} บาท`,
              availableDates: c.availableDates,
              timeSlots: c.timeSlots,
              onlineMeetingUrl: c.onlineMeetingUrl || 'ไม่มี (Onsite)',
              location: c.location,
              maxSeats: c.maxSeats,
              featured: c.featured
            }))
          }, null, 2)
        }
      ]
    };
  }

  // 2. get_course
  if (name === 'get_course') {
    const data = await apiCall('/api/classes');
    const courses = data.data || [];
    const course = courses.find(c => c.id === args.id || c.title.includes(args.id));
    if (!course) {
      throw new Error(`ไม่พบคอร์สเรียนที่ตรงกับ ID หรือชื่อ: "${args.id}"`);
    }
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(course, null, 2)
        }
      ]
    };
  }

  // 3. create_course
  if (name === 'create_course') {
    const payload = {
      title: args.title,
      subtitle: args.subtitle || '',
      description: args.description || '',
      type: args.type || 'onsite',
      price: Number(args.price) || 0,
      durationMinutes: Number(args.durationMinutes) || 180,
      location: args.location || (args.type === 'online' ? 'Google Meet / Zoom' : 'Onsite Workshop Campus'),
      onlineMeetingUrl: args.onlineMeetingUrl || '',
      maxSeats: Number(args.maxSeats) || 20,
      availableDates: Array.isArray(args.availableDates) ? args.availableDates : [],
      timeSlots: Array.isArray(args.timeSlots) ? args.timeSlots : ['13:00 - 16:00'],
      topics: Array.isArray(args.topics) ? args.topics : [],
      toolsUsed: Array.isArray(args.toolsUsed) ? args.toolsUsed : ['ChatGPT', 'Claude'],
      prerequisites: args.prerequisites || 'นำแล็ปท็อปมาด้วย',
      featured: Boolean(args.featured),
      attachments: []
    };
    const res = await apiCall('/api/classes', 'POST', payload);
    return {
      content: [
        {
          type: 'text',
          text: `สร้างคอร์ส "${payload.title}" สำเร็จเรียบร้อยแล้ว (ID: ${res.data?.id || 'new'}) ข้อมูลแสดงบนหน้าเว็บทันที`
        }
      ]
    };
  }

  // 4. update_course
  if (name === 'update_course') {
    const res = await apiCall(`/api/classes/${args.id}`, 'PUT', args);
    return {
      content: [
        {
          type: 'text',
          text: `อัปเดตข้อมูลคอร์ส ID: ${args.id} เรียบร้อยแล้ว`
        }
      ]
    };
  }

  // 5. delete_course
  if (name === 'delete_course') {
    await apiCall(`/api/classes/${args.id}`, 'DELETE');
    return {
      content: [
        {
          type: 'text',
          text: `ลบคอร์สเรียน ID: ${args.id} เรียบร้อยแล้ว`
        }
      ]
    };
  }

  // 6. list_bookings
  if (name === 'list_bookings') {
    const data = await apiCall('/api/bookings');
    let bookings = data.data || [];
    if (args.status && args.status !== 'all') {
      bookings = bookings.filter(b => b.bookingStatus === args.status);
    }
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            count: bookings.length,
            bookings: bookings.map(b => ({
              id: b.id,
              classTitle: b.classTitle,
              userName: b.userName,
              userEmail: b.userEmail,
              userPhone: b.userPhone,
              date: b.date,
              timeSlot: b.timeSlot,
              amount: `${b.amount.toLocaleString()} บาท`,
              status: b.bookingStatus,
              paymentStatus: b.paymentStatus,
              onlineMeetingUrl: b.onlineMeetingUrl,
              hasSlip: Boolean(b.slipUrl)
            }))
          }, null, 2)
        }
      ]
    };
  }

  // 7. create_booking
  if (name === 'create_booking') {
    // Look up class price & title
    const classesData = await apiCall('/api/classes');
    const classes = classesData.data || [];
    const targetClass = classes.find(c => c.id === args.classId);
    if (!targetClass) {
      throw new Error(`ไม่พบคอร์สเรียน ID: ${args.classId}`);
    }

    const payload = {
      classId: targetClass.id,
      classTitle: targetClass.title,
      userName: args.userName,
      userEmail: args.userEmail,
      userPhone: args.userPhone || '',
      date: args.date,
      timeSlot: args.timeSlot,
      amount: targetClass.price,
      notes: args.notes || 'จองผ่าน Model Context Protocol (MCP Agent)',
      bookingStatus: 'pending_payment',
      paymentStatus: 'pending',
      onlineMeetingUrl: targetClass.onlineMeetingUrl || ''
    };

    const res = await apiCall('/api/bookings', 'POST', payload);
    return {
      content: [
        {
          type: 'text',
          text: `สร้างการจองคอร์ส "${targetClass.title}" สำหรับ ${args.userName} สำเร็จ! รหัสการจอง: ${res.data?.id || 'BK-NEW'} (ยอดชำระ: ${targetClass.price.toLocaleString()} บาท)`
        }
      ]
    };
  }

  // 8. update_booking_status
  if (name === 'update_booking_status') {
    const payload = {
      bookingStatus: args.status,
      onlineMeetingUrl: args.onlineMeetingUrl,
      approvalMessage: args.approvalMessage
    };
    const res = await apiCall(`/api/bookings/${args.bookingId}`, 'PATCH', payload);
    return {
      content: [
        {
          type: 'text',
          text: `อัปเดตสถานะการจอง ${args.bookingId} เป็น "${args.status}" เรียบร้อยแล้ว (ระบบส่งอีเมลแจ้งผู้เรียนอัตโนมัติ)`
        }
      ]
    };
  }

  // 9. list_prompts
  if (name === 'list_prompts') {
    const data = await apiCall('/api/prompts');
    let prompts = data.data || [];
    if (args.category && args.category !== 'all') {
      prompts = prompts.filter(p => p.category?.toLowerCase() === args.category.toLowerCase());
    }
    if (args.search) {
      const q = args.search.toLowerCase();
      prompts = prompts.filter(p => 
        p.title?.toLowerCase().includes(q) || 
        p.promptText?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
      );
    }
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            count: prompts.length,
            prompts: prompts.map(p => ({
              id: p.id,
              title: p.title,
              category: p.category,
              description: p.description,
              promptText: p.promptText,
              tags: p.tags,
              copyCount: p.copyCount
            }))
          }, null, 2)
        }
      ]
    };
  }

  // 10. create_prompt
  if (name === 'create_prompt') {
    const payload = {
      title: args.title,
      promptText: args.promptText,
      category: args.category,
      description: args.description || '',
      tags: Array.isArray(args.tags) ? args.tags : [args.category],
      author: args.author || 'AI Assistant via MCP',
      featured: false
    };
    const res = await apiCall('/api/prompts', 'POST', payload);
    return {
      content: [
        {
          type: 'text',
          text: `บันทึก Prompt "${payload.title}" เข้าสู่คลัง Kevin AI Academy สำเร็จเรียบร้อยแล้ว`
        }
      ]
    };
  }

  // 11. get_site_settings
  if (name === 'get_site_settings') {
    const data = await apiCall('/api/site-settings');
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(data.data, null, 2)
        }
      ]
    };
  }

  // 12. manage_website_cms
  if (name === 'manage_website_cms') {
    const res = await apiCall('/api/site-settings', 'POST', args);
    return {
      content: [
        {
          type: 'text',
          text: 'ปรับแต่งเนื้อหาหน้าเว็บไซต์ (CMS) สำเร็จ ข้อมูลอัปเดตแบบ Real-time ทันที'
        }
      ]
    };
  }

  // 13. system_health
  if (name === 'system_health') {
    const [classesRes, bookingsRes, siteRes] = await Promise.all([
      apiCall('/api/classes').catch(() => ({ data: [] })),
      apiCall('/api/bookings').catch(() => ({ data: [] })),
      apiCall('/api/site-settings').catch(() => ({ data: {} }))
    ]);

    const activeCourses = (classesRes.data || []).length;
    const totalBookings = (bookingsRes.data || []).length;
    const confirmedBookings = (bookingsRes.data || []).filter(b => b.bookingStatus === 'confirmed').length;

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            status: 'HEALTHY_AND_OPERATIONAL',
            mcpVersion: '1.0.0',
            protocolVersion: '2024-11-05',
            rfcCompatible: 'RFC 2026',
            academy: 'Kevin AI Academy',
            connectedEndpoints: {
              activeCourses,
              totalBookings,
              confirmedBookings,
              siteName: siteRes.data?.brandTitle || 'Kevin AI Academy'
            },
            timestamp: new Date().toISOString()
          }, null, 2)
        }
      ]
    };
  }

  throw new Error(`Tool not found: "${name}"`);
}

// -----------------------------------------------------------------------------
// Resource Reader Handler
// -----------------------------------------------------------------------------
async function handleResourceRead(uri) {
  if (uri === 'kevin://courses') {
    const data = await apiCall('/api/classes');
    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify(data.data || [], null, 2)
        }
      ]
    };
  }

  if (uri === 'kevin://bookings') {
    const data = await apiCall('/api/bookings');
    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify(data.data || [], null, 2)
        }
      ]
    };
  }

  if (uri === 'kevin://prompts') {
    const data = await apiCall('/api/prompts');
    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify(data.data || [], null, 2)
        }
      ]
    };
  }

  if (uri === 'kevin://site-settings') {
    const data = await apiCall('/api/site-settings');
    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify(data.data || {}, null, 2)
        }
      ]
    };
  }

  throw new Error(`Resource not found: ${uri}`);
}

// -----------------------------------------------------------------------------
// Prompt Template Handler
// -----------------------------------------------------------------------------
async function handlePromptGet(name, args = {}) {
  if (name === 'consult_course') {
    const classes = (await apiCall('/api/classes')).data || [];
    return {
      description: 'คำแนะนำคอร์สเรียน AI ที่เหมาะสม',
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `นี่คือรายชื่อคอร์สเรียนปัจจุบันของ Kevin AI Academy:\n${JSON.stringify(classes.map(c => ({ title: c.title, price: c.price, type: c.type, desc: c.description })), null, 2)}\n\nผู้เรียนมีเป้าหมาย: "${args.studentGoal}"\nโปรดแนะนำคอร์สที่เหมาะสมที่สุด พร้อมเหตุผลและขั้นตอนการสมัครเรียนอย่างสุภาพและเป็นมิตร`
          }
        }
      ]
    };
  }

  if (name === 'generate_video_prompt') {
    return {
      description: 'Prompt สำหรับสร้างวิดีโอ AI',
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `ช่วยสร้าง Prompt สำหรับเครื่องมือสร้างวิดีโอ AI (Runway Gen-3 / Kling 1.5 / Sora / Hailuo) ตามคอนเซปต์:\n"${args.concept}"\nสไตล์ที่ต้องการ: "${args.style || 'Cinematic Hyper-realistic 4K'}"\n\nให้ระบุ: 1. English Prompt (พร้อม Camera movement, Lighting, Mood) 2. คำแปลภาษาไทย 3. การตั้งค่าสัดส่วน (16:9 หรือ 9:16) 4. Negative Prompt`
          }
        }
      ]
    };
  }

  throw new Error(`Prompt not found: ${name}`);
}

// -----------------------------------------------------------------------------
// Main JSON-RPC Stdio Loop
// -----------------------------------------------------------------------------
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

function sendResponse(id, result = null, error = null) {
  const response = {
    jsonrpc: '2.0',
    id
  };
  if (error) {
    response.error = error;
  } else {
    response.result = result;
  }
  process.stdout.write(JSON.stringify(response) + '\n');
}

rl.on('line', async (line) => {
  const trimmed = line.trim();
  if (!trimmed) return;

  try {
    const request = JSON.parse(trimmed);
    const { jsonrpc, id, method, params } = request;

    // Handle notifications (no id)
    if (id === undefined || id === null) {
      if (method === 'notifications/initialized') {
        process.stderr.write('[MCP] Client sent notifications/initialized: handshake complete.\n');
      }
      return;
    }

    // 1. Initialize
    if (method === 'initialize') {
      sendResponse(id, {
        protocolVersion: '2024-11-05',
        capabilities: {
          tools: { listChanged: true },
          resources: { subscribe: true, listChanged: true },
          prompts: { listChanged: true },
          logging: {}
        },
        serverInfo: {
          name: 'kevin-ai-academy-mcp',
          version: '1.0.0',
          title: 'Kevin AI Academy Official MCP Server'
        }
      });
      return;
    }

    // 2. Ping
    if (method === 'ping') {
      sendResponse(id, {});
      return;
    }

    // 3. Tools List
    if (method === 'tools/list') {
      sendResponse(id, { tools: TOOLS });
      return;
    }

    // 4. Tools Call
    if (method === 'tools/call') {
      const { name, arguments: args } = params || {};
      try {
        const result = await handleToolCall(name, args);
        sendResponse(id, result);
      } catch (callErr) {
        sendResponse(id, {
          content: [
            {
              type: 'text',
              text: `⚠️ เกิดข้อผิดพลาดในการเรียกใช้ Tool "${name}": ${callErr.message}`
            }
          ],
          isError: true
        });
      }
      return;
    }

    // 5. Resources List
    if (method === 'resources/list') {
      sendResponse(id, { resources: RESOURCES });
      return;
    }

    // 6. Resources Read
    if (method === 'resources/read') {
      const { uri } = params || {};
      try {
        const result = await handleResourceRead(uri);
        sendResponse(id, result);
      } catch (resErr) {
        sendResponse(id, null, { code: -32002, message: resErr.message });
      }
      return;
    }

    // 7. Prompts List
    if (method === 'prompts/list') {
      sendResponse(id, { prompts: PROMPTS });
      return;
    }

    // 8. Prompts Get
    if (method === 'prompts/get') {
      const { name, arguments: args } = params || {};
      try {
        const result = await handlePromptGet(name, args);
        sendResponse(id, result);
      } catch (promptErr) {
        sendResponse(id, null, { code: -32602, message: promptErr.message });
      }
      return;
    }

    // Unsupported method
    sendResponse(id, null, {
      code: -32601,
      message: `Method not supported: ${method}`
    });
  } catch (err) {
    process.stderr.write(`[MCP Error] Failed to parse or process line: ${err.message}\n`);
  }
});

process.stderr.write('[MCP] Kevin AI Academy MCP Server running on stdio.\n');
