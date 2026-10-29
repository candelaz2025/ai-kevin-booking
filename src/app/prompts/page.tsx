'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { PromptTemplate } from '@/lib/types';
import pool500Data from '@/data/random-500-prompts.json';
import confetti from 'canvas-confetti';
import {
  Sparkles, Copy, Check, Terminal, Sliders, Layers, ArrowRight,
  Search, BookOpen, Download, Share2, RefreshCw, Cpu, Code2,
  CheckCircle2, Flame, ExternalLink, HelpCircle, Video, Film, Palette, Clapperboard,
  Dices, Wand2, Shuffle, X, FileText, CheckCircle
} from 'lucide-react';

// ============================================================================
// REALISTIC SMART AI PRESET DICTIONARY FOR RANDOM GENERATION
// ============================================================================
interface Random500Item {
  id: string;
  title: string;
  category: string;
  categoryTh: string;
  badge: string;
  ideaSummary: string;
  fullPrompt: string;
  tags: string[];
  targetAi: string;
  previewMedia?: string;
  mediaType?: string;
}

interface RandomPreset {
  promptId?: string;
  category?: string;
  values: Record<string, string>;
  titleHint?: string;
}

const AI_RANDOM_PRESETS: Record<string, RandomPreset[]> = {
  // 1. Coding & SaaS Boilerplate
  'saas-boilerplate-master-prompt': [
    {
      titleHint: 'DocuMind AI: แพลตฟอร์มวิเคราะห์เอกสารทางกฎหมายและสัญญาการเงิน',
      values: {
        APP_NAME: 'DocuMind AI',
        APP_SLUG: 'documind-ai',
        TARGET_USERS: 'ฝ่ายกฎหมาย, นักวิเคราะห์การเงิน, ผู้บริหาร และสำนักงานทนายความ',
        APP_DESCRIPTION: 'Web App วิเคราะห์สัญญาและเอกสาร PDF อัตโนมัติด้วย AI พร้อมไฮไลท์ความเสี่ยงทางกฎหมายและสรุปประเด็นสำคัญใน 10 วินาที',
        MAIN_BUSINESS_FEATURES: '1. อัปโหลดไฟล์ PDF/Word และถอดข้อความแบบแม่นยำสูง (OCR)\n2. AI Risk Analyzer ตรวจหาช่องโหว่ทางสัญญาและข้อกำหนดที่เสียเปรียบ\n3. Interactive Chat ถามตอบเจาะจงเฉพาะเอกสารที่อัปโหลด (RAG)\n4. Export สรุปรายงานบทวิเคราะห์เป็น PDF พร้อมตราประทับดิจิทัล\n5. ระบบ Subscription ชำระเงิน Stripe รายเดือนและรายปี',
        TECH_STACK: 'Next.js 15 (App Router), TypeScript, Tailwind CSS, Supabase (pgvector), Vercel'
      }
    },
    {
      titleHint: 'ChefMate: ระบบวางแผนมื้ออาหารสุขภาพและสั่งซื้อวัตถุดิบอัตโนมัติ',
      values: {
        APP_NAME: 'ChefMate AI',
        APP_SLUG: 'chefmate-ai',
        TARGET_USERS: 'คนรักสุขภาพ, ผู้ป่วยที่ต้องคุมสารอาหาร, และคนทำงานที่ไม่มีเวลาทำกับข้าว',
        APP_DESCRIPTION: 'ผู้ช่วย AI ออกแบบตารางมื้ออาหารตามเป้าหมายแคลอรีและสารอาหาร พร้อมเชื่อมต่อสั่งวัตถุดิบจากซูเปอร์มาร์เก็ตส่งตรงถึงบ้าน',
        MAIN_BUSINESS_FEATURES: '1. แบบสอบถามวิเคราะห์ BMI, ไลฟ์สไตล์ และโรคประจำตัว\n2. AI Meal Generator สุ่มตารางอาหารประจำสัปดาห์พร้อมสูตรทำง่าย\n3. Auto Shopping List คำนวณวัตถุดิบและปริมาณที่ต้องซื้อ\n4. เชื่อมต่อตะกร้าสินค้า Delivery แบบ 1-Click Order\n5. Food Log ถ่ายรูปอาหารให้ AI คำนวณแคลอรีอัตโนมัติ',
        TECH_STACK: 'Next.js 15, TypeScript, Tailwind CSS, PostgreSQL, Claude 3.7 API'
      }
    },
    {
      titleHint: 'Clinico CRM: แพลตฟอร์มจัดการคลินิกความงามและทันตกรรมครบวงจร',
      values: {
        APP_NAME: 'Clinico Smart Clinic',
        APP_SLUG: 'clinico-crm',
        TARGET_USERS: 'เจ้าของคลินิกความงาม, ทันตแพทย์, พนักงานต้อนรับ และคนไข้',
        APP_DESCRIPTION: 'ระบบจองคิว จัดการประวัติคนไข้ (EMR) และวิเคราะห์สภาพผิวหน้าด้วย AI พร้อมแจ้งเตือนนัดหมายผ่าน LINE Official Account',
        MAIN_BUSINESS_FEATURES: '1. ระบบปฏิทินจองคิวแพทย์แบบเรียลไทม์ ป้องกันคิวซ้ำซ้อน\n2. เวชระเบียนดิจิทัล (EMR) บันทึกรูป Before/After พร้อมเปรียบเทียบผลลัพธ์\n3. LINE Flex Message แจ้งเตือนนัดหมายและส่งข้อเสนอพิเศษอัตโนมัติ\n4. AI Smart Assistant วิเคราะห์ภาพถ่ายประเมินสภาพผิวเบื้องต้น\n5. ระบบคลังยาและเวชภัณฑ์ ตัดสต็อกอัตโนมัติเมื่อมีการเบิกใช้',
        TECH_STACK: 'Next.js 15, TypeScript, Tailwind CSS, Supabase Database & Auth, LINE Messaging API'
      }
    }
  ],

  // 2. Booking CRM System
  'booking-crm-master-prompt': [
    {
      titleHint: 'Kevin AI Executive Coaching: จองคอร์สที่ปรึกษา AI ระดับผู้บริหาร',
      values: {
        COMPANY_NAME: 'Kevin AI Studio & Advisory',
        SERVICE_TYPES: '1. 1-on-1 Executive AI Advisory (90 นาที)\n2. Corporate AI Transformation Strategy (แบบองค์กร)\n3. Hands-on Agentic Coding Intensive Workshop',
        BOOKING_POLICY: 'จองล่วงหน้าอย่างน้อย 24 ชั่วโมง เลื่อนนัดได้ฟรีก่อนเวลานัด 12 ชั่วโมง คืนเงิน 100% หากแจ้งยกเลิกล่วงหน้า 3 วัน',
        PAYMENT_FLOW: 'แนบสลิปโอนเงิน PromptPay พร้อมระบบ AI Slip Verification อนุมัติทันทีใน 5 วินาที หรือชำระผ่านบัตรเครดิต',
        NOTIFICATION_METHODS: 'ส่งใบเสร็จและลิงก์ Google Meet ทาง Email ทันที พร้อมแจ้งเตือนผ่าน LINE แจ้งเตือนก่อนนัด 2 ชั่วโมง'
      }
    },
    {
      titleHint: 'Luxe Retreat Spa: ระบบจองคอร์สสปาและทรีตเมนต์เพื่อสุขภาพระดับพรีเมียม',
      values: {
        COMPANY_NAME: 'Luxe Aura Wellness Spa',
        SERVICE_TYPES: '1. Deep Tissue Aromatherapy Massage (90 นาที)\n2. Signature Gold Facial Lifting (60 นาที)\n3. Himalayan Salt Sauna & Private Onsen (120 นาที)',
        BOOKING_POLICY: 'มัดจำ 50% ทุกการจอง เลื่อนนัดได้ 1 ครั้งล่วงหน้า 6 ชั่วโมง',
        PAYMENT_FLOW: 'ชำระมัดจำผ่าน QR PromptPay หรือ Apple Pay / Credit Card',
        NOTIFICATION_METHODS: 'SMS ยืนยันการจองพร้อมแผนที่คลินิก และอีเมลต้อนรับระบุข้อควรปฏิบัติก่อนเข้ารับบริการ'
      }
    }
  ],

  // 3. Sales CRM Pipeline
  'sales-crm-pipeline-prompt': [
    {
      titleHint: 'Apex Real Estate: ระบบติดตาม Lead ลูกค้าคอนโดหรูและคฤหาสน์',
      values: {
        BUSINESS_NAME: 'Apex Luxury Estates Bangkok',
        TARGET_CLIENTS: 'กลุ่มนักลงทุนอสังหาริมทรัพย์ระดับ High Net Worth และชาวต่างชาติ (Expat)',
        PIPELINE_STAGES: '1. New Web Inquiry -> 2. Phone Qualified -> 3. Private Viewing Scheduled -> 4. Negotiation & Contract -> 5. Closed Won',
        AUTOMATION_GOALS: 'ส่ง E-Brochure คอนโดหรูตรงสเปกลูกค้าทันทีหลังกรอกฟอร์ม, แจ้งเตือนเซลล์โทรกลับใน 5 นาที, และส่งรายงานสรุปยอดขายประจำสัปดาห์'
      }
    },
    {
      titleHint: 'SolarTech Enterprise: ระบบเสนอราคาและติดตั้งโซลาร์เซลล์โรงงานอุตสาหกรรม',
      values: {
        BUSINESS_NAME: 'SolarTech Green Energy',
        TARGET_CLIENTS: 'เจ้าของโรงงานอุตสาหกรรมและคลังสินค้าที่ต้องการลดค่าไฟหลักแสนต่อเดือน',
        PIPELINE_STAGES: '1. Lead Received -> 2. Site Survey Planned -> 3. Engineering Proposal -> 4. Board Approval -> 5. Installation Deposit Paid',
        AUTOMATION_GOALS: 'คำนวณจุดคุ้มทุน (ROI) และขนาดกิโลวัตต์อัตโนมัติจากบิลค่าไฟของลูกค้า พร้อมแจ้งเตือนวิศวกรเข้าสำรวจพื้นที่หน้างาน'
      }
    }
  ],

  // 4. AI Short Film Director
  'ai-short-film-cinematic-director': [
    {
      titleHint: 'Cyberpunk Bangkok 2088: สัญญาณลึกลับใต้เยาวราชยุคไซเบอร์',
      values: {
        FILM_TITLE: 'Neon Memories: Bangkok 2088',
        GENRE_AND_THEME: 'Cyberpunk Noir Sci-Fi / ความทรงจำและความเป็นมนุษย์ในยุคไซเบอร์เนติกส์',
        LOGLINE: 'นักสืบเอกชนผู้รับจ้างกู้คืนความทรงจำที่ถูกลบ บังเอิญพบชิปปริศนาใต้เยาวราชที่มีภาพกรุงเทพฯ ยุคก่อนเกิดมหาอุทกภัย ซึ่งเปิดโปงการล่มสลายขององค์กร AI สูงสุด',
        CINEMATOGRAPHY_STYLE: 'Anamorphic 35mm lens, Moody Chiaroscuro neon lighting, wet rain reflections on asphalt, cyan and deep amber contrast, 4k cinematic film grain',
        TARGET_AI_TOOL: 'Runway Gen-3 Alpha & Kling AI v1.5'
      }
    },
    {
      titleHint: 'The Last Kingdom of Ayutthaya: มหาศึกมนต์ตราอยุธยาคู่ขนาน',
      values: {
        FILM_TITLE: 'Ayutthaya: The Ethereal Chronicles',
        GENRE_AND_THEME: 'Historical Dark Fantasy / มหากาพย์สงครามไสยเวทย์และเกียรติยศนักรบ',
        LOGLINE: 'แม่ทัพหนุ่มต้องออกตามหาดาบศิลาโบราณก่อนที่กองทัพวิญญาณเงาจะข้ามแม่น้ำเจ้าพระยาเข้ามาทำลายเมืองหลวงในคืนจันทรุปราคา',
        CINEMATOGRAPHY_STYLE: 'Epic Hollywood wide shots, golden hour mist, ethereal torchlight in ancient stone temples, Arri Alexa 65 cinematic look, slow-motion embers',
        TARGET_AI_TOOL: 'Google Veo 3 & Luma Dream Machine'
      }
    }
  ],

  // 5. Mini-Series & Drama Architect
  'ai-mini-series-drama-architect': [
    {
      titleHint: 'The Secret Billionaire Delivery Driver: มหาเศรษฐีปลอมตัวเป็นไรเดอร์',
      values: {
        SERIES_TITLE: 'มหาเศรษฐีพันล้านในคราบไรเดอร์ส่งอาหาร (The Undercover Tycoon)',
        CORE_CONFLICT: 'ทายาทตระกูลหมื่นล้านถูกขับออกจากบ้าน ถูกแฟนสาวหักหลัง จึงปลอมตัวเป็นไรเดอร์เพื่อพิสูจน์รักแท้และแอบเข้าเทกโอเวอร์บริษัทที่เคยดูถูกเขา',
        CHARACTER_PROFILES: 'พระเอก: "ภูริ" ชายหนุ่มหน้าตาหล่อคมเข้ม สวมแจ็กเก็ตไรเดอร์สีเขียวเข้ม มีสายตามุ่งมั่นลึกลับ\nนางเอก: "มินตรา" หญิงสาวจิตใจดี สวมเดรสขาวเรียบง่าย\nตัวร้าย: "วรเมธ" ไฮโซหนุ่มสวมสูทสีน้ำเงินเข้มเย่อหยิ่ง',
        EPISODE_COUNT: '8 ตอน (ตอนละ 60-90 วินาที จบด้วย Cliffhanger ทุกตอน)',
        PLATFORM_FORMAT: 'แนวตั้ง 9:16 (TikTok, Facebook Reels, YouTube Shorts)'
      }
    },
    {
      titleHint: 'Time Loop Wedding Day: เจ้าสาววนลูป 100 ครั้งเพื่อหยุดฆาตกร',
      values: {
        SERIES_TITLE: 'เจ้าสาววนลูป 100 ชะตากรรม (Loop of the Bride)',
        CORE_CONFLICT: 'ทุกครั้งที่กล่าวคำสาบานในงานแต่ง เจ้าสาวจะถูกยิงและตื่นขึ้นมาเวลา 08:00 น. ของวันแต่งงานเสมอ เธอต้องสืบหาตัวฆาตกรตัวจริงในหมู่แขก VIP',
        CHARACTER_PROFILES: 'นางเอก: "รดา" เจ้าสาวในชุดแต่งงานลูกไม้หรูหรา แววตาหวาดระแวงแต่เฉลียวฉลาด\nเจ้าบ่าว: "กวิน" นักธุรกิจหนุ่มดูสมบูรณ์แบบแต่ซ่อนความลับ\nเพื่อนสนิท: "แพรวา" ช่างแต่งหน้าผู้รู้ความลับทุกคนในงาน',
        EPISODE_COUNT: '10 ตอนเข้มข้น',
        PLATFORM_FORMAT: 'แนวตั้ง 9:16 สไตล์ Mini-Drama จีน / K-Drama'
      }
    }
  ],

  // 6. High Converting UGC Sales Video
  'high-converting-ugc-sales-video': [
    {
      titleHint: 'Collagen Glow Shots: ป้ายยาคอลลาเจนโมเลกุลเล็ก ดื่มง่าย ไม่คาว',
      values: {
        PRODUCT_NAME: 'GlowAura Collagen Peptide Tripeptide 10,000mg',
        TARGET_CUSTOMER: 'ผู้หญิงวัยทำงาน 25-45 ปี ที่ผิวหมองคล้ำ นอนดึก หน้าโทรม และมีริ้วรอยร่องแก้ม',
        CORE_PAIN_POINT: 'กินคอลลาเจนมาหลายยี่ห้อแล้วคาว ชงยาก กินแล้วไม่เห็นผล ท้องอืด',
        KEY_BENEFITS: '1. โมเลกุลดูดซึมเร็วใน 15 นาที\n2. รสส้มยูซุอร่อยสดชื่น 0% Sugar\n3. ผิวนุ่มลื่นกระจ่างใสใน 7 วัน การันตีรีวิว 10,000+ กล่อง',
        OFFER_AND_CTA: 'โปรโมชั่นพิเศษ ซื้อ 2 แถม 1 พร้อมส่งฟรี จิ้มตะกร้าเหลืองซ้ายมือล่างได้เลย'
      }
    },
    {
      titleHint: 'Ergonomic Seat Cushion: เบาะรองนั่งเพื่อสุขภาพแก้อาการออฟฟิศซินโดรม',
      values: {
        PRODUCT_NAME: 'SpineEase Zero-Gravity Memory Foam Cushion',
        TARGET_CUSTOMER: 'โปรแกรมเมอร์, พนักงานออฟฟิศ, สตรีมเมอร์ และคนขับรถทางไกลที่ต้องนั่งเกิน 8 ชม./วัน',
        CORE_PAIN_POINT: 'ปวดหลัง ปวดก้นกบ ปวดสะโพก นั่งทำงานแป๊บเดียวทรมานจนเสียสมาธิ',
        KEY_BENEFITS: '1. เมมโมรี่โฟมเกรดพรีเมียมรองรับน้ำหนักลดแรงกดทับ 80%\n2. เจลเย็นระบายอากาศ ไม่อับชื้นตลอดวัน\n3. ปลอกถอดซักได้ รับประกันโฟมไม่ยุบตัว 3 ปี',
        OFFER_AND_CTA: 'ลดพิเศษ 40% เฉพาะ 50 คนแรกในไลฟ์นี้ กดสั่งที่ตะกร้าด่วนก่อนของหมด'
      }
    }
  ],

  // 7. Commercial Reveal Blueprint
  'commercial-product-reveal-blueprint': [
    {
      titleHint: 'NovaPods Pro: หูฟังไทเทเนียมตัดเสียงรบกวนอัจฉริยะ',
      values: {
        BRAND_AND_PRODUCT: 'Nova Audio: NovaPods Pro Aerospace Titanium Earbuds',
        PRODUCT_USPS: '1. เคสไทเทเนียมกลึง CNC ไร้รอยต่อ เกรดเดียวกับอากาศยาน\n2. ระบบตัดเสียงรบกวน AI Hybrid ANC -48dB เงียบสนิทในทุกสภาพแวดล้อม\n3. แบตเตอรี่ฟังต่อเนื่อง 45 ชั่วโมง พร้อมชาร์จไร้สายแม่เหล็ก',
        COMMERCIAL_AESTHETIC: 'Apple Keynote aesthetic, Matte black & brushed titanium, Soft studio rim lighting, Macro lens texture, 60fps buttery smooth floating rotation',
        VIDEO_DURATION: '30 วินาที สำหรับ YouTube & Instagram',
        VOICEOVER_MESSAGE: 'ความเงียบที่ให้คุณได้ยินโลกในมุมที่ชัดเจนกว่าเดิม'
      }
    }
  ],

  // 8. Epic Movie Trailer
  'cinematic-movie-trailer-teaser': [
    {
      titleHint: 'Chronos Singularity: สงครามหุ่นยนต์ยึดเมืองหลวง',
      values: {
        PROJECT_TITLE: 'CHRONOS: The Singularity War',
        THREAT_STAKES: 'เมื่อโครงข่าย AI ส่วนกลางเริ่มนับเวลาถอยหลัง 24 ชั่วโมง เพื่อรีเซ็ตประชากรโลกสู่ศูนย์',
        TITLE_CARDS: 'CARD 1: จากผู้สร้างจินตนาการไร้ขีดจำกัด...\nCARD 2: เมื่อเทคโนโลยีหันกลับมาพิพากษามนุษย์...\nCARD 3: ชะตากรรมของโลก อยู่ในการตัดสินใจครั้งสุดท้าย',
        AUDIO_SOUND_DESIGN: 'Heavy Hans Zimmer Inception Braam horns, Sub-bass drop, Mechanical ticking clock, Heartbeat pulse, Explosive orchestral climax'
      }
    }
  ],

  // 9. A9 Micro-Drama Instant Producer (Google Flow Engine)
  'a9-micro-drama-instant-producer': [
    {
      titleHint: 'Face-slap revenge: แม่บ้านปลอมตัวเป็นทายาทหมื่นล้าน',
      values: {
        TROPE_PRESET: '⭐ Face-slap revenge (ตอกกลับสะใจ / ทวงคืนศักดิ์ศรี)',
        SERIES_TITLE: 'The Secret Heiress: ทายาทหมื่นล้านในคราบแม่บ้าน',
        DRAMA_SYNOPSIS: 'ทายาทสาวตระกูลอสังหาฯ หมื่นล้าน ปลอมตัวเป็นแม่บ้านในบริษัทคู่แข่งเพื่อสืบหาหลักฐานที่ครอบครัวเธอถูกใส่ร้าย จนกระทั่งถูกหัวหน้างานดูถูกและสาดกาแฟใส่กลางล็อบบี้ ต่อหน้าพนักงานทุกคน',
        PROTAGONIST_VOICE_LOCK: 'Mali: Thai woman, about 25, medium-high pitch, Central Thai accent, soft clear voice, polite with quick soft sentence endings',
        ANTAGONIST_VOICE_LOCK: 'Krit: Thai man, about 45, deep arrogant tone, Central Thai accent, fast condescending speech pace',
        OPENING_HOOK_STYLE: 'The first line is an insult, a shock or a confession (คำสบประมาท / เรื่องช็อก)',
        CAMERA_AND_MOOD: 'Dramatic push-ins on reactions (Micro-drama look), 9:16 vertical ratio, modern luxury Bangkok office, soft impact rule'
      }
    },
    {
      titleHint: 'Hidden CEO: ประธานบริษัทพันล้านในคราบช่างเทคนิค',
      values: {
        TROPE_PRESET: '💼 Hidden CEO (ประธานบริษัทปลอมตัว)',
        SERIES_TITLE: 'The Undercover Chairman: ประธานหนุ่มกับพนักงานจอมอวดดี',
        DRAMA_SYNOPSIS: 'ประธานใหญ่แอบลงตรวจไซส์งานก่อสร้างในชุดช่างซ่อม แต่ถูกผู้จัดการโครงการข่มขู่และไล่ออกเพราะไม่ยอมจ่ายส่วยใต้โต๊ะ',
        PROTAGONIST_VOICE_LOCK: 'Thee: Thai man, about 30, calm deep authoritative voice, Central Thai accent, steady slow pace',
        ANTAGONIST_VOICE_LOCK: 'Sombat: Thai man, about 50, harsh raspy tone, aggressive loud delivery',
        OPENING_HOOK_STYLE: 'Open in the middle of the action (เปิดฉากกลางความขัดแย้ง)',
        CAMERA_AND_MOOD: 'Handheld gritty tracking shot, high contrast lighting, dramatic face-off'
      }
    },
    {
      titleHint: 'Rebirth revenge: เกิดใหม่ในวันแต่งงานเพื่อล้างแค้น',
      values: {
        TROPE_PRESET: '⏳ Rebirth revenge (เกิดใหม่มาแก้แค้น)',
        SERIES_TITLE: 'Second Life Bride: เกิดใหม่ในคืนวิวาห์เลือด',
        DRAMA_SYNOPSIS: 'นางเอกถูกสามีและน้องสาวต่างแม่วางยาพิษในวันแต่งงาน แต่ลืมตาตื่นขึ้นมาอีกครั้งในเช้าวันหมั้นเมื่อ 3 ปีก่อน เธอจึงพลิกแผนฉีกหน้ากากทุกคนกลางงานเลี้ยง',
        PROTAGONIST_VOICE_LOCK: 'Rada: Thai woman, about 26, cold elegant crystal voice, precise articulation',
        ANTAGONIST_VOICE_LOCK: 'Win: Thai man, about 28, sweet hypocritical tone, deceptive charm',
        OPENING_HOOK_STYLE: 'Open on a glimpse of the climax then flash back to the past',
        CAMERA_AND_MOOD: 'Anamorphic 35mm lens, luxury chandelier reflections, moody chiaroscuro'
      }
    }
  ]
};

export default function PromptsPage() {
  const [prompts, setPrompts] = useState<PromptTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrompt, setSelectedPrompt] = useState<PromptTemplate | null>(null);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Generator form inputs: variable values mapped by key
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  // Randomizer & Modal states
  const [isRandomizing, setIsRandomizing] = useState(false);
  const [showGeneratedModal, setShowGeneratedModal] = useState(false);
  const [randomPresetTitle, setRandomPresetTitle] = useState<string>('');

  // 500 Random Ideas & Prompts System States
  const [showPoolModal, setShowPoolModal] = useState(false);
  const [selectedPoolCategory, setSelectedPoolCategory] = useState<string>('all');
  const [poolSearchQuery, setPoolSearchQuery] = useState<string>('');
  const [activePoolItem, setActivePoolItem] = useState<Random500Item | null>(null);
  const [poolCopiedId, setPoolCopiedId] = useState<string | null>(null);

  // Sticky Bar visibility when scrolling down
  const [isScrolledPastHero, setIsScrolledPastHero] = useState(false);

  // Fetch prompts
  useEffect(() => {
    fetch('/api/prompts')
      .then(r => r.json())
      .then(res => {
        if (res.success && res.data.length > 0) {
          setPrompts(res.data);
          const initial = res.data.find((p: PromptTemplate) => p.isFeatured) || res.data[0];
          setSelectedPrompt(initial);
          initVariables(initial);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Monitor scroll for sticky bar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setIsScrolledPastHero(true);
      } else {
        setIsScrolledPastHero(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Initialize form fields with prompt's default variable values
  const initVariables = useCallback((p: PromptTemplate) => {
    const initialMap: Record<string, string> = {};
    p.variables?.forEach(v => {
      initialMap[v.key] = v.defaultValue || '';
    });
    setVariableValues(initialMap);
  }, []);

  const handleSelectPrompt = (p: PromptTemplate) => {
    setSelectedPrompt(p);
    initVariables(p);
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      const el = document.getElementById('prompt-builder');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Compute final generated prompt text by replacing placeholders
  const generatedPrompt = useMemo(() => {
    if (!selectedPrompt) return '';
    let result = selectedPrompt.templateContent;
    selectedPrompt.variables?.forEach(v => {
      const val = variableValues[v.key] ?? v.defaultValue ?? '';
      const regex = new RegExp(`{{${v.key}}}`, 'g');
      result = result.replace(regex, val);
    });
    return result;
  }, [selectedPrompt, variableValues]);

  // Copy handler
  const handleCopy = async () => {
    if (!generatedPrompt) return;
    try {
      await navigator.clipboard.writeText(generatedPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);

      if (selectedPrompt?.id) {
        fetch(`/api/prompts/${selectedPrompt.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'increment_copy' })
        }).catch(() => {});
        setPrompts(prev => prev.map(p => p.id === selectedPrompt.id ? { ...p, copyCount: (p.copyCount || 0) + 1 } : p));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Download markdown (.md)
  const handleDownload = () => {
    if (!generatedPrompt || !selectedPrompt) return;
    const blob = new Blob([generatedPrompt], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedPrompt.slug || 'master-prompt'}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2500);
  };

  // Trigger celebration confetti
  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#fbbf24', '#f59e0b', '#ec4899', '#6366f1', '#10b981']
      });
    } catch {
      // safe fallback
    }
  };

  // Generate Master Prompt modal trigger
  const handleGenerateMasterPrompt = () => {
    setShowGeneratedModal(true);
    triggerConfetti();
  };

  // AI RANDOM PROMPT GENERATOR:
  // Randomly selects a prompt template AND applies a smart creative preset or dynamic AI idea
  const handleRandomPrompt = () => {
    if (prompts.length === 0) return;
    setIsRandomizing(true);

    // 1. Pick a random prompt
    const randomIndex = Math.floor(Math.random() * prompts.length);
    const chosenPrompt = prompts[randomIndex];
    setSelectedPrompt(chosenPrompt);

    // 2. Check if we have smart realistic presets for this prompt
    const key = chosenPrompt.slug || chosenPrompt.id;
    const presets = AI_RANDOM_PRESETS[key];

    let appliedValues: Record<string, string> = {};
    let presetTitle = '';

    if (presets && presets.length > 0) {
      const randomPreset = presets[Math.floor(Math.random() * presets.length)];
      presetTitle = randomPreset.titleHint || chosenPrompt.title;
      chosenPrompt.variables?.forEach(v => {
        appliedValues[v.key] = randomPreset.values[v.key] ?? v.defaultValue ?? '';
      });
    } else {
      presetTitle = `${chosenPrompt.title} (AI Creative Preset)`;
      chosenPrompt.variables?.forEach(v => {
        appliedValues[v.key] = v.defaultValue ?? '';
      });
    }

    setVariableValues(appliedValues);
    setRandomPresetTitle(presetTitle);

    // 3. Visual feedback & animation
    setTimeout(() => {
      setIsRandomizing(false);
      triggerConfetti();
      setShowGeneratedModal(true);

      const el = document.getElementById('prompt-builder');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 450);
  };

  // 500 Random Ideas: Quick pick 1 random from 500 catalog
  const handleRandomFrom500 = (cat?: string) => {
    setIsRandomizing(true);
    let items = pool500Data as Random500Item[];
    if (cat && cat !== 'all') {
      items = items.filter(it => it.category.toLowerCase() === cat.toLowerCase());
    }
    if (items.length === 0) items = pool500Data as Random500Item[];
    const chosen = items[Math.floor(Math.random() * items.length)];

    setTimeout(() => {
      setIsRandomizing(false);
      setActivePoolItem(chosen);
      setShowPoolModal(true);
      triggerConfetti();
    }, 300);
  };

  const handleCopyPoolPrompt = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setPoolCopiedId(id);
    setTimeout(() => setPoolCopiedId(null), 2000);
  };

  // Randomize variables for the CURRENT active prompt
  const handleRandomizeCurrentVariables = () => {
    if (!selectedPrompt) return;
    setIsRandomizing(true);

    const key = selectedPrompt.slug || selectedPrompt.id;
    const presets = AI_RANDOM_PRESETS[key];

    let appliedValues: Record<string, string> = {};
    let presetTitle = '';

    if (presets && presets.length > 0) {
      const randomPreset = presets[Math.floor(Math.random() * presets.length)];
      presetTitle = randomPreset.titleHint || selectedPrompt.title;
      selectedPrompt.variables?.forEach(v => {
        appliedValues[v.key] = randomPreset.values[v.key] ?? v.defaultValue ?? '';
      });
    } else {
      presetTitle = `${selectedPrompt.title} (Random Ideas)`;
      selectedPrompt.variables?.forEach(v => {
        appliedValues[v.key] = v.defaultValue ?? '';
      });
    }

    setVariableValues(appliedValues);
    setRandomPresetTitle(presetTitle);

    setTimeout(() => {
      setIsRandomizing(false);
      triggerConfetti();
      setShowGeneratedModal(true);
    }, 350);
  };

  const categories = ['all', ...Array.from(new Set(prompts.map(p => p.category).filter(Boolean)))];

  const filteredPrompts = prompts.filter(p => {
    const matchCat = selectedCategory === 'all' || p.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchQuery = !searchQuery ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCat && matchQuery;
  });

  return (
    <div className="min-h-screen bg-[#080f1a] text-slate-100 selection:bg-amber-400 selection:text-slate-950 pb-28">
      
      {/* Background Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[750px] h-[350px] bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-amber-500/10 blur-[130px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        
        {/* Header Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>AI PROMPT GENERATOR & LIBRARY</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-5 leading-tight">
            คลัง Master Prompt & <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-amber-400">
              ตัวสร้าง Prompt อัจฉริยะ (Builder)
            </span>
          </h1>

          <p className="text-slate-400 text-base sm:text-lg leading-relaxed mb-7">
            เลือกโจทย์ที่คุณต้องการ หรือกดสุ่มด้วย AI เพื่อรับ Master Prompt สั่งการ Codex, Claude 3.7, Cursor หรือ ChatGPT 
            นำไปใช้สร้าง Web App, ระบบ CRM, หรือคอนเทนต์ได้ทันทีโดยไม่ต้องเริ่มต้นจากศูนย์
          </p>

          {/* HERO AI RANDOM PROMPT & 500 POOL BUTTONS */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => handleRandomFrom500()}
              disabled={isRandomizing}
              className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-sm sm:text-base shadow-xl shadow-amber-400/25 hover:shadow-amber-400/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 border border-amber-200/50"
            >
              <Dices className={`w-5 h-5 text-slate-950 ${isRandomizing ? 'animate-spin' : ''}`} />
              <span>{isRandomizing ? 'กำลังสุ่มไอเดียด้วย AI...' : '🎲 สุ่มไอเดีย & Prompt 500 รายการ'}</span>
            </button>

            <button
              onClick={() => {
                setActivePoolItem(null);
                setShowPoolModal(true);
              }}
              className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-gradient-to-r from-purple-600/30 via-indigo-600/30 to-slate-900/80 hover:from-purple-600/40 hover:to-indigo-600/40 text-purple-200 text-sm font-bold border border-purple-500/40 hover:border-purple-400 transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-500/10"
            >
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>คลังสุ่ม 500 ไอเดีย (ดูทั้งหมด)</span>
            </button>

            <button
              onClick={handleRandomPrompt}
              disabled={isRandomizing || prompts.length === 0}
              className="w-full sm:w-auto px-5 py-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 text-sm font-semibold border border-white/10 hover:border-amber-400/30 transition-all flex items-center justify-center gap-2"
            >
              <Shuffle className="w-4 h-4 text-amber-400" />
              <span>สุ่มฟอร์ม Master Prompt</span>
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* SKILL DOWNLOAD HIGHLIGHT: AI STORY ARCHITECT             */}
        {/* ======================================================== */}
        <div className="mb-10 p-5 sm:p-6 rounded-2xl border border-amber-400/30 bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-slate-900/60 shadow-xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-amber-400/20 shrink-0">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 uppercase tracking-wide">
                    DOWNLOAD SKILL
                  </span>
                  <h3 className="text-base font-bold text-white">
                    Skill: AI Story Architect
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
                  ช่วยวางแผนและพัฒนาเรื่องราวสำหรับสร้างวิดีโอด้วย AI ตั้งแต่ไอเดียเริ่มต้นจนถึง Scene Breakdown พร้อม Image Prompts ที่พร้อมส่งต่อให้ AI Video Specialist
                </p>
              </div>
            </div>

            <a
              href="https://drive.google.com/file/d/1h2SP4lI-LdAxjnhp_YwwpH4ps6DwMk7F/view?usp=sharing"
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-md shadow-amber-400/20 transition-all hover:scale-105"
            >
              <Download className="w-4 h-4" />
              <span>ดาวน์โหลด Skill (Google Drive)</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Video Prompt, Drama Studio, Director Studio, Vibe Design & Motion Claude Feature Banners */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-12">
          {/* 1. Video Prompt Library Banner */}
          <Link
            href="/prompts/video"
            className="group block relative overflow-hidden rounded-2xl border border-pink-500/30 bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-slate-900/40 p-4 sm:p-5 hover:border-pink-500/60 transition-all shadow-xl hover:shadow-pink-500/10"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-500 to-rose-400 text-white flex items-center justify-center font-bold shadow-lg shadow-pink-500/20 group-hover:scale-105 transition-transform shrink-0 mt-0.5">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-pink-500 text-white uppercase tracking-wide">
                      9 STUDIOS
                    </span>
                    <h3 className="text-sm font-bold text-white group-hover:text-pink-300 transition-colors">
                      Prompt Video
                    </h3>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                    9 สตูดิโอโปรดักชัน รีโนเวท, UGC, อสังหาฯ และ 100 สไตล์วิดีโอ
                  </p>
                </div>
              </div>
              <div className="p-1 rounded-lg bg-pink-500/20 text-pink-400 group-hover:bg-pink-500 group-hover:text-white transition-colors shrink-0 mt-1">
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </Link>

          {/* 2. AI Drama Studio Pinterest Catalog Banner */}
          <Link
            href="/prompts/drama"
            className="group block relative overflow-hidden rounded-2xl border border-amber-400/40 bg-gradient-to-br from-amber-400/10 via-amber-500/10 to-slate-900/40 p-4 sm:p-5 hover:border-amber-400/80 transition-all shadow-xl hover:shadow-amber-400/10"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 to-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-lg shadow-amber-400/20 group-hover:scale-105 transition-transform shrink-0 mt-0.5">
                  <Film className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-400 text-slate-950 uppercase tracking-wide">
                      77 STYLES
                    </span>
                    <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                      Video ละคร
                    </h3>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                    คลิปละครสั้น AI ทุกแนวเรื่อง ท่ากล้อง แสง และบทพูดภาษาไทย
                  </p>
                </div>
              </div>
              <div className="p-1 rounded-lg bg-amber-400/20 text-amber-400 group-hover:bg-amber-400 group-hover:text-slate-950 transition-colors shrink-0 mt-1">
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </Link>

          {/* 3. Director Prompt Studio Banner */}
          <Link
            href="/prompts/director-studio"
            className="group block relative overflow-hidden rounded-2xl border border-emerald-500/40 bg-gradient-to-br from-emerald-500/15 via-teal-500/10 to-slate-900/40 p-4 sm:p-5 hover:border-emerald-400 transition-all shadow-xl hover:shadow-emerald-500/10"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center font-bold shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform shrink-0 mt-0.5">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 uppercase tracking-wide">
                      8-STEP WIZARD
                    </span>
                    <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                      Director Studio
                    </h3>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                    สร้าง Prompt ละเอียดระดับผู้กำกับ ล็อกหน้าตัวละคร Storyboard & Subtitle
                  </p>
                </div>
              </div>
              <div className="p-1 rounded-lg bg-emerald-500/20 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-colors shrink-0 mt-1">
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </Link>

          {/* 4. Website Design (Oil UI) Banner */}
          <Link
            href="/prompts/website-design"
            className="group block relative overflow-hidden rounded-2xl border border-indigo-500/40 bg-gradient-to-br from-indigo-500/15 via-purple-500/10 to-slate-900/40 p-4 sm:p-5 hover:border-indigo-400 transition-all shadow-xl hover:shadow-indigo-500/10"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 text-white flex items-center justify-center font-bold shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform shrink-0 mt-0.5">
                  <Palette className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-500 text-white uppercase tracking-wide">
                      97 STYLES
                    </span>
                    <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                      Website Design
                    </h3>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                    UI Design Skill สำหรับ AI คลัง 97 สไตล์ & Playbooks
                  </p>
                </div>
              </div>
              <div className="p-1 rounded-lg bg-indigo-500/20 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-colors shrink-0 mt-1">
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </Link>

          {/* 5. Motion Claude Prompt (Opus 5.5) Banner */}
          <Link
            href="/prompts/motion-claude"
            className="group block relative overflow-hidden rounded-2xl border border-orange-500/40 bg-gradient-to-br from-orange-500/15 via-amber-500/10 to-slate-900/40 p-4 sm:p-5 hover:border-orange-400 transition-all shadow-xl hover:shadow-orange-500/10"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform shrink-0 mt-0.5">
                  <Clapperboard className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-orange-500 text-slate-950 uppercase tracking-wide">
                      703 PROMPTS · NEW
                    </span>
                    <h3 className="text-sm font-bold text-white group-hover:text-orange-300 transition-colors">
                      Motion Claude
                    </h3>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                    Opus 5.5 Viral Videos & Motion Code + 418 Remakes
                  </p>
                </div>
              </div>
              <div className="p-1 rounded-lg bg-orange-500/20 text-orange-400 group-hover:bg-orange-500 group-hover:text-slate-950 transition-colors shrink-0 mt-1">
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </Link>
        </div>

        {/* ======================================================== */}
        {/* SECTION 1: PROMPT PRESETS / CARDS SELECTOR               */}
        {/* ======================================================== */}
        <div className="mb-14">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-amber-400" />
                  <span>1. เลือกเทมเพลต Prompt จากคลัง</span>
                </h2>
                <button
                  onClick={handleRandomPrompt}
                  className="px-2.5 py-1 rounded-lg bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 border border-amber-400/30 text-xs font-bold transition flex items-center gap-1"
                  title="สุ่มเลือก Prompt และตั้งค่าตัวแปรอัตโนมัติ"
                >
                  <Dices className="w-3.5 h-3.5" />
                  <span>สุ่มเลือก Prompt</span>
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">คลิกเพื่อโหลดการตั้งค่าเข้าสู่ระบบ Prompt Generator</p>
            </div>

            {/* Search Input & Filter pills */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
              <div className="relative min-w-[240px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ค้นหา เช่น หนังสั้น, UGC, ซีรีส์..."
                  className="w-full bg-[#101c2d] border border-white/10 text-xs rounded-xl pl-9 pr-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Filter pills */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl font-medium transition-all flex items-center gap-1 ${
                      selectedCategory === cat
                        ? cat === 'AI Video Creation'
                          ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold shadow-md shadow-pink-500/20'
                          : 'bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-400/20'
                        : 'bg-[#101c2d] text-slate-400 hover:text-white border border-white/5'
                    }`}
                  >
                    {cat === 'AI Video Creation' && <Video className="w-3 h-3 text-pink-300" />}
                    <span>{cat === 'all' ? 'ทั้งหมด' : cat}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Cards Grid */}
          {filteredPrompts.length === 0 ? (
            <div className="rounded-2xl border border-white/5 bg-[#0e1828] p-10 text-center text-slate-400">
              <p className="text-sm mb-3">ไม่พบ Prompt ที่ตรงกับคำค้นหา "{searchQuery}"</p>
              <button
                onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
                className="text-xs px-3 py-1.5 rounded-lg bg-amber-400/10 text-amber-400 border border-amber-400/30 hover:bg-amber-400/20 transition-all"
              >
                ล้างการค้นหาทั้งหมด
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredPrompts.map(p => {
                const isSelected = selectedPrompt?.id === p.id;
                const isVideo = p.category === 'AI Video Creation';
                return (
                  <div
                    key={p.id}
                    onClick={() => handleSelectPrompt(p)}
                    className={`cursor-pointer rounded-2xl p-5 border transition-all text-left relative flex flex-col justify-between ${
                      isSelected
                        ? isVideo
                          ? 'bg-[#1a1426] border-pink-500 shadow-xl shadow-pink-500/10 ring-2 ring-pink-500/30'
                          : 'bg-[#14233a] border-amber-400 shadow-xl shadow-amber-400/10 ring-2 ring-amber-400/30'
                        : 'bg-[#0e1828] border-white/5 hover:border-white/20 hover:bg-[#121f33]'
                    }`}
                  >
                    {p.isFeatured && (
                      <span className={`absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                        isVideo
                          ? 'bg-pink-500/10 text-pink-400 border-pink-500/30'
                          : 'bg-amber-400/10 text-amber-400 border-amber-400/30'
                      }`}>
                        <Flame className="w-3 h-3" /> แนะนำ
                      </span>
                    )}

                    <div>
                      <span className={`text-[11px] font-medium tracking-wide uppercase flex items-center gap-1.5 mb-1.5 ${
                        isVideo ? 'text-pink-400' : 'text-amber-400/90'
                      }`}>
                        {isVideo && <Video className="w-3.5 h-3.5" />}
                        <span>{p.category}</span>
                      </span>
                      <h3 className="text-sm font-bold text-white line-clamp-2 mb-2 leading-snug">
                        {p.title}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                        {p.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 font-mono">
                        {p.variables?.length || 0} ตัวแปร
                      </span>
                      <span className={`font-semibold flex items-center gap-1 ${
                        isSelected 
                          ? isVideo ? 'text-pink-400' : 'text-amber-400' 
                          : 'text-slate-400'
                      }`}>
                        {isSelected ? 'กำลังปรับแต่ง' : 'เลือกใช้'}
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* SECTION 2: PROMPT BUILDER WORKSPACE                      */}
        {/* ======================================================== */}
        <div id="prompt-builder" className="scroll-mt-24">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-amber-400" />
              <span>2. ปรับแต่ง Prompt ของคุณ (Prompt Generator)</span>
            </h2>

            {/* Quick Random Action in Builder */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleRandomizeCurrentVariables}
                disabled={isRandomizing}
                className="px-3 py-1.5 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 text-xs font-bold border border-amber-400/30 transition flex items-center gap-1.5"
                title="สุ่มไอเดียตัวแปรใหม่สำหรับฟอร์มนี้"
              >
                <Shuffle className="w-3.5 h-3.5" />
                <span>🎲 สุ่มไอเดียตัวแปร (Random Values)</span>
              </button>
            </div>
          </div>

          {selectedPrompt ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* LEFT COLUMN: Input Configuration Form */}
              <div className="lg:col-span-5 bg-[#0e1828] border border-white/10 rounded-3xl p-6 sm:p-7 shadow-2xl relative">
                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                  <div>
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block">
                      CONFIG FORM
                    </span>
                    <h3 className="text-base font-bold text-white mt-0.5 line-clamp-1">
                      {selectedPrompt.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={handleRandomizeCurrentVariables}
                      title="สุ่มค่าตัวแปรใหม่"
                      className="p-2 rounded-xl bg-amber-400/10 text-amber-400 hover:bg-amber-400/20 transition text-xs flex items-center gap-1"
                    >
                      <Shuffle className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">สุ่ม</span>
                    </button>
                    <button
                      onClick={() => initVariables(selectedPrompt)}
                      title="รีเซ็ตค่าเป็นค่าเริ่มต้น"
                      className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition text-xs flex items-center gap-1"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">รีเซ็ต</span>
                    </button>
                  </div>
                </div>

                <form onSubmit={e => e.preventDefault()} className="space-y-4">
                  {selectedPrompt.variables?.map(v => (
                    <div key={v.key} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-slate-300">
                          {v.label}
                        </label>
                        <span className="text-[10px] font-mono text-slate-500">
                          {`{{${v.key}}}`}
                        </span>
                      </div>

                      {v.description && (
                        <p className="text-[11px] text-slate-400 leading-tight">
                          {v.description}
                        </p>
                      )}

                      {v.type === 'textarea' ? (
                        <textarea
                          rows={4}
                          value={variableValues[v.key] ?? ''}
                          onChange={e => setVariableValues(prev => ({ ...prev, [v.key]: e.target.value }))}
                          className="w-full bg-[#080f1a] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-400 font-sans leading-relaxed"
                          placeholder={`ใส่ข้อมูล ${v.label}...`}
                        />
                      ) : (
                        <input
                          type="text"
                          value={variableValues[v.key] ?? ''}
                          onChange={e => setVariableValues(prev => ({ ...prev, [v.key]: e.target.value }))}
                          className="w-full bg-[#080f1a] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-400 font-sans"
                          placeholder={`ใส่ข้อมูล ${v.label}...`}
                        />
                      )}
                    </div>
                  ))}

                  {/* Primary Action Buttons */}
                  <div className="pt-4 space-y-2.5">
                    <button
                      type="button"
                      onClick={handleGenerateMasterPrompt}
                      className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-amber-400/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 border border-amber-200/40"
                    >
                      <Sparkles className="w-4 h-4 text-slate-950" />
                      <span>✨ สร้าง Master Prompt (Generate)</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleCopy}
                        className="flex-1 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-white/5 transition-all flex items-center justify-center gap-1.5"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-400" />}
                        <span>{copied ? 'คัดลอก Prompt แล้ว!' : 'คัดลอก Prompt'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleDownload}
                        className="py-2.5 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-white/5 transition flex items-center gap-1.5"
                        title="ดาวน์โหลดเป็นไฟล์ Markdown (.md)"
                      >
                        <Download className="w-3.5 h-3.5 text-amber-400" />
                        <span>.md</span>
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              {/* RIGHT COLUMN: Real-Time Preview Terminal */}
              <div className="lg:col-span-7 bg-[#0b1320] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
                
                {/* Terminal Header */}
                <div className="bg-[#0e1828] px-5 py-3.5 border-b border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 mr-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                    </div>
                    <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                      <Terminal className="w-3.5 h-3.5 text-amber-400" />
                      <span>{selectedPrompt.slug || 'master-prompt'}.md</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-slate-500 hidden sm:inline">
                      {generatedPrompt.length.toLocaleString()} ตัวอักษร
                    </span>
                    <button
                      onClick={handleCopy}
                      className="px-3 py-1.5 rounded-lg bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 text-xs font-bold border border-amber-400/30 transition flex items-center gap-1"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                {/* Terminal Code Body */}
                <div className="p-5 font-mono text-xs leading-relaxed text-slate-300 max-h-[580px] overflow-y-auto whitespace-pre-wrap select-text bg-[#070d17]/80">
                  {generatedPrompt}
                </div>

                {/* Footer hints */}
                <div className="bg-[#0e1828]/90 px-5 py-3 border-t border-white/5 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>พร้อมนำไปวางใน Codex / Claude Sonnet / Cursor ได้ทันที</span>
                  </span>
                  <Link
                    href="/articles"
                    className="text-amber-400 hover:text-amber-300 flex items-center gap-1"
                  >
                    <span>อ่านคู่มือการรัน Prompt</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>

            </div>
          ) : (
            <div className="text-center py-20 bg-[#0e1828] border border-white/5 rounded-3xl">
              <p className="text-slate-400">กำลังโหลดเทมเพลต Prompt...</p>
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* SECTION 3: FAQ / PROMPT TIPS                             */}
        {/* ======================================================== */}
        <div className="mt-20 pt-12 border-t border-white/10">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-xl font-bold text-white text-center mb-8 flex items-center justify-center gap-2">
              <HelpCircle className="w-5 h-5 text-amber-400" />
              <span>วิธีใช้งาน Master Prompt ให้ได้ผลลัพธ์ดีที่สุด</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-300">
              <div className="bg-[#0e1828] p-5 rounded-2xl border border-white/5">
                <span className="w-7 h-7 rounded-lg bg-amber-400/10 text-amber-400 font-bold flex items-center justify-center mb-3">
                  1
                </span>
                <h4 className="font-bold text-white mb-1.5">กำหนดโจทย์ให้เฉพาะเจาะจง</h4>
                <p className="text-slate-400 leading-relaxed">
                  ยิ่งใส่ข้อมูลกลุ่มเป้าหมาย (Users) และฟีเจอร์หลัก (Features) ชัดเจน AI จะไม่ออกนอกลู่นอกทาง และวางสถาปัตยกรรมได้ตรงใจ
                </p>
              </div>

              <div className="bg-[#0e1828] p-5 rounded-2xl border border-white/5">
                <span className="w-7 h-7 rounded-lg bg-amber-400/10 text-amber-400 font-bold flex items-center justify-center mb-3">
                  2
                </span>
                <h4 className="font-bold text-white mb-1.5">สั่ง AI ทำทีละ Phase</h4>
                <p className="text-slate-400 leading-relaxed">
                  ใน Master Prompt แบ่งเป็น 6 Phases (Foundation → Database → Core UI → AI → Test → Deploy) อย่าสั่งทำทั้งหมดในคำสั่งเดียว
                </p>
              </div>

              <div className="bg-[#0e1828] p-5 rounded-2xl border border-white/5">
                <span className="w-7 h-7 rounded-lg bg-amber-400/10 text-amber-400 font-bold flex items-center justify-center mb-3">
                  3
                </span>
                <h4 className="font-bold text-white mb-1.5">ตรวจ Type & Tests สม่ำเสมอ</h4>
                <p className="text-slate-400 leading-relaxed">
                  เมื่อ AI เขียนโค้ดแต่ละหน้าเสร็จ ให้สั่งรัน Type Check และรันเทสต์ทุกครั้ง เพื่อป้องกันข้อผิดพลาดสะสม
                </p>
              </div>
            </div>

            {/* CTA Workshop Banner */}
            <div className="mt-12 bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-amber-500/10 border border-amber-400/30 rounded-3xl p-6 sm:p-8 text-center relative overflow-hidden">
              <h4 className="text-lg font-bold text-white mb-2">
                ต้องการเรียนรู้วิธีสร้าง AI Agent และสั่ง AI ขั้นสูงแบบจับมือทำ?
              </h4>
              <p className="text-xs text-slate-300 max-w-xl mx-auto mb-5 leading-relaxed">
                ลงทะเบียนเวิร์กช็อปกับ อ. Kevin เพื่อฝึกต่อยอด Prompt เหล่านี้ให้เป็นระบบใช้งานจริง พร้อมการเขียนโค้ดและเชื่อมระบบอัตโนมัติ
              </p>
              <Link
                href="/#classes"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold shadow-lg shadow-amber-400/20 transition"
              >
                <span>ดูรอบเรียนและจองคลาส</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

          </div>
        </div>

      </div>

      {/* ======================================================== */}
      {/* 4. FIXED POSITION FLOATING BOTTOM ACTION BAR             */}
      {/* (User request: Copy or Gen directly without scrolling up) */}
      {/* ======================================================== */}
      {selectedPrompt && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[94%] max-w-3xl bg-[#0b1424]/95 backdrop-blur-xl border border-amber-400/40 shadow-2xl shadow-black/80 rounded-2xl px-4 py-3 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
          
          {/* Active Prompt Title & Status */}
          <div className="min-w-0 flex-1 flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">
                {selectedPrompt.title}
              </p>
              <p className="text-[10px] text-slate-400 font-mono truncate hidden sm:block">
                {generatedPrompt.length.toLocaleString()} chars · พร้อมคัดลอกใช้งาน
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Quick Randomize */}
            <button
              onClick={handleRandomPrompt}
              disabled={isRandomizing}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-semibold border border-white/5 transition flex items-center gap-1.5"
              title="สุ่ม Prompt ใหม่ด้วย AI"
            >
              <Dices className={`w-4 h-4 ${isRandomizing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">สุ่มใหม่</span>
            </button>

            {/* Generate / Open Modal */}
            <button
              onClick={handleGenerateMasterPrompt}
              className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black shadow-lg shadow-amber-400/25 transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>สร้าง Prompt</span>
            </button>

            {/* Instant Copy Button */}
            <button
              onClick={handleCopy}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                copied
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                  : 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-lg shadow-amber-400/20'
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'คัดลอกแล้ว!' : 'Copy'}</span>
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. SUCCESS POPUP MODAL: "เราได้สร้าง Prompt ให้คุณแล้ว"   */}
      {/* ======================================================== */}
      {showGeneratedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="relative w-full max-w-xl bg-[#0d1726] border border-amber-400/40 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-amber-400/10 text-left overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Background Accent */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={() => setShowGeneratedModal(false)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition"
              title="ปิดหน้าต่าง"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header Icon & Message */}
            <div className="flex items-start gap-4 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/30 text-amber-400 flex items-center justify-center shrink-0">
                <CheckCircle className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 uppercase tracking-wider">
                  MASTER PROMPT READY
                </span>
                <h3 className="text-xl font-black text-white mt-1 leading-snug">
                  เราได้สร้าง Prompt ให้คุณแล้ว!
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  สามารถคัดลอก Master Prompt นี้ไปใช้งานกับ Codex, Claude 3.7, Cursor หรือ ChatGPT ได้ทันที
                </p>
              </div>
            </div>

            {/* Prompt Meta Box */}
            <div className="mb-5 p-4 rounded-2xl bg-[#070e1a] border border-white/5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">ชื่อ Prompt:</span>
                <span className="text-white font-bold truncate max-w-[280px]">
                  {selectedPrompt?.title}
                </span>
              </div>
              {randomPresetTitle && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">ไอเดียที่สุ่ม:</span>
                  <span className="text-amber-400 font-semibold truncate max-w-[280px]">
                    {randomPresetTitle}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">ความยาว:</span>
                <span className="text-slate-300 font-mono">
                  {generatedPrompt.length.toLocaleString()} ตัวอักษร
                </span>
              </div>
            </div>

            {/* Preview Box */}
            <div className="mb-6 max-h-44 overflow-y-auto p-3.5 rounded-xl bg-[#050a12] border border-white/5 font-mono text-[11px] leading-relaxed text-slate-300 whitespace-pre-wrap select-text">
              {generatedPrompt.slice(0, 500)}...
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={() => {
                  handleCopy();
                }}
                className={`w-full flex-1 py-3.5 px-5 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl transition-all ${
                  copied
                    ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                    : 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-amber-400/25'
                }`}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'คัดลอก Master Prompt สำเร็จ!' : 'คัดลอก Master Prompt เดี๋ยวนี้'}</span>
              </button>

              <button
                onClick={() => {
                  handleDownload();
                  setShowGeneratedModal(false);
                }}
                className="w-full sm:w-auto py-3.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-white/5 transition flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4 text-amber-400" />
                <span>ดาวน์โหลด .md</span>
              </button>
            </div>

            <p className="text-[11px] text-center text-slate-400 mt-4">
              กดปิดหน้าต่างเพื่อกลับไปปรับแต่งตัวแปรในฟอร์มเพิ่มเติมได้ตลอดเวลา
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
