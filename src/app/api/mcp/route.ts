import { NextResponse } from 'next/server';
import { 
  getClasses, 
  saveClass, 
  deleteClass, 
  getBookings, 
  saveBooking, 
  getArticles, 
  saveArticle, 
  getPromptTemplates, 
  savePromptTemplate,
  deletePromptTemplate,
  getSiteSettings, 
  saveSiteSettings,
  addNotification
} from '@/lib/store';
import { ClassItem, Booking, Article, PromptTemplate } from '@/lib/types';
import { uploadBase64ToGoogleDrive } from '@/lib/gdrive';

// Standard MCP Tool Schema Definition
export interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: { [key: string]: any };
    required?: string[];
  };
}

export const MCP_TOOLS: McpToolDefinition[] = [
  {
    name: 'list_courses',
    description: 'ดึงรายชื่อคอร์สเรียนทั้งหมดในระบบ พร้อมราคา, รอบวัน-เวลา, สถานที่ และรายละเอียด',
    inputSchema: {
      type: 'object',
      properties: {
        type: { type: 'string', enum: ['all', 'online', 'onsite'], description: 'ประเภทคลาสที่ต้องการดู' }
      }
    }
  },
  {
    name: 'get_course',
    description: 'ดึงรายละเอียดแบบเจาะลึกของคอร์สเรียนตาม ID หรือคำค้นหา',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'รหัสคอร์ส เช่น ai-content-workshop หรือ ai-private-1on1-online' }
      },
      required: ['id']
    }
  },
  {
    name: 'create_course',
    description: 'สร้างคอร์สเรียนใหม่ในระบบ พร้อมตั้งชื่อ, คำอธิบายยาวได้ถึง 4,000 คำ, ราคา, วันเวลา, รูปภาพ และลิงก์เข้าเรียน',
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
        availableDates: { 
          type: 'array', 
          items: { type: 'string' }, 
          description: 'วันที่เปิดสอน รูปแบบ YYYY-MM-DD เช่น ["2026-11-15", "2026-11-22"]' 
        },
        timeSlots: { 
          type: 'array', 
          items: { type: 'string' }, 
          description: 'รอบเวลาเรียน เช่น ["13:00 - 16:00"]' 
        },
        topics: { 
          type: 'array', 
          items: { type: 'string' }, 
          description: 'หัวข้อเนื้อหาในคลาส' 
        },
        toolsUsed: { 
          type: 'array', 
          items: { type: 'string' }, 
          description: 'เครื่องมือ AI ที่ใช้ในคลาส เช่น ["ChatGPT", "Claude", "Grok"]' 
        },
        prerequisites: { type: 'string', description: 'สิ่งที่ต้องเตรียมมา' },
        image: { type: 'string', description: 'URL รูปภาพโปสเตอร์คอร์ส หรือ Google Drive View URL' },
        featured: { type: 'boolean', description: 'ปักหมุดคอร์สแนะนำบนหน้าแรก' }
      },
      required: ['title', 'price', 'type']
    }
  },
  {
    name: 'update_course',
    description: 'แก้ไขรายละเอียดคอร์สเรียน รูปภาพ ราคา หรือตารางวันเวลาเรียนที่มีอยู่',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'รหัสคอร์สเรียนที่ต้องการแก้ไข' },
        title: { type: 'string', description: 'ชื่อคอร์สใหม่' },
        subtitle: { type: 'string', description: 'คำโปรยใหม่' },
        description: { type: 'string', description: 'รายละเอียดใหม่' },
        price: { type: 'number', description: 'ราคาใหม่' },
        image: { type: 'string', description: 'URL รูปภาพใหม่' },
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
    name: 'upload_course_image',
    description: 'อัปโหลดรูปภาพโปสเตอร์หรือสื่อการสอนไปยัง Google Drive อัตโนมัติ และคืนค่า URL รูปภาพที่พร้อมใช้งานในเว็บ',
    inputSchema: {
      type: 'object',
      properties: {
        fileName: { type: 'string', description: 'ชื่อไฟล์รูปภาพ เช่น course-poster.png' },
        base64Data: { type: 'string', description: 'รูปภาพในรูปแบบ Data URL (data:image/png;base64,...) หรือ Base64 string' },
        folderType: { type: 'string', enum: ['course_media', 'slipcoursekevin'], description: 'โฟลเดอร์ปลายทางบน Google Drive' }
      },
      required: ['fileName', 'base64Data']
    }
  },
  {
    name: 'list_bookings',
    description: 'ดึงรายการจองเรียนทั้งหมด พร้อมสถานะชำระเงิน และข้อมูลนักเรียน',
    inputSchema: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: ['all', 'confirmed', 'pending_payment', 'rejected'], description: 'กรองตามสถานะการจอง' }
      }
    }
  },
  {
    name: 'create_booking',
    description: 'สร้างการจองคอร์สเรียนใหม่ให้นักเรียน พร้อมยอดเงินและข้อมูลติดต่อ',
    inputSchema: {
      type: 'object',
      properties: {
        classId: { type: 'string', description: 'รหัสคอร์สที่ต้องการจอง' },
        userName: { type: 'string', description: 'ชื่อ-นามสกุลของผู้เรียน' },
        userEmail: { type: 'string', description: 'อีเมลของผู้เรียน' },
        userPhone: { type: 'string', description: 'เบอร์โทรศัพท์' },
        date: { type: 'string', description: 'วันที่เลือกเรียน YYYY-MM-DD' },
        timeSlot: { type: 'string', description: 'รอบเวลาเรียน' },
        notes: { type: 'string', description: 'หมายเหตุเพิ่มเติม' }
      },
      required: ['classId', 'userName', 'userEmail', 'date', 'timeSlot']
    }
  },
  {
    name: 'update_booking_status',
    description: 'อนุมัติ (Approve) หรือปฏิเสธ (Reject) การจองคอร์สเรียน พร้อมอัปเดตลิงก์ห้องเรียนออนไลน์',
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
        category: { type: 'string', description: 'หมวดหมู่ เช่น video, image, agent, all' },
        search: { type: 'string', description: 'คำค้นหาในชื่อหรือเนื้อหา' }
      }
    }
  },
  {
    name: 'create_prompt',
    description: 'บันทึก Prompt Template ใหม่เข้าสู่คลัง Kevin AI Academy',
    inputSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'ชื่อของพรออมต์' },
        promptText: { type: 'string', description: 'เนื้อหา Prompt ฉบับเต็ม' },
        category: { type: 'string', description: 'หมวดหมู่ เช่น video, image, agent' },
        description: { type: 'string', description: 'คำอธิบายวิธีใช้และผลลัพธ์' },
        tags: { type: 'array', items: { type: 'string' }, description: 'แท็ก' }
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
    description: 'ปรับแต่งเนื้อหาหน้าเว็บไซต์ (CMS) เช่น Hero Section, ข้อความต้อนรับ, ข้อมูลผู้สอน (Instructor) และ Footer',
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

export const MCP_RESOURCES = [
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

export const MCP_PROMPT_TEMPLATES = [
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

export async function GET(req: Request) {
  const url = new URL(req.url);
  const accept = req.headers.get('accept') || '';
  const isSse = accept.includes('text/event-stream') || url.searchParams.get('transport') === 'sse';

  // Support SSE Stream for native MCP clients
  if (isSse) {
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(`event: endpoint\ndata: /api/mcp\n\n`));
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
      }
    });
  }

  // Standard JSON response
  return NextResponse.json({
    jsonrpc: '2.0',
    server: {
      name: 'kevin-ai-academy-mcp',
      title: 'Kevin AI Academy Official MCP Server',
      version: '1.0.0',
      description: 'Model Context Protocol Server สำหรับจัดการคอร์สเรียน, อัปโหลดรูปภาพเข้า Google Drive, ตรวจสอบการจอง และควบคุม CMS หลังบ้าน',
      rfcCompatible: 'RFC 2026',
      protocolVersion: '2024-11-05'
    },
    capabilities: {
      tools: {
        listChanged: true
      },
      resources: {
        subscribe: true,
        listChanged: true
      },
      prompts: {
        listChanged: true
      },
      logging: {}
    },
    tools: MCP_TOOLS,
    resources: MCP_RESOURCES,
    prompts: MCP_PROMPT_TEMPLATES
  });
}

// JSON-RPC 2.0 Handler for MCP Clients (ChatGPT, Claude Desktop, Gemini, Cursor)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { jsonrpc, id, method, params } = body;

    // Handle MCP 'initialize' handshake
    if (method === 'initialize') {
      return NextResponse.json({
        jsonrpc: '2.0',
        id,
        result: {
          protocolVersion: '2024-11-05',
          capabilities: {
            tools: { listChanged: true },
            resources: { subscribe: true, listChanged: true },
            prompts: { listChanged: true },
            logging: {}
          },
          serverInfo: {
            name: 'kevin-ai-academy-mcp',
            title: 'Kevin AI Academy Official MCP Server',
            version: '1.0.0'
          }
        }
      });
    }

    // Handle MCP 'ping'
    if (method === 'ping') {
      return NextResponse.json({
        jsonrpc: '2.0',
        id,
        result: {}
      });
    }

    // Handle MCP 'tools/list'
    if (method === 'tools/list') {
      return NextResponse.json({
        jsonrpc: '2.0',
        id,
        result: {
          tools: MCP_TOOLS
        }
      });
    }

    // Handle MCP 'resources/list'
    if (method === 'resources/list') {
      return NextResponse.json({
        jsonrpc: '2.0',
        id,
        result: {
          resources: MCP_RESOURCES
        }
      });
    }

    // Handle MCP 'resources/read'
    if (method === 'resources/read') {
      const { uri } = params || {};
      if (uri === 'kevin://courses') {
        const classes = await getClasses();
        return NextResponse.json({
          jsonrpc: '2.0',
          id,
          result: {
            contents: [{ uri, mimeType: 'application/json', text: JSON.stringify(classes, null, 2) }]
          }
        });
      }
      if (uri === 'kevin://bookings') {
        const bookings = await getBookings();
        return NextResponse.json({
          jsonrpc: '2.0',
          id,
          result: {
            contents: [{ uri, mimeType: 'application/json', text: JSON.stringify(bookings, null, 2) }]
          }
        });
      }
      if (uri === 'kevin://prompts') {
        const prompts = await getPromptTemplates();
        return NextResponse.json({
          jsonrpc: '2.0',
          id,
          result: {
            contents: [{ uri, mimeType: 'application/json', text: JSON.stringify(prompts, null, 2) }]
          }
        });
      }
      if (uri === 'kevin://site-settings') {
        const settings = await getSiteSettings();
        return NextResponse.json({
          jsonrpc: '2.0',
          id,
          result: {
            contents: [{ uri, mimeType: 'application/json', text: JSON.stringify(settings, null, 2) }]
          }
        });
      }
      return NextResponse.json({
        jsonrpc: '2.0',
        id,
        error: { code: -32002, message: `Resource not found: ${uri}` }
      });
    }

    // Handle MCP 'prompts/list'
    if (method === 'prompts/list') {
      return NextResponse.json({
        jsonrpc: '2.0',
        id,
        result: {
          prompts: MCP_PROMPT_TEMPLATES
        }
      });
    }

    // Handle MCP 'prompts/get'
    if (method === 'prompts/get') {
      const { name, arguments: args } = params || {};
      if (name === 'consult_course') {
        const classes = await getClasses();
        return NextResponse.json({
          jsonrpc: '2.0',
          id,
          result: {
            description: 'คำแนะนำคอร์สเรียน AI ที่เหมาะสม',
            messages: [
              {
                role: 'user',
                content: {
                  type: 'text',
                  text: `นี่คือรายชื่อคอร์สเรียนของ Kevin AI Academy:\n${JSON.stringify(classes.map(c => ({ title: c.title, price: c.price, type: c.type, desc: c.description })), null, 2)}\n\nผู้เรียนมีเป้าหมาย: "${args?.studentGoal}"\nโปรดแนะนำคอร์สที่เหมาะสมที่สุด พร้อมเหตุผลและขั้นตอนการสมัครเรียนอย่างสุภาพและเป็นมิตร`
                }
              }
            ]
          }
        });
      }
      if (name === 'generate_video_prompt') {
        return NextResponse.json({
          jsonrpc: '2.0',
          id,
          result: {
            description: 'Prompt สำหรับสร้างวิดีโอ AI',
            messages: [
              {
                role: 'user',
                content: {
                  type: 'text',
                  text: `ช่วยสร้าง Prompt สำหรับเครื่องมือสร้างวิดีโอ AI (Runway Gen-3 / Kling 1.5 / Sora / Hailuo) ตามคอนเซปต์:\n"${args?.concept}"\nสไตล์ที่ต้องการ: "${args?.style || 'Cinematic Hyper-realistic 4K'}"\n\nให้ระบุ: 1. English Prompt (พร้อม Camera movement, Lighting, Mood) 2. คำแปลภาษาไทย 3. การตั้งค่าสัดส่วน (16:9 หรือ 9:16) 4. Negative Prompt`
                }
              }
            ]
          }
        });
      }
      return NextResponse.json({
        jsonrpc: '2.0',
        id,
        error: { code: -32602, message: `Prompt template not found: ${name}` }
      });
    }

    // Handle MCP 'tools/call'
    if (method === 'tools/call') {
      const { name, arguments: args } = params || {};

      // 1. Tool: list_courses
      if (name === 'list_courses') {
        const classes = await getClasses();
        const filtered = args?.type && args.type !== 'all' 
          ? classes.filter(c => c.type === args.type) 
          : classes;
        
        return NextResponse.json({
          jsonrpc: '2.0',
          id,
          result: {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  total: filtered.length,
                  academy: 'Kevin AI Academy',
                  courses: filtered.map(c => ({
                    id: c.id,
                    title: c.title,
                    subtitle: c.subtitle,
                    type: c.type,
                    price: `${c.price.toLocaleString()} บาท`,
                    availableDates: c.availableDates,
                    timeSlots: c.timeSlots,
                    onlineMeetingUrl: c.onlineMeetingUrl,
                    image: c.image,
                    maxSeats: c.maxSeats,
                    location: c.location
                  }))
                }, null, 2)
              }
            ]
          }
        });
      }

      // 2. Tool: get_course
      if (name === 'get_course') {
        const classes = await getClasses();
        const target = classes.find(c => c.id === args?.id || c.title.includes(args?.id));
        if (!target) {
          return NextResponse.json({
            jsonrpc: '2.0',
            id,
            error: { code: -32602, message: `ไม่พบคอร์สเรียน ID หรือชื่อ: ${args?.id}` }
          });
        }
        return NextResponse.json({
          jsonrpc: '2.0',
          id,
          result: {
            content: [{ type: 'text', text: JSON.stringify(target, null, 2) }]
          }
        });
      }

      // 3. Tool: create_course
      if (name === 'create_course') {
        const description = (args.description || '').trim();
        const wordCount = description ? description.split(/\s+/).filter(Boolean).length : 0;
        if (wordCount > 4000) {
          return NextResponse.json({
            jsonrpc: '2.0',
            id,
            error: {
              code: -32602,
              message: `คำอธิบายคอร์สเกินกำหนด (${wordCount.toLocaleString()} คำ / สูงสุด 4,000 คำ)`
            }
          });
        }

        const newClass: ClassItem = {
          id: args.id || `course-${Date.now().toString().slice(-6)}`,
          title: args.title,
          subtitle: args.subtitle || '',
          description: args.description || '',
          type: args.type === 'online' ? 'online' : 'onsite',
          price: Number(args.price) || 0,
          durationMinutes: Number(args.durationMinutes) || 180,
          location: args.location || (args.type === 'online' ? 'Google Meet / Zoom' : 'Onsite Workshop Campus'),
          onlineMeetingUrl: args.onlineMeetingUrl || '',
          maxSeats: Number(args.maxSeats) || 20,
          availableDates: Array.isArray(args.availableDates) ? args.availableDates : [],
          timeSlots: Array.isArray(args.timeSlots) ? args.timeSlots : ['13:00 - 16:00'],
          topics: Array.isArray(args.topics) ? args.topics : [],
          toolsUsed: Array.isArray(args.toolsUsed) ? args.toolsUsed : ['AI Agent', 'ChatGPT'],
          prerequisites: args.prerequisites || 'แล็ปท็อปสำหรับการฝึกปฏิบัติจริง',
          image: args.image || '/assets/ai-content-workshop.avif',
          featured: Boolean(args.featured),
          attachments: []
        };

        const saved = await saveClass(newClass);
        await addNotification({
          title: 'สร้างคอร์สใหม่ผ่าน MCP Server',
          message: `โมเดล AI ได้สร้างคอร์ส "${saved.title}" (ราคา ${saved.price.toLocaleString()} บาท) เข้าสู่ระบบเรียบร้อยแล้ว`,
          type: 'new_booking',
          read: false
        });

        return NextResponse.json({
          jsonrpc: '2.0',
          id,
          result: {
            content: [
              {
                type: 'text',
                text: `สร้างคอร์ส "${saved.title}" สำเร็จเรียบร้อยแล้ว (ID: ${saved.id}) พร้อมแสดงบนหน้าเว็บไซต์ทันที`
              }
            ],
            course: saved
          }
        });
      }

      // 4. Tool: update_course
      if (name === 'update_course') {
        const classes = await getClasses();
        const existing = classes.find(c => c.id === args.id);
        if (!existing) {
          return NextResponse.json({
            jsonrpc: '2.0',
            id,
            error: { code: -32602, message: `ไม่พบคอร์สเรียน ID: ${args.id}` }
          });
        }

        const updatedCourse: ClassItem = {
          ...existing,
          title: args.title !== undefined ? args.title : existing.title,
          subtitle: args.subtitle !== undefined ? args.subtitle : existing.subtitle,
          description: args.description !== undefined ? args.description : existing.description,
          price: args.price !== undefined ? Number(args.price) : existing.price,
          image: args.image !== undefined ? args.image : existing.image,
          availableDates: args.availableDates !== undefined ? args.availableDates : existing.availableDates,
          timeSlots: args.timeSlots !== undefined ? args.timeSlots : existing.timeSlots,
          onlineMeetingUrl: args.onlineMeetingUrl !== undefined ? args.onlineMeetingUrl : existing.onlineMeetingUrl
        };

        const saved = await saveClass(updatedCourse);
        return NextResponse.json({
          jsonrpc: '2.0',
          id,
          result: {
            content: [
              {
                type: 'text',
                text: `อัปเดตข้อมูลคอร์ส "${saved.title}" เรียบร้อยแล้ว`
              }
            ],
            course: saved
          }
        });
      }

      // 5. Tool: delete_course
      if (name === 'delete_course') {
        const ok = await deleteClass(args.id);
        return NextResponse.json({
          jsonrpc: '2.0',
          id,
          result: {
            content: [{ type: 'text', text: ok ? `ลบคอร์ส ID ${args.id} สำเร็จ` : `ไม่พบคอร์ส ID ${args.id}` }]
          }
        });
      }

      // 6. Tool: upload_course_image (Google Drive)
      if (name === 'upload_course_image') {
        let base64 = args.base64Data;
        if (!base64.startsWith('data:image')) {
          base64 = `data:image/png;base64,${base64}`;
        }

        const targetFolder: 'slip' | 'article' = args.folderType === 'slipcoursekevin' ? 'slip' : 'article';
        const uploadResult = await uploadBase64ToGoogleDrive({
          dataUrl: base64,
          fileName: args.fileName || `course_image_${Date.now()}.png`,
          folderType: targetFolder
        });

        return NextResponse.json({
          jsonrpc: '2.0',
          id,
          result: {
            content: [
              {
                type: 'text',
                text: `อัปโหลดรูปภาพเข้าสู่ Google Drive สำเร็จ! View URL: ${uploadResult.viewUrl}`
              }
            ],
            imageResult: uploadResult
          }
        });
      }

      // 7. Tool: list_bookings
      if (name === 'list_bookings') {
        const bookings = await getBookings();
        const filtered = args?.status && args.status !== 'all'
          ? bookings.filter(b => b.bookingStatus === args.status)
          : bookings;

        return NextResponse.json({
          jsonrpc: '2.0',
          id,
          result: {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  count: filtered.length,
                  bookings: filtered.map(b => ({
                    id: b.id,
                    classTitle: b.classTitle,
                    userName: b.userName,
                    userEmail: b.userEmail,
                    date: b.date,
                    timeSlot: b.timeSlot,
                    amount: b.amount,
                    status: b.bookingStatus,
                    slipUrl: b.slipUrl
                  }))
                }, null, 2)
              }
            ]
          }
        });
      }

      // 8. Tool: create_booking
      if (name === 'create_booking') {
        const classes = await getClasses();
        const targetClass = classes.find(c => c.id === args.classId);
        if (!targetClass) {
          return NextResponse.json({
            jsonrpc: '2.0',
            id,
            error: { code: -32602, message: `ไม่พบคอร์สเรียน ID: ${args.classId}` }
          });
        }

        const newBooking: Booking = {
          id: `BK-${Date.now().toString().slice(-6)}`,
          classId: targetClass.id,
          classTitle: targetClass.title,
          classType: targetClass.type,
          userId: args.userId || 'guest-mcp',
          userName: args.userName,
          userEmail: args.userEmail,
          userPhone: args.userPhone || '',
          date: args.date,
          timeSlot: args.timeSlot,
          amount: targetClass.price,
          paymentMethod: 'promptpay_qr',
          paymentStatus: 'pending',
          bookingStatus: 'pending_payment',
          notes: args.notes || 'จองผ่าน MCP Agent',
          onlineMeetingUrl: targetClass.onlineMeetingUrl || '',
          createdAt: new Date().toISOString()
        };

        const saved = await saveBooking(newBooking);
        await addNotification({
          title: 'การจองใหม่ผ่าน MCP',
          message: `${saved.userName} ได้จองคอร์ส "${saved.classTitle}" ผ่าน AI Agent เรียบร้อยแล้ว`,
          type: 'new_booking',
          read: false
        });

        return NextResponse.json({
          jsonrpc: '2.0',
          id,
          result: {
            content: [
              {
                type: 'text',
                text: `สร้างการจองสำหรับ ${saved.userName} สำเร็จ! รหัสการจอง: ${saved.id} (ยอดเงิน: ${saved.amount.toLocaleString()} บาท)`
              }
            ],
            booking: saved
          }
        });
      }

      // 9. Tool: update_booking_status
      if (name === 'update_booking_status') {
        const bookings = await getBookings();
        const existing = bookings.find(b => b.id === args.bookingId);
        if (!existing) {
          return NextResponse.json({
            jsonrpc: '2.0',
            id,
            error: { code: -32602, message: `ไม่พบรายการจองรหัส ${args.bookingId}` }
          });
        }

        const updatedBooking: Booking = {
          ...existing,
          bookingStatus: args.status,
          onlineMeetingUrl: args.onlineMeetingUrl || existing.onlineMeetingUrl,
          approvalMessage: args.approvalMessage || existing.approvalMessage
        };

        const saved = await saveBooking(updatedBooking);
        return NextResponse.json({
          jsonrpc: '2.0',
          id,
          result: {
            content: [
              {
                type: 'text',
                text: `อัปเดตสถานะการจอง ${saved.id} เป็น "${saved.bookingStatus}" เรียบร้อยแล้ว`
              }
            ],
            booking: saved
          }
        });
      }

      // 10. Tool: list_prompts
      if (name === 'list_prompts') {
        let prompts = await getPromptTemplates();
        if (args?.category && args.category !== 'all') {
          prompts = prompts.filter(p => p.category?.toLowerCase() === args.category.toLowerCase());
        }
        if (args?.search) {
          const q = args.search.toLowerCase();
          prompts = prompts.filter(p => 
            p.title?.toLowerCase().includes(q) || 
            p.templateContent?.toLowerCase().includes(q) || 
            p.description?.toLowerCase().includes(q)
          );
        }
        return NextResponse.json({
          jsonrpc: '2.0',
          id,
          result: {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  total: prompts.length,
                  prompts: prompts.map(p => ({
                    id: p.id,
                    title: p.title,
                    category: p.category,
                    description: p.description,
                    templateContent: p.templateContent,
                    tags: p.tags,
                    copyCount: p.copyCount
                  }))
                }, null, 2)
              }
            ]
          }
        });
      }

      // 11. Tool: create_prompt
      if (name === 'create_prompt') {
        const slug = (args.title || 'prompt')
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-');

        const newPrompt: PromptTemplate = {
          id: `prompt-${Date.now()}`,
          title: args.title,
          slug: `${slug}-${Date.now().toString().slice(-4)}`,
          category: args.category,
          description: args.description || '',
          tags: Array.isArray(args.tags) ? args.tags : [args.category],
          templateContent: args.promptText || args.templateContent || '',
          variables: [],
          copyCount: 0,
          authorName: args.author || 'AI Assistant',
          isFeatured: false,
          createdAt: new Date().toISOString()
        };
        const saved = await savePromptTemplate(newPrompt);
        return NextResponse.json({
          jsonrpc: '2.0',
          id,
          result: {
            content: [
              {
                type: 'text',
                text: `บันทึก Prompt Template "${saved.title}" สำเร็จเรียบร้อยแล้ว`
              }
            ],
            prompt: saved
          }
        });
      }

      // 12. Tool: get_site_settings
      if (name === 'get_site_settings') {
        const settings = await getSiteSettings();
        return NextResponse.json({
          jsonrpc: '2.0',
          id,
          result: {
            content: [{ type: 'text', text: JSON.stringify(settings, null, 2) }]
          }
        });
      }

      // 13. Tool: manage_website_cms
      if (name === 'manage_website_cms') {
        const currentCms = await getSiteSettings();
        const updated = await saveSiteSettings({
          ...currentCms,
          heroBadge: args.heroBadge !== undefined ? args.heroBadge : currentCms.heroBadge,
          heroTitleMain: args.heroTitleMain !== undefined ? args.heroTitleMain : currentCms.heroTitleMain,
          heroDescription: args.heroDescription !== undefined ? args.heroDescription : currentCms.heroDescription,
          instructorBio: args.instructorBio !== undefined ? args.instructorBio : currentCms.instructorBio,
          announceText: args.announceText !== undefined ? args.announceText : currentCms.announceText
        });

        return NextResponse.json({
          jsonrpc: '2.0',
          id,
          result: {
            content: [
              {
                type: 'text',
                text: 'ปรับแต่งเนื้อหาหน้าเว็บไซต์ (CMS) สำเร็จ ข้อมูลแสดงผลแบบ Real-time ทันที'
              }
            ],
            siteSettings: updated
          }
        });
      }

      // 14. Tool: system_health
      if (name === 'system_health') {
        const [classes, bookings, site] = await Promise.all([
          getClasses(),
          getBookings(),
          getSiteSettings()
        ]);

        return NextResponse.json({
          jsonrpc: '2.0',
          id,
          result: {
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
                    activeCourses: classes.length,
                    totalBookings: bookings.length,
                    confirmedBookings: bookings.filter(b => b.bookingStatus === 'confirmed').length,
                    siteName: (site as any)?.brandName || (site as any)?.siteTitle || 'Kevin AI Academy'
                  },
                  timestamp: new Date().toISOString()
                }, null, 2)
              }
            ]
          }
        });
      }

      return NextResponse.json({
        jsonrpc: '2.0',
        id,
        error: { code: -32601, message: `Method or tool "${name}" not found` }
      });
    }

    return NextResponse.json({
      jsonrpc: '2.0',
      id,
      error: { code: -32601, message: `Unsupported MCP method "${method}"` }
    });
  } catch (error: any) {
    if (error?.digest === 'NEXT_PRERENDER_INTERRUPTED') throw error;
    return NextResponse.json({
      jsonrpc: '2.0',
      error: { code: -32603, message: error.message || 'Internal error' }
    }, { status: 500 });
  }
}
