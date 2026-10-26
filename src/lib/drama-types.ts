export interface DramaItem {
  id: string;
  group: string;
  groupTh: string;
  label: string;
  emoji: string;
  kind: 'clip' | 'image';
  region?: string;
  img: string;
  clip?: string;
  lines?: string[];
  narration?: string;
  beat?: string;
  settings?: Record<string, string | undefined>;
  metaPrompt?: string;
}

export interface DramaCatalog {
  built: string;
  groups: Record<string, string>;
  items: DramaItem[];
}

export const DRAMA_MEDIA_BASE_URL = 'https://jaroensakyod.github.io/ai-drama-studio-releases/catalog';

export const DRAMA_GROUP_NOTES: Record<string, string> = {
  all: 'คลิปความยาว 10 วินาที ตัวละครพูดบทภาษาไทยอย่างเป็นธรรมชาติ · กดดูคลิป สคริปต์บทพูด และคัดลอก Master Prompt ไปใช้ได้ทันที',
  genre: 'เทมเพลตพล็อตเรื่องยอดนิยม: ระบบกำหนดแนว สไตล์ภาพ ท่ากล้อง และเสียงให้ครบ พร้อมโครงสร้างบทละครเข้มข้น',
  cartoon: 'โหมดการ์ตูน & อนิเมะ: เลือกประเภทลายเส้น ทั้งแอนิเมชัน 3D, มังงะ, อนิเมะญี่ปุ่น และเว็บตูน',
  ad: 'โหมดคลิปขายของไวรัล: วางโครงสคริปต์สไตล์ Hook & Hold ดึงดูดสายตาตามประเภทสินค้า',
  camera: 'ฉากเดียวกัน บทเดียวกัน เปลี่ยนแค่การเคลื่อนกล้อง (Camera Motion) เพื่อสร้างอารมณ์',
  sound: 'ฉากเดียวกัน บทเดียวกัน เปลี่ยนโทนเสียง ดนตรี และ Sound Design',
  style: 'ฉากเดียวกัน เปลี่ยนสไตล์ภาพ (Visual Art Direction)',
  mood: 'ฉากเดียวกัน เปลี่ยนอารมณ์และโทนสี (Color Grading)',
  lighting: 'ฉากเดียวกัน ปรับเปลี่ยนการจัดแสง (Cinematic Lighting)',
  time: 'ฉากเดียวกัน เปลี่ยนช่วงเวลาของวัน (Time of Day)',
  weather: 'ฉากเดียวกัน ปรับเปลี่ยนสภาพอากาศ (Atmosphere & Weather)',
  shot: 'ฉากเดียวกัน เปลี่ยนขนาดของภาพ (Shot Size จากระยะใกล้ไปจนถึงมุมกว้าง)',
  angle: 'ฉากเดียวกัน เปลี่ยนมุมมองของกล้อง (Camera Angle)',
};
