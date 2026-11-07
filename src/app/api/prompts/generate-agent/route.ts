import { NextResponse } from 'next/server';

interface GenerateAgentRequest {
  occupation: string;
  roleContext?: string;
  painpoint: string;
  targetAi?: string;
  desiredOutput?: string;
  constraints?: string;
}

export async function POST(req: Request) {
  try {
    const body: GenerateAgentRequest = await req.json();

    const occupation = body.occupation?.trim() || 'ผู้เชี่ยวชาญการทำงาน';
    const roleContext = body.roleContext?.trim() || 'พนักงาน / เจ้าของธุรกิจ';
    const painpoint = body.painpoint?.trim();
    const targetAi = body.targetAi?.trim() || 'Claude 3.7 Sonnet / Computer Use';
    const desiredOutput = body.desiredOutput?.trim() || 'เอกสารสรุปผล แผนปฏิบัติการ และสคริปต์พร้อมใช้งาน';
    const constraints = body.constraints?.trim() || 'ถูกต้อง แม่นยำ รวดเร็ว และไม่มีการมโนข้อมูล (Zero Hallucination)';

    if (!painpoint) {
      return NextResponse.json(
        { success: false, error: 'กรุณาระบุ Pain Point หรือปัญหาที่ต้องการให้ AI Agent จัดการแทน' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const promptInstruction = `คุณเป็น AI Prompt Architect & Multi-Agent Systems Engineer ระดับโลก
หน้าที่ของคุณคือสร้าง "Master Prompt สำหรับสั่งการ AI Agent" เพื่อแก้ปัญหาการทำงาน (Pain Point) ให้กับผู้ใช้งานจริง

ข้อมูลบริบท:
- อาชีพ/ตำแหน่งงาน: ${occupation}
- บริบทองค์กร/ระดับงาน: ${roleContext}
- ปัญหาที่ต้องการแก้ (Pain Point): ${painpoint}
- แพลตฟอร์ม AI Agent เป้าหมาย: ${targetAi}
- รูปแบบผลลัพธ์ที่ต้องการ: ${desiredOutput}
- ข้อจำกัดเพิ่มเติม: ${constraints}

จงตอบกลับเป็น JSON รูปแบบนี้เท่านั้น (ห้ามใส่คำเกริ่นนำหรือคำลงท้ายนอก JSON):
{
  "title": "ชื่อของ AI Agent สั้นๆ ตรงประเด็นภาษาไทย (เช่น AI Agent สรุปและตรวจจับความผิดปกติบัญชีรายวัน)",
  "agentRole": "ชื่อบทบาทภาษาอังกฤษของ Agent (เช่น Autonomous Financial Auditor & Controller Agent)",
  "masterPrompt": "เนื้อหา Master Prompt เต็มรูปแบบที่สมบูรณ์แบบ มีโครงสร้าง: ### 1. IDENTITY & MISSION, ### 2. CONTEXT & INPUTS, ### 3. STEP-BY-STEP AUTONOMOUS WORKFLOW, ### 4. VERIFICATION GATES, ### 5. DELIVERABLE SPECIFICATIONS พร้อมมีตัวแปร {{VARIABLE_NAME}} สำหรับปรับแต่ง",
  "steps": [
    "ขั้นตอนที่ 1...",
    "ขั้นตอนที่ 2...",
    "ขั้นตอนที่ 3...",
    "ขั้นตอนที่ 4..."
  ],
  "suggestedVariables": {
    "COMPANY_OR_PROJECT": "ชื่อบริษัทหรือโปรเจกต์ของคุณ",
    "PRIMARY_GOAL": "เป้าหมายเฉพาะเจาะจง",
    "INPUT_DATA": "ข้อมูลหรือไฟล์นำเข้า"
  }
}`;

        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [{ text: promptInstruction }]
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
            jsonText = jsonText.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
            const parsed = JSON.parse(jsonText);
            return NextResponse.json({
              success: true,
              data: {
                title: parsed.title,
                role: parsed.agentRole,
                targetAi,
                painpoint,
                masterPrompt: parsed.masterPrompt,
                steps: parsed.steps || [],
                suggestedVariables: parsed.suggestedVariables || {}
              }
            });
          }
        }
      } catch (err) {
        console.warn('Gemini API call failed, falling back to local synthesis engine:', err);
      }
    }

    // Intelligent Fallback Synthesis Engine
    const fallbackTitle = `AI Agent สำหรับ${occupation}: จัดการ${painpoint.slice(0, 35)}...`;
    const fallbackRole = `Autonomous ${occupation.replace(/[^a-zA-Z]/g, '') || 'Specialist'} Executive Agent`;
    const fallbackSteps = [
      `รับและตรวจสอบข้อมูลนำเข้าที่เกี่ยวข้องกับ "${painpoint}"`,
      `วิเคราะห์บริบทการทำงานของ ${occupation} (${roleContext}) และแยกแยะตัวแปรสำคัญ`,
      `ดำเนินการประมวลผลตามมาตรฐานของ ${targetAi} โดยปราศจากข้อผิดพลาด`,
      `จัดทำผลลัพธ์ในรูปแบบ "${desiredOutput}" พร้อมคำแนะนำเชิงปฏิบัติการ`
    ];

    const fallbackMasterPrompt = `### 1. IDENTITY & MISSION
You are an expert **${fallbackRole}**, an autonomous AI system designed for **${occupation}** (${roleContext}).
Your core mission is to autonomously resolve this real-world operational bottleneck:
> "${painpoint}"

---

### 2. CONTEXT & INPUT VARIABLES
You will receive the following parameters from the user:
- **ORGANIZATION_CONTEXT**: {{COMPANY_OR_PROJECT}}
- **DATA_SOURCE_OR_INPUTS**: {{INPUT_DATA}}
- **SPECIFIC_GOAL**: {{PRIMARY_GOAL}}
- **TARGET_CONSTRAINTS**: ${constraints}

---

### 3. STEP-BY-STEP AUTONOMOUS WORKFLOW
Execute the following protocol systematically:
1. **Intake & Verification**: Ingest and audit {{INPUT_DATA}}. If any vital information is missing, ask 1-2 clarifying questions before proceeding.
2. **Deep Domain Analysis**: Analyze the root challenges in line with standard industry practices for a ${occupation}.
3. **Execution & Synthesis**: Produce high-accuracy solutions without fluff or generic filler advice.
4. **Deliverable Production**: Package findings strictly into: **${desiredOutput}**.

---

### 4. QUALITY ASSURANCE GATES
- **Zero Hallucination**: Every number, assertion, or recommendation must be grounded in provided inputs or stated as an estimate.
- **Action-Oriented**: Provide exact tables, code, drafted communications, or operational checklists that can be used immediately.
- **Optimization Platform**: Tailored for **${targetAi}**.

---
*Ready to execute. Awaiting your inputs for {{INPUT_DATA}} and {{COMPANY_OR_PROJECT}}.*`;

    return NextResponse.json({
      success: true,
      data: {
        title: fallbackTitle,
        role: fallbackRole,
        targetAi,
        painpoint,
        masterPrompt: fallbackMasterPrompt,
        steps: fallbackSteps,
        suggestedVariables: {
          COMPANY_OR_PROJECT: 'บริษัทหรือทีมงานของคุณ',
          INPUT_DATA: 'ข้อมูลตัวเลข, เอกสาร, หรือรายละเอียดปัญหา',
          PRIMARY_GOAL: 'เป้าหมายความสำเร็จของงานนี้'
        }
      }
    });

  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
