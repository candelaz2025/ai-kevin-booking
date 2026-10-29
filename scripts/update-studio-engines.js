const fs = require('fs');

let js = fs.readFileSync('public/director-studio/studio.js', 'utf8');

// 1. Define AI Target Engines and update initialState
const oldInit = `function initialState(){
  return {
    step:0, genre:"drama", style:"photoreal", scope:"single",`;

const newInit = `const ENGINES = {
  meta: { th: "Meta AI", sub: "Prompt เต็มรูปแบบพร้อม Identity Lock & Negative Prompt" },
  flow: { th: "Google Flow", sub: "จัดรูปแบบ Multi-Camera, Shot Breakdown และ Directing Notes" },
  minimax: { th: "MiniMax Hailuo H3", sub: "Voiceover พิเศษ <d> (S1) ... </d> lips stay closed" },
  dreamradar: { th: "DreamRadar", sub: "Prompt ซีนและท่ากล้องสำหรับ Radar Video Engine" }
};

function initialState(){
  return {
    step:0, genre:"drama", style:"photoreal", scope:"single", engine:"minimax",`;

js = js.replace(oldInit, newInit);

// 2. Add buildMinimaxPrompt, buildGoogleFlowPrompt, buildDreamRadarPrompt and rewrite buildPrompt
const oldBuildPrompt = `function buildPrompt(){
  const used = S.chars.map((c,i)=>({c,i})).filter(o=>o.c.name||o.c.nameEn||o.c.face||o.c.hair);
  if(!used.length && !S.shots.length) return "";
  const g = GENRES[S.genre], st = STYLES[S.style], ar = PLATFORMS[S.platform];
  const L = [];
  const names = used.map(o=>label(o.c,o.i)).join(", ") || "the character in the reference image";
  const total = S.shots.length ? timeline()[S.shots.length-1][1] : +S.clipSec;

  /* 1. system lock */
  if(st.stylized){
    L.push("SYSTEM PROMPT (LOCK): Primary character reference: "+names+" as drawn in the attached reference image(s). STRICT CHARACTER DESIGN LOCK: keep the same face shape, eye shape and color, hairstyle and hair color, body proportions and signature accessories in every shot, angle and scene. Do not redesign, do not mix art styles. Outfit, location, pose, emotion, lighting and camera may change. Style: "+st.txt+". Genre preset: "+(g.en||g.th)+" ("+g.mood+"). Format: "+aspectTxt(ar)+", "+fmt(total)+" total, "+S.shots.length+" shots. FINAL PRIORITY: character design consistency outranks every other instruction.");
  }else{
    L.push("SYSTEM PROMPT (LOCK): Primary identity reference: "+names+", exactly as in the attached reference image(s). STRICT IDENTITY LOCK, 100% CHARACTER CONSISTENCY: keep the same face (face shape, forehead, brows, eyes and eye spacing, nose, mouth, smile, cheeks, chin, jawline), skin tone, apparent age, hairstyle and body proportions in every shot, every angle and every scene. Never create a new face, never beautify, never slim or reshape. Outfit, location, pose, emotion, lighting and camera may change. Natural head turns stay within about 45 degrees. Style: "+st.txt+". Genre preset: "+(g.en||g.th)+" ("+g.mood+"). Format: "+aspectTxt(ar)+", "+fmt(total)+" total, "+S.shots.length+" shots. FINAL PRIORITY: identity preservation outranks every other instruction.");
  }
  /* 2. character lock */
  if(used.length){
    L.push("CHARACTER LOCK:\\n"+used.map(o=>{
      const c=o.c, bits=[];
      bits.push("- "+label(c,o.i)+(c.role?" ["+c.role+"]":"")+(c.job?", "+c.job:"")+": "+appearance(c)+".");
      if(c.wardrobe) bits.push("  Default wardrobe: "+c.wardrobe+".");
      if(c.traits||c.flaw) bits.push("  On-screen personality: "+[c.traits,c.flaw?"flaw: "+c.flaw:""].filter(Boolean).join("; ")+".");
      return bits.join("\\n");
    }).join("\\n"));
  }
  /* 2b. product lock (UGC) */
  const pOn = productOn();
  if(pOn){
    const pr = S.product, pb = [];
    pb.push("PRODUCT LOCK: Product"+(pr.name.trim()?": "+pr.name.trim():"")+(pr.look.trim()?" ("+pr.look.trim()+")":"")+".");
    pb.push("Keep the product's shape, packaging, colors, label text and logo exactly as in the attached product image(s) in every shot where it appears. Do not redesign it, do not translate or invent text or logos on it, keep its size consistent relative to the hand and body, and keep the label facing the camera when shown.");
    if(pr.usp.trim()) pb.push("Key selling point to express through natural action, not on-screen claims: "+pr.usp.trim()+".");
    L.push(pb.join(" "));
  }
  /* 3. story */
  const story = [];
  if(S.premise) story.push("Premise: "+S.premise+".");
  if(S.relation) story.push("Relationship: "+S.relation+".");
  if(S.setting)  story.push("Setting: "+S.setting+".");
  if(S.ending)   story.push("Ending: "+S.ending+".");
  if(S.scope==="series") story.push("Series plan: "+S.eps+" episodes x "+S.mins+" min; this prompt covers one "+S.clipSec+"s clip.");
  if(story.length) L.push("STORY: "+story.join(" "));
  /* 4. audio + subtitles */
  L.push(audioLine());
  { const sl = subLine(); if(sl) L.push(sl); }
  /* 5. shots */
  const tl = timeline();
  S.shots.forEach((s,i)=>{
    const who = s.who==="all" ? used.map(o=>shortName(o.c,o.i)).join(" and ") : shortName(S.chars[+s.who]||S.chars[0], +s.who||0);
    const parts = [];
    parts.push("Identity: "+(who||"the lead")+(st.stylized?" (same character design as reference)":" (same face and body as reference)")+".");
    parts.push("Action: "+(s.action||"natural movement")+".");
    if(pOn && /product|demonstrat|proof|result|before|after|bottle|box|tube|case/i.test(s.action||"")) parts.push("Product: identical to the attached product image.");
    const d = (s.dia||"").trim();
    if(d && S.vo!=="none"){
      const isVO = /^(vo|voice-?over)\s*[:：]/i.test(d);
      const line = d.replace(/^(vo|voice-?over)\s*[:：]\s*/i,"");
      parts.push((isVO||S.vo==="vo" ? "Voice-over: " : "Dialogue: ")+"\\""+line+"\\" in "+S.accent+".");
    }
    { const vo=(s.vo||"").trim(); if(vo && S.vo!=="none" && S.vo!=="dialogue") parts.push("Voice-over: \\""+vo+"\\" in "+S.accent+"."); }
    { const sb=(s.sub||"").trim(); if(sb && S.sub.on==="on") parts.push("Subtitle ("+langName(S.sub.lang)+"): \\""+sb.replace(/\\n+/g," / ")+"\\"."); }
    if(S.setting) parts.push("Environment: "+S.setting+".");
    parts.push("Lighting: "+g.light+".");
    parts.push("Camera: "+(SIZES[s.size]||s.size)+", "+s.move+".");
    parts.push("Style: "+st.txt+".");
    parts.push(aspectTxt(ar)+".");
    if(i<S.shots.length-1 && s.trans && s.trans!=="cut") parts.push("Transition: "+s.trans+".");
    L.push("SHOT "+(i+1)+" ("+fmt(tl[i][0])+"-"+fmt(tl[i][1])+"): "+parts.join(" "));
  });
  /* 6. negative */
  L.push("NEGATIVE PROMPT: "+NEG+(st.stylized?", photorealistic skin, mixed art styles, off-model character design":", cartoon face, anime face")+(pOn?", distorted product, altered packaging, wrong logo, misspelled label text, changed product color":""));
  return L.join("\\n\\n");
}`;

const newBuildPrompt = `function buildPrompt(){
  const eng = S.engine || "meta";
  if(eng === "minimax") return buildMinimaxPrompt();
  if(eng === "flow") return buildGoogleFlowPrompt();
  if(eng === "dreamradar") return buildDreamRadarPrompt();
  return buildMetaAiPrompt();
}

/* 1. Meta AI Prompt (Default Identity Lock) */
function buildMetaAiPrompt(){
  const used = S.chars.map((c,i)=>({c,i})).filter(o=>o.c.name||o.c.nameEn||o.c.face||o.c.hair);
  if(!used.length && !S.shots.length) return "";
  const g = GENRES[S.genre], st = STYLES[S.style], ar = PLATFORMS[S.platform];
  const L = [];
  const names = used.map(o=>label(o.c,o.i)).join(", ") || "the character in the reference image";
  const total = S.shots.length ? timeline()[S.shots.length-1][1] : +S.clipSec;

  if(st.stylized){
    L.push("SYSTEM PROMPT (LOCK): Primary character reference: "+names+" as drawn in the attached reference image(s). STRICT CHARACTER DESIGN LOCK: keep the same face shape, eye shape and color, hairstyle and hair color, body proportions and signature accessories in every shot, angle and scene. Do not redesign, do not mix art styles. Outfit, location, pose, emotion, lighting and camera may change. Style: "+st.txt+". Genre preset: "+(g.en||g.th)+" ("+g.mood+"). Format: "+aspectTxt(ar)+", "+fmt(total)+" total, "+S.shots.length+" shots. FINAL PRIORITY: character design consistency outranks every other instruction.");
  }else{
    L.push("SYSTEM PROMPT (LOCK): Primary identity reference: "+names+", exactly as in the attached reference image(s). STRICT IDENTITY LOCK, 100% CHARACTER CONSISTENCY: keep the same face (face shape, forehead, brows, eyes and eye spacing, nose, mouth, smile, cheeks, chin, jawline), skin tone, apparent age, hairstyle and body proportions in every shot, every angle and every scene. Never create a new face, never beautify, never slim or reshape. Outfit, location, pose, emotion, lighting and camera may change. Natural head turns stay within about 45 degrees. Style: "+st.txt+". Genre preset: "+(g.en||g.th)+" ("+g.mood+"). Format: "+aspectTxt(ar)+", "+fmt(total)+" total, "+S.shots.length+" shots. FINAL PRIORITY: identity preservation outranks every other instruction.");
  }
  if(used.length){
    L.push("CHARACTER LOCK:\\n"+used.map(o=>{
      const c=o.c, bits=[];
      bits.push("- "+label(c,o.i)+(c.role?" ["+c.role+"]":"")+(c.job?", "+c.job:"")+": "+appearance(c)+".");
      if(c.wardrobe) bits.push("  Default wardrobe: "+c.wardrobe+".");
      if(c.traits||c.flaw) bits.push("  On-screen personality: "+[c.traits,c.flaw?"flaw: "+c.flaw:""].filter(Boolean).join("; ")+".");
      return bits.join("\\n");
    }).join("\\n"));
  }
  const pOn = productOn();
  if(pOn){
    const pr = S.product, pb = [];
    pb.push("PRODUCT LOCK: Product"+(pr.name.trim()?": "+pr.name.trim():"")+(pr.look.trim()?" ("+pr.look.trim()+")":"")+".");
    pb.push("Keep the product's shape, packaging, colors, label text and logo exactly as in the attached product image(s) in every shot where it appears. Do not redesign it, do not translate or invent text or logos on it, keep its size consistent relative to the hand and body, and keep the label facing the camera when shown.");
    if(pr.usp.trim()) pb.push("Key selling point to express through natural action, not on-screen claims: "+pr.usp.trim()+".");
    L.push(pb.join(" "));
  }
  const story = [];
  if(S.premise) story.push("Premise: "+S.premise+".");
  if(S.relation) story.push("Relationship: "+S.relation+".");
  if(S.setting)  story.push("Setting: "+S.setting+".");
  if(S.ending)   story.push("Ending: "+S.ending+".");
  if(S.scope==="series") story.push("Series plan: "+S.eps+" episodes x "+S.mins+" min; this prompt covers one "+S.clipSec+"s clip.");
  if(story.length) L.push("STORY: "+story.join(" "));
  L.push(audioLine());
  { const sl = subLine(); if(sl) L.push(sl); }
  const tl = timeline();
  S.shots.forEach((s,i)=>{
    const who = s.who==="all" ? used.map(o=>shortName(o.c,o.i)).join(" and ") : shortName(S.chars[+s.who]||S.chars[0], +s.who||0);
    const parts = [];
    parts.push("Identity: "+(who||"the lead")+(st.stylized?" (same character design as reference)":" (same face and body as reference)")+".");
    parts.push("Action: "+(s.action||"natural movement")+".");
    if(pOn && /product|demonstrat|proof|result|before|after|bottle|box|tube|case/i.test(s.action||"")) parts.push("Product: identical to the attached product image.");
    const d = (s.dia||"").trim();
    if(d && S.vo!=="none"){
      const isVO = /^(vo|voice-?over)\\s*[:：]/i.test(d);
      const line = d.replace(/^(vo|voice-?over)\\s*[:：]\\s*/i,"");
      parts.push((isVO||S.vo==="vo" ? "Voice-over: " : "Dialogue: ")+"\\""+line+"\\" in "+S.accent+".");
    }
    { const vo=(s.vo||"").trim(); if(vo && S.vo!=="none" && S.vo!=="dialogue") parts.push("Voice-over: \\""+vo+"\\" in "+S.accent+"."); }
    { const sb=(s.sub||"").trim(); if(sb && S.sub.on==="on") parts.push("Subtitle ("+langName(S.sub.lang)+"): \\""+sb.replace(/\\n+/g," / ")+"\\"."); }
    if(S.setting) parts.push("Environment: "+S.setting+".");
    parts.push("Lighting: "+g.light+".");
    parts.push("Camera: "+(SIZES[s.size]||s.size)+", "+s.move+".");
    parts.push("Style: "+st.txt+".");
    parts.push(aspectTxt(ar)+".");
    if(i<S.shots.length-1 && s.trans && s.trans!=="cut") parts.push("Transition: "+s.trans+".");
    L.push("SHOT "+(i+1)+" ("+fmt(tl[i][0])+"-"+fmt(tl[i][1])+"): "+parts.join(" "));
  });
  L.push("NEGATIVE PROMPT: "+NEG+(st.stylized?", photorealistic skin, mixed art styles, off-model character design":", cartoon face, anime face")+(pOn?", distorted product, altered packaging, wrong logo, misspelled label text, changed product color":""));
  return L.join("\\n\\n");
}

/* 2. MiniMax Hailuo H3 Prompt with Exact Off-Screen Voiceover Tag */
function buildMinimaxPrompt(){
  const g = GENRES[S.genre], st = STYLES[S.style], ar = PLATFORMS[S.platform];
  const langCode = (S.sub.lang || "th").toLowerCase().split("-")[0] || "th";
  const tl = timeline();
  const out = [];

  // Header Context
  out.push("[MODEL: MiniMax Hailuo H3] [FORMAT: "+aspectTxt(ar)+"] [STYLE: "+st.txt+"]\\nGENRE: "+(g.en||g.th)+" - "+g.mood+"\\nLIGHTING: "+g.light);

  if(S.shots.length === 0){
    const act = (S.premise || "A beautiful cinematic scene during sunset in Bangkok.").trim();
    const voText = S.hookText || "กรุงเทพมหานคร เมืองหลวงที่ไม่เคยหลับใหล";
    out.push(act + "\\n<d> (S1) says in an off-screen voiceover; [" + langCode + "] " + voText + " </d> and state lips stay closed after </d>.");
    return out.join("\\n\\n");
  }

  S.shots.forEach((s, i) => {
    let act = (s.action || "").trim();
    if(!act) act = (S.setting ? S.setting + ", " : "") + (SIZES[s.size]||s.size) + " shot, " + s.move + ".";
    
    // Voice-over text from vo field, dia field, or hookText
    let vo = (s.vo || "").trim();
    if(!vo && (s.dia||"").trim()) vo = stripVO(s.dia);
    if(!vo && i === 0 && S.hookText) vo = S.hookText.trim();

    let speaker = "S1";
    if(s.who !== "all" && s.who !== undefined && s.who !== null){
      const num = parseInt(s.who, 10);
      speaker = "S" + (isNaN(num) ? 1 : num + 1);
    }

    let shotBlock = "[SHOT " + (i+1) + "] (" + (SIZES[s.size]||s.size) + ", " + s.move + ")\\n" + act;
    if(vo && S.vo !== "none"){
      shotBlock += "\\n<d> (" + speaker + ") says in an off-screen voiceover; [" + langCode + "] " + vo + " </d> and state lips stay closed after </d>.";
    }
    out.push(shotBlock);
  });

  return out.join("\\n\\n");
}

/* 3. Google Flow Multi-Camera / Scene Breakdown */
function buildGoogleFlowPrompt(){
  const g = GENRES[S.genre], st = STYLES[S.style], ar = PLATFORMS[S.platform];
  const L = [];
  L.push("GOOGLE FLOW PROJECT SPEC:\\n- Title: " + (S.premise ? S.premise.slice(0, 40) : "Micro Drama") + "\\n- Aspect Ratio: " + aspectTxt(ar) + "\\n- Visual Style: " + st.txt + "\\n- Production Pace: " + g.pace + "\\n- Lighting Design: " + g.light);

  if(S.chars.length){
    L.push("CASTING & TALENT:\\n" + S.chars.map((c, i) => "• Character " + (i+1) + ": " + (c.name || "Actor") + " (" + (c.role || "Lead") + ") - " + appearance(c)).join("\\n"));
  }

  const tl = timeline();
  const shotList = S.shots.map((s, i) => {
    const vo = (s.vo || s.dia || "").trim();
    return "SCENE " + (i+1) + " [" + fmt(tl[i][0]) + " - " + fmt(tl[i][1]) + "]\\n" +
      "  Camera: " + (SIZES[s.size] || s.size) + " | Movement: " + s.move + "\\n" +
      "  Action: " + (s.action || "Natural scene execution") + "\\n" +
      (vo ? "  Dialogue/Audio: [Language: " + S.lang + "] \\"" + vo + "\\"\\n" : "") +
      "  Atmosphere: " + g.mood;
  });

  L.push("SHOT-BY-SHOT BREAKDOWN:\\n" + (shotList.length ? shotList.join("\\n\\n") : "Scene 1: " + (S.premise || "Cinematic shot")));
  return L.join("\\n\\n");
}

/* 4. DreamRadar Video Engine */
function buildDreamRadarPrompt(){
  const g = GENRES[S.genre], st = STYLES[S.style], ar = PLATFORMS[S.platform];
  const L = [];
  L.push("/dreamradar prompt: " + (S.setting || "cinematic scene") + ", " + (S.premise || "compelling dramatic moment") + ", " + st.txt + ", " + g.light + " --ar " + (PLATFORMS[S.platform] || "9:16") + " --camera dynamic");

  if(S.shots.length){
    L.push("RADAR KEYFRAMES & SHOT SEQUENCES:\\n" + S.shots.map((s, i) => {
      const vo = (s.vo || s.dia || "").trim();
      return "Seq " + (i+1) + ": " + (SIZES[s.size]||s.size) + ", " + s.move + " -> " + (s.action || "fluid subject motion") + (vo ? " [Voice: " + vo + "]" : "");
    }).join("\\n"));
  }

  L.push("Negative: " + NEG);
  return L.join("\\n\\n");
}`;

js = js.replace(oldBuildPrompt, newBuildPrompt);

// 3. Update monitor() to render Engine Selector Pills
const oldMonitor = `function monitor(extra){
  const p = buildPrompt();
  return \`<div class="mon \${extra||""}"><div class="mon-bar"><span class="rec"><i class="dot"></i> META AI PROMPT</span>
    <button class="btn primary sm" type="button" data-act="copyPrompt" \${p?"":"disabled"}>คัดลอก Prompt</button></div>
    \${p?\`<pre class="promptPre" tabindex="0">\${esc(p)}</pre>\`:\`<div class="empty">ยังไม่มีข้อมูลพอสำหรับประกอบ Prompt เริ่มจากตั้งชื่อตัวละครและสร้าง Storyboard</div>\`}</div>\`;
}`;

const newMonitor = `function monitor(extra){
  const p = buildPrompt();
  const curEng = S.engine || "minimax";
  const engLabel = (ENGINES[curEng] || ENGINES.meta).th;
  return \`<div class="mon \${extra||""}">
    <div style="padding:10px 12px 6px;border-bottom:1px solid #2a2c33;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;background:rgba(255,255,255,0.02)">
      <div style="font-size:11px;font-family:var(--font-mono);color:var(--muted);display:flex;align-items:center;gap:6px">
        <span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:#F59E0B"></span>
        เลือกโมเดลเป้าหมาย (AI Target):
      </div>
      <div style="display:flex;gap:4px;flex-wrap:wrap">
        \${Object.keys(ENGINES).map(k=>\`<button type="button" class="btn sm \${curEng===k?"primary":""}" data-setengine="\${k}" style="min-height:28px;padding:2px 8px;font-size:11.5px;font-weight:600">\${esc(ENGINES[k].th)}</button>\`).join("")}
      </div>
    </div>
    <div class="mon-bar">
      <span class="rec"><i class="dot"></i> \${esc(engLabel.toUpperCase())} PROMPT</span>
      <button class="btn primary sm" type="button" data-act="copyPrompt" \${p?"":"disabled"}>คัดลอก Prompt</button>
    </div>
    \${p?\`<pre class="promptPre" tabindex="0">\${esc(p)}</pre>\`:\`<div class="empty">ยังไม่มีข้อมูลพอสำหรับประกอบ Prompt เริ่มจากตั้งชื่อตัวละครและสร้าง Storyboard</div>\`}
  </div>\`;
}`;

js = js.replace(oldMonitor, newMonitor);

// 4. Update click handler to support data-setengine
const oldClick = `document.addEventListener("click", e => {
  const t = e.target.closest("button"); if(!t) return;`;

const newClick = `document.addEventListener("click", e => {
  const t = e.target.closest("button"); if(!t) return;
  if(t.dataset.setengine){ S.engine = t.dataset.setengine; save(); render(); toast("เลือกเป้าหมายเป็น " + ENGINES[S.engine].th + " แล้ว"); return; }`;

js = js.replace(oldClick, newClick);

fs.writeFileSync('public/director-studio/studio.js', js, 'utf8');
console.log('studio.js updated with Google Flow, Meta AI, DreamRadar, and MiniMax H3 voice-over tag format!');
