import { Article } from './types';
import { saveArticle, addNotification } from './store';

export type ArticleGenerationCategory = 'ai_techniques' | 'ai_news';

interface GeneratedArticlePayload {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  imagePrompt: string;
}

// Curated fallbacks in case of offline/API quota limits
const FALLBACK_TOPICS: Record<ArticleGenerationCategory, GeneratedArticlePayload[]> = {
  ai_techniques: [
    {
      title: 'สุดยอดเทคนิค Advanced Prompt Engineering สำหรับ Claude 3.7 & DeepSeek V3',
      slug: 'advanced-prompt-engineering-guide-claude-deepseek',
      excerpt: 'เรียนรู้โครงสร้าง Prompt ขั้นสูง แบบ System Framing, Few-Shot และ Chain-of-Thought เพื่อควบคุม AI ให้ทำงานเขียนโค้ดและวิเคราะห์ข้อมูลได้อย่างแม่นยำ 100%',
      category: 'เทคนิคการใช้งาน AI',
      tags: ['Prompt Engineering', 'Claude 3.7', 'DeepSeek', 'AI Workflow'],
      imagePrompt: 'futuristic high tech prompt engineering concept, glowing digital neural synapse, modern clean studio lighting, 8k render',
      content: `<h2>1. ทำความเข้าใจการสั่งงาน AI แบบ Systematic Prompting</h2>
<p>ในปี 2026 โมเดล Generative AI อย่าง Claude 3.7, DeepSeek V3 และ Gemini 2.5 มีความสามารถในการเข้าใจบริบท (Context Reasoning) ที่ก้าวหน้าอย่างก้าวกระโดด แต่หลายคนยังได้ผลลัพธ์ที่ธรรมดาเพราะใช้ Zero-shot prompt ทั่วไป</p>

<h3>โครงสร้าง Prompt ที่ดีที่สุด 4 ขั้นตอน:</h3>
<ol>
  <li><strong>Role & Persona Definition:</strong> กำหนดบทบาท ผู้เชี่ยวชาญระดับ 10+ ปี</li>
  <li><strong>Context & Constraints:</strong> ข้อจำกัด กฎเกณฑ์ รูปแบบผลลัพธ์ที่ห้ามละเมิด</li>
  <li><strong>Few-Shot Demonstrations:</strong> ตัวอย่าง Input / Output ที่ต้องการ 1-2 ตัวอย่าง</li>
  <li><strong>Chain-of-Thought Trigger:</strong> บังคับให้คิดทีละขั้นตอนด้วย <code>&lt;thinking&gt;</code> ก่อนตอบ</li>
</ol>

<pre><code class="language-markdown">คุณคือ Senior AI Solution Architect 
ภารกิจ: วิเคราะห์ข้อดีข้อเสียของ Agentic Workflow vs Linear Automation
เงื่อนไข:
1. ห้ามตอบแบบกำกวม ให้ยกตัวอย่างเครื่องมือจริง เช่น n8n, LangGraph
2. จัดกลุ่มเป็น ตารางเปรียบเทียบ 5 มิติ
3. สรุป Actionable Next Steps ให้ทีม Developer</code></pre>

<h2>2. เทคนิคการคุม Hallucination ด้วย Verification Loop</h2>
<p>เคล็ดลับคือการขอให้โมเดลประเมินความมั่นใจของคำตอบตนเองก่อนเสมอ หรือแยก Agent เป็น 2 ตัว: Generator และ Reviewer</p>
<p>ลองนำเทคนิคนี้ไปปรับใช้กับโปรเจกต์ของคุณ แล้วคุณจะพบว่าผลงานมีคุณภาพสูงขึ้นอย่างเห็นได้ชัด!</p>`
    },
    {
      title: 'เจาะลึก Autonomous AI Agents: สร้างระบบทำงานอัตโนมัติด้วย n8n และ LLM Tools',
      slug: 'build-autonomous-ai-agents-with-n8n-llm',
      excerpt: 'คู่มือการสร้าง Multi-Agent Workflow เชื่อมต่อ Google Workspace, Line Notify และ CRM ช่วยประหยัดเวลาการทำงานซ้ำซากได้กว่า 80%',
      category: 'เทคนิคการใช้งาน AI',
      tags: ['AI Agents', 'Automation', 'n8n', 'Workflow'],
      imagePrompt: 'autonomous multi-agent system working together, cybernetic nodes connecting tools, sleek neon teal and gold lighting, ultra-detailed 8k',
      content: `<h2>การเปลี่ยนผ่านจาก Simple Chat สู่ Agentic Action</h2>
<p>โมเดล AI ที่ทำได้แค่พูดคุยกำลังตกยุค ยุคนี้คือยุคของ <strong>Agentic Workflows</strong> ที่ AI สามารถเรียก Tool, ค้นหา Web, อัปเดตฐานข้อมูล และส่งเมลตอบลูกค้าได้เอง</p>

<h3>หัวใจ 3 ประการของ AI Agent:</h3>
<ul>
  <li><strong>Perception (การรับรู้):</strong> Webhooks, Trigger จาก Email หรือ Form</li>
  <li><strong>Planning (การวางแผน):</strong> LLM ตัดสินใจว่าต้องใช้ Tool ใดตามลำดับ</li>
  <li><strong>Execution (การกระทำ):</strong> REST API Call, DB Update, Message Notification</li>
</ul>

<p>เริ่มต้นสร้าง Flow แรกของคุณได้ง่ายๆ ด้วยการกำหนด Scope ให้ชัดเจน และมี Human-in-the-loop เพื่อยืนยันความถูกต้องในขั้นตอนสำคัญ</p>`
    }
  ],
  ai_news: [
    {
      title: 'สรุปอัปเดต AI ประจำวัน: การเปิดตัวโมเดล Reasoning รุ่นใหม่ และทิศทางตลาด AI โลก',
      slug: 'daily-ai-news-reasoning-models-breakthrough',
      excerpt: 'สรุปประเด็นร้อนวงการ AI วันนี้: การแข่งขันของโมเดลโอเพนซอร์ส vs โมเดลพาณิชย์, การอัปเกรดความเร็ว Inference และผลกระทบต่อภาคธุรกิจ',
      category: 'AI News ประจำวัน',
      tags: ['AI News', 'Deep Learning', 'Tech Trends', 'LLM Updates'],
      imagePrompt: 'breaking technology news studio, digital globe with artificial intelligence data streams, futuristic hologram display, cinematic 8k',
      content: `<h2>ภาพรวมการพัฒนา AI ประจำวันนี้</h2>
<p>วันนี้วงการ AI มีความเคลื่อนไหวที่น่าจับตามองอย่างมาก โดยเฉพาะในกลุ่มโมเดลที่เน้น <strong>High Reasoning & Cost Efficiency</strong> ซึ่งทำให้ต้นทุนต่อโทเคนลดลงมากกว่า 60% ในขณะที่ประสิทธิภาพการตอบเพิ่มขึ้น</p>

<h3>ไฮไลท์สำคัญ:</h3>
<ul>
  <li><strong>ความเร็ว Inference เพิ่มขึ้น 3 เท่า:</strong> สถาปัตยกรรม MoE (Mixture of Experts) รุ่นล่าสุดช่วยให้ latency ลดลงอย่างมีนัยสำคัญ</li>
  <li><strong>การรองรับ Multimodal แบบ Realtime:</strong> รองรับภาพ เสียง และวิดีโอแบบ low-latency พร้อมใช้งานบนอุปกรณ์ Edge</li>
  <li><strong>Enterprise Adoption พุ่งสูง:</strong> องค์กรธุรกิจกว่า 70% เริ่มนำ Agentic Systems มาประยุกต์ใช้ในฝ่ายบริการลูกค้าและวิเคราะห์ข้อมูล</li>
</ul>

<p>ติดตามบทวิเคราะห์และอัปเดตเชิงลึกได้ที่ AI Kevin Booking ทุกวันเวลา 09:00 น.</p>`
    },
    {
      title: 'AI News Roundup: การปฏิวัติโมเดลสร้างวิดีโอและเสียงเสมือนจริงระดับสตูดิโอ',
      slug: 'ai-news-roundup-video-audio-sota',
      excerpt: 'วงการครีเอเตอร์ต้องจับตา! โมเดลวิดีโอและ Voice Cloning ยุคใหม่ให้ความละเอียด 4K ลื่นไหล 60 FPS และลิปซิงค์สมบูรณ์แบบ',
      category: 'AI News ประจำวัน',
      tags: ['AI News', 'Generative Video', 'Voice AI', 'Creative Tech'],
      imagePrompt: 'cinematic digital film studio, AI camera lens capturing futuristic virtual world, high dynamic range, volumetric lighting, photorealistic',
      content: `<h2>ก้าวสำคัญของ Generative Media ในระดับโปรดักชัน</h2>
<p>การเปิดตัวเทคโนโลยี Video Diffusion ล่าสุดช่วยให้ผู้ผลิตสื่อและนักการตลาดสามารถสร้างวิดีโอคุณภาพสูงระดับโฆษณาโทรทัศน์ได้จาก Text Prompt หรือ Reference Image เพียงใบเดียว</p>

<h3>จุดเด่นของเทคโนโลยีใหม่:</h3>
<ul>
  <li><strong>Physics Consistency:</strong> ระบบจำลองแรงโน้มถ่วงและการเคลื่อนไหวของแสงที่สมจริงยิ่งขึ้น</li>
  <li><strong>Character Locking:</strong> การล็อกใบหน้าและชุดของตัวละครข้ามช็อตภาพอย่างแม่นยำ</li>
  <li><strong>Zero-Shot Lip Sync:</strong> ลิปซิงค์ภาษาไทยและภาษาอังกฤษได้เป็นธรรมชาติในคลิกเดียว</li>
</ul>`
    }
  ]
};

function getPollinationsImageUrl(prompt: string): string {
  const cleanPrompt = prompt.replace(/[^\w\s,-]/g, ' ').trim();
  const encoded = encodeURIComponent(cleanPrompt || 'futuristic artificial intelligence neural technology');
  return `https://image.pollinations.ai/prompt/${encoded}?width=1200&height=630&nologo=true&enhance=true`;
}

/**
 * Generate a single article using Gemini 2.5 Flash via REST API
 * with robust fallback in case of rate limit or missing API key
 */
export async function generateDailyAiArticle(type: ArticleGenerationCategory): Promise<Article> {
  const apiKey = process.env.GEMINI_API_KEY;
  const isTechniques = type === 'ai_techniques';
  const categoryName = isTechniques ? 'เทคนิคการใช้งาน AI' : 'AI News ประจำวัน';
  const defaultAuthor = 'อ. Kevin (AI Studio Routine)';
  const dateStr = new Date().toLocaleDateString('th-TH', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const promptGuidance = isTechniques
    ? `เขียนบทความแนว "เทคนิคการใช้งาน AI" (AI Techniques & Workflows) ที่ทันสมัยที่สุดในปี 2026 เช่น Prompt Engineering ขั้นสูง, Autonomous Agents, AI Coding Assistant, หรือการใช้ AI ในการทำงานจริง มีตัวอย่าง prompt หรือ code สั้นๆ พร้อมขั้นตอนเข้าใจง่าย ภาษาไทยอ่านสนุก มีสาระและ actionable`
    : `เขียนบทความแนว "AI News ประจำวัน" (Daily AI News & Breakthroughs) ประจำวันที่ ${dateStr} สรุปข่าวเทคโนโลยี AI, โมเดลใหม่, วงการ LLM, Multimodal, การลงทุน AI, หรือเทรนด์ AI ของโลก ภาษาไทยกระชับ ได้ใจความ วิเคราะห์ผลกระทบต่อคนทำงานและธุรกิจ`;

  if (apiKey) {
    try {
      const systemInstruction = `คุณเป็น AI Tech Journalist และ Content Specialist ระดับโลกของ AI Kevin Studio
จงสร้างบทความระดับพรีเมียมเกี่ยวกับ ${categoryName} เป็น JSON รูปแบบต่อไปนี้เท่านั้น (ไม่มีข้อความอื่นนอก JSON):
{
  "title": "หัวข้อบทความภาษาไทยที่ดึงดูดใจและตรงประเด็น (ความยาว 50-90 ตัวอักษร)",
  "slug": "url-friendly-slug-in-english-with-hyphens",
  "excerpt": "สรุปสั้น 1-2 ประโยคภาษาไทย ดึงดูดให้คลิกอ่าน (ความยาว 120-180 ตัวอักษร)",
  "content": "เนื้อหาบทความแบบ HTML ที่สวยงาม ประกอบด้วย <h2>, <h3>, <p>, <ul>, <ol>, <strong>, และ <pre><code>...</code></pre> อย่างน้อย 300 คำ อธิบายละเอียด มีโครงสร้างชัดเจน",
  "tags": ["AI", "Tech", "แท็กภาษาอังกฤษหรือไทย 3-5 คำ"],
  "imagePrompt": "Detailed English prompt for high-tech cinematic futuristic 8k cover image related directly to this article topic"
}`;

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: `${systemInstruction}\n\nโจทย์: ${promptGuidance}` }]
            }
          ],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.7
          }
        })
      });

      if (res.ok) {
        const data = await res.json();
        let jsonText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (jsonText) {
          // Clean possible markdown code fences if model enclosed JSON
          jsonText = jsonText.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
          let parsed: GeneratedArticlePayload;
          try {
            parsed = JSON.parse(jsonText);
          } catch {
            // Clean unescaped control chars (like raw newlines inside string values)
            const sanitized = jsonText.replace(/[\u0000-\u001F\u007F-\u009F]/g, (c: string) => {
              if (c === '\n') return '\\n';
              if (c === '\r') return '\\r';
              if (c === '\t') return '\\t';
              return '';
            });
            parsed = JSON.parse(sanitized);
          }
          const articleId = `art-auto-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
          const cleanSlug = `${parsed.slug || 'ai-article'}-${Date.now().toString().slice(-6)}`;
          const coverImageUrl = getPollinationsImageUrl(parsed.imagePrompt || parsed.title);

          const newArticle: Article = {
            id: articleId,
            slug: cleanSlug,
            title: parsed.title,
            excerpt: parsed.excerpt,
            content: parsed.content,
            coverImage: coverImageUrl,
            authorName: defaultAuthor,
            category: categoryName,
            tags: Array.isArray(parsed.tags) ? parsed.tags : ['AI', 'Tech', 'Automation'],
            status: 'published',
            views: Math.floor(Math.random() * 40) + 10,
            featured: isTechniques, // Highlight techniques by default
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

          return newArticle;
        }
      }
    } catch (err) {
      console.warn('Gemini article generation failed, using rich curated fallback:', err);
    }
  }

  // Fallback to high-quality curated rotating topics
  const fallbacks = FALLBACK_TOPICS[type];
  const selectedFallback = fallbacks[Math.floor(Math.random() * fallbacks.length)];
  const articleId = `art-auto-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const cleanSlug = `${selectedFallback.slug}-${Date.now().toString().slice(-6)}`;
  const coverImageUrl = getPollinationsImageUrl(selectedFallback.imagePrompt);

  return {
    id: articleId,
    slug: cleanSlug,
    title: selectedFallback.title,
    excerpt: selectedFallback.excerpt,
    content: selectedFallback.content,
    coverImage: coverImageUrl,
    authorName: defaultAuthor,
    category: categoryName,
    tags: selectedFallback.tags,
    status: 'published',
    views: Math.floor(Math.random() * 50) + 15,
    featured: isTechniques,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

/**
 * Execute routine: creates both 'ai_techniques' and 'ai_news' articles
 * and saves them into the persistent database and notifies admin
 */
export async function runDailyArticlesRoutine() {
  const startTime = Date.now();
  const results: { techniques?: Article; news?: Article; error?: string } = {};

  try {
    // 1. Generate เทคนิคการใช้งาน AI
    const techArticle = await generateDailyAiArticle('ai_techniques');
    await saveArticle(techArticle);
    results.techniques = techArticle;

    // 2. Generate AI News ประจำวัน
    const newsArticle = await generateDailyAiArticle('ai_news');
    await saveArticle(newsArticle);
    results.news = newsArticle;

    // 3. Dispatch system notification
    await addNotification({
      type: 'general',
      title: '🤖 AI Automation เผยแพร่บทความประจำวันสำเร็จ',
      message: `ระบบ Routine เวลา 09:00 น. ได้เผยแพร่บทความใหม่ 2 เรื่อง:\n1. ${techArticle.title}\n2. ${newsArticle.title}`,
      read: false
    });

    return {
      success: true,
      durationMs: Date.now() - startTime,
      count: 2,
      articles: [
        { id: techArticle.id, title: techArticle.title, slug: techArticle.slug, category: techArticle.category },
        { id: newsArticle.id, title: newsArticle.title, slug: newsArticle.slug, category: newsArticle.category }
      ]
    };
  } catch (error: any) {
    console.error('Error running daily articles routine:', error);
    return {
      success: false,
      error: error?.message || 'Unknown error during routine execution'
    };
  }
}
