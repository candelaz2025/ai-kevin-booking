/**
 * Anti-Spam Email Protection Service
 * Kevin AI Booking & Academy
 * 
 * Blocks placeholder domains (@example.com, @example.org, etc.),
 * test domains (@test.com), and known disposable/temporary email providers.
 */

export const BLOCKED_EMAIL_DOMAINS = [
  // Example & RFC reserved domains
  'example.com',
  'example.org',
  'example.net',
  'example.edu',
  'test.com',
  'test.org',
  'test.net',
  'sample.com',
  'sample.org',
  
  // Disposable / Temporary / Trash email providers
  'tempmail.com',
  'temp-mail.org',
  '10minutemail.com',
  'mailinator.com',
  'guerrillamail.com',
  'guerrillamailblock.com',
  'sharklasers.com',
  'yopmail.com',
  'yopmail.fr',
  'trashmail.com',
  'dispostable.com',
  'getairmail.com',
  'throwawaymail.com',
  'fakemailgenerator.com',
  'dropmail.me',
  'generator.email',
  'mohmal.com',
  'inboxkitten.com',
  'tempail.com',
  'burnermail.io',
  'crazymailing.com'
];

export interface SpamCheckResult {
  isBlocked: boolean;
  reason?: string;
  normalizedEmail: string;
}

/**
 * Validates whether an email address is authentic and not a spam/example/disposable address.
 */
export function checkSpamEmail(email: string | null | undefined): SpamCheckResult {
  if (!email || typeof email !== 'string') {
    return {
      isBlocked: true,
      reason: 'กรุณากรอกอีเมลสำหรับการติดต่อ',
      normalizedEmail: ''
    };
  }

  const clean = email.trim().toLowerCase();

  // Basic RFC format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(clean)) {
    return {
      isBlocked: true,
      reason: 'รูปแบบอีเมลไม่ถูกต้อง กรุณากรอกอีเมลที่ถูกต้อง (เช่น yourname@gmail.com)',
      normalizedEmail: clean
    };
  }

  const parts = clean.split('@');
  if (parts.length !== 2) {
    return {
      isBlocked: true,
      reason: 'รูปแบบอีเมลไม่ถูกต้อง',
      normalizedEmail: clean
    };
  }

  const [username, domain] = parts;

  // 1. Check if domain matches any blocked or disposable domain (including subdomains)
  const isBlockedDomain = BLOCKED_EMAIL_DOMAINS.some(blocked => 
    domain === blocked || domain.endsWith(`.${blocked}`)
  );

  if (isBlockedDomain) {
    return {
      isBlocked: true,
      reason: `ระบบไม่อนุญาตให้ใช้อีเมลจากโดเมน @${domain} (อีเมลตัวอย่าง/ชั่วคราว) เพื่อป้องกัน Spam กรุณาใช้อีเมลจริงที่สามารถติดต่อได้ (เช่น Gmail, Outlook, Hotmail หรืออีเมลองค์กร)`,
      normalizedEmail: clean
    };
  }

  // 2. Strict block on any domain containing "example" (e.g., example-mail.com, myexample.com)
  if (domain.includes('example')) {
    return {
      isBlocked: true,
      reason: 'ระบบไม่อนุญาตให้ใช้อีเมลที่มีโดเมนตัวอย่าง (@example.*) กรุณาใช้อีเมลจริงสำหรับการรับลิงก์เข้าเรียนและเอกสารประกอบ',
      normalizedEmail: clean
    };
  }

  // 3. Block common mock usernames with test domains
  if ((username === 'example' || username === 'test' || username === 'spam') && (domain === 'localhost' || domain.includes('test'))) {
    return {
      isBlocked: true,
      reason: 'อีเมลนี้ถูกระงับโดยระบบตรวจจับ Spam กรุณาใช้อีเมลส่วนตัวหรืออีเมลที่ทำงานจริง',
      normalizedEmail: clean
    };
  }

  return {
    isBlocked: false,
    normalizedEmail: clean
  };
}
