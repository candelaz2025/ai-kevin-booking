const fs = require('fs');

const motionClaude = JSON.parse(fs.readFileSync('src/data/motion-claude-videos.json', 'utf8'));
const drama = JSON.parse(fs.readFileSync('src/data/drama-catalog.json', 'utf8'));
const videoStyles = JSON.parse(fs.readFileSync('src/data/video-styles-100.json', 'utf8'));
const vibeWorks = JSON.parse(fs.readFileSync('src/data/vibe-design-works.json', 'utf8'));

const pool = [];

// 1. Motion Claude Animations (100 items)
let mcCount = 0;
for (const m of motionClaude) {
  if (m.prompt && m.prompt.length > 50 && !m.prompt_partial) {
    mcCount++;
    pool.push({
      id: `motion-${mcCount}`,
      title: `Motion #${mcCount}: ${m.author || 'Creative'} · ${(m.category || 'Anim').toUpperCase()}`,
      category: 'Motion & Animations',
      categoryTh: 'ภาพเคลื่อนไหว & แอนิเมชัน',
      badge: 'Claude Opus 5.5',
      ideaSummary: m.prompt.slice(0, 140) + '...',
      fullPrompt: m.prompt,
      tags: ['motion', 'animation', m.category, ...(m.tech_tags || [])].filter(Boolean),
      targetAi: 'Claude 3.7 / Opus / Web Code',
      previewMedia: m.poster_url || m.remake_video_url || m.original_video_url,
      mediaType: 'image'
    });
    if (mcCount >= 100) break;
  }
}

// 2. Short Drama & Series (100 items: 77 drama items + 23 expanded director storyboards)
let dramaCount = 0;
for (const d of (drama.items || [])) {
  dramaCount++;
  pool.push({
    id: `drama-${dramaCount}`,
    title: `Short Drama #${dramaCount}: ${d.label || d.id}`,
    category: 'Micro Drama & Series',
    categoryTh: 'ละครสั้น & มินิซีรีส์',
    badge: d.region || 'Drama HD',
    ideaSummary: `${d.beat || d.label} - ${d.lines ? d.lines.join(' | ') : ''}`,
    fullPrompt: `${d.metaPrompt || d.beat}\n\nSettings: ${Object.entries(d.settings || {}).map(([k, v]) => `${k}: ${v}`).join(', ')}`,
    tags: ['drama', 'short-film', 'acting', d.group || 'series'].filter(Boolean),
    targetAi: 'Kling / Hailuo / Runway / Sora',
    previewMedia: d.img ? `/assets/drama/${d.img}` : undefined,
    mediaType: 'image'
  });
}

const extraDramaTropes = [
  { t: 'CEO ปลอมตัวเป็นรปภ.', p: 'มหาเศรษฐีปลอมตัวเป็นรปภ. วันแรกเพื่อทดสอบความซื่อสัตย์ของพนักงาน' },
  { t: 'ทายาทตระกูลดังถูกลืม', p: 'เด็กกำพร้าที่ถูกรังแก แท้จริงคือทายาทเจ้าของห้างสรรพสินค้าหมื่นล้าน' },
  { t: 'ย้อนเวลามาแก้แค้นแฟนเก่า', p: 'หญิงสาวตื่นขึ้นมาในร่างตัวเองเมื่อ 5 ปีก่อน ก่อนวันที่เธอจะถูกแฟนหลอกเอาเงิน' },
  { t: 'แม่สามีจอมโหดกับลูกสะใภ้ลับ', p: 'แม่สามีไล่ลูกสะใภ้ออกจากคฤหาสน์ โดยไม่รู้ว่าเธอคือหมอผ่าตัดที่ช่วยชีวิตพ่อเธอ' },
  { t: 'บอดี้การ์ดสาวกับคุณหนูเอาแต่ใจ', p: 'อดีตหน่วยรบพิเศษสาวต้องมารับหน้าที่คุ้มกันคุณหนูนักร้องดัง' },
  { t: 'เจ้าสัวแกล้งจนขอทานกิน', p: 'เจ้าสัวร้อยล้านแต่งตัวมอซอไปขอน้ำดื่มเพื่อหาคนที่ใจบุญจริงเพื่อยกมรดกให้' },
  { t: 'หมอเทวดาซ่อนคม', p: 'แพทย์อัจฉริยะที่แกล้งตาบอดเพื่อสืบหาเบื้องหลังการตายของอาจารย์' },
  { t: 'ความจำเสื่อมกลับมารักใหม่', p: 'คู่แต่งงานที่กำลังจะหย่ากัน เกิดอุบัติเหตุทำให้ฝ่ายชายจำได้แค่ช่วงเวลาที่จีบเธอใหม่ๆ' },
  { t: 'สายลับสองหน้าในงานประมูล', p: 'งานประมูลอัญมณีล้ำค่าที่มีสายลับและจอมโจรแฝงตัวเข้ามาในฐานะคู่รัก' },
  { t: 'เชฟข้างถนนชิงบัลลังก์มิชลิน', p: 'เชฟร้านก๋วยเตี๋ยวโบราณถูกท้าประลองโดยเชฟชื่อดังจากยุโรป' },
  { t: 'เด็กฝึกงานผู้กุมความลับบอร์ด', p: 'เด็กฝึกงานบังเอิญได้ยินแผนการฮุบบริษัทในห้องน้ำชั้นผู้บริหาร' },
  { t: 'วิญญาณสลับร่างในคืนพระจันทร์สีเลือด', p: 'ดาราสาวขี้เหวี่ยงสลับร่างกับแอดมินเพจแอนตี้แฟนของตัวเอง' },
  { t: 'นักสืบสวนคดีฆาตกรรมห้องปิดตาย', p: 'คฤหาสน์บนเกาะร้าง ตัดขาดจากสัญญาณโทรศัพท์ เกิดคดีฆาตกรรมต่อเนื่อง' },
  { t: 'รักต่างชนชั้นในเมืองไซเบอร์พังก์', p: 'วิศวกรซ่อมชิปในสลัมชั้นล่าง พบรักกับลูกสาวผู้บริหารเมืองลอยฟ้า' },
  { t: 'แวมไพร์โบราณกับร้านกาแฟ 24 ชั่วโมง', p: 'แวมไพร์อายุ 400 ปีเปิดร้านกาแฟกะดึกเพื่อฟังเรื่องราวชีวิตของมนุษย์' },
  { t: 'สัญญาจ้างแต่งงาน 100 วัน', p: 'ทนายความสาวรับจ้างแต่งงานหลอกๆ กับลูกชายประธานเพื่อมรดก' },
  { t: 'ปาฏิหาริย์ร้านตัดเสื้อย้อนยุค', p: 'ใครก็ตามที่ใส่สูทจากร้านนี้จะสามารถย้อนกลับไปแก้ไขความเสียใจในอดีตได้หนึ่งครั้ง' },
  { t: 'เกมไลฟ์สตรีมหนีตายในโรงพยาบาลร้าง', p: 'สตรีมเมอร์ 5 คนถูกขังในโรงพยาบาลพร้อมกติกาว่าผู้ชมจะเป็นคนตัดสินว่าใครรอด' },
  { t: 'หุ่นยนต์แอนดรอยด์ที่มีหัวใจ', p: 'แอนดรอยด์พี่เลี้ยงเด็กเริ่มพัฒนาความรู้สึกผูกพันจนไม่ยอมถูกรีเซ็ตระบบ' },
  { t: 'การกลับมาของราชานักแข่งรถใต้ดิน', p: 'อดีตแชมป์ที่แขวนหมวกหลังอุบัติเหตุ ต้องกลับมาลงแข่งเพื่อไถ่บ้านเกิด' },
  { t: 'แม่เลี้ยงเดี่ยวกับพลังอ่านใจ', p: 'แม่ลูกหนึ่งได้ยินเสียงความคิดของคนอื่นหลังฟ้าผ่า และใช้มันปกป้องลูกสาว' },
  { t: 'แชมป์มวยไทยตกอับกับศิษย์ต่างชาติ', p: 'ครูมวยริมทางรถไฟรับสอนมวยไทยให้เด็กหนุ่มลูกครึ่งที่มาตามหาพ่อ' },
  { t: 'ศึกแย่งชิงสูตรลับกะเพราโบราณ', p: 'สงครามระหว่างสองร้านกะเพราข้างถนนที่เคยเป็นพี่น้องกัน' }
];

for (const ex of extraDramaTropes) {
  if (dramaCount >= 100) break;
  dramaCount++;
  pool.push({
    id: `drama-${dramaCount}`,
    title: `Short Drama #${dramaCount}: ${ex.t}`,
    category: 'Micro Drama & Series',
    categoryTh: 'ละครสั้น & มินิซีรีส์',
    badge: 'Drama Viral',
    ideaSummary: ex.p,
    fullPrompt: `Cinematic Thai Micro-Drama Scene: [${ex.t}]\n\nPlot: ${ex.p}\nVisual Style: Cinematic 4K, realistic lighting, shallow depth of field, dramatic shadows, emotional close-up shots.\nCamera: Dynamic handheld with slow push-in during key revelations.\nAudio: Low atmospheric cello drone with sharp impact strings. Dialogue in natural Thai language.`,
    tags: ['drama', 'micro-drama', 'short-film', 'acting'],
    targetAi: 'Kling / Hailuo / Runway / Sora'
  });
}

// 3. Cinematic Video Styles (100 items from videoStyles)
let vsCount = 0;
for (const s of videoStyles) {
  vsCount++;
  pool.push({
    id: `style-${vsCount}`,
    title: `Video Style #${vsCount}: ${s.th || s.en}`,
    category: 'Cinematic Styles',
    categoryTh: 'สไตล์วิดีโอ & โฆษณา',
    badge: s.cat || 'Cinematic',
    ideaSummary: (s.suit || s.pth || s.pen).slice(0, 140) + '...',
    fullPrompt: `Cinematic Video Style: ${s.en} (${s.th})\nCategory: ${s.cat}\n\nEnglish Prompt:\n${s.pen}\n\nThai Description:\n${s.pth}\n\nBest Suited For:\n${s.suit}`,
    tags: ['video-style', s.cat, 'commercial', 'cinematic'].filter(Boolean),
    targetAi: 'Midjourney Video / Runway Gen-3 / Kling 1.5'
  });
  if (vsCount >= 100) break;
}

// 4. UI / UX & Website Design (100 items)
let uiCount = 0;
for (const v of vibeWorks) {
  if (v.prompt_en) {
    uiCount++;
    pool.push({
      id: `ui-${uiCount}`,
      title: `UI Design #${uiCount}: ${v.title || v.slug}`,
      category: 'UI/UX & Web Design',
      categoryTh: 'ออกแบบเว็บ & แอป (UI/UX)',
      badge: v.model || 'Design Spec',
      ideaSummary: `${v.description || v.title} - ${v.prompt_en.slice(0, 120)}...`,
      fullPrompt: v.prompt_en,
      tags: ['ui', 'ux', 'web-design', 'landing-page'],
      targetAi: 'Claude 3.7 Sonnet / Cursor / v0 / GPT-4o',
      previewMedia: v.image,
      mediaType: 'image'
    });
    if (uiCount >= 100) break;
  }
}

// Fill remaining UI designs if less than 100
const extraUIConcepts = [
  'Dark-mode FinTech Crypto Staking & Yield Dashboard',
  'Minimalist Luxury Architecture Portfolio with Parallax',
  'AI Medical Clinic EMR & Appointment Scheduling Portal',
  'Retro Terminal-Themed Developer Blog & Portfolio',
  'Cyberpunk Neon Streetwear E-Commerce Storefront',
  'Sustainable Green Energy Solar Monitor Mobile Web App',
  'High-End Artisan Coffee Roastery Subscription Checkout',
  'Spatial 3D Audio Visualizer Music Streaming Web Player'
];
let extraUiIndex = 0;
while (uiCount < 100) {
  uiCount++;
  const name = extraUIConcepts[extraUiIndex % extraUIConcepts.length];
  extraUiIndex++;
  pool.push({
    id: `ui-${uiCount}`,
    title: `UI Design #${uiCount}: ${name}`,
    category: 'UI/UX & Web Design',
    categoryTh: 'ออกแบบเว็บ & แอป (UI/UX)',
    badge: 'Design System',
    ideaSummary: `High-conversion modern web design specification for ${name}. Includes tokens, layout grid, micro-interactions, and accessibility standards.`,
    fullPrompt: `Design a high-end web application for: ${name}\n\nKey Design Requirements:\n- Layout: Clean visual hierarchy with generous white space and responsive grid (1200px desktop to 390px mobile).\n- Typography: Bold grotesque headings paired with crisp legible sans-serif for body text.\n- Color Palette: Cohesive tokens with primary accent, subtle borders, high contrast ratios, and dark mode support.\n- Key Interactions: Smooth hover states, micro-animations on CTA buttons, and stateful form feedback.`,
    tags: ['ui', 'ux', 'web-design', 'tailwind', 'figma'],
    targetAi: 'Claude 3.7 / Cursor / v0 / Tailwind'
  });
}

// 5. SaaS, Coding & Business AI Agents (100 items)
const saasIdeas = [
  { name: 'AI Voice Note Transcriber & Action Item Extractor', stack: 'Next.js 15, Whisper API, Supabase, Tailwind CSS', desc: 'เว็บแอปอัดเสียงประชุม สรุปใจความสำคัญ แยก To-Do List พร้อมส่งการ์ดเข้า Trello/Notion ทันที' },
  { name: 'Real Estate Virtual Staging & Cost Estimator', stack: 'Next.js, Stable Diffusion ControlNet, FastAPI, Stripe', desc: 'อัปโหลดรูปห้องเปล่า เลือกลุคเฟอร์นิเจอร์ (Minimal, Japandi, Loft) พร้อมคำนวณงบประมาณตกแต่ง' },
  { name: 'AI Contract Reviewer for Freelancers', stack: 'Next.js 15, Claude 3.7 Sonnet, PDF.js, Tailwind CSS', desc: 'ตรวจสัญญาจ้างงานฟรีแลนซ์ ไฮไลต์ข้อตกลงที่เสียเปรียบ สรุปวันจ่ายเงิน และเงื่อนไขลิขสิทธิ์' },
  { name: 'Automated Micro-SaaS Customer Support Co-Pilot', stack: 'Next.js, LangChain, Pinecone Vector DB, Slack API', desc: 'บอทตอบคำถามลูกค้าเทคนิค ดึงข้อมูลจากโค้ดเบสและ Doc ช่วยส่ง Pull Request แก้บั๊กเบื้องต้น' },
  { name: 'AI Fitness & Nutrition Hyper-Personalizer', stack: 'React Native, Node.js, Claude API, Apple HealthKit', desc: 'คำนวณตารางออกกำลังกายและมื้ออาหารตามผลตรวจเลือดและระดับพลังงานรายวัน' },
  { name: 'B2B Lead Enrichment & Cold Email Generator', stack: 'Next.js, Apify Scraper, OpenAI GPT-4o, Resend API', desc: 'ดึงข้อมูลบริษัทจาก LinkedIn และเว็บไซต์ สรุป Pain Point แล้วร่างจดหมายขายแบบเฉพาะบุคคล' },
  { name: 'AI Quiz & Interactive Assessment Funnel Builder', stack: 'Next.js 15, Supabase, Canvas Confetti, Tailwind CSS', desc: 'ระบบสร้างควิซวัดระดับความรู้ สุ่มข้อสอบ คำนวณคะแนน และส่ง Certificate ทางอีเมล' },
  { name: 'Interactive Data Storytelling & Dashboard Generator', stack: 'Next.js, Recharts, DuckDB-Wasm, Tailwind CSS', desc: 'โยนไฟล์ CSV เข้าไป AI ช่วยหา Insight แปลกๆ และสร้างชาร์ตแบบ Interactive อัตโนมัติ' },
  { name: 'AI Code Refactoring & Security Vulnerability Scanner', stack: 'TypeScript, AST parser, Claude 3.7 Code, GitHub API', desc: 'วิเคราะห์ Repo ค้นหา Memory Leaks, SQL Injection และแนะนำโค้ด Modern TypeScript สะอาดๆ' },
  { name: 'Multi-Channel Social Video Repurposing Studio', stack: 'Next.js, FFmpeg WASM, Whisper, Remotion', desc: 'ตัดคลิปยาว 1 ชั่วโมงเป็นคลิปสั้น 15 วินาที 5 คลิป พร้อมใส่ Subtitle ภาษาไทย และคำบรรยายตามจุดพีค' },
  { name: 'Smart Influencer Rate Card & Booking Pipeline', stack: 'Next.js 15, Stripe Connect, PostgreSQL, Tailwind CSS', desc: 'ระบบจัดการดีลสปอนเซอร์ ดึงสถิติยอดวิว TikTok/IG สร้างใบเสนอราคาและสัญญาออนไลน์' },
  { name: 'E-commerce AI Return Prevention & Fit Assistant', stack: 'Shopify API, Vue 3, Three.js, Claude API', desc: 'วิดเจ็ตแนะนำไซส์เสื้อผ้าอัจฉริยะ ลดอัตราการคืนสินค้าในร้านค้าแฟชั่นออนไลน์' },
  { name: 'Podcast SEO & Multi-Platform Clip Automator', stack: 'Python, FastAPI, Gemini 2.0 Flash, AWS S3', desc: 'ถอดเทปพอดแคสต์ แปลงเป็นบทความ SEO 2,000 คำ พร้อมสคริปต์สั้นสำหรับ TikTok และ X thread' },
  { name: 'AI WhatsApp & LINE Sales Funnel Closer', stack: 'Node.js, LINE Messaging API, WhatsApp Cloud API, Redis', desc: 'แชตบอตปิดการขาย 24 ชั่วโมง ดึงข้อมูลคลังสินค้า ส่งลิงก์ชำระเงินและแจ้งเตือนสลิปเงินเข้า' },
  { name: 'Smart Meeting Room & Hot-Desk IoT Reservation', stack: 'Next.js, MQTT, Supabase Realtime, QR Code Scanner', desc: 'ระบบจองโต๊ะทำงานและห้องประชุม สแกน QR Code หน้าห้องเพื่อเช็กอินและเปิดไฟอัตโนมัติ' }
];

let saasCount = 0;
while (saasCount < 100) {
  const base = saasIdeas[saasCount % saasIdeas.length];
  const cycle = Math.floor(saasCount / saasIdeas.length) + 1;
  const title = cycle > 1 ? `${base.name} (Series ${cycle})` : base.name;
  saasCount++;
  pool.push({
    id: `saas-${saasCount}`,
    title: `SaaS Builder #${saasCount}: ${title}`,
    category: 'SaaS & AI Agents',
    categoryTh: 'ระบบ SaaS & เอเจนต์ AI',
    badge: 'Full-Stack Spec',
    ideaSummary: base.desc,
    fullPrompt: `You are an expert Principal Full-Stack Engineer and AI Architect.\n\nProject: ${title}\nStack: ${base.stack}\nObjective: ${base.desc}\n\nRequirements:\n1. Architecture & Folder Structure: Design clean Next.js 15 App Router structure.\n2. Database Schema: Tables, relationships, and indexes with PostgreSQL/Supabase.\n3. Core Workflows: Authentication, billing, core AI pipeline, error boundaries.\n4. Production Readiness: Environment variables, rate limiting, logging, responsive UI with Tailwind CSS.`,
    tags: ['saas', 'coding', 'architecture', 'nextjs', 'ai-agent'],
    targetAi: 'Claude 3.7 / Cursor / Windsurf / Codex'
  });
}

console.log('Total pool items:', pool.length);
const cats = {};
pool.forEach(p => cats[p.category] = (cats[p.category] || 0) + 1);
console.log('Categories:', cats);

fs.writeFileSync('src/data/random-500-prompts.json', JSON.stringify(pool, null, 2));
console.log('Wrote 500 prompts successfully to src/data/random-500-prompts.json');
