export type ClassType = 'online' | 'onsite';

export interface ClassAttachment {
  id: string;
  name: string;
  type: 'pdf' | 'doc' | 'ebook' | 'youtube' | 'link';
  url: string;
  size?: string;
}

export type DurationUnit = 'minute' | 'hour' | 'day';

export type CourseLevel = 'beginner' | 'intermediate' | 'advanced';

export interface CourseLevelConfig {
  id: CourseLevel;
  label: string; // 'เริ่มต้น', 'ปานกลาง', 'ระดับสูง'
  enLabel: string; // 'Beginner', 'Intermediate', 'Advanced'
  description: string;
  badgeClass: string;
  dotColor: string;
  textColor: string;
}

export const COURSE_LEVELS: Record<CourseLevel, CourseLevelConfig> = {
  beginner: {
    id: 'beginner',
    label: 'เริ่มต้น',
    enLabel: 'Beginner',
    description: 'ไม่มีพื้นฐานก็เรียนได้ เริ่มตั้งแต่ศูนย์',
    badgeClass: 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400',
    dotColor: 'bg-emerald-400',
    textColor: 'text-emerald-400'
  },
  intermediate: {
    id: 'intermediate',
    label: 'ปานกลาง',
    enLabel: 'Intermediate',
    description: 'มีพื้นฐานการใช้ AI มาบ้าง มุ่งเน้นต่อยอดจริง',
    badgeClass: 'bg-amber-500/15 border border-amber-500/30 text-amber-400',
    dotColor: 'bg-amber-400',
    textColor: 'text-amber-400'
  },
  advanced: {
    id: 'advanced',
    label: 'ระดับสูง',
    enLabel: 'Advanced',
    description: 'ระดับเชี่ยวชาญ เทคนิคเชิงลึก หรือสร้าง AI Agent ขั้นสูง',
    badgeClass: 'bg-rose-500/15 border border-rose-500/30 text-rose-400',
    dotColor: 'bg-rose-400',
    textColor: 'text-rose-400'
  }
};

export function getCourseLevelConfig(level?: string | CourseLevel | null): CourseLevelConfig {
  if (level === 'advanced') return COURSE_LEVELS.advanced;
  if (level === 'intermediate') return COURSE_LEVELS.intermediate;
  return COURSE_LEVELS.beginner;
}

export interface LessonModule {
  id: string;
  title: string;
  duration?: string; // e.g. "15 นาที", "25:00"
  videoUrl: string; // YouTube link, Google Drive video, or direct MP4 link
  summary?: string;
  order?: number;
}

export interface ClassItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  type: ClassType;
  price: number;
  isFree?: boolean; // คอร์สฟรี (0 บาท) หรือมีค่าใช้จ่าย
  rewardPoints?: number; // แต้มสะสมที่จะได้รับเมื่อลงเรียนคลาสนี้
  level?: CourseLevel; // ระดับความยากง่าย: 'beginner' (เริ่มต้น) | 'intermediate' (ปานกลาง) | 'advanced' (ระดับสูง)
  durationMinutes: number; // เก็บเป็นจำนวนนาทีรวม (backward compatibility)
  durationValue?: number; // ตัวเลขจำนวน เช่น 2, 90, 3
  durationUnit?: DurationUnit; // หน่วย: 'minute' (นาที), 'hour' (ชม.), 'day' (วัน)
  location?: string; // e.g. "NEXUS Bangkok Downtown Campus (ชั้น 6 M Academy)" or "Google Meet / Zoom"
  onlineMeetingUrl?: string; // Meeting link for online classes
  maxSeats: number;
  availableDates: string[]; // ISO Date strings 'YYYY-MM-DD'
  timeSlots: string[]; // e.g. ["10:00 - 12:00", "13:00 - 16:00", "18:00 - 20:00"]
  topics: string[];
  toolsUsed: string[];
  prerequisites: string;
  image: string;
  featured?: boolean;
  attachments?: ClassAttachment[]; // Max 4 items (PDF, doc, ebook, link, youtube)
  // E-Learning Video, Instructor & Certificate extensions
  videoUrl?: string; // ลิงก์วิดีโอหลัก หรือ YouTube E-Learning ของคอร์ส
  lessons?: LessonModule[]; // รายการบทเรียนวิดีโอย่อย (E-Learning Modules)
  instructorName?: string; // ชื่อ-นามสกุล ผู้สอน / ผู้ออกใบประกาศนียบัตร (e.g. อาจารย์ สรเชษฐ์ (อ. เควิน))
  instructorTitle?: string; // ตำแหน่งผู้สอน (e.g. Founder & Lead AI Instructor, Kevin AI Academy)
  instructorSignature?: string; // รูปลายเซ็นผู้สอน (URL รูปภาพ หรือ Base64)
  certificateEnabled?: boolean; // เปิดใช้งานระบบออกใบประกาศนียบัตรเมื่อเรียนจบ
  passingScorePercent?: number; // คะแนนสอบผ่านขั้นต่ำ (เช่น 70%)
}

/**
 * ฟังก์ชันช่วยแปลงและจัดรูปแบบระยะเวลาเรียนให้สวยงาม รองรับ ชม. / นาที / วัน
 */
export function getYouTubeEmbedUrl(url?: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = trimmed.match(regExp);
  if (match && match[2].length === 11) {
    return `https://www.youtube.com/embed/${match[2]}`;
  }
  return null;
}
export function formatClassDuration(cls: { durationMinutes?: number; durationValue?: number; durationUnit?: DurationUnit } | null | undefined): string {
  if (!cls) return '0 นาที';
  if (cls.durationValue && cls.durationUnit) {
    const val = cls.durationValue;
    if (cls.durationUnit === 'day') return `${val} วัน`;
    if (cls.durationUnit === 'hour') return `${val} ชั่วโมง`;
    if (cls.durationUnit === 'minute') return `${val} นาที`;
  }
  const mins = cls.durationMinutes || 0;
  if (mins <= 0) return '0 นาที';
  if (mins >= 1440 && mins % 1440 === 0) return `${mins / 1440} วัน`;
  if (mins >= 60 && mins % 60 === 0) return `${mins / 60} ชั่วโมง`;
  if (mins >= 60) {
    const hours = Math.floor(mins / 60);
    const remMinutes = mins % 60;
    return `${hours} ชม. ${remMinutes} นาที`;
  }
  return `${mins} นาที`;
}

/**
 * ฟังก์ชันตรวจสอบว่าคอร์สนี้เป็นคอร์สฟรีหรือไม่
 */
export function isClassFree(cls: { isFree?: boolean; price?: number } | null | undefined): boolean {
  if (!cls) return false;
  return cls.isFree === true || cls.price === 0;
}

export type PaymentMethod = 'promptpay_qr' | 'stripe' | 'pay_later_7days';
export type PaymentStatus = 'pending' | 'verified' | 'failed' | 'refunded';
export type BookingStatus = 'pending_payment' | 'confirmed' | 'rejected' | 'cancelled' | 'completed' | 'rescheduled';

export interface Booking {
  id: string;
  classId: string;
  classTitle: string;
  classType: ClassType;
  date: string;
  timeSlot: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  lineId?: string;
  notes?: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  slipUrl?: string;
  stripePaymentIntentId?: string;
  bookingStatus: BookingStatus;
  onlineMeetingUrl?: string;
  rescheduledReason?: string;
  originalDate?: string;
  originalTimeSlot?: string;
  rejectReason?: string;
  approvalMessage?: string;
  createdAt: string;
  confirmedAt?: string;
  // 7-day payment window & auto-expiry fields
  paymentDueAt?: string; // ISO date string (7 days after registration)
  isPayLater7Days?: boolean;
}

/**
 * ตรวจสอบว่าการจองเกินกำหนดชำระเงิน 7 วันหรือไม่
 */
export function isBookingPaymentExpired(booking: {
  paymentStatus?: string;
  bookingStatus?: string;
  paymentDueAt?: string;
  createdAt?: string;
  paymentMethod?: string;
  isPayLater7Days?: boolean;
}): boolean {
  if (booking.paymentStatus === 'verified' || booking.bookingStatus === 'confirmed' || booking.bookingStatus === 'completed') {
    return false;
  }
  if (booking.bookingStatus === 'cancelled' || booking.bookingStatus === 'rejected') {
    return false;
  }
  if (booking.paymentDueAt) {
    return new Date(booking.paymentDueAt).getTime() < Date.now();
  }
  if (booking.paymentMethod === 'pay_later_7days' || booking.isPayLater7Days) {
    if (booking.createdAt) {
      const createdTime = new Date(booking.createdAt).getTime();
      return (Date.now() - createdTime) > (7 * 24 * 60 * 60 * 1000);
    }
  }
  return false;
}

export interface RewardHistoryItem {
  id: string;
  action: 'connect_line' | 'share_class' | 'referral_signup' | 'referral_first_purchase' | 'course_reward' | 'admin_adjustment' | 'redeem';
  points: number;
  description: string;
  createdAt: string;
}

export interface UserRewardData {
  points: number;
  freeHours: number;
  refCode: string;
  referredBy?: string | null;
  referralCount: number;
  lineConnected: boolean;
  lineNotifyCode?: string;
  sharedClasses?: string[];
  history?: RewardHistoryItem[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  phone?: string;
  bio?: string;
  role: 'user' | 'admin';
  provider: 'credentials' | 'google';
  createdAt: string;
  rewards?: UserRewardData;
}

export interface SystemNotification {
  id: string;
  type: 'new_booking' | 'payment_slip_uploaded' | 'booking_confirmed' | 'meeting_link_sent' | 'general';
  title: string;
  message: string;
  read: boolean;
  bookingId?: string;
  createdAt: string;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string; // rich text HTML or markdown format
  coverImage?: string;
  authorName: string;
  category: string;
  tags: string[];
  status: 'published' | 'draft';
  views: number;
  featured?: boolean;
  driveFileId?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface PromptTemplate {
  id: string;
  title: string;
  slug: string;
  category: string; // e.g. 'Coding & SaaS', 'Marketing & Sales', 'Customer Support', 'Business Strategy', 'Creative'
  description: string;
  targetRole?: string; // e.g. 'Software Engineer', 'Content Creator', 'Sales Leader'
  aiModel?: string; // e.g. 'Claude 3.7 / Codex', 'GPT-4o', 'Midjourney', 'All Models'
  tags: string[];
  systemPrompt?: string;
  templateContent: string; // Master Prompt text with placeholders
  variables: {
    key: string; // e.g. 'APP_NAME', 'TARGET_AUDIENCE'
    label: string;
    description?: string;
    defaultValue?: string;
    type?: 'text' | 'textarea' | 'select';
    options?: string[];
  }[];
  isFeatured?: boolean;
  copyCount?: number;
  authorName?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface SiteSettings {
  id: string; // 'current_site_settings'
  // Layout & General
  siteTitle: string;
  siteSubtitle: string;
  brandName: string;
  brandBadge: string;
  primaryColorTheme?: string;
  showAnnounceBanner?: boolean;
  announceText?: string;
  
  // Hero Section
  heroBadge: string;
  heroTitleGradient: string;
  heroTitleMain: string;
  heroDescription: string;
  heroPosterImage: string;
  heroPriceTag: string;
  heroSeatLimit: string;
  heroCtaButtonText: string;
  heroTags: string[];

  // About Section (Instructor & Venue)
  instructorTitle: string;
  instructorName: string;
  instructorBio: string;
  instructorTags: string[];
  venueTitle: string;
  venueName: string;
  venueAddress: string;
  venueMapUrl: string;

  // Final CTA Section
  finalCtaBadge: string;
  finalCtaTitle: string;
  finalCtaDescription: string;
  finalCtaButtonText: string;

  // Footer & Contact Information
  footerDescription: string;
  footerContactEmail: string;
  footerContactPhone: string;
  footerLocationText: string;
  footerCopyrightText: string;
  footerLineId?: string;
  footerFacebookUrl?: string;

  // Payment & PromptPay Settings
  promptpayQrImage?: string;
  promptpayAccountName?: string;
  showAccountName?: boolean;
  promptpayNumber?: string;
  showPromptpayNumber?: boolean;
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountName?: string;
  showBankTransferDetails?: boolean;

  updatedAt?: string;
}

export type AiProvider = 'chatgpt' | 'openai' | 'claude' | 'gemini' | 'groq' | 'perplexity' | 'openrouter' | 'custom';
export type McpTransport = 'sse' | 'stdio' | 'websocket' | 'http';
export type ConnectionStatus = 'connected' | 'disconnected' | 'connecting' | 'error';

export interface McpServerConfig {
  id: string;
  name: string;
  description: string;
  transport: McpTransport;
  serverUrl?: string; // e.g. https://mcp.yourdomain.com/sse
  command?: string;   // e.g. npx -y @modelcontextprotocol/server-filesystem
  args?: string[];
  env?: { [key: string]: string };
  status: ConnectionStatus;
  capabilities: {
    resources?: boolean;
    tools?: boolean;
    prompts?: boolean;
    logging?: boolean;
  };
  toolsCount?: number;
  promptsCount?: number;
  lastTestedAt?: string;
  errorMessage?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AiConnectorConfig {
  id: string;
  provider: AiProvider;
  name: string;
  description: string;
  icon?: string;
  status: ConnectionStatus;
  authType: 'oauth' | 'api_key';
  
  // API Key fields
  apiKey?: string;
  maskedApiKey?: string;
  apiEndpoint?: string;
  defaultModel?: string;

  // OAuth fields
  oauth?: {
    clientId?: string;
    clientSecret?: string;
    redirectUri?: string;
    scopes?: string[];
    tokenEndpoint?: string;
    authEndpoint?: string;
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: string;
    accountEmail?: string;
    accountName?: string;
  };

  // Connected MCP servers to this AI Agent / Model
  connectedMcpServerIds: string[];
  enabledTools: string[];
  systemInstructions?: string;
  lastTestedAt?: string;
  errorMessage?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface McpIntegrationSettings {
  id: string; // 'current_mcp_settings'
  mcpEnabled: boolean;
  gatewayUrl?: string;
  secretToken?: string;
  servers: McpServerConfig[];
  aiConnectors: AiConnectorConfig[];
  updatedAt?: string;
}

/* =========================================================================
   SOCIAL CHANNELS & BROADCAST INTEGRATION INTERFACES
   (Facebook Page & LINE Official Account via Token / OAuth)
   ========================================================================= */

export interface LineOaConfig {
  enabled: boolean;
  channelId?: string;
  channelSecret?: string;
  channelAccessToken?: string; // Long-lived Channel Access Token (v2.1)
  botBasicId?: string;        // e.g. @kevin_ai
  autoNotifyNewCourse?: boolean;
  autoNotifyPromotion?: boolean;
  welcomeMessage?: string;
  status: 'connected' | 'disconnected' | 'error';
  lastTestedAt?: string;
  errorMessage?: string;
}

export interface FacebookPageConfig {
  enabled: boolean;
  appId?: string;
  appSecret?: string;
  pageId?: string;
  pageName?: string;
  pageAccessToken?: string;  // Page Access Token for Graph API (/feed)
  userAccessToken?: string;  // Short/Long-lived User OAuth Token
  autoPostNewCourse?: boolean;
  autoPostArticles?: boolean;
  defaultHashtags?: string;
  status: 'connected' | 'disconnected' | 'error';
  lastTestedAt?: string;
  errorMessage?: string;
}

export interface SocialBroadcastHistory {
  id: string;
  channel: 'line_oa' | 'facebook' | 'both';
  type: 'course_recommend' | 'custom_post' | 'article_share';
  title: string;
  content: string;
  targetCourseId?: string;
  targetArticleId?: string;
  linkUrl?: string;
  imageUrl?: string;
  status: 'success' | 'failed' | 'simulated';
  responseDetails?: string;
  sentAt: string;
}

export interface SocialIntegrationSettings {
  id: string; // 'current_social_settings'
  line: LineOaConfig;
  facebook: FacebookPageConfig;
  broadcastHistory: SocialBroadcastHistory[];
  updatedAt?: string;
}

/* =========================================================================
   QUIZ & POST-CLASS ASSESSMENT INTERFACES
   ========================================================================= */

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[]; // 4 choices: [A, B, C, D]
  correctOptionIndex: number; // 0, 1, 2, or 3
  explanation?: string;
}

export interface Quiz {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  classId?: string; // Optional: connected to a specific class or available generally
  classTitle?: string;
  passingScorePercent: number; // e.g. 70
  questions: QuizQuestion[]; // 10 questions
  createdAt: string;
  updatedAt?: string;
}

export interface QuizSubmission {
  id: string;
  quizId: string;
  quizTitle: string;
  classId?: string;
  classTitle?: string;
  userId: string;
  userEmail: string;
  userName: string;
  answers: number[]; // Array of selected option indices (0-3)
  score: number; // Number of correct answers (e.g. 8)
  totalQuestions: number; // e.g. 10
  scorePercent: number; // e.g. 80
  passed: boolean;
  submittedAt: string;
  emailSent?: boolean;
}

export interface CourseCertificate {
  id: string; // e.g. CERT-2026-XXXXX
  userId: string;
  userName: string;
  userEmail: string;
  classId: string;
  classTitle: string;
  instructorName: string;
  instructorTitle?: string;
  instructorSignature?: string;
  score?: number;
  scorePercent?: number;
  rewardPointsEarned?: number;
  issuedAt: string;
}



