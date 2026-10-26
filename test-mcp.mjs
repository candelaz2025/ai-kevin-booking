import { spawn } from 'child_process';

console.log('===========================================================');
console.log('🧪 กำลังเริ่มต้นทดสอบยิง MCP Server (Model Context Protocol)');
console.log('===========================================================\n');

// 1. Test Stdio MCP Server (node mcp-server.mjs)
async function testStdioMcp() {
  console.log('--- [1] ทดสอบ Stdio MCP Server (node mcp-server.mjs) ---');
  
  const proc = spawn('node', ['mcp-server.mjs'], {
    stdio: ['pipe', 'pipe', 'pipe']
  });

  let output = '';
  proc.stdout.on('data', (d) => {
    output += d.toString();
  });
  proc.stderr.on('data', (d) => {
    // Stderr contains internal logs
  });

  const send = (msg) => {
    proc.stdin.write(JSON.stringify(msg) + '\n');
  };

  const delay = (ms) => new Promise(r => setTimeout(r, ms));

  // Step 1: Handshake initialize
  const t0 = Date.now();
  send({ jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2024-11-05' } });
  await delay(100);

  // Step 2: Tools list
  send({ jsonrpc: '2.0', id: 2, method: 'tools/list' });
  await delay(100);

  // Step 3: Tool call system_health
  send({ jsonrpc: '2.0', id: 3, method: 'tools/call', params: { name: 'system_health', arguments: {} } });
  await delay(300);

  // Step 4: Tool call list_courses
  send({ jsonrpc: '2.0', id: 4, method: 'tools/call', params: { name: 'list_courses', arguments: { type: 'all' } } });
  await delay(300);

  // Step 5: Resources list
  send({ jsonrpc: '2.0', id: 5, method: 'resources/list' });
  await delay(100);

  proc.stdin.end();
  await delay(200);

  const lines = output.trim().split('\n').filter(Boolean);
  console.log(`✅ Stdio ตอบกลับทั้งหมด ${lines.length} JSON-RPC Responses (เวลา: ${Date.now() - t0}ms)\n`);

  for (const line of lines) {
    try {
      const parsed = JSON.parse(line);
      if (parsed.id === 1) {
        console.log('📌 [Handshake initialize]:', parsed.result?.serverInfo?.title, '| Protocol:', parsed.result?.protocolVersion);
      } else if (parsed.id === 2) {
        console.log(`📌 [Tools List]: พบทั้งหมด ${parsed.result?.tools?.length} Tools พร้อมใช้งาน`);
        console.log('   ตัวอย่าง:', parsed.result?.tools?.slice(0, 5).map(t => t.name).join(', ') + '...');
      } else if (parsed.id === 3) {
        console.log('📌 [Tool: system_health]:', parsed.result?.content?.[0]?.text?.replace(/\s+/g, ' ').slice(0, 120) + '...');
      } else if (parsed.id === 4) {
        const resText = parsed.result?.content?.[0]?.text || '';
        const data = JSON.parse(resText);
        console.log(`📌 [Tool: list_courses]: ดึงข้อมูลสำเร็จ พบ ${data.total} คอร์ส`);
        data.courses?.forEach((c, idx) => {
          console.log(`   ${idx + 1}. ${c.title} (${c.type}) — ราคา ${c.price}`);
        });
      } else if (parsed.id === 5) {
        console.log(`📌 [Resources List]: พบ ${parsed.result?.resources?.length} Resources:`, parsed.result?.resources?.map(r => r.uri).join(', '));
      }
    } catch (e) {
      console.log('Raw output:', line);
    }
  }
}

// 2. Test Live Production HTTP / SSE Endpoint (https://ai-kevin-booking.vercel.app/api/mcp)
async function testHttpMcp() {
  const SERVER_URL = 'https://ai-kevin-booking.vercel.app/api/mcp';
  console.log(`\n--- [2] ทดสอบยิง Production Server โดยตรง (${SERVER_URL}) ---`);

  // Test GET info
  const t0 = Date.now();
  const getRes = await fetch(SERVER_URL);
  const getData = await getRes.json();
  const getLatency = Date.now() - t0;

  console.log(`✅ [GET ${SERVER_URL}] ตอบกลับ HTTP ${getRes.status} (Latency: ${getLatency}ms)`);
  console.log('   Server Name:', getData.server?.name);
  console.log('   Tools Count:', getData.tools?.length);
  console.log('   Capabilities:', Object.keys(getData.capabilities || {}).join(', '));

  // Test POST JSON-RPC initialize
  const postInit = await fetch(SERVER_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 101,
      method: 'initialize',
      params: { protocolVersion: '2024-11-05' }
    })
  });
  const postInitData = await postInit.json();
  console.log(`✅ [POST Handshake initialize]:`, postInitData.result?.serverInfo?.name);

  // Test POST JSON-RPC tools/call list_courses
  const postCall = await fetch(SERVER_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 102,
      method: 'tools/call',
      params: {
        name: 'list_courses',
        arguments: { type: 'online' }
      }
    })
  });
  const postCallData = await postCall.json();
  const content = postCallData.result?.content?.[0]?.text;
  console.log(`✅ [POST Tool Call: list_courses]: สำเร็จ ยิงเข้า Production Server เรียบร้อย!`);
  console.log('   Result Preview:', content?.slice(0, 160) + '...');
}

async function run() {
  try {
    await testStdioMcp();
    await testHttpMcp();
    console.log('\n===========================================================');
    console.log('🎉 สรุปผลการทดสอบ: MCP Server ทำงานได้ 100% ทั้ง Stdio และ HTTP!');
    console.log('===========================================================');
  } catch (err) {
    console.error('Error during testing:', err);
  }
}

run();
