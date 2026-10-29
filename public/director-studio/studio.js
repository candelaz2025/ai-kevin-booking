
/* ===== DATA: presets ===== */
const NEG = "different person, different face, face swap, identity drift, altered facial features, changed face shape, changed eye spacing, changed nose, changed mouth, altered smile, different hairstyle, different skin tone, body shape change, body proportion change, de-aging, aging, beautification, excessive retouching, artificial face, distorted anatomy, inconsistent character, morphing, flickering face";

const GENRES = {
  drama:    {th:"ดราม่า",        sub:"อารมณ์หนัก ใบหน้าใกล้",   light:"soft motivated window light, warm key with cool fill, gentle shadows", mood:"restrained, emotional, quiet tension", pace:"slow",
             moves:["slow push-in","static","slow push-in","gentle handheld","static"], sizes:["CU","MCU","CU","MS","ECU"],
             beats:["{A} alone in {setting}, a small gesture shows something is wrong","{A} tries to keep normal life going while {premise}","The conflict surfaces: {A} faces {B} and words fail","A quiet turning point: {A} makes a choice that costs something","Aftermath: {A} holds a lingering look, the ending lands with silence"],
             tags:["#หนังสั้น","#ดราม่า","#shortfilm","#MetaAI"]},
  ugc:      {th:"UGC ขายของ",    sub:"มือถือ จริงใจ มี hook 3 วิ", light:"natural daylight, slightly overexposed window light, phone-camera look", mood:"authentic, friendly, direct-to-camera", pace:"fast",
             moves:["handheld","handheld","slow push-in","handheld","static"], sizes:["MCU","CU","MS","CU","MCU"],
             beats:["HOOK: {A} looks into the lens and says the opening line","Problem: {A} shows the everyday pain point in {setting}","Product moment: {A} demonstrates the product close-up, honest reaction","Proof: before and after or result shown clearly, {A} smiles naturally","CTA: {A} points to the link, warm sign-off"],
             tags:["#รีวิว","#UGC","#ของดีบอกต่อ","#TikTokShop"]},
  comedy:   {th:"คอมเมดี้",       sub:"มุกชัด จังหวะเป๊ะ",         light:"bright even high-key light, saturated colors", mood:"playful, exaggerated reactions, snappy timing", pace:"fast",
             moves:["static","whip pan","slow push-in","static","handheld"], sizes:["MS","MCU","CU","WS","MCU"],
             beats:["{A} in {setting} thinks everything is under control","Setup: {premise}, {B} watches with a deadpan face","Escalation: the situation gets absurdly worse for {A}","Punchline: a visual twist, {A} reacts with a frozen stare","Tag: one last small gag after the laugh"],
             tags:["#ตลก","#คอมเมดี้","#หนังสั้นตลก","#funny"]},
  horror:   {th:"ผี / สยองขวัญ",   sub:"ค่อยๆ บีบ ไม่รีบโชว์",        light:"low-key, single practical light, deep shadows, cold green-blue cast", mood:"dread, slow reveal, negative space", pace:"slow",
             moves:["slow push-in","static","slow pan","handheld","static"], sizes:["WS","MS","CU","MCU","ECU"],
             beats:["{A} in {setting} at night, something is slightly off","{A} notices a detail that should not be there","The presence is felt but not shown, {B} warns or disappears","Reveal: a brief glimpse in the background, {A} freezes","Ending sting: the camera lingers, the threat is still there"],
             tags:["#หนังผี","#สยองขวัญ","#เรื่องผี","#horror"]},
  boss:     {th:"ประธานบริษัท",    sub:"อำนาจ ความลับ หักมุม",       light:"clean corporate cinematic light, glass reflections, cool daylight with warm accents", mood:"powerful, composed, high-stakes", pace:"medium",
             moves:["slow push-in","tracking","static","slow push-in","orbit"], sizes:["WS","MS","MCU","CU","MS"],
             beats:["{A} enters {setting}, everyone goes quiet","{A} takes the lead seat while {premise}","{B} challenges {A} openly, tension in the room","Reveal: {A} plays the card nobody expected","{A} walks away, the power balance has changed"],
             tags:["#ประธานบริษัท","#ละครสั้น","#CEO","#หนังสั้น"]},
  action:   {th:"แอ็คชั่น",       sub:"เร็ว คม ชัดเจนทุกช็อต",      light:"high-contrast dramatic light, rim light, motivated practicals", mood:"kinetic, tense, precise choreography", pace:"fast",
             moves:["tracking","handheld","whip pan","tracking","slow push-in"], sizes:["WS","MS","CU","MS","MCU"],
             beats:["{A} is already in motion in {setting}, the threat is visible","{A} reads the space, one clear objective","Clash: {A} versus {B}, one clean move per shot","Reversal: {A} loses ground, then finds an opening","Resolution: a final decisive beat, {A} stands still after the noise"],
             tags:["#แอ็คชั่น","#หนังสั้น","#action","#MetaAI"]},
  anime_jp: {th:"อนิเมะญี่ปุ่น",    sub:"cel shading ตาสื่ออารมณ์",    light:"stylized anime lighting, soft gradients, glowing highlights", mood:"expressive, heartfelt, dynamic poses", pace:"medium",
             moves:["slow push-in","pan","static","tracking","slow push-in"], sizes:["MS","CU","ECU","WS","MCU"],
             beats:["{A} stands in {setting}, wind moves hair and clothes","{A} hides a feeling while {premise}","{B} appears and the emotional distance shows","Climax: a burst of resolve, dramatic pose and speed lines","Quiet closing shot under a wide sky"],
             tags:["#อนิเมะ","#anime","#อนิเมะญี่ปุ่น","#MetaAI"]},
  donghua_cn:{th:"อนิเมะจีน / Donghua",sub:"ยุทธภพ แสงพลังงาม",       light:"ethereal glow, mist, rim light, golden and jade tones", mood:"epic, graceful, mythic", pace:"medium",
             moves:["slow orbit","slow push-in","tracking","static","pan"], sizes:["WS","MS","CU","WS","MCU"],
             beats:["{A} on a misty mountain, robes flowing, {setting}","{A} trains or meditates while {premise}","{B} arrives, rival or master, a test begins","Power surge: qi light, a graceful strike sequence","{A} bows, the mist closes the scene"],
             tags:["#donghua","#อนิเมะจีน","#ยุทธภพ","#MetaAI"]},
  period:   {th:"ย้อนยุค / วรรณกรรม", sub:"โทนฟิล์ม งานคราฟต์",         light:"warm tungsten and candle-like practicals, film grain, soft vignette", mood:"nostalgic, literary, patient", pace:"slow",
             moves:["static","slow push-in","pan","static","slow push-in"], sizes:["WS","MS","CU","MCU","WS"],
             beats:["Establishing {setting}, period details visible, {A} in frame","{A} goes about the day while {premise}","A letter, a meeting, or a glance with {B} changes the mood","The emotional turn is spoken softly, almost whispered","{A} looks out of a window, time passes in one long shot"],
             tags:["#ย้อนยุค","#วรรณกรรม","#หนังสั้น","#period"]},
  romance:  {th:"กุ๊กกิ๊ก / โรแมนซ์", sub:"แสงนุ่ม จังหวะหัวใจ",         light:"golden hour glow, soft diffusion, shallow depth of field", mood:"warm, shy, sweet tension", pace:"medium",
             moves:["slow push-in","gentle handheld","static","slow orbit","slow push-in"], sizes:["MS","CU","MCU","CU","WS"],
             beats:["{A} and {B} cross paths in {setting}","Small awkward moment while {premise}","Eye contact, a shy smile, a hand almost touches","A confession or a missed chance, both feel it","Soft ending: they walk side by side, light fades"],
             tags:["#กุ๊กกิ๊ก","#โรแมนติก","#รักวัยใส","#หนังสั้น"]},
  adventure:{th:"ผจญภัย",        sub:"โลกกว้าง ขยับตลอด",           light:"bright natural sunlight, saturated landscape colors", mood:"curious, energetic, wide open", pace:"medium",
             moves:["tracking","pan","slow push-in","tracking","tilt"], sizes:["WS","MS","WS","MCU","WS"],
             beats:["{A} sets out from {setting}, the goal is clear","Obstacle on the path while {premise}","{B} helps or blocks, a choice must be made","Discovery: the place reveals something unexpected","{A} looks back at the distance covered, ready for more"],
             tags:["#ผจญภัย","#adventure","#หนังสั้น","#MetaAI"]}
};

const STYLES = {
  photoreal:{th:"Photoreal Cinematic", txt:"photorealistic cinematic video, natural skin texture, sharp facial detail, realistic lighting and shadows, shallow depth of field", stylized:false},
  ugc_phone:{th:"UGC มือถือ",          txt:"photorealistic smartphone vertical video, natural handheld micro-shake, real skin texture, unpolished authentic look", stylized:false},
  film35:   {th:"ฟิล์ม 35mm",           txt:"photorealistic 35mm film look, subtle grain, halation, muted warm palette, natural skin", stylized:false},
  doc:      {th:"สารคดี",               txt:"photorealistic documentary look, available light, observational framing", stylized:false},
  anime:    {th:"Anime (JP)",           txt:"Japanese anime style, clean cel shading, expressive large eyes, consistent character design sheet, no photorealism", stylized:true},
  donghua:  {th:"Donghua (CN) 3D",      txt:"Chinese donghua style, semi-3D painterly rendering, flowing fabric, glowing qi effects, consistent character design", stylized:true}
};

const SIZES = {ECU:"extreme close-up",CU:"close-up",MCU:"medium close-up",MS:"medium shot",WS:"wide shot",OTS:"over-the-shoulder shot"};
const MOVES = ["static","slow push-in","slow pull-out","pan","tilt","tracking","handheld","whip pan","slow orbit"];
const TRANS = ["cut","match cut","fade","whip","dissolve","hard cut"];
const PLATFORMS = {tiktok:"9:16", reels:"9:16", shorts:"9:16", fb:"4:5", yt:"16:9"};
const PLAT_TH = {tiktok:"TikTok",reels:"Reels",shorts:"Shorts",fb:"Facebook Feed",yt:"YouTube"};
const ACCENTS = ["ไทยกลาง (กรุงเทพ)","อีสาน","เหนือ (คำเมือง)","ใต้","ไทยปนอังกฤษ","English (neutral)","日本語 (Japanese)","中文 (Mandarin)"];
const VO_MODES = {both:"พูดในฉาก + Voice-over", dialogue:"บทพูดในฉากอย่างเดียว", vo:"Voice-over อย่างเดียว", none:"ไม่มีเสียงพูด (เพลง/เสียงบรรยากาศ)"};

const HOOKS = {
  pain:      {th:"Pain point",     tpl:"ยังต้อง{x}อีกเหรอ?",             ex:"ยังต้องนั่งแก้ปัญหานี้อีกเหรอ?"},
  result:    {th:"Result first",   tpl:"{x} ใน 3 วิ เห็นผลเลย",           ex:"เห็นผลใน 3 วิ"},
  pattern:   {th:"Pattern break",  tpl:"อย่าเพิ่งเลื่อนผ่าน เรื่อง{x}",    ex:"อย่าเพิ่งเลื่อนผ่าน"},
  confession:{th:"Confession",     tpl:"ยอมรับเลย เราพลาดเรื่อง{x}",       ex:"ยอมรับเลย เราพลาดมาตลอด"}
};

const TONES = {
  playful:  {th:"สนุก / เป็นกันเอง"},
  sincere:  {th:"จริงใจ / อบอุ่น"},
  dramatic: {th:"ดราม่า / ลึก"},
  suspense: {th:"ลุ้น / เร้าใจ"},
  formal:   {th:"เป็นทางการ"}
};

const STEPS = [
  {id:"concept",  t:"แนวเรื่อง"},
  {id:"chars",    t:"ตัวละคร"},
  {id:"prod",     t:"การผลิต"},
  {id:"hook",     t:"Hook & เรื่อง"},
  {id:"board",    t:"Storyboard"},
  {id:"audio",   t:"เสียง & Sub"},
  {id:"out",      t:"Prompt"},
  {id:"social",   t:"Caption"}
];

function blankChar(i){
  return {name:"", nameEn:"", role: i===0?"Lead":"Support", age:"", job:"", traits:"", flaw:"", accent:"",
          face:"", hair:"", body:"", wardrobe:"", ref:""};
}
const ENGINES = {
  meta: { th: "Meta AI", sub: "Prompt เต็มรูปแบบพร้อม Identity Lock & Negative Prompt" },
  flow: { th: "Google Flow", sub: "จัดรูปแบบ Multi-Camera, Shot Breakdown และ Directing Notes" },
  minimax: { th: "MiniMax Hailuo H3", sub: "Voiceover พิเศษ <d> (S1) ... </d> lips stay closed" },
  dreamradar: { th: "DreamRadar", sub: "Prompt ซีนและท่ากล้องสำหรับ Radar Video Engine" }
};

function initialState(){
  return {
    step:0, genre:"drama", style:"photoreal", scope:"single", engine:"minimax",
    premise:"", ending:"", relation:"", setting:"", topic:"", product:{name:"",look:"",usp:""},
    audio:{music:"auto",ambience:"auto",sfx:[],mix:"vo_first"}, voice:{gender:"female",tone:"warm",pace:"medium"}, sub:{on:"on",lang:"th",lang2:"",pos:"lower",style:"clean"},
    chars:[blankChar(0)],
    eps:1, mins:1, clipSec:15, platform:"tiktok", lang:"ไทย", accent:"ไทยกลาง (กรุงเทพ)", vo:"both",
    hookType:"pain", hookText:"", beats:[], shots:[],
    tone:"playful", caption:"", hashtags:""
  };
}

/* ===== RANDOM POOLS ===== */
const PREMISES = {
  drama:["ลูกสาวกลับบ้านเกิดเพื่อดูแลพ่อที่ป่วย และพบจดหมายที่แม่ซ่อนไว้","พี่น้องสองคนต้องตัดสินใจขายบ้านเก่าที่ผูกพันกับความทรงจำ","หญิงวัยทำงานทำทุกอย่างให้ครอบครัว จนวันหนึ่งไม่มีใครถามว่าเธอเหนื่อยไหม"],
  ugc:["เล่าประสบการณ์จริงหลังลองใช้สินค้าครบ 7 วัน","คนที่เคยไม่เชื่อว่าสินค้านี้จะช่วยได้ มาเล่าว่าเปลี่ยนความคิดตรงไหน","รีวิวแบบไม่อวย บอกทั้งข้อดีและสิ่งที่ควรรู้ก่อนซื้อ"],
  comedy:["พนักงานออฟฟิศพยายามแอบกินข้าวกล่องหอมๆ ในห้องประชุมโดยไม่ให้ใครรู้","หนุ่มซื้อของขวัญวันเกิดแฟนผิดสี แล้วต้องหาทางแก้ก่อนเธอเปิดกล่อง","ผีขี้อายที่ถูกจ้างมาหลอก แต่กลับถูกผู้เช่าหลอกกลับ"],
  horror:["สาวเช่าห้องใหม่ แล้วพบว่ากระจกในห้องสะท้อนช้ากว่าตัวเองเล็กน้อย","ยามกลางคืนในโรงเรียนเก่าได้ยินเสียงเรียกชื่อตัวเองจากห้องที่ล็อกอยู่","กลุ่มเพื่อนเล่นเกมเรียกวิญญาณ แล้วมีคนนับได้ว่าเพิ่มมาอีกหนึ่ง"],
  boss:["พนักงานใหม่ค้นพบว่าประธานบริษัทคือคนที่เธอเคยช่วยไว้ตอนเด็ก","ประธานแสร้งเป็นพนักงานธรรมดาเพื่อหาคนทรยศในบริษัท","ทายาทหนุ่มกลับมารับตำแหน่งในวันที่บอร์ดบริหารไม่อยากให้เขาอยู่"],
  action:["อดีตบอดี้การ์ดต้องพาพยานสำคัญฝ่าเมืองในคืนเดียว","นักขับรถส่งของต้องส่งพัสดุปริศนาให้ถึงปลายทางก่อนเที่ยงคืน","เธอเป็นแค่คนจัดดอกไม้ แต่เคยเป็นสายลับมาก่อน"],
  anime_jp:["นักเรียนม.ปลายที่ได้รับพลังจากกล้องฟิล์มเก่า ต้องปกป้องเมืองยามค่ำคืน","สองเพื่อนซี้สัญญากันบนดาดฟ้าว่าจะไปถึงเวทีใหญ่ด้วยกัน","เด็กสาวปลุกหุ่นยนต์ยักษ์ที่หลับอยู่ใต้โรงเรียน"],
  donghua_cn:["ศิษย์นอกสำนักผู้ถูกดูแคลน พบคัมภีร์โบราณบนยอดเขาหมอก","นักพรตสาวออกตามหาดาบที่สูญหายเพื่อปลดผนึกสำนัก","สองสำนักคู่อริต้องร่วมมือกันเมื่อมังกรหลับตื่น"],
  period:["จดหมายรักฉบับเดียวที่ส่งไม่ถึงมือผู้รับในปี 2490","หญิงสาวร้านน้ำชาในตลาดเก่ากับนักเขียนที่แวะมาทุกบ่าย","ช่างภาพหนุ่มเก็บภาพสุดท้ายของบ้านไม้ก่อนถูกรื้อ"],
  romance:["สองคนที่เจอกันที่ร้านกาแฟเดิมทุกเช้า แต่ไม่มีใครกล้าทัก","เพื่อนสนิทที่เพิ่งรู้ว่าอีกฝ่ายแอบชอบมาหลายปี","ร่มคันเดียวกลางฝนที่ทำให้คนแปลกหน้าสองคนต้องเดินไปด้วยกัน"],
  adventure:["กลุ่มเพื่อนตามแผนที่เก่าเข้าไปในป่าเขาเพื่อหาน้ำตกที่ไม่มีใครเคยเห็น","เด็กหนุ่มล่องเรือเล็กตามเข็มทิศของปู่ไปยังเกาะที่ไม่อยู่ในแผนที่","นักสำรวจหญิงต้องข้ามหุบเขาก่อนพายุมา"]
};
const SETTINGS = {
  drama:["old wooden house in a quiet village, late afternoon","hospital corridor at night, fluorescent light","small apartment kitchen, rainy morning"],
  ugc:["bright bedroom vanity by a window, morning light","tidy home kitchen counter, daylight","cozy living room sofa, soft daylight"],
  comedy:["open-plan office with messy desks","crowded condo elevator","street food market stall at noon"],
  horror:["dim apartment hallway with flickering light","abandoned school classroom at night","old house stairwell, one bare bulb"],
  boss:["modern glass office at dusk","top-floor boardroom with city skyline","private executive elevator lobby"],
  action:["Bangkok back alley at night, wet pavement","rooftop parking deck at dusk","busy night market with neon signs"],
  anime_jp:["school rooftop at sunset with city skyline","quiet shopping street under cherry blossoms","moonlit train platform"],
  donghua_cn:["misty mountain temple courtyard","bamboo forest at dawn","floating stone bridge above clouds"],
  period:["1950s wooden shophouse tea room, warm lamps","old railway station with steam, sepia light","teak house veranda at golden hour"],
  romance:["riverside cafe at golden hour","rainy bus stop with neon reflections","bookstore aisle with warm lamps"],
  adventure:["jungle trail leading to a waterfall","small wooden boat on open sea","rocky canyon ridge at sunrise"]
};
const RELATIONS = ["หัวหน้ากับลูกน้องที่ไม่ลงรอยกัน","เพื่อนสนิทที่เพิ่งรู้ความลับของกันและกัน","คู่แข่งที่เคยเป็นเพื่อนรักสมัยเรียน","พี่น้องที่ไม่ได้คุยกันมาหลายปี","คนแปลกหน้าที่ถูกโชคชะตาจับมาเจอกัน","ครูกับศิษย์ที่ต่างฝ่ายต่างมีความลับ"];
const ENDINGS = ["จบอบอุ่น ทุกอย่างคลี่คลาย","จบเปิด ทิ้งปมให้ตอนหน้า","หักมุมในช็อตสุดท้าย","จบแบบขมแต่ได้เติบโต","จบด้วยรอยยิ้มและประโยคสั้นๆ"];
const TOPICS = ["การเลื่อนขั้น","ความลับของบริษัท","ความสัมพันธ์ในครอบครัว","การเริ่มต้นใหม่"];
const PRODUCTS = [
  {name:"เซรั่มบำรุงผิว",look:"white pump bottle with pastel green label, minimalist",usp:"เนื้อบางเบา ซึมไว ไม่เหนียว"},
  {name:"กระบอกน้ำเก็บความเย็น",look:"matte sage-green stainless tumbler with black lid",usp:"เก็บความเย็นได้นาน พกง่าย"},
  {name:"ครีมกันแดด",look:"slim sky-blue tube with white cap",usp:"เกลี่ยง่าย ไม่วอก"},
  {name:"กาแฟดริปพร้อมชง",look:"kraft paper box with small coffee drip bags",usp:"ชงง่ายใน 3 นาที"},
  {name:"หูฟังไร้สาย",look:"small off-white charging case with earbuds",usp:"เสียงชัด แบตอึด"}
];
const HOOK_POOL = {
  pain:["ยังปวดหัวเรื่องนี้อยู่เหรอ?","เหนื่อยกับเรื่องเดิมๆ ใช่ไหม?","ทำไมยังแก้ไม่หายสักที?"],
  result:["เห็นผลใน 3 วิ","ลองแล้วต่างจริง ดูเลย","ก่อนกับหลัง ต่างขนาดนี้"],
  pattern:["อย่าเพิ่งเลื่อนผ่าน","หยุดก่อน ดูอันนี้","3 วิพอ แล้วจะเข้าใจ"],
  confession:["ยอมรับเลย เราพลาดมาตลอด","เมื่อก่อนเราเข้าใจผิดมาก","ขอสารภาพอย่างหนึ่ง"]
};
const NAMES = [["นลิน","Nalin"],["ภูมิ","Phum"],["ธัญญา","Thanya"],["กวิน","Kawin"],["ใบบัว","Baibua"],["ปิติ","Piti"],["มณี","Manee"],["ณัฐ","Nat"],["ชลดา","Chonlada"],["วีรพงษ์","Weerapong"]];
const FACES = ["oval face, soft jawline, double eyelids","round face, full cheeks, gentle smile lines","square jaw, strong brows, narrow eyes","heart-shaped face, high cheekbones, small nose","long face, defined chin, light freckles"];
const HAIRS = ["black shoulder-length straight hair","short black side-parted hair","black wavy bob with fringe","long black hair tied in a low ponytail","short cropped black hair"];
const BODIES = ["slim build, about 165 cm, narrow shoulders","average build, about 175 cm, broad shoulders","petite build, about 155 cm","athletic build, about 180 cm","medium build, about 170 cm"];
const WARDROBES = ["navy blazer, white blouse","plain white t-shirt, denim jacket","charcoal suit, light blue shirt","beige knit sweater, dark trousers","floral blouse, high-waist jeans"];
const TRAITS = ["calm, observant, dry humor","warm, stubborn, quick to laugh","ambitious, precise, guarded","playful, loyal, impulsive","quiet, thoughtful, brave when it counts"];
const FLAWS = ["never asks for help","avoids conflict until it explodes","trusts the wrong people","hides feelings behind jokes","can't forgive mistakes"];
const JOBS = ["office worker","freelance designer","barista","nurse","teacher","photographer","chef","engineer"];
const BOSS_JOBS = ["CEO","chairwoman","CFO","executive assistant"];
const SUPPORT_ROLES = ["Rival","Mentor","Best friend","Antagonist","Love interest"];
const ACC_BY_LANG = {"ไทย":ACCENTS.slice(0,5),"English":["English (neutral)"],"日本語":["日本語 (Japanese)"],"中文":["中文 (Mandarin)"]};

/* ===== CHARACTER ARCHETYPES (auto-gen) ===== */
const ARCH = {
  lead:    {th:"ตัวเอก",          sub:"คนเล่าเรื่องหลัก",   role:"Lead",          age:[22,35], jobs:["office worker","freelance designer","nurse","photographer"], traits:["calm, observant, dry humor","warm, stubborn, quick to laugh","quiet, thoughtful, brave when it counts"], flaws:["never asks for help","hides feelings behind jokes","avoids conflict until it explodes"], wardrobe:["plain white t-shirt, denim jacket","beige knit sweater, dark trousers","navy blazer, white blouse"]},
  love:    {th:"คนรัก / คู่ตัวเอก",  sub:"แรงดึงดูดและความอึดอัด", role:"Love interest", age:[22,38], jobs:["barista","architect","musician","chef"], traits:["gentle, witty, a little shy","confident, caring, teasing","reserved, loyal, secretly romantic"], flaws:["afraid of commitment","too proud to apologize","keeps a secret"], wardrobe:["soft linen shirt, light trousers","floral blouse, high-waist jeans","charcoal cardigan, white tee"]},
  rival:   {th:"คู่แข่ง",           sub:"ดันตัวเอกให้โต",     role:"Rival",         age:[24,40], jobs:["sales manager","senior colleague","competitor founder"], traits:["ambitious, precise, guarded","sharp-tongued, competitive, respects effort","polished, strategic, hides insecurity"], flaws:["can't stand losing","trusts no one","needs approval"], wardrobe:["charcoal suit, light blue shirt","fitted red blazer, black trousers","dark turtleneck, tailored coat"]},
  villain: {th:"ตัวร้าย",           sub:"มีเหตุผลของตัวเอง",   role:"Antagonist",    age:[32,58], jobs:["board director","fixer","landlord","family elder"], traits:["cold, charming, calculating","soft-spoken, patient, ruthless","generous in public, controlling in private"], flaws:["obsessed with control","cannot admit being wrong","afraid of being forgotten"], wardrobe:["black tailored suit, silver tie","deep green silk blouse, dark skirt","grey overcoat, leather gloves"]},
  mentor:  {th:"ผู้ใหญ่ / อาจารย์", sub:"ให้คำแนะนำ มีอดีต",   role:"Mentor",        age:[45,68], jobs:["retired teacher","master craftsman","veteran editor","old shop owner"], traits:["patient, wise, dry humor","strict, fair, quietly proud","playful, forgetful, sees everything"], flaws:["holds onto an old regret","speaks in riddles","hates asking for help"], wardrobe:["cream cardigan, pressed trousers","worn linen shirt, apron","tweed jacket, round glasses"]},
  friend:  {th:"เพื่อนซี้",         sub:"ไว้ใจได้ ปากไว",     role:"Best friend",   age:[22,36], jobs:["colleague","roommate","delivery rider","student"], traits:["loud, loyal, impulsive","playful, honest, always hungry","cheerful, nosy, big-hearted"], flaws:["talks too much","overpromises","jumps to conclusions"], wardrobe:["oversized hoodie, jeans","bright yellow jacket, cap","striped shirt, canvas shoes"]},
  boss:    {th:"ประธาน / เจ้านาย",   sub:"อำนาจและความกดดัน",   role:"Boss",          age:[38,60], jobs:["CEO","chairwoman","founder","executive director"], traits:["composed, demanding, fair","charismatic, impatient, observant","quiet, powerful, rarely smiles"], flaws:["trusts numbers over people","never takes a day off","hides a private loss"], wardrobe:["charcoal suit, white shirt","tailored navy suit, silk scarf","dark three-piece suit"]},
  comic:   {th:"ตัวตลก",           sub:"คลายเครียด ทำเรื่องวุ่น", role:"Comic relief",  age:[20,45], jobs:["intern","security guard","street vendor","neighbor"], traits:["clumsy, optimistic, oblivious","dramatic, boastful, kind","deadpan, absurd, secretly smart"], flaws:["always late","cannot keep a secret","overconfident"], wardrobe:["mismatched colorful shirt, shorts","uniform one size too big","vintage floral shirt, bucket hat"]},
  reviewer:{th:"รีวิวเวอร์ UGC",    sub:"พูดกับกล้อง จริงใจ",   role:"Reviewer",      age:[20,35], jobs:["content creator","working professional","student","stay-at-home parent"], traits:["friendly, direct, relatable","bubbly, honest, a little sarcastic","calm, detail-oriented, trustworthy"], flaws:["skeptical by default","talks fast when excited","dislikes hard selling"], wardrobe:["casual t-shirt, hair clip","soft pastel hoodie","simple blouse, small earrings"]}
};

/* ===== AUDIO / VO / SUBTITLE DATA ===== */
const MUSIC = {
  cinematic:{th:"ซิมโฟนีออร์เคสตรา (cinematic)",en:"cinematic orchestral score with a slow build"},
  piano:{th:"เปียโนอารมณ์ลึก",en:"emotional solo piano with soft strings"},
  lofi:{th:"Lo-fi chill",en:"lo-fi chill beat, warm vinyl texture"},
  upbeat:{th:"Pop สดใส จังหวะเร็ว",en:"upbeat modern pop beat, bright and catchy"},
  tense:{th:"ดรอนตึงเครียด (suspense)",en:"tense ambient drone with sparse pulses"},
  dark:{th:"ดาร์ก / สยองขวัญ",en:"dark horror drones, low rumbles, sparse dissonant strings"},
  epic:{th:"Epic ออร์เคสตรา + กลอง",en:"epic orchestral with taiko drums and brass"},
  acoustic:{th:"กีตาร์อะคูสติกโรแมนติก",en:"romantic acoustic guitar, soft and intimate"},
  comedic:{th:"ตลก (pizzicato / เสียงเด้ง)",en:"playful comedic pizzicato strings with quirky percussion"},
  jazz:{th:"แจ๊ซ / ย้อนยุค",en:"vintage jazz trio, brushed drums, warm upright bass"},
  synth:{th:"Synthwave / อิเล็กทรอนิกส์",en:"synthwave electronic pulse, neon mood"},
  thai_trad:{th:"ดนตรีไทย (ระนาด / ขลุ่ย)",en:"traditional Thai instruments, ranat and khlui, gentle and nostalgic"},
  jpop:{th:"J-pop / อนิเมะ",en:"Japanese anime style score, energetic guitars and piano"},
  guzheng:{th:"จีนโบราณ (กู่เจิง / เอ้อหู)",en:"Chinese guzheng and erhu, flowing and mythic"},
  corporate:{th:"คอร์ปอเรตมีพลัง",en:"modern corporate cinematic, confident pulse and light strings"},
  none:{th:"ไม่มีดนตรี",en:""}
};
const GENRE_MUSIC = {drama:"piano",ugc:"upbeat",comedy:"comedic",horror:"dark",boss:"corporate",action:"epic",anime_jp:"jpop",donghua_cn:"guzheng",period:"thai_trad",romance:"acoustic",adventure:"epic"};
const AMBIENCE = {
  room:{th:"Room tone เงียบ",en:"quiet room tone"},
  city:{th:"เมือง / รถ",en:"distant city traffic and street ambience"},
  office:{th:"ออฟฟิศ",en:"office hum, air conditioning, soft keyboard clicks"},
  rain:{th:"ฝนตก",en:"steady rain and distant thunder"},
  nature:{th:"ป่า / ลม / นก",en:"wind through trees, birds, rustling leaves"},
  market:{th:"ตลาด / ฝูงชน",en:"busy market crowd chatter and street vendors"},
  night:{th:"กลางคืน (จิ้งหรีด)",en:"night crickets and faint distant sounds"},
  cafe:{th:"คาเฟ่",en:"cafe chatter, cups and espresso machine"},
  sea:{th:"คลื่นทะเล",en:"ocean waves and sea breeze"}
};
const SFX = {
  steps:{th:"ฝีเท้า",en:"footsteps"}, door:{th:"ประตู",en:"door open and close"}, notif:{th:"แจ้งเตือนมือถือ",en:"phone notification"},
  whoosh:{th:"Whoosh ต่อฉาก",en:"whoosh transitions"}, heart:{th:"หัวใจเต้น",en:"heartbeat"}, typing:{th:"พิมพ์คีย์บอร์ด",en:"keyboard typing"},
  thunder:{th:"ฟ้าร้อง",en:"thunder"}, glass:{th:"แก้วกระทบ",en:"glass clink"}, page:{th:"พลิกกระดาษ",en:"paper page turn"},
  hit:{th:"Impact hit",en:"cinematic impact hits"}, shutter:{th:"ชัตเตอร์",en:"camera shutter"}, pop:{th:"ป๊อป / Ding",en:"soft pop and ding UI sounds"}
};
const MIX = {
  vo_first:{th:"เสียงพูดชัดก่อน",en:"voice always clearly audible, music kept low underneath"},
  balanced:{th:"สมดุล",en:"balanced mix of voice, music and effects"},
  music_forward:{th:"ดนตรีนำ",en:"music-led mix, voice still intelligible"}
};
const V_GENDER = {female:"เสียงผู้หญิง",male:"เสียงผู้ชาย",neutral:"กลางๆ"};
const V_TONE = {warm:"อบอุ่น",energetic:"สดใส มีพลัง",calm:"นิ่ง สงบ",dramatic:"ดราม่า",mysterious:"ลึกลับ",authoritative:"หนักแน่น มั่นใจ"};
const V_PACE = {slow:"ช้า",medium:"ปกติ",fast:"เร็ว"};
const SUB_ON = {on:"เปิด Subtitle",off:"ปิด"};
const SUB_POS = {bottom:"ล่างจอ",lower:"ล่างเหนือขอบ (safe zone)",top:"บนจอ"};
const SUB_STYLE = {clean:"ขาว + เงา",yellow:"เหลือง",box:"พื้นหลังดำโปร่ง",karaoke:"ไฮไลต์ทีละคำ"};

const LANG_RAW = `th|Thai|ไทย
en|English|English
zh-CN|Chinese (Simplified)|简体中文
zh-TW|Chinese (Traditional)|繁體中文
ja|Japanese|日本語
ko|Korean|한국어
vi|Vietnamese|Tiếng Việt
id|Indonesian|Bahasa Indonesia
ms|Malay|Bahasa Melayu
tl|Filipino (Tagalog)|Filipino
my|Burmese|မြန်မာဘာသာ
km|Khmer|ខ្មែរ
lo|Lao|ລາວ
hi|Hindi|हिन्दी
bn|Bengali|বাংলা
ur|Urdu|اردو
ta|Tamil|தமிழ்
te|Telugu|తెలుగు
mr|Marathi|मराठी
gu|Gujarati|ગુજરાતી
kn|Kannada|ಕನ್ನಡ
ml|Malayalam|മലയാളം
pa|Punjabi|ਪੰਜਾਬੀ
ne|Nepali|नेपाली
si|Sinhala|සිංහල
as|Assamese|অসমীয়া
or|Odia|ଓଡ଼ିଆ
sa|Sanskrit|संस्कृतम्
mai|Maithili|मैथिली
kok|Konkani|कोंकणी
sd|Sindhi|سنڌي
ar|Arabic|العربية
fa|Persian|فارسی
he|Hebrew|עברית
tr|Turkish|Türkçe
ps|Pashto|پښتو
ku|Kurdish (Kurmanji)|Kurdî
ckb|Kurdish (Sorani)|کوردی
ug|Uyghur|ئۇيغۇرچە
dv|Dhivehi|ދިވެހި
yi|Yiddish|ייִדיש
ru|Russian|Русский
uk|Ukrainian|Українська
be|Belarusian|Беларуская
pl|Polish|Polski
cs|Czech|Čeština
sk|Slovak|Slovenčina
hu|Hungarian|Magyar
ro|Romanian|Română
bg|Bulgarian|Български
sr|Serbian|Српски
hr|Croatian|Hrvatski
sl|Slovenian|Slovenščina
bs|Bosnian|Bosanski
mk|Macedonian|Македонски
sq|Albanian|Shqip
el|Greek|Ελληνικά
de|German|Deutsch
fr|French|Français
es|Spanish|Español
pt-BR|Portuguese (Brazil)|Português (Brasil)
pt-PT|Portuguese (Portugal)|Português (Portugal)
it|Italian|Italiano
nl|Dutch|Nederlands
sv|Swedish|Svenska
no|Norwegian|Norsk
da|Danish|Dansk
fi|Finnish|Suomi
is|Icelandic|Íslenska
et|Estonian|Eesti
lv|Latvian|Latviešu
lt|Lithuanian|Lietuvių
ga|Irish|Gaeilge
cy|Welsh|Cymraeg
gd|Scottish Gaelic|Gàidhlig
mt|Maltese|Malti
eu|Basque|Euskara
ca|Catalan|Català
gl|Galician|Galego
lb|Luxembourgish|Lëtzebuergesch
fy|Frisian|Frysk
br|Breton|Brezhoneg
oc|Occitan|Occitan
co|Corsican|Corsu
sc|Sardinian|Sardu
fo|Faroese|Føroyskt
se|Northern Sami|Davvisámegiella
kl|Greenlandic|Kalaallisut
eo|Esperanto|Esperanto
la|Latin|Latina
af|Afrikaans|Afrikaans
sw|Swahili|Kiswahili
zu|Zulu|isiZulu
xh|Xhosa|isiXhosa
st|Sesotho|Sesotho
tn|Setswana|Setswana
ts|Tsonga|Xitsonga
ve|Venda|Tshivenda
ss|Swati|SiSwati
sn|Shona|chiShona
ny|Chichewa|Chichewa
rw|Kinyarwanda|Kinyarwanda
rn|Kirundi|Kirundi
lg|Luganda|Luganda
ln|Lingala|Lingála
wo|Wolof|Wolof
ff|Fulah|Fulfulde
bm|Bambara|Bamanankan
ee|Ewe|Eʋegbe
tw|Twi|Twi
yo|Yoruba|Yorùbá
ig|Igbo|Igbo
ha|Hausa|Hausa
am|Amharic|አማርኛ
ti|Tigrinya|ትግርኛ
om|Oromo|Afaan Oromoo
so|Somali|Soomaali
mg|Malagasy|Malagasy
ka|Georgian|ქართული
hy|Armenian|Հայերեն
az|Azerbaijani|Azərbaycan
kk|Kazakh|Қазақша
uz|Uzbek|Oʻzbekcha
ky|Kyrgyz|Кыргызча
tg|Tajik|Тоҷикӣ
tk|Turkmen|Türkmençe
mn|Mongolian|Монгол
tt|Tatar|Татарча
ba|Bashkir|Башҡортса
cv|Chuvash|Чӑвашла
sah|Yakut|Саха
ce|Chechen|Нохчийн
os|Ossetian|Ирон
ab|Abkhaz|Аҧсуа
bo|Tibetan|བོད་སྐད
dz|Dzongkha|རྫོང་ཁ
jv|Javanese|Basa Jawa
su|Sundanese|Basa Sunda
ceb|Cebuano|Cebuano
ilo|Ilocano|Ilokano
hmn|Hmong|Hmoob
shn|Shan|ၽႃႇသႃႇတႆး
haw|Hawaiian|ʻŌlelo Hawaiʻi
mi|Maori|Te Reo Māori
sm|Samoan|Gagana Samoa
to|Tongan|Lea faka-Tonga
fj|Fijian|Vosa Vakaviti
ht|Haitian Creole|Kreyòl Ayisyen
qu|Quechua|Runasimi
gn|Guarani|Avañeʼẽ
ay|Aymara|Aymar aru`;
const LANGS = LANG_RAW.split("\n").map(r=>{ const [code,en,native]=r.split("|"); return {code,en,native}; });
const TH_ALT = {th:"ไทย",en:"อังกฤษ","zh-CN":"จีนตัวย่อ","zh-TW":"จีนตัวเต็ม",ja:"ญี่ปุ่น",ko:"เกาหลี",vi:"เวียดนาม",id:"อินโดนีเซีย",ms:"มาเลย์",tl:"ฟิลิปปินส์ ตากาล็อก",my:"พม่า เมียนมา",km:"เขมร กัมพูชา",lo:"ลาว",hi:"ฮินดี อินเดีย",ar:"อาหรับ",fr:"ฝรั่งเศส",de:"เยอรมัน",es:"สเปน","pt-BR":"โปรตุเกส บราซิล",it:"อิตาลี",ru:"รัสเซีย",tr:"ตุรกี",fa:"เปอร์เซีย อิหร่าน",he:"ฮีบรู",el:"กรีก",nl:"ดัตช์ เนเธอร์แลนด์",sv:"สวีเดน",pl:"โปแลนด์",uk:"ยูเครน",ne:"เนปาล",si:"สิงหล ศรีลังกา",mn:"มองโกเลีย",ka:"จอร์เจีย"};
function langName(c){ const l = LANGS.find(x=>x.code===c); return l ? l.en+" ("+l.native+")" : c; }
function langOpts(sel,q,allowNone){
  q = (q||"").trim().toLowerCase();
  const hit = l => !q || (l.code+" "+l.en+" "+l.native+" "+(TH_ALT[l.code]||"")).toLowerCase().includes(q);
  const list = LANGS.filter(l=>hit(l)||l.code===sel);
  return (allowNone?`<option value="" ${sel===""?"selected":""}>ไม่มี</option>`:"") +
    list.map(l=>`<option value="${l.code}" ${l.code===sel?"selected":""}>${esc(l.native+" · "+l.en+(TH_ALT[l.code]?" · "+TH_ALT[l.code]:""))}</option>`).join("") +
    (list.length===0?`<option disabled>ไม่พบภาษาที่ค้นหา</option>`:"");
}
/* ===== GENRE CATALOG (100+): each sub-genre inherits a core preset (base) ===== */
const GENRE_CATS = {dr:"ดราม่า / ชีวิต",ro:"โรแมนซ์",co:"คอมเมดี้",ho:"สยอง / ระทึก",ac:"แอ็คชั่น / ผจญภัย",sf:"ไซไฟ / แฟนตาซี",an:"อนิเมะ / การ์ตูน",bz:"UGC / ธุรกิจ / โฆษณา",pe:"ย้อนยุค / วรรณกรรม",ot:"สารคดี / อื่นๆ"};
Object.entries({drama:["Drama","dr"],ugc:["UGC product review","bz"],comedy:["Comedy","co"],horror:["Horror","ho"],boss:["Corporate boss drama","bz"],action:["Action","ac"],anime_jp:["Japanese anime","an"],donghua_cn:["Chinese donghua","an"],period:["Period and literary","pe"],romance:["Romance","ro"],adventure:["Adventure","ac"]}).forEach(([k,[en,cat]])=>{ GENRES[k].en=en; GENRES[k].cat=cat; });
const GENRE_RAW = `family_drama|ดราม่าครอบครัว|Family drama|พ่อแม่ ลูก บ้านเก่า|drama|dr
social_real|สังคมสะท้อนชีวิต|Social realism|คนตัวเล็กในระบบใหญ่|drama|dr
coming_age|โตเป็นผู้ใหญ่|Coming of age|ก้าวผ่านวัย|drama|dr
school_life|ชีวิตวัยเรียน|School life drama|ห้องเรียน เพื่อน ความฝัน|drama|dr
medical|หมอ / พยาบาล|Medical drama|โรงพยาบาล ชีวิตและความตาย|drama|dr
legal|ทนายความ / ศาล|Legal courtroom drama|ความจริงในห้องพิจารณา|drama|dr
tragedy|โศกนาฏกรรม|Tragedy|สูญเสีย ไม่มีทางกลับ|drama|dr
lakorn|ละครน้ำเน่าไทย|Thai lakorn melodrama|ตบตี แย่งชิง น้ำตา|drama|dr
revenge|ละครแก้แค้น|Revenge drama|แค้นฝังลึก วางแผนเงียบ|drama|dr
sports_drama|กีฬา / พลังใจ|Sports drama|แพ้ ชนะ ลุกขึ้นใหม่|drama|dr
music_drama|ดนตรี / วงดนตรี|Music drama|เสียงเพลงกับความฝัน|drama|dr
war_drama|สงคราม|War drama|ผู้คนในสนามรบ|drama|dr
survival|เอาชีวิตรอด|Survival drama|ทรัพยากรน้อย ความกดดันสูง|drama|dr
healing|เยียวยาใจ|Healing slice of life|ช้า อบอุ่น ปลอบประโลม|drama|dr
friendship|มิตรภาพ|Friendship drama|เพื่อนที่ไม่ทิ้งกัน|drama|dr
immigrant|คนต่างถิ่น / ย้ายถิ่น|Immigrant story|บ้านใหม่ ความคิดถึง|drama|dr
rural_life|ชีวิตชนบท|Rural life drama|ทุ่งนา สายหมอก|drama|dr
rom_com|โรแมนติกคอมเมดี้|Romantic comedy|ฟินและฮา|romance|ro
enemy_lover|ศัตรูกลายเป็นรัก|Enemies to lovers|เกลียดแต่หัวใจไม่ยอม|romance|ro
first_love|รักแรก|First love|ใสๆ เขินๆ|romance|ro
forbidden|รักต้องห้าม|Forbidden love|ใจรักแต่โลกไม่ยอม|romance|ro
office_rom|รักในออฟฟิศ|Office romance|ลิฟต์ ห้องประชุม สายตา|romance|ro
fake_date|แกล้งเป็นแฟน|Fake dating|เล่นละครจนกลายเรื่องจริง|romance|ro
second_chance|รักครั้งที่สอง|Second chance romance|คนเก่ากลับมา|romance|ro
long_dist|รักระยะไกล|Long distance romance|หน้าจอ สนามบิน|romance|ro
bl|BL / วาย|Boys love|หวานละมุน|romance|ro
gl|GL / ยูริ|Girls love|นุ่มนวล ลึกซึ้ง|romance|ro
wedding|งานแต่งงาน|Wedding story|วันสำคัญ ความลับ|romance|ro
campus_rom|รักในรั้วมหาลัย|Campus romance|ชมรม ห้องสมุด|romance|ro
reunion|พบกันอีกครั้ง|Reunion romance|เวลาผ่านไป ใจยังอยู่|romance|ro
slapstick|ตลกโปกฮา|Slapstick comedy|ล้ม ชน วุ่นวาย|comedy|co
satire|เสียดสีสังคม|Satire|หัวเราะแล้วเจ็บ|comedy|co
dark_com|ตลกร้าย|Dark comedy|ขำปนขม|comedy|co
mockumentary|ม็อกคิวเมนทารี|Mockumentary|สัมภาษณ์หน้ากล้อง|comedy|co
sitcom|ซิตคอม|Sitcom|ฉากเดียว มุกเยอะ|comedy|co
parody|ล้อเลียน|Parody|เลียนแบบอย่างมีลูกเล่น|comedy|co
sketch|สเก็ตช์ตลกสั้น|Comedy sketch|มุกจบในคลิปเดียว|comedy|co
absurd|ตลกเหนือจริง|Absurdist comedy|เหตุผลหาย ความฮาอยู่|comedy|co
work_com|ตลกออฟฟิศ|Workplace comedy|ประชุม ปั่นงาน เจ้านาย|comedy|co
prank|แกล้ง / เซอร์ไพรส์|Prank|ปล่อยของแล้วจับอาการ|comedy|co
family_com|ตลกครอบครัว|Family comedy|บ้านวุ่นๆ ที่รัก|comedy|co
thai_ghost|ผีไทย|Thai ghost horror|ผีบ้าน ผีป่า ความเชื่อ|horror|ho
haunted|บ้านผีสิง|Haunted house|เสียงในที่ที่ไม่มีใคร|horror|ho
psych_horror|สยองจิตวิทยา|Psychological horror|ความกลัวในหัว|horror|ho
slasher|สเลชเชอร์|Slasher|ไล่ล่าในที่แคบ|horror|ho
found_foot|ฟาวด์ฟุตเทจ|Found footage horror|กล้องมือถือ ภาพสั่น|horror|ho
folk_horror|ตำนานผีบ้านนอก|Folk horror|พิธีกรรม หมู่บ้านปิด|horror|ho
zombie|ซอมบี้|Zombie|เมืองร้าง เสียงคำราม|horror|ho
creature|สัตว์ประหลาด|Creature feature|เงาใหญ่ในความมืด|horror|ho
thriller|ระทึกขวัญ|Thriller|นาฬิกานับถอยหลัง|horror|ho
mystery|สืบสวนลึกลับ|Mystery|เบาะแสทีละชิ้น|horror|ho
crime_noir|อาชญากรรมนัวร์|Crime noir|เงา ฝน คนมีความลับ|horror|ho
detective|นักสืบ|Detective story|ไขคดีในคืนเดียว|horror|ho
cursed|คำสาป|Curse story|ของต้องห้าม ราคาที่ต้องจ่าย|horror|ho
gothic|โกธิค|Gothic|คฤหาสน์เก่า ความงามมืด|horror|ho
muay_thai|มวยไทย / ศิลปะป้องกันตัว|Muay Thai martial arts|ศอก เข่า จังหวะเป๊ะ|action|ac
spy|สายลับ|Spy thriller|ปลอมตัว ข้อมูลลับ|action|ac
heist|ปล้นสุดแนบเนียน|Heist|แผนที่ต้องเป๊ะ|action|ac
car_chase|ไล่ล่ารถ|Car chase|ความเร็ว ถนนแคบ|action|ac
superhero|ซูเปอร์ฮีโร่|Superhero|พลังกับความรับผิดชอบ|action|ac
post_apoc|หลังหายนะ|Post-apocalyptic|ซากเมือง ทรัพยากรหมด|action|ac
western|เวสเทิร์น|Western|ทะเลทราย ดวลปืน|action|ac
samurai|ซามูไร / ดาบ|Samurai swordplay|นิ่งก่อนฟัน|action|ac
gangster|แก๊งสเตอร์|Gangster|ศักดิ์ศรีและความภักดี|action|ac
disaster|ภัยพิบัติ|Disaster|นาทีชี้เป็นชี้ตาย|action|ac
treasure|ล่าสมบัติ|Treasure hunt|แผนที่ กับดัก|adventure|ac
road_trip|โร้ดทริป|Road trip|ถนนยาว เพื่อนร่วมทาง|adventure|ac
pirate|โจรสลัด|Pirate adventure|ทะเลกว้าง ธงดำ|adventure|ac
jungle|สำรวจป่า|Jungle expedition|ป่าดิบ เสียงสัตว์|adventure|ac
cyberpunk|ไซเบอร์พังก์|Cyberpunk|นีออน ฝน เทคโนโลยีกดทับ|action|sf
space_opera|อวกาศ|Space opera|ยานและดวงดาว|adventure|sf
time_travel|ย้อนเวลา|Time travel|เปลี่ยนอดีตแล้วเกิดอะไร|drama|sf
ai_robot|AI / หุ่นยนต์|AI and robots|ความรู้สึกของเครื่องจักร|drama|sf
dystopia|โลกดิสโทเปีย|Dystopia|ระบบควบคุมทุกอย่าง|drama|sf
alien|เอเลี่ยนมาเยือน|Alien contact|สัญญาณจากฟ้า|adventure|sf
fantasy_epic|แฟนตาซีมหากาพย์|Epic fantasy|อาณาจักรและคำทำนาย|adventure|sf
sword_sorcery|ดาบและเวทมนตร์|Sword and sorcery|นักรบกับพ่อมด|adventure|sf
urban_fan|แฟนตาซีเมือง|Urban fantasy|เวทมนตร์ซ่อนในเมือง|romance|sf
fairy_tale|เทพนิยาย|Fairy tale|ปราสาท ป่าลึก คำสาป|adventure|sf
magic_school|โรงเรียนเวทมนตร์|Magic school|ไม้กายสิทธิ์ ห้องเรียนลับ|adventure|sf
steampunk|สตีมพังก์|Steampunk|เกียร์ ไอน้ำ ทองเหลือง|period|sf
isekai|ต่างโลก|Isekai|ตื่นมาในโลกใหม่|anime_jp|an
mecha|หุ่นยักษ์ / เมก้า|Mecha|นักบินกับเครื่อง|anime_jp|an
shonen|โชเน็น|Shonen|ฝึก สู้ มิตรภาพ|anime_jp|an
shojo|โชโจ|Shojo|หัวใจสั่น ประกายระยิบ|anime_jp|an
sol_anime|ไลฟ์สไตล์อนิเมะ|Slice of life anime|วันธรรมดาที่สวย|anime_jp|an
magical_girl|สาวน้อยเวทมนตร์|Magical girl|แปลงร่าง ปกป้องโลก|anime_jp|an
sports_anime|กีฬาอนิเมะ|Sports anime|เหงื่อ เสียงเชียร์|anime_jp|an
idol|ไอดอล|Idol anime|เวที แสงสปอตไลต์|anime_jp|an
xianxia|เซียนเหรินบำเพ็ญ|Xianxia cultivation|บำเพ็ญเพียรสู่ความเป็นอมตะ|donghua_cn|an
wuxia|กำลังภายใน|Wuxia|ยุทธภพ ผู้กล้า|donghua_cn|an
chibi|ชิบิ / การ์ตูนน่ารัก|Chibi comedy|ตัวเล็กหัวโต ฮา|comedy|an
kids_cartoon|การ์ตูนเด็ก|Kids cartoon|สีสด เรียบง่าย สอนใจ|comedy|an
ugc_skin|รีวิวสกินแคร์ / ความงาม|UGC skincare review|หน้าสด แสงหน้าต่าง|ugc|bz
ugc_food|รีวิวอาหาร / เครื่องดื่ม|UGC food review|ซูมอาหาร เสียงกรุบกริบ|ugc|bz
ugc_unbox|แกะกล่อง Unboxing|UGC unboxing|เปิดกล่อง ปฏิกิริยาจริง|ugc|bz
ugc_fashion|แฟชั่น / OOTD|UGC fashion OOTD|ลองชุดหน้ากระจก|ugc|bz
ugc_gadget|แกดเจ็ต / ไอที|UGC gadget review|ทดสอบใช้จริง|ugc|bz
ugc_before|ก่อน-หลัง|UGC before and after|เห็นผลชัด|ugc|bz
ugc_tutorial|สอนใช้ / How-to|UGC tutorial|ทีละสเต็ป|ugc|bz
ugc_vlog|Vlog ไลฟ์สไตล์|UGC vlog|เล่าชีวิตหน้ากล้อง|ugc|bz
ugc_testimonial|คำบอกเล่าลูกค้า|UGC testimonial|เสียงจากคนใช้จริง|ugc|bz
ugc_live|ไลฟ์ขายของ|UGC live selling|ปิดการขายเร็ว|ugc|bz
brand_film|หนังแบรนด์|Brand film|เล่าที่มาของแบรนด์|boss|bz
explainer|อธิบายแบบกระชับ|Corporate explainer|เข้าใจใน 30 วินาที|boss|bz
startup|เรื่องราวสตาร์ทอัพ|Startup story|ล้มแล้วลุก|boss|bz
recruit|สมัครงาน / วัฒนธรรมองค์กร|Recruitment video|คนทำงานจริง|boss|bz
launch|เปิดตัวสินค้า|Product launch teaser|ความลับก่อนเปิดตัว|boss|bz
realestate|รีวิวบ้าน / คอนโด|Real estate tour|เดินดูห้อง แสงธรรมชาติ|ugc|bz
travel_ad|โฆษณาท่องเที่ยว|Travel ad|ภาพกว้าง ความรู้สึกอยากไป|adventure|bz
restaurant|โปรโมตร้านอาหาร|Restaurant promo|ไอร้อน เสียงเตา|ugc|bz
car_ad|โฆษณารถยนต์|Car commercial|เส้นสาย แสงบนตัวถัง|action|bz
perfume|โฆษณาน้ำหอม|Perfume advertisement|ช้า ลึก เย้ายวน|romance|bz
fitness|ฟิตเนส / สุขภาพ|Fitness promo|เหงื่อ พลัง วินัย|action|bz
edu_explain|สอนความรู้|Educational explainer|ภาพช่วยเล่า|boss|bz
trailer|ตัวอย่างหนัง (Trailer)|Movie trailer|ตัดเร็ว ปมชัด|action|bz
siam_period|ย้อนยุคไทย|Thai period drama|เรือนไทย ผ้าซิ่น|period|pe
ayutthaya|อยุธยา / ประวัติศาสตร์|Ayutthaya historical|วัง วัด สายน้ำ|period|pe
bkk_60s|กรุงเทพยุค 60s|1960s Bangkok|รถราง ตึกแถว|period|pe
victorian|วิกตอเรียน|Victorian era|หมอก คฤหาสน์ จดหมาย|period|pe
noir_40s|ฟิล์มนัวร์ 40s|1940s film noir|ขาวดำ เงาแรง|horror|pe
silent|หนังเงียบ|Silent film|ไม่มีเสียงพูด ใช้ท่าทาง|period|pe
literary|ดัดแปลงวรรณกรรม|Literary adaptation|ภาพกวี ความหมายซ่อน|period|pe
poetic|ภาพยนตร์กวี|Poetic cinema|ภาพช้า ความรู้สึกนำ|period|pe
palace|ละครวัง|Palace drama|ลับหลังม่าน|donghua_cn|pe
cold_war|สงครามเย็น|Cold war|สายลับ วิทยุลับ|period|pe
roaring_20s|ยุค 20s แจ๊ซ|Roaring twenties|ปาร์ตี้ แจ๊ซ|period|pe
documentary|สารคดี|Documentary|คนจริง เรื่องจริง|drama|ot
travel_vlog|ท่องเที่ยว Vlog|Travel vlog|เล่าระหว่างเดินทาง|adventure|ot
music_video|มิวสิกวิดีโอ|Music video|ภาพตามจังหวะ|romance|ot
dance|เต้น / โชว์|Dance video|มูฟเมนต์คม|action|ot
cooking|ทำอาหาร|Cooking video|มือ วัตถุดิบ ไอร้อน|ugc|ot
asmr|ASMR|ASMR video|เสียงละเอียด ภาพนิ่ง|romance|ot
meditation|สมาธิ / ผ่อนคลาย|Meditation visuals|ช้า เงียบ นุ่ม|drama|ot
sports_hl|ไฮไลต์กีฬา|Sports highlight|ช้าสลับเร็ว|action|ot
bts|เบื้องหลังการถ่ายทำ|Behind the scenes|ภาพจริง ไม่เกลา|ugc|ot
interview|สัมภาษณ์|Interview|พูดกับกล้อง จริงใจ|drama|ot
kids_story|นิทานเด็ก|Children's story|เรื่องง่าย ภาพอบอุ่น|adventure|ot
fable|นิทานสอนใจ|Moral fable|ตัวละครสัตว์ ข้อคิด|adventure|ot
parable|อุปมาทางธรรม|Spiritual parable|เรียบ สงบ ลึก|drama|ot
biography|ชีวประวัติ|Biography|ช่วงชีวิตสำคัญ|drama|ot`;
GENRE_RAW.split("\n").forEach(r=>{
  const [id,th,en,sub,base,cat] = r.split("|"), b = GENRES[base];
  GENRES[id] = Object.assign({}, b, {th, en, sub, base, cat, mood: b.mood+"; "+en+" tone and conventions",
    tags:["#"+th.replace(/[\s\/\-–]/g,"")].concat(b.tags)});
});
const GENRE_IDS = Object.keys(GENRES);
const gBase = () => (GENRES[S.genre]||GENRES.drama).base || S.genre;
/* ===== STYLE CATALOG (120+) : id|th|prompt|cat|stylized(1/0) ===== */
const STYLE_CATS = {pr:"Photoreal / Cinematic",fl:"ฟิล์ม / ยุคสมัย",an:"อนิเมะ / มังงะ",ca:"3D / การ์ตูน",il:"ภาพวาด / อิลลัสเตรชัน",cr:"งานคราฟต์ / สต็อปโมชัน",rt:"เรโทร / พิกเซล / กลิตช์",mo:"โทนสี / ลุคหนัง",co:"โฆษณา / UGC"};
Object.entries({photoreal:"pr",ugc_phone:"co",film35:"fl",doc:"pr",anime:"an",donghua:"an"}).forEach(([k,c])=>{ STYLES[k].cat=c; });
const STYLE_RAW = `cine_hdr|Cinematic high-end|photorealistic high-end cinematic video, anamorphic lens look, natural skin, controlled highlights|pr|0
cine_soft|Cinematic soft glow|photorealistic cinematic video with soft diffusion glow, gentle contrast, natural skin|pr|0
cine_gritty|Cinematic gritty|photorealistic gritty cinematic video, desaturated palette, strong texture, handheld energy|pr|0
cine_clean|Clean commercial|photorealistic clean commercial look, bright even lighting, crisp detail, natural skin|pr|0
cine_moody|Moody low-key|photorealistic low-key moody cinematography, deep shadows, single motivated light|pr|0
cine_golden|Golden hour|photorealistic golden hour cinematography, warm backlight, lens flare kept subtle|pr|0
cine_blue|Blue hour|photorealistic blue hour cinematography, cool ambient light, warm practical accents|pr|0
cine_night|Night city neon|photorealistic night cinematography, neon reflections on wet streets, shallow depth of field|pr|0
cine_overcast|Overcast natural|photorealistic overcast daylight, soft shadowless light, muted colors|pr|0
cine_sun|Hard sunlight|photorealistic hard midday sunlight, crisp shadows, high contrast|pr|0
cine_candle|Candlelit|photorealistic candlelit interior, warm flickering light, deep amber shadows|pr|0
cine_window|Window light portrait|photorealistic window-lit portrait look, soft directional light, gentle falloff|pr|0
cine_studio|Studio beauty|photorealistic studio beauty lighting, soft key, clean background, fine skin detail|pr|0
cine_drone|Aerial cinematic|photorealistic aerial cinematic look, sweeping drone framing, natural color|pr|0
cine_macro|Macro detail|photorealistic macro cinematography, extreme close detail, shallow focus|pr|0
cine_long|Telephoto compression|photorealistic telephoto look, compressed perspective, creamy background blur|pr|0
cine_wide|Wide-angle immersive|photorealistic wide-angle immersive look, strong depth, natural distortion kept minimal|pr|0
cine_steady|Steadicam smooth|photorealistic steadicam look, smooth gliding movement, cinematic framing|pr|0
cine_hand|Handheld realism|photorealistic handheld documentary realism, subtle camera shake, available light|pr|0
cine_imax|IMAX epic scale|photorealistic large-format epic look, vast scale, crisp detail|pr|0
cine_tv|Prestige TV drama|photorealistic prestige TV drama look, restrained palette, shallow depth|pr|0
cine_indie|Indie drama|photorealistic indie drama look, natural light, slightly muted, intimate framing|pr|0
cine_thai|Thai cinema|photorealistic modern Thai cinema look, warm humid atmosphere, rich greens and golds|pr|0
cine_korean|Korean drama gloss|photorealistic Korean drama look, soft pastel grade, glossy skin, gentle backlight|pr|0
cine_japan|Japanese live-action|photorealistic Japanese live-action look, muted greens, quiet composition|pr|0
cine_hk|Hong Kong 90s|photorealistic 1990s Hong Kong cinema look, saturated neon, step-printed motion feel|pr|0
cine_bolly|Bollywood vibrant|photorealistic Bollywood look, vibrant saturated colors, glamorous lighting|pr|0
cine_euro|European art film|photorealistic European art film look, restrained palette, long takes, natural light|pr|0
cine_hollywood|Hollywood blockbuster|photorealistic Hollywood blockbuster look, teal and orange grade, polished|pr|0
cine_a24|A24-style arthouse|photorealistic arthouse look, unusual framing, muted palette, tactile realism|pr|0
film16|16mm film|photorealistic 16mm film look, visible grain, soft edges, warm tones|fl|0
film8|8mm home movie|photorealistic 8mm home movie look, heavy grain, light leaks, faded color|fl|0
film_kodak|Kodak warm stock|photorealistic Kodak-style film stock, warm skin tones, gentle grain|fl|0
film_fuji|Fuji cool stock|photorealistic Fuji-style film stock, cool greens, soft contrast|fl|0
film_cine800|Tungsten night stock|photorealistic tungsten night film stock look, halation around lights, rich grain|fl|0
film_bw|Black and white|photorealistic black and white film look, deep blacks, fine grain|fl|0
film_bw_hi|High-contrast B&W|photorealistic high-contrast black and white look, hard light, dramatic shadows|fl|0
film_sepia|Sepia vintage|photorealistic sepia-toned vintage look, soft vignette, aged paper warmth|fl|0
film_70s|1970s film|photorealistic 1970s film look, warm orange grade, soft focus, zoom lens feel|fl|0
film_80s|1980s film|photorealistic 1980s film look, saturated colors, hazy light, practical neon|fl|0
film_90s|1990s home video|photorealistic 1990s camcorder look, soft detail, timestamp-free, slightly washed color|fl|0
film_y2k|Y2K digital|photorealistic early-2000s digital video look, flash photography feel, glossy highlights|fl|0
film_vhs|VHS tape|photorealistic VHS tape look, scanlines, tracking noise, soft chroma|fl|0
film_polaroid|Polaroid instant|photorealistic instant-photo look, faded color, soft vignette|fl|0
film_cctv|CCTV surveillance|photorealistic CCTV footage look, high angle, low frame detail, cold tint|fl|0
film_bodycam|Bodycam / found footage|photorealistic body-camera found footage look, wide lens, shaky, harsh exposure|fl|0
film_news|News broadcast|photorealistic broadcast news look, flat even lighting, clean framing|fl|0
film_silent|Silent film era|photorealistic early silent film look, flicker, high contrast, vignette|fl|0
film_technicolor|Technicolor classic|photorealistic classic Technicolor look, vivid saturated colors, theatrical lighting|fl|0
film_noir|Film noir|photorealistic film noir look, black and white, venetian blind shadows, hard contrast|fl|0
film_giallo|Giallo thriller|photorealistic giallo look, saturated red and blue gels, stylized shadows|fl|0
film_grindhouse|Grindhouse|photorealistic grindhouse look, scratches, dirt, burnt colors|fl|0
film_nouvelle|French new wave|photorealistic French new wave look, natural light, handheld, casual framing|fl|0
film_wes|Symmetrical pastel|photorealistic symmetrical composition, pastel palette, flat staging, whimsical order|fl|0
anime_modern|Modern anime|modern Japanese anime style, clean linework, soft gradient shading, expressive eyes, consistent character design|an|1
anime_90s|90s anime|1990s Japanese anime style, cel animation look, grainy texture, muted palette, consistent character design|an|1
anime_80s|80s anime|1980s retro Japanese anime style, hand-painted backgrounds, soft color, consistent character design|an|1
anime_shonen|Shonen action anime|shonen action anime style, bold outlines, speed lines, dynamic poses, consistent character design|an|1
anime_shojo|Shojo anime|shojo anime style, sparkles, delicate linework, pastel colors, consistent character design|an|1
anime_ghibli|Ghibli-inspired watercolor|hand-painted watercolor anime feel, lush natural backgrounds, gentle movement, original character design|an|1
anime_shinkai|Cinematic anime sky|cinematic anime style with luminous skies, detailed backgrounds, lens flare, consistent character design|an|1
anime_chibi|Chibi|chibi anime style, tiny proportions, big heads, simple shading, consistent character design|an|1
anime_mecha|Mecha anime|mecha anime style, hard-surface machines, dramatic lighting, consistent character design|an|1
anime_seinen|Seinen gritty anime|gritty seinen anime style, heavy shadows, realistic proportions, consistent character design|an|1
anime_cyber|Cyberpunk anime|cyberpunk anime style, neon palette, rain, detailed city, consistent character design|an|1
anime_horror|Horror anime|horror anime style, desaturated palette, uneasy compositions, consistent character design|an|1
anime_sports|Sports anime|sports anime style, motion blur, sweat and light, expressive faces, consistent character design|an|1
anime_idol|Idol anime|idol anime style, stage lighting, glossy highlights, consistent character design|an|1
anime_lofi|Lo-fi anime|lo-fi anime style, cozy night room, soft grain, limited palette, consistent character design|an|1
manga_bw|Manga black and white|black and white manga style, screentone shading, ink linework, consistent character design|an|1
manga_color|Colored manga|colored manga page style, flat colors with ink linework, consistent character design|an|1
webtoon|Webtoon / manhwa|Korean webtoon style, soft digital painting, clean lines, glossy highlights, consistent character design|an|1
donghua_xian|Xianxia donghua|Chinese xianxia donghua style, flowing robes, glowing qi, misty mountains, consistent character design|an|1
donghua_ink|Ink-wash donghua|Chinese ink-wash painting animation style, brush strokes, fluid watercolor, original character design|an|1
donghua_3d|3D donghua|Chinese 3D donghua style, semi-realistic rendering, detailed costumes, consistent character design|an|1
pixar3d|3D family animation|polished 3D family animation style, expressive stylized faces, warm lighting, original character design|ca|1
claymation|Claymation|claymation style, visible thumbprints, handmade clay textures, stop-motion movement, original character design|ca|1
cgi_realistic|Realistic CGI|high-end realistic CGI character style, detailed skin and fabric, consistent character design|ca|1
lowpoly|Low-poly 3D|low-poly 3D style, flat shaded facets, simple geometry, original character design|ca|1
voxel|Voxel art|voxel block art style, cube-built world, soft lighting, original character design|ca|1
toon_shade|Toon-shaded 3D|toon-shaded 3D style, bold outlines, flat color ramps, original character design|ca|1
cartoon_west|Western cartoon|Western TV cartoon style, bold shapes, exaggerated expressions, original character design|ca|1
cartoon_retro|Retro cartoon|1930s rubber-hose cartoon style, black and white or limited color, bouncy motion, original character design|ca|1
cartoon_adult|Adult animation|modern adult animation style, flat vector shapes, deadpan expressions, original character design|ca|1
spiderverse|Comic-book 3D|comic-book 3D style, halftone dots, offset color, bold lines, original character design|ca|1
cel_shade|Cel-shaded game|cel-shaded game style, thick outlines, saturated colors, original character design|ca|1
flat_vector|Flat vector motion|flat vector motion graphics style, simple shapes, bold colors, original character design|ca|1
paper_cut|Paper cut-out|paper cut-out animation style, layered paper textures, soft shadows, original character design|cr|1
stop_motion|Stop-motion puppets|stop-motion puppet style, handmade sets, tactile materials, slightly jittery motion, original character design|cr|1
felt_craft|Felt and yarn|felt and yarn craft style, soft fibers, handmade charm, original character design|cr|1
miniature|Miniature tilt-shift|tilt-shift miniature world look, small-scale diorama feel, vivid colors|cr|0
diorama|Diorama set|handmade diorama set look, tabletop scale, warm practical lights|cr|0
origami|Origami|origami folded paper style, crisp folds, soft studio light, original character design|cr|1
lego_like|Toy brick|toy brick world style, plastic sheen, blocky figures, original character design|cr|1
puppet_shadow|Shadow puppet|shadow puppet theatre style, backlit cutouts, warm screen glow, original character design|cr|1
wayang|Thai shadow theatre|Thai nang talung shadow theatre style, intricate cutout figures, warm lamp light, original character design|cr|1
embroidery|Embroidery textile|embroidered textile animation style, stitched textures, handmade imperfection, original character design|cr|1
watercolor|Watercolor painting|watercolor painted animation style, soft bleeding edges, paper texture, original character design|il|1
oil_paint|Oil painting|oil painting animation style, visible brush strokes, rich pigment, original character design|il|1
ink_sketch|Ink sketch|ink and pen sketch animation style, crosshatching, white paper, original character design|il|1
pencil|Pencil drawing|graphite pencil drawing animation style, soft shading, paper grain, original character design|il|1
charcoal|Charcoal drawing|charcoal drawing animation style, smudged shadows, rough texture, original character design|il|1
gouache|Gouache picture book|gouache picture book style, matte flat colors, gentle shapes, original character design|il|1
storybook|Storybook illustration|storybook illustration style, warm hand-drawn textures, soft lighting, original character design|il|1
ukiyoe|Ukiyo-e woodblock|ukiyo-e woodblock print style, flat color areas, bold contour lines, original character design|il|1
thai_mural|Thai mural painting|traditional Thai mural painting style, gold leaf accents, flat perspective, original character design|il|1
batik|Batik pattern|batik pattern art style, wax-resist lines, rich dyes, original character design|il|1
pop_art|Pop art|pop art style, halftone dots, bold primary colors, thick outlines, original character design|il|1
art_deco|Art deco|art deco illustration style, geometric symmetry, gold and black, original character design|il|1
art_nouveau|Art nouveau|art nouveau illustration style, flowing organic lines, ornamental borders, original character design|il|1
impression|Impressionist|impressionist painting style, broken brush strokes, shimmering light, original character design|il|1
surreal|Surreal painting|surrealist painting style, dreamlike scale shifts, soft realism, original character design|il|1
comic_ink|Comic book inks|comic book ink style, heavy blacks, halftone shading, original character design|il|1
graphic_novel|Graphic novel|graphic novel style, flat colors, strong shadows, moody panels, original character design|il|1
isometric|Isometric illustration|isometric illustration style, clean geometry, soft shadows, original character design|il|1
stained_glass|Stained glass|stained glass style, leaded outlines, jewel colors, glowing light, original character design|il|1
gothic_ill|Gothic illustration|gothic illustration style, delicate ink lines, dark romantic mood, original character design|il|1
dreamy_pastel|Dreamy pastel|dreamy pastel illustration style, soft haze, rounded shapes, original character design|il|1
neon_line|Neon line art|neon line art style, glowing outlines on dark background, original character design|il|1
pixel8|8-bit pixel art|8-bit pixel art style, limited palette, blocky sprites, original character design|rt|1
pixel16|16-bit pixel art|16-bit pixel art style, rich palette, dithering, original character design|rt|1
pixel_hd|HD pixel art|HD pixel art style, detailed sprites, dynamic lighting, original character design|rt|1
glitch|Glitch art|glitch art look, RGB split, data moshing, scanline tears|rt|0
synthwave|Synthwave|synthwave look, magenta and cyan neon, grid horizon, chrome gradients|rt|0
vaporwave|Vaporwave|vaporwave look, pastel pink and teal, marble busts, nostalgic gradients|rt|0
y2k_gloss|Y2K glossy|Y2K glossy aesthetic, chrome, bubble shapes, candy colors|rt|0
crt|CRT monitor|CRT monitor look, curved screen, phosphor glow, scanlines|rt|0
arcade|Arcade game|arcade game look, bright sprites, glowing UI, high-energy color|rt|1
ps1|PS1 low-poly|PS1 era 3D look, wobbly low-poly models, affine texture warping, original character design|rt|1
retro_futur|Retro-futurism|retro-futurist look, 1960s space-age design, clean curves, optimistic colors|rt|0
cyber_vhs|Cyber VHS|cyberpunk VHS look, neon grain, chromatic aberration, rainy city|rt|0
teal_orange|Teal and orange|teal and orange color grade, strong complementary contrast, cinematic|mo|0
pastel_grade|Pastel grade|soft pastel color grade, lifted blacks, airy mood|mo|0
mono_blue|Monochrome blue|monochrome blue color grade, cold tones, minimal palette|mo|0
mono_red|Monochrome red|monochrome red color grade, intense mood, minimal palette|mo|0
earth_tone|Earth tones|earth tone color grade, warm browns and olives, natural texture|mo|0
high_key|High-key bright|high-key bright look, minimal shadows, clean and airy|mo|0
low_sat|Desaturated muted|desaturated muted look, restrained color, quiet mood|mo|0
bleach|Bleach bypass|bleach bypass look, high contrast, desaturated, silvery highlights|mo|0
infrared|Infrared dreamscape|infrared dreamscape look, white foliage, pink and teal sky|mo|0
duotone|Duotone|duotone look, two-color grade, strong graphic mood|mo|0
golden_luxury|Luxury gold|luxury gold and black look, rich reflections, glossy surfaces|mo|0
green_matrix|Matrix green|green-tinted digital look, cool shadows, techno atmosphere|mo|0
hazy_dream|Hazy dream|hazy dreamlike look, bloom, soft focus edges, light leaks|mo|0
ugc_selfie|UGC selfie|photorealistic vertical selfie video, front camera look, natural light, authentic skin texture|co|0
ugc_tiktok|TikTok trend|photorealistic TikTok-style vertical video, fast energy, bright natural light, direct-to-camera|co|0
ugc_review|Review desk|photorealistic review video, product on table, soft daylight, close hands-on shots|co|0
ugc_unbox|Unboxing top-down|photorealistic top-down unboxing video, clean surface, natural light, hands only|co|0
ugc_vlog|Vlog daylight|photorealistic casual vlog look, wide front camera, natural light, relaxed framing|co|0
ugc_live|Live stream|photorealistic live-stream look, ring light catchlights, desk setup, direct address|co|0
ugc_asmr|ASMR close|photorealistic ASMR close-up look, soft light, shallow focus, intimate framing|co|0
ugc_beauty|Beauty close-up|photorealistic beauty close-up look, soft ring light, visible skin texture, clean background|co|0
ugc_food|Food close-up|photorealistic food video look, warm side light, steam, macro details|co|0
ad_premium|Premium product ad|photorealistic premium product advertisement look, controlled reflections, dark gradient background|co|0
ad_lifestyle|Lifestyle ad|photorealistic lifestyle advertisement look, bright airy interiors, natural moments|co|0
ad_fashion|Fashion editorial|photorealistic fashion editorial look, bold framing, directional light, confident poses|co|0
ad_tech|Tech product reveal|photorealistic tech product reveal look, dark backdrop, rim light, slow macro moves|co|0
ad_food|Food commercial|photorealistic food commercial look, glossy textures, steam and splashes, warm tones|co|0
ad_auto|Automotive commercial|photorealistic automotive commercial look, low angles, sweeping reflections|co|0
ad_real|Real estate bright|photorealistic real estate video look, wide lens, bright natural light, straight verticals|co|0`;
STYLE_RAW.split("\n").forEach(r=>{ const [id,th,txt,cat,s]=r.split("|"); STYLES[id] = {th,txt,stylized:s==="1",cat}; });
const STYLE_IDS = Object.keys(STYLES);
/* ===== LOCATION CATALOG (120+) : th|prompt text (EN)|cat ===== */
const LOC_CATS = {ur:"เมือง / ถนน",in:"บ้าน / ภายใน",wk:"ที่ทำงาน / ธุรกิจ",na:"ธรรมชาติ",tr:"ไทย / ท่องเที่ยว",sc:"โรงเรียน / สถาบัน",tn:"ยานพาหนะ / ขนส่ง",fa:"แฟนตาซี / ไซไฟ",ho:"ร้าง / สยอง",th:"ย้อนยุค / ประวัติศาสตร์"};
const LOC_RAW = `ซอยหลังบ้านตอนกลางคืน|Bangkok back alley at night, wet pavement and warm shop signs|ur
ถนนเมืองยามฝน|rainy city street at night with neon reflections|ur
สี่แยกไฟแดง|busy intersection at dusk, traffic lights and motorbikes|ur
ใต้สะพานลอย|under a concrete overpass, graffiti and soft street light|ur
ตลาดนัดกลางคืน|busy night market with string lights and street food stalls|ur
ตลาดเช้า|early morning fresh market, steam and baskets of produce|ur
ถนนคนเดิน|lively walking street with vendors and lanterns|ur
ย่านไชน่าทาวน์|crowded Chinatown street with red signs and food carts|ur
ดาดฟ้าตึก|rooftop terrace at sunset with city skyline|ur
ลานจอดรถชั้นบน|rooftop parking deck at dusk, long shadows|ur
ป้ายรถเมล์ตอนฝนตก|rainy bus stop with neon reflections|ur
สถานีรถไฟฟ้า|modern elevated train station platform, evening commuters|ur
ทางเดินลอยฟ้า (สกายวอล์ก)|city skywalk at twilight, glass and steel|ur
ลานน้ำพุกลางเมือง|city plaza fountain at golden hour|ur
สวนสาธารณะยามเช้า|public park at early morning, joggers and mist|ur
ริมแม่น้ำเจ้าพระยา|Chao Phraya riverside at dusk, boats and temple lights|ur
สะพานข้ามแม่น้ำ|long river bridge at blue hour with car lights|ur
ท่าเรือเก่า|old wooden pier at dawn, mist on the water|ur
ซอยแคบในชุมชน|narrow community lane with laundry lines and potted plants|ur
หน้าร้านสะดวกซื้อ 24 ชม.|24-hour convenience store front at night, cold white light|ur
ห้องนอนมินิมอล|minimalist bedroom with soft morning window light|in
ห้องนอนเด็กวัยรุ่น|teenager's cluttered bedroom with posters and fairy lights|in
โต๊ะเครื่องแป้งริมหน้าต่าง|bright bedroom vanity by a window, morning light|in
ห้องครัวบ้านๆ|tidy home kitchen counter, daylight|in
ห้องครัวตอนฝนตก|small apartment kitchen, rainy morning|in
ห้องนั่งเล่นอบอุ่น|cozy living room sofa, soft daylight|in
ห้องน้ำโทนขาว|clean white bathroom with soft diffused light|in
ระเบียงคอนโด|condo balcony at night with city lights|in
คอนโดสตูดิโอ|compact studio condo, warm lamp, city view|in
บ้านไม้ชนบท|old wooden house in a quiet village, late afternoon|in
เรือนไทยริมน้ำ|traditional Thai house on stilts beside a canal|in
ชานบ้านตอนเย็น|house veranda at golden hour with creaking boards|in
ห้องใต้หลังคา|dusty attic with slanted light through a small window|in
ห้องเก็บของ|crowded storage room with boxes and a single bulb|in
บันไดบ้านเก่า|old house stairwell, one bare bulb|in
ห้องโถงหรู|luxury villa hall with marble floor and grand staircase|in
ห้องแต่งตัว|dressing room with mirror lights and clothing racks|in
ห้องทำงานที่บ้าน|home office desk with laptop and warm lamp|in
ห้องเรียนดนตรี|small music room with an upright piano|in
ออฟฟิศกระจกยามเย็น|modern glass office at dusk|wk
ห้องประชุมชั้นบน|top-floor boardroom with city skyline|wk
ออฟฟิศโอเพ่นแปลน|open-plan office with messy desks|wk
ล็อบบี้ลิฟต์ผู้บริหาร|private executive elevator lobby|wk
ห้องทำงานประธาน|chairman's office with wooden desk and skyline window|wk
ห้องเซิร์ฟเวอร์|cold server room with blinking lights|wk
โกดังสินค้า|warehouse with shelves and forklifts, cool light|wk
สตูดิโอถ่ายภาพ|photography studio with softboxes and seamless backdrop|wk
สตูดิโอไลฟ์ขายของ|live-selling studio with ring light and product shelves|wk
ร้านกาแฟริมแม่น้ำ|riverside cafe at golden hour|wk
ร้านกาแฟมินิมอล|minimalist coffee shop with plants and morning light|wk
ร้านหนังสือเก่า|second-hand bookstore aisle with warm lamps|wk
ร้านอาหารริมทาง|street food stall at noon with steam and sizzling woks|wk
ครัวร้านอาหาร|busy restaurant kitchen with flames and steel counters|wk
ร้านเสริมสวย|hair salon with big mirrors and warm lights|wk
คลินิกความงาม|clean aesthetic clinic reception, bright and calm|wk
โรงพยาบาลตอนกลางคืน|hospital corridor at night, fluorescent light|wk
ห้องพักฟื้น|quiet recovery ward with soft window light|wk
ฟิตเนส|modern gym with mirrors and dramatic lighting|wk
สนามมวย|boxing ring under harsh overhead lights|wk
ลิฟต์คอนโด|crowded condo elevator|wk
ห้องเรียนมัธยม|high school classroom with afternoon sun through the windows|sc
ระเบียงโรงเรียน|school corridor with lockers and soft light|sc
สนามกีฬาโรงเรียน|school sports field at golden hour|sc
ห้องสมุดมหาวิทยาลัย|university library with tall shelves and reading lamps|sc
ลานกิจกรรมมหาลัย|university courtyard with students and trees|sc
ห้องแล็บวิทยาศาสตร์|school science lab with glassware|sc
โรงเรียนร้างตอนกลางคืน|abandoned school classroom at night|ho
ป่าไทยยามเช้า|misty Thai forest at dawn with shafts of light|na
ทางเดินสู่น้ำตก|jungle trail leading to a waterfall|na
ริมน้ำตก|waterfall pool with mist and green rocks|na
ภูเขาหมอก|misty mountain ridge at sunrise|na
ทุ่งนาตอนเย็น|rice paddy fields at sunset|na
ทุ่งดอกไม้|wildflower meadow under soft sunlight|na
ชายหาดตอนเช้า|quiet beach at sunrise with soft waves|na
ชายหาดพระอาทิตย์ตก|tropical beach at sunset, silhouettes and warm sky|na
เรือเล็กกลางทะเล|small wooden boat on open sea|na
เกาะส่วนตัว|small tropical island with turquoise water|na
ถ้ำใต้ภูเขา|limestone cave with torch light and dripping water|na
หุบเขาหิน|rocky canyon ridge at sunrise|na
ทะเลทราย|vast desert dunes at golden hour|na
ทุ่งหิมะ|snowy field under pale sky|na
ป่าสนฤดูหนาว|pine forest in winter with soft falling snow|na
ป่าไผ่ยามเช้า|bamboo forest at dawn|na
ทะเลสาบสงบ|calm lake at dawn with mirror reflections|na
สวนญี่ปุ่น|Japanese garden with koi pond and maple trees|na
ไร่ชา|tea plantation on rolling hills in morning mist|na
ป่าชายเลน|mangrove forest with winding wooden walkway|na
วัดไทยยามเช้า|Thai temple courtyard at dawn, monks and golden spires|tr
ลานวัดตอนเย็น|temple grounds at dusk with lanterns|tr
ตลาดน้ำ|floating market with wooden boats and fruit baskets|tr
ตลาดโบราณ|old riverside market with wooden shophouses|tr
งานวัด|Thai temple fair at night with colorful lights|tr
เทศกาลลอยกระทง|Loy Krathong festival on the river with floating lights|tr
เทศกาลสงกรานต์|Songkran street festival with water splashes and smiles|tr
ถนนข้าวสาร|Khao San Road at night, backpackers and neon|tr
ตลาดจตุจักร|Chatuchak weekend market, crowded stalls|tr
ภูเก็ตโอลด์ทาวน์|Phuket old town street with Sino-Portuguese shophouses|tr
เชียงใหม่ย่านเมืองเก่า|Chiang Mai old city lane with temples and cafes|tr
ไร่องุ่น|vineyard terraces at golden hour|tr
รีสอร์ตริมทะเล|beachfront resort with infinity pool at sunset|tr
โรงแรมบูติก|boutique hotel lobby with warm lighting and plants|tr
สระว่ายน้ำบนดาดฟ้า|rooftop infinity pool at dusk with city view|tr
ในรถเก๋ง|inside a parked car at night, dashboard glow|tn
บนรถไฟ|train carriage window seat, passing countryside|tn
สถานีรถไฟเก่า|old railway station with steam, sepia light|th
สนามบิน|airport terminal at night, long windows and runway lights|tn
บนเครื่องบิน|airplane cabin, soft overhead light|tn
เรือข้ามฟาก|cross-river ferry at dusk|tn
รถตู้ / รถทัวร์|long-distance bus interior at night|tn
มอเตอร์ไซค์ริมถนน|motorbike on a rain-slick street at night|tn
รถไฟฟ้าชั้นใน|metro train interior with commuters|tn
ลานจอดเรือ|marina with sailboats and golden light|tn
เมืองไซเบอร์พังก์|cyberpunk megacity street with holograms and rain|fa
ยานอวกาศภายใน|spaceship cockpit with glowing panels|fa
สถานีอวกาศ|space station corridor with soft white light|fa
ห้องแล็บล้ำยุค|futuristic laboratory with holographic displays|fa
ดาวเคราะห์ต่างดาว|alien planet landscape with two moons|fa
ปราสาทบนเขา|medieval castle on a cliff at dusk|fa
ป่าเวทมนตร์|enchanted forest with glowing spores|fa
วิหารลอยฟ้า|floating stone temple above clouds|fa
สะพานหินในหมอก|floating stone bridge above clouds|fa
ลานสำนักบนเขา|misty mountain temple courtyard|fa
ตึกร้างยามค่ำ|abandoned building at night with flickering light|ho
โรงพยาบาลร้าง|abandoned hospital corridor with peeling paint|ho
ทางเดินหอพักมืดๆ|dim apartment hallway with flickering light|ho
บ้านผีสิง|old haunted house stairwell, dust and one bare bulb|ho
สุสาน|foggy cemetery at night with old stones|ho
โรงละครร้าง|abandoned theatre with torn velvet seats|ho
อุโมงค์ใต้ดิน|underground tunnel with dripping pipes|ho
ห้องใต้ดิน|basement with exposed pipes and a single swinging bulb|ho
ร้านน้ำชาเก่า 1950s|1950s wooden shophouse tea room, warm lamps|th
บ้านเก่าสไตล์โคโลเนียล|colonial mansion veranda with ceiling fans, golden light|th
วังเก่า|old palace hall with carved teak and amber light|th
ตลาดเก่าสมัย 1960s|1960s market street with tram tracks and hand-painted signs|th
ห้องล็อบบี้โรงแรมยุค 20s|1920s hotel lobby with brass and marble|th
สถานีตำรวจเก่า|vintage police station with wooden desks and green lamps|th
ร้านถ่ายรูปโบราณ|old photo studio with painted backdrops|th
โรงหนังกลางแปลง|open-air cinema screening at night with projector beam|th`;
const LOCS = LOC_RAW.split("\n").map(r=>{ const [th,en,cat]=r.split("|"); return {th,en,cat}; });
/* ===== ENGINE: state, builders (works without AI) ===== */
const KEY = "dps-v1";
let S = initialState();
const preview = {}; // reference image previews, memory only (never persisted)
const productImgs = []; // product image previews, memory only

function load(){
  try{ const r = localStorage.getItem(KEY); if(r){ const o = JSON.parse(r); S = Object.assign(initialState(), o); if(!S.chars||!S.chars.length) S.chars=[blankChar(0)]; if(!GENRES[S.genre]) S.genre="drama"; if(!STYLES[S.style]) S.style="photoreal"; if(!Array.isArray(S.audio.sfx)) S.audio.sfx=[]; } }catch(e){}
}
let saveT;
function save(){ clearTimeout(saveT); saveT = setTimeout(()=>{ try{ localStorage.setItem(KEY, JSON.stringify(S)); }catch(e){} }, 300); }

const esc = s => String(s==null?"":s).replace(/[&<>"']/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const nShots = () => Math.max(1, Math.round((+S.clipSec||15)/5));
const fmt = sec => { sec = Math.round(sec); return Math.floor(sec/60)+":"+String(sec%60).padStart(2,"0"); };

function label(c,i){
  if(!c) return "the character";
  if(c.nameEn) return c.nameEn + (c.name ? " ("+c.name+")" : "");
  return c.name || ("Character "+(i+1));
}
function shortName(c,i){ return (c && (c.nameEn||c.name)) || ("Character "+(i+1)); }
function fill(t){
  const A = S.chars[0] ? shortName(S.chars[0],0) : "the lead";
  const B = S.chars[1] ? shortName(S.chars[1],1) : "a stranger";
  return t.replace(/\{A\}/g,A).replace(/\{B\}/g,B)
          .replace(/\{setting\}/g, S.setting || "the location")
          .replace(/\{premise\}/g, S.premise || "the story unfolds");
}

function buildBeats(){ return GENRES[S.genre].beats.map(fill); }

function buildStoryboard(){
  const g = GENRES[S.genre], n = nShots(), dur = (+S.clipSec||15)/n, out = [];
  for(let i=0;i<n;i++){
    const bi = Math.min(S.beats.length-1, Math.floor(i*S.beats.length/n));
    out.push({
      size: g.sizes[i % g.sizes.length], move: g.moves[i % g.moves.length],
      action: (S.beats[bi]||"").trim(), who: (S.chars.length>1 && i%2===1) ? "1" : "0",
      dia: (i===0 && S.hookText) ? S.hookText : "", vo:"", sub:"", trans: i===n-1 ? "fade" : "cut", dur: Math.round(dur*10)/10
    });
  }
  return out;
}

function appearance(c){
  const p = [];
  if(c.age) p.push(c.age+" years old");
  if(c.face) p.push(c.face);
  if(c.hair) p.push(c.hair);
  if(c.body) p.push(c.body);
  return p.length ? p.join("; ") : "exactly the face, hair and body of the reference image";
}

function aspectTxt(ar){ return ar==="9:16" ? "9:16 vertical" : ar==="16:9" ? "16:9 horizontal" : ar+" portrait"; }

function timeline(){
  let t = 0;
  return S.shots.map(s => { const a = t; t += (+s.dur||5); return [a, t]; });
}

const productOn = () => gBase()==="ugc" && !!((S.product.name||"").trim()||(S.product.look||"").trim()||productImgs.length);

function buildPrompt(){
  const eng = S.engine || "minimax";
  if(eng === "minimax") return buildMinimaxPrompt();
  if(eng === "flow") return buildGoogleFlowPrompt();
  if(eng === "dreamradar") return buildDreamRadarPrompt();
  return buildMetaAiPrompt();
}

/* 1. MiniMax Hailuo H3 Prompt with Exact Off-Screen Voiceover Tag */
function buildMinimaxPrompt(){
  const g = GENRES[S.genre], st = STYLES[S.style], ar = PLATFORMS[S.platform];
  const langCode = (S.sub.lang || "th").toLowerCase().split("-")[0] || "th";
  const tl = timeline();
  const out = [];

  // Scene Context
  out.push("[MODEL: MiniMax Hailuo H3] [FORMAT: " + aspectTxt(ar) + "] [STYLE: " + st.txt + "]\nGENRE: " + (g.en||g.th) + " (" + g.mood + ")\nLIGHTING: " + g.light);

  if(!S.shots.length){
    const act = (S.premise || "A beautiful cinematic drone shot of Bangkok skyline during sunset.").trim();
    const voText = S.hookText || "กรุงเทพมหานคร เมืองหลวงที่ไม่เคยหลับใหล";
    out.push(act + "\n<d> (S1) says in an off-screen voiceover; [" + langCode + "] " + voText + " </d> and state lips stay closed after </d>.");
    return out.join("\n\n");
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

    let shotBlock = "[SHOT " + (i+1) + "] (" + (SIZES[s.size]||s.size) + ", " + s.move + ")\n" + act;
    if(vo && S.vo !== "none"){
      shotBlock += "\n<d> (" + speaker + ") says in an off-screen voiceover; [" + langCode + "] " + vo + " </d> and state lips stay closed after </d>.";
    }
    out.push(shotBlock);
  });

  return out.join("\n\n");
}

/* 2. Google Flow Multi-Camera / Scene Breakdown */
function buildGoogleFlowPrompt(){
  const g = GENRES[S.genre], st = STYLES[S.style], ar = PLATFORMS[S.platform];
  const L = [];
  L.push("GOOGLE FLOW PROJECT SPEC:\n- Title: " + (S.premise ? S.premise.slice(0, 40) : "Micro Drama") + "\n- Aspect Ratio: " + aspectTxt(ar) + "\n- Visual Style: " + st.txt + "\n- Production Pace: " + g.pace + "\n- Lighting Design: " + g.light);

  if(S.chars.length){
    L.push("CASTING & TALENT:\n" + S.chars.map((c, i) => "• Character " + (i+1) + ": " + (c.name || "Actor") + " (" + (c.role || "Lead") + ") - " + appearance(c)).join("\n"));
  }

  const tl = timeline();
  const shotList = S.shots.map((s, i) => {
    const vo = (s.vo || s.dia || "").trim();
    return "SCENE " + (i+1) + " [" + fmt(tl[i][0]) + " - " + fmt(tl[i][1]) + "]\n" +
      "  Camera: " + (SIZES[s.size] || s.size) + " | Movement: " + s.move + "\n" +
      "  Action: " + (s.action || "Natural scene execution") + "\n" +
      (vo ? "  Dialogue/Audio: [Language: " + S.lang + "] \"" + vo + "\"\n" : "") +
      "  Atmosphere: " + g.mood;
  });

  L.push("SHOT-BY-SHOT BREAKDOWN:\n" + (shotList.length ? shotList.join("\n\n") : "Scene 1: " + (S.premise || "Cinematic shot")));
  return L.join("\n\n");
}

/* 3. DreamRadar Video Engine */
function buildDreamRadarPrompt(){
  const g = GENRES[S.genre], st = STYLES[S.style], ar = PLATFORMS[S.platform];
  const L = [];
  L.push("/dreamradar prompt: " + (S.setting || "cinematic scene") + ", " + (S.premise || "compelling dramatic moment") + ", " + st.txt + ", " + g.light + " --ar " + (PLATFORMS[S.platform] || "9:16") + " --camera dynamic");

  if(S.shots.length){
    L.push("RADAR KEYFRAMES & SHOT SEQUENCES:\n" + S.shots.map((s, i) => {
      const vo = (s.vo || s.dia || "").trim();
      return "Seq " + (i+1) + ": " + (SIZES[s.size]||s.size) + ", " + s.move + " -> " + (s.action || "fluid subject motion") + (vo ? " [Voice: " + vo + "]" : "");
    }).join("\n"));
  }

  L.push("Negative: " + NEG);
  return L.join("\n\n");
}

/* 4. Meta AI Prompt (Default Identity Lock) */
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
    L.push("CHARACTER LOCK:\n"+used.map(o=>{
      const c=o.c, bits=[];
      bits.push("- "+label(c,o.i)+(c.role?" ["+c.role+"]":"")+(c.job?", "+c.job:"")+": "+appearance(c)+".");
      if(c.wardrobe) bits.push("  Default wardrobe: "+c.wardrobe+".");
      if(c.traits||c.flaw) bits.push("  On-screen personality: "+[c.traits,c.flaw?"flaw: "+c.flaw:""].filter(Boolean).join("; ")+".");
      return bits.join("\n");
    }).join("\n"));
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
      const isVO = /^(vo|voice-?over)\s*[:：]/i.test(d);
      const line = d.replace(/^(vo|voice-?over)\s*[:：]\s*/i,"");
      parts.push((isVO||S.vo==="vo" ? "Voice-over: " : "Dialogue: ")+"\""+line+"\" in "+S.accent+".");
    }
    { const vo=(s.vo||"").trim(); if(vo && S.vo!=="none" && S.vo!=="dialogue") parts.push("Voice-over: \""+vo+"\" in "+S.accent+"."); }
    { const sb=(s.sub||"").trim(); if(sb && S.sub.on==="on") parts.push("Subtitle ("+langName(S.sub.lang)+"): \""+sb.replace(/\n+/g," / ")+"\"."); }
    if(S.setting) parts.push("Environment: "+S.setting+".");
    parts.push("Lighting: "+g.light+".");
    parts.push("Camera: "+(SIZES[s.size]||s.size)+", "+s.move+".");
    parts.push("Style: "+st.txt+".");
    parts.push(aspectTxt(ar)+".");
    if(i<S.shots.length-1 && s.trans && s.trans!=="cut") parts.push("Transition: "+s.trans+".");
    L.push("SHOT "+(i+1)+" ("+fmt(tl[i][0])+"-"+fmt(tl[i][1])+"): "+parts.join(" "));
  });
  L.push("NEGATIVE PROMPT: "+NEG+(st.stylized?", photorealistic skin, mixed art styles, off-model character design":", cartoon face, anime face")+(pOn?", distorted product, altered packaging, wrong logo, misspelled label text, changed product color":""));
  return L.join("\n\n");
}

function checks(){
  const c = [];
  const named = S.chars.filter(x=>x.name||x.nameEn).length;
  c.push([named>0, named>0 ? "ตั้งชื่อตัวละครแล้ว ("+named+")" : "ยังไม่ได้ตั้งชื่อตัวละคร"]);
  const locked = S.chars.filter(x=>x.face&&x.hair).length;
  c.push([locked>0, locked>0 ? "มี Locked appearance ("+locked+" ตัว)" : "ใส่ลักษณะใบหน้า + ทรงผมอย่างน้อย 1 ตัวละคร"]);
  c.push([!!S.premise.trim(), S.premise.trim() ? "มี Premise" : "ยังไม่มี Premise"]);
  c.push([!!S.setting.trim(), S.setting.trim() ? "มีฉาก/สถานที่" : "ยังไม่ระบุฉาก/สถานที่"]);
  c.push([S.shots.length>0, S.shots.length>0 ? "Storyboard "+S.shots.length+" ช็อต" : "ยังไม่ได้สร้าง Storyboard"]);
  const empty = S.shots.filter(s=>!s.action.trim()).length;
  if(S.shots.length) c.push([empty===0, empty===0 ? "ทุกช็อตมี action" : empty+" ช็อตยังไม่มี action"]);
  if(gBase()==="ugc" || S.hookText){ const n=[...S.hookText].length; c.push([n>0&&n<=32, n>0&&n<=32 ? "Hook สั้นพอสำหรับ 3 วิแรก ("+n+" ตัวอักษร)" : "Hook ควรมี 1–32 ตัวอักษร (ตอนนี้ "+n+")"]); }
  if(S.vo!=="none" && S.vo!=="dialogue" && S.shots.length){ const n=S.shots.filter(s=>(s.vo||"").trim()).length; c.push([n>0, n>0 ? "มี Voice-over "+n+" ช็อต" : "ยังไม่มีบท Voice-over (ขั้นเสียง & Sub)"]); }
  if(S.sub.on==="on" && S.shots.length){ const n=S.shots.filter(s=>(s.sub||"").trim()).length; c.push([n===S.shots.length, "Subtitle "+n+"/"+S.shots.length+" ช็อต ("+((LANGS.find(l=>l.code===S.sub.lang)||{}).en||S.sub.lang)+")"]); }
  if(gBase()==="ugc"){ const ok = productImgs.length>0 || (S.product.name||"").trim(); c.push([!!ok, ok ? "มีข้อมูล/รูปสินค้า ("+productImgs.length+" รูป)" : "UGC ควรใส่ชื่อหรือรูปสินค้า"]); }
  return c;
}

function fallbackCaption(){
  const t = (S.topic||S.premise||"เรื่องนี้").trim();
  const hk = S.hookText ? S.hookText+"\n\n" : "";
  const T = {
    playful: hk+t+"\nดูจบแล้วบอกหน่อยว่าเคยเจอแบบนี้ไหม 😆\n\nชอบแนวนี้ กดติดตามไว้ ตอนต่อไปมาแน่",
    sincere: hk+t+"\nเราตั้งใจทำคลิปนี้ให้ดูแล้วรู้สึกว่าไม่ได้อยู่คนเดียว\n\nถ้ามีอะไรอยากเล่า คอมเมนต์ไว้ได้เลย เราอ่านทุกอัน",
    dramatic: hk+t+"\nบางเรื่องไม่ต้องพูดเยอะ แต่มันอยู่กับเรานานกว่าที่คิด\n\nดูให้จบ แล้วค่อยบอกว่าคุณเห็นอะไร",
    suspense: hk+t+"\nมีบางอย่างในคลิปนี้ที่หลายคนพลาด ลองดูอีกรอบ\n\nเจอแล้วคอมเมนต์ไว้ ไม่บอกเฉลย",
    formal: hk+t+"\nขอบคุณที่รับชม ติดตามเนื้อหาตอนถัดไปได้ที่ช่องทางของเรา\n\nหากมีข้อเสนอแนะ สามารถแจ้งได้ในช่องความคิดเห็น"
  };
  return T[S.tone] || T.playful;
}
function fallbackTags(){
  const base = GENRES[S.genre].tags.concat(["#AIvideo","#MetaAI","#คอนเทนต์ไทย"]);
  return [...new Set(base)].slice(0,8).join(" ");
}

function aiContext(){
  const g = GENRES[S.genre];
  return JSON.stringify({
    genre: g.th, style: STYLES[S.style].th, scope: S.scope, premise: S.premise, ending: S.ending, relationship: S.relation, setting: S.setting,
    topic: S.topic, product: gBase()==="ugc" ? S.product : undefined, clipSeconds: S.clipSec, shots: nShots(), spokenLanguage: S.lang, accent: S.accent, voiceMode: VO_MODES[S.vo], voiceStyle: S.voice, music: S.audio.music==="auto"?GENRE_MUSIC[gBase()]:S.audio.music, subtitleLanguage: langName(S.sub.lang),
    characters: S.chars.filter(c=>c.name||c.nameEn).map(c=>({name:c.name,nameEn:c.nameEn,role:c.role,age:c.age,job:c.job,traits:c.traits,flaw:c.flaw}))
  });
}

/* ===== audio / subtitle builders ===== */
const V_TONE_EN = {warm:"warm",energetic:"energetic",calm:"calm and steady",dramatic:"dramatic",mysterious:"mysterious",authoritative:"confident and authoritative"};
const V_PACE_EN = {slow:"slow pace",medium:"natural pace",fast:"fast pace"};
const SUB_POS_EN = {bottom:"placed at the bottom center",lower:"placed in the lower third, inside the safe zone above platform UI",top:"placed at the top"};
const SUB_STYLE_EN = {clean:"white text with a soft shadow",yellow:"yellow text with a black outline",box:"white text on a semi-transparent black box",karaoke:"word-by-word highlight"};
const stripVO = d => (d||"").replace(/^(vo|voice-?over)\s*[:：]\s*/i,"");
const spoken = s => [stripVO(s.dia), s.vo||""].map(x=>x.trim()).filter(Boolean).join(" ");
function audioLine(){
  const a=S.audio, v=S.voice, P=[];
  if(S.vo==="none") P.push("no spoken dialogue");
  else{
    P.push("spoken language "+S.lang+", accent "+S.accent+(S.vo==="vo"?", voice-over only":S.vo==="dialogue"?", in-scene dialogue only":", in-scene dialogue plus voice-over"));
    P.push("voice: "+({female:"female",male:"male",neutral:"gender-neutral"}[v.gender]||"natural")+", "+(V_TONE_EN[v.tone]||"natural")+" tone, "+(V_PACE_EN[v.pace]||"natural pace"));
    P.push("about 2 to 3 short sentences per 5-second shot, 0.5 second of silence before each cut");
  }
  const mk = a.music==="auto" ? GENRE_MUSIC[gBase()] : a.music, m = MUSIC[mk];
  P.push(m && m.en ? "music: "+m.en : "no background music");
  P.push(a.ambience==="auto" ? "ambience: sound matching the setting" : "ambience: "+(AMBIENCE[a.ambience]||{}).en);
  if(a.sfx.length) P.push("sound effects: "+a.sfx.map(k=>(SFX[k]||{}).en).filter(Boolean).join(", "));
  P.push("mix: "+(MIX[a.mix]||MIX.vo_first).en);
  return "AUDIO: "+P.join(". ")+".";
}
function subLine(){
  if(S.sub.on!=="on") return "";
  const l1=langName(S.sub.lang), l2=S.sub.lang2 ? langName(S.sub.lang2) : "";
  return "SUBTITLES: burned-in subtitles in "+l1+(l2?", with a smaller second line in "+l2:"")+", "+SUB_POS_EN[S.sub.pos]+", "+SUB_STYLE_EN[S.sub.style]+". Show exactly the subtitle text given in each shot, spelled correctly, at most two lines, synced to speech, and no other on-screen text.";
}
function srtTime(t){ const ms=Math.max(0,Math.round(t*1000)), h=Math.floor(ms/3600000), m=Math.floor(ms%3600000/60000), x=Math.floor(ms%60000/1000), r=ms%1000;
  return [h,m,x].map(v=>String(v).padStart(2,"0")).join(":")+","+String(r).padStart(3,"0"); }
function buildSrt(){
  const tl=timeline(); let n=0;
  return S.shots.map((s,i)=>{ const t=(s.sub||"").trim(); if(!t) return ""; n++;
    const a=tl[i][0]+0.2, b=Math.max(a+0.5, tl[i][1]-0.3); return n+"\n"+srtTime(a)+" --> "+srtTime(b)+"\n"+t; }).filter(Boolean).join("\n\n");
}
/* ===== RANDOM engine ===== */
const pick = a => a[Math.floor(Math.random()*a.length)];
const ri = (a,b) => a+Math.floor(Math.random()*(b-a+1));
const normKey = k => k.replace(/^chars\.\d+\./,"chars.").replace(/^shots\.\d+\./,"shots.");
const SPECIAL = ["chars.name","chars.nameEn","product.name","product.look","product.usp"];
const RNDF = {
  premise:()=>pick(PREMISES[gBase()]), relation:()=>pick(RELATIONS), ending:()=>pick(ENDINGS), setting:()=>pick(LOCS).en,
  topic:()=>pick(TOPICS), hookText:()=>pick(HOOK_POOL[S.hookType]),
  eps:()=>ri(2,12), mins:()=>ri(1,3), clipSec:()=>pick([10,15,20,30]),
  lang:()=>pick(["ไทย","ไทย","ไทย","English","日本語","中文"]),
  accent:()=>pick((ACC_BY_LANG[S.lang]||ACCENTS)),
  "chars.role":i=>i===0?"Lead":pick(SUPPORT_ROLES), "chars.age":()=>String(ri(20,45)),
  "chars.job":i=>(gBase()==="boss"&&i===0)?pick(BOSS_JOBS):pick(JOBS),
  "chars.traits":()=>pick(TRAITS), "chars.flaw":()=>pick(FLAWS), "chars.accent":()=>pick(ACCENTS),
  "chars.face":()=>pick(FACES), "chars.hair":()=>pick(HAIRS), "chars.body":()=>pick(BODIES), "chars.wardrobe":()=>pick(WARDROBES),
  caption:()=>fallbackCaption(), hashtags:()=>fallbackTags(),
  "audio.music":()=>pick(Object.keys(MUSIC).filter(k=>k!=="none")), "audio.ambience":()=>pick(Object.keys(AMBIENCE)), "audio.mix":()=>pick(Object.keys(MIX)),
  "voice.gender":()=>pick(Object.keys(V_GENDER)), "voice.tone":()=>pick(Object.keys(V_TONE)), "voice.pace":()=>pick(Object.keys(V_PACE)),
  "sub.lang":()=>pick(LANGS).code, "sub.pos":()=>pick(Object.keys(SUB_POS)), "sub.style":()=>pick(Object.keys(SUB_STYLE))
};
function canRnd(k){ const n = normKey(k); return !!RNDF[n] || SPECIAL.includes(n); }
function randomField(k){
  const n = normKey(k), m = k.match(/^chars\.(\d+)\./), i = m ? +m[1] : 0;
  if(n==="chars.name"||n==="chars.nameEn"){
    const used = S.chars.map(c=>c.nameEn), pool = NAMES.filter(x=>!used.includes(x[1]));
    const x = pick(pool.length?pool:NAMES); S.chars[i].name = x[0]; S.chars[i].nameEn = x[1]; return true;
  }
  if(n.startsWith("product.")){ S.product = Object.assign({}, pick(PRODUCTS)); S.topic = S.product.name; return true; }
  if(n==="lang"){ S.lang = RNDF.lang(); S.accent = RNDF.accent(); return true; }
  const f = RNDF[n]; if(!f) return false;
  setp(k, f(i)); return true;
}
function rndStyleId(){
  const g=GENRES[S.genre], b=gBase(); let pool;
  if(g.cat==="an"){
    if(b==="donghua_cn") pool=STYLE_IDS.filter(id=>/donghua/.test(id));
    else if(b==="anime_jp") pool=STYLE_IDS.filter(id=>STYLES[id].cat==="an"&&!/donghua/.test(id));
    else pool=STYLE_IDS.filter(id=>STYLES[id].stylized&&["ca","il","an","cr"].includes(STYLES[id].cat));
  }
  else if(b==="ugc") pool=STYLE_IDS.filter(id=>STYLES[id].cat==="co");
  else if(b==="boss") pool=STYLE_IDS.filter(id=>["pr","co","mo"].includes(STYLES[id].cat));
  else pool=STYLE_IDS.filter(id=>!STYLES[id].stylized);
  return pick(pool.length?pool:["photoreal"]);
}
function alignStyle(){ S.style = rndStyleId(); }
function rndSet(k){
  if(k==="genre"){ S.genre = pick(GENRE_IDS); S.beats = []; alignStyle(); return; }
  if(k==="style"){ S.style = rndStyleId(); return; }
  if(k==="platform"){ S.platform = gBase()==="ugc" ? pick(["tiktok","reels","shorts"]) : pick(Object.keys(PLATFORMS)); return; }
  const maps = {scope:["single","series"],vo:Object.keys(VO_MODES),tone:Object.keys(TONES),hookType:Object.keys(HOOKS)};
  if(maps[k]) S[k] = pick(maps[k]);
}
function rndSfxSet(){ S.audio.sfx = Object.keys(SFX).sort(()=>Math.random()-.5).slice(0, ri(2,4)); }
function randomStep(i){
  if(i===0){ rndSet("genre"); ["premise","relation","ending","setting"].forEach(randomField); randomField(gBase()==="ugc"?"product.name":"topic"); }
  else if(i===1){ S.chars.forEach((c,x)=>["chars.name","chars.role","chars.age","chars.job","chars.traits","chars.flaw","chars.face","chars.hair","chars.body","chars.wardrobe"].forEach(f=>randomField(f.replace("chars.","chars."+x+".")))); }
  else if(i===2){ ["eps","mins","clipSec"].forEach(randomField); rndSet("platform"); rndSet("vo"); randomField("lang"); }
  else if(i===3){ rndSet("hookType"); randomField("hookText"); S.beats = buildBeats(); ai.hooks = []; }
  else if(i===4){ if(!S.beats.length) S.beats = buildBeats(); S.shots = buildStoryboard(); }
  else if(i===5){ ["audio.music","audio.ambience","audio.mix","voice.gender","voice.tone","voice.pace","sub.pos","sub.style"].forEach(randomField); rndSfxSet(); }
  else if(i===7){ rndSet("tone"); randomField("caption"); randomField("hashtags"); }
}
function randomAll(){ [0,1,2,3,4,5,7].forEach(randomStep); }

let lastSnap = null;
function snap(){ lastSnap = JSON.stringify(S); const b = document.querySelector("#btnUndo"); if(b) b.hidden = false; }
function undoRandom(){
  if(!lastSnap) return;
  try{ S = Object.assign(initialState(), JSON.parse(lastSnap)); }catch(e){ return; }
  lastSnap = null; document.querySelector("#btnUndo").hidden = true; save(); render(); toast("ย้อนกลับแล้ว");
}

/* ===== Character auto-gen ===== */
function defaultArch(idx){
  if(idx===0) return gBase()==="ugc" ? "reviewer" : gBase()==="boss" ? "boss" : "lead";
  return pick(["love","rival","villain","mentor","friend","comic"]);
}
function fillChar(c, idx, key){
  const a = ARCH[key||defaultArch(idx)] || ARCH.lead;
  const used = S.chars.filter(x=>x!==c).map(x=>x.nameEn), pool = NAMES.filter(n=>!used.includes(n[1])), n = pick(pool.length?pool:NAMES);
  Object.assign(c,{name:n[0],nameEn:n[1],role:a.role,age:String(ri(a.age[0],a.age[1])),job:pick(a.jobs),traits:pick(a.traits),flaw:pick(a.flaws),
    face:pick(FACES),hair:pick(HAIRS),body:pick(BODIES),wardrobe:pick(a.wardrobe)});
  return c;
}
function genChar(key){
  if(S.chars.length>=4) return false;
  const c = blankChar(S.chars.length); S.chars.push(c); fillChar(c, S.chars.length-1, key); return true;
}
/* ===== UI: rendering ===== */
const $ = s => document.querySelector(s);
let ai = {api:null, busy:null, err:"", ctrl:null, hooks:[]};

function getp(p){ return p.split(".").reduce((o,k)=>o==null?o:o[k], S); }
function setp(p,v){ const ks=p.split("."), last=ks.pop(); ks.reduce((o,k)=>o[k], S)[last]=v; }

let addOpen = false;
const dice = k => canRnd(k) ? `<button type="button" class="dice" data-rnd="${k}" aria-label="สุ่มช่องนี้" title="สุ่มช่องนี้">🎲</button>` : "";
const diceSet = k => `<button type="button" class="dice" data-rndset="${k}" aria-label="สุ่มตัวเลือก" title="สุ่มตัวเลือก">🎲</button>`;
const inp = (k,l,ph,hint,type) => `<label class="field"><span class="lbl">${l}</span><input type="${type||"text"}" ${type==="number"?'data-num="1" inputmode="numeric"':""} data-k="${k}" value="${esc(getp(k))}" placeholder="${esc(ph||"")}">${dice(k)}${hint?`<span class="hint">${hint}</span>`:""}</label>`;
const ta  = (k,l,ph,hint,rows) => `<label class="field"><span class="lbl">${l}</span><textarea rows="${rows||3}" data-k="${k}" placeholder="${esc(ph||"")}">${esc(getp(k))}</textarea>${dice(k)}${hint?`<span class="hint">${hint}</span>`:""}</label>`;
const sel = (k,l,opts,hint) => `<label class="field"><span class="lbl">${l}</span><select data-k="${k}">${opts.map(o=>`<option value="${esc(o[0])}" ${String(getp(k))===String(o[0])?"selected":""}>${esc(o[1])}</option>`).join("")}</select>${dice(k)}${hint?`<span class="hint">${hint}</span>`:""}</label>`;
const chips = (k,map,lbl) => `<div class="chips" role="group" aria-label="${lbl}">${Object.keys(map).map(id=>`<button type="button" class="chip" data-set="${k}" data-val="${id}" aria-pressed="${S[k]===id}">${esc(typeof map[id]==="string"?map[id]:map[id].th)}</button>`).join("")}</div>${diceSet(k)}`;
const chipsP = (path,map,lbl) => `<div class="chips" role="group" aria-label="${lbl}">${Object.keys(map).map(id=>`<button type="button" class="chip" data-setp="${path}" data-val="${id}" aria-pressed="${getp(path)===id}">${esc(typeof map[id]==="string"?map[id]:map[id].th)}</button>`).join("")}</div>${dice(path)}`;
const foot = i => `<div class="nav-foot">${i>0?`<button class="btn" type="button" data-go="${i-1}">← ย้อนกลับ</button>`:"<span></span>"}${i<STEPS.length-1?`<button class="btn primary" type="button" data-go="${i+1}">ถัดไป: ${STEPS[i+1].t} →</button>`:""}</div>`;
const head = (t,d) => `<div class="card-head"><div class="card-top"><span class="eyebrow">ขั้นที่ ${S.step+1} / ${STEPS.length}</span>${S.step!==6?`<span class="row-actions"><button class="btn sm ghost" type="button" data-rndstep="${S.step}" title="สุ่มจากคลังตัวเลือกในแอป (ใช้ได้ทันที ไม่ต้องรอ AI)">🎲 สุ่มทั้งหน้านี้</button>${ai.api?`<button class="btn sm ai" type="button" data-airs="${S.step}" ${ai.busy?"disabled":""} title="ให้ AI คิดสร้างสรรค์ใหม่ทั้งหน้า">${ai.busy==="rs"+S.step?"Thinking…":"✦ AI สุ่มทั้งหน้า"}</button>`:""}</span>`:""}</div><h2>${t}</h2><p class="muted small">${d}</p></div>`;
const aiBtn = (kind,txt) => ai.api ? `<button class="btn ai sm" type="button" data-ai="${kind}" ${ai.busy?"disabled":""}>${ai.busy===kind?"Thinking…":"✦ "+txt}</button>` : "";
const aiErr = () => ai.err ? `<div class="err" role="alert">${esc(ai.err)}</div>` : "";

const catUI = {genre:{q:"",cat:"all"},style:{q:"",cat:"all"},loc:{q:"",cat:"all"}};
const CATDEF = {
  genre:{title:"แนวเรื่อง",cats:GENRE_CATS,rnd:()=>diceSet("genre"),items:()=>GENRE_IDS.map(id=>{const g=GENRES[id];return{id,th:g.th,sub:g.sub,cat:g.cat,on:S.genre===id,k:g.th+" "+g.en+" "+id};})},
  style:{title:"สไตล์ภาพ",cats:STYLE_CATS,rnd:()=>diceSet("style"),items:()=>STYLE_IDS.map(id=>{const t=STYLES[id];return{id,th:t.th,sub:STYLE_CATS[t.cat],cat:t.cat,on:S.style===id,k:t.th+" "+t.txt+" "+id};})},
  loc:{title:"สถานที่ / ฉาก",cats:LOC_CATS,rnd:()=>dice("setting"),items:()=>LOCS.map((l,i)=>({id:String(i),th:l.th,sub:l.en,cat:l.cat,on:S.setting===l.en,k:l.th+" "+l.en}))}
};
function catResults(kind){
  const u=catUI[kind], q=u.q.trim().toLowerCase();
  const list=CATDEF[kind].items().filter(x=>(u.cat==="all"||x.cat===u.cat)&&(!q||x.k.toLowerCase().includes(q)));
  return list.length ? list.map(x=>`<button type="button" class="opt sm" data-cpick="${kind}" data-val="${x.id}" aria-pressed="${x.on}"><b>${esc(x.th)}</b><span>${esc(x.sub)}</span></button>`).join("") : `<p class="hint" style="grid-column:1/-1">ไม่พบรายการที่ค้นหา</p>`;
}
function catPicker(kind){
  const d=CATDEF[kind], u=catUI[kind], items=d.items(), cur=items.find(x=>x.on);
  return `<div class="field"><span class="lbl">${d.title} <span class="tag">${items.length} แบบ</span></span>
  <input type="text" data-cq="${kind}" value="${esc(u.q)}" placeholder="ค้นหา${d.title} (ไทย / English)" aria-label="ค้นหา${d.title}">
  <div class="chips" role="group" aria-label="หมวด${d.title}"><button type="button" class="chip" data-ccat="${kind}" data-val="all" aria-pressed="${u.cat==="all"}">ทั้งหมด</button>${Object.keys(d.cats).map(c=>`<button type="button" class="chip" data-ccat="${kind}" data-val="${c}" aria-pressed="${u.cat===c}">${esc(d.cats[c])}</button>`).join("")}</div>
  <div class="catres" id="catres-${kind}" role="group" aria-label="${d.title}">${catResults(kind)}</div>
  ${cur?`<span class="hint">เลือกอยู่: <b>${esc(cur.th)}</b></span>`:""}${d.rnd()}</div>`;
}
function stepConcept(){
  return `<div class="card">${head("แนวเรื่องและภาพรวม","เลือกแนวก่อน ระบบจะตั้งแสง มุมกล้อง และจังหวะให้ตาม preset ของแนวนั้น")}
  ${catPicker("genre")}
  ${catPicker("style")}
  <p class="hint">${STYLES[S.style].stylized?"สไตล์นี้เป็นภาพวาด/แอนิเมชัน: Lock จะใช้ Character Design แทน Photoreal":"สไตล์นี้เป็นภาพจริง: ใช้ Identity Lock เต็มรูปแบบ (Face / Body / Hair)"}</p>
  <div class="field"><span class="lbl">ขอบเขต</span>${chips("scope",{single:"คลิปเดียว",series:"ซีรีส์หลายตอน"},"ขอบเขต")}</div>
  ${ta("premise","Premise: เรื่องย่อ 1–2 ประโยค","เช่น พนักงานใหม่ค้นพบว่าประธานบริษัทคือคนที่เธอเคยช่วยไว้ตอนเด็ก","ภาษาไทยได้ ปุ่ม AI จะแปลงเป็น action อังกฤษให้ในขั้น Hook & เรื่อง",3)}
  <div class="grid2">${ta("relation","ความสัมพันธ์ตัวละคร","เช่น หัวหน้ากับลูกน้อง / คู่แข่งที่เคยเป็นเพื่อนสนิท","",2)}${ta("ending","ฉากจบ","เช่น จบเปิด ทิ้งปมให้ตอนหน้า","",2)}</div>
  ${catPicker("loc")}
  ${inp("setting","ฉาก / สถานที่ (แก้เองได้)","เช่น modern glass office at dusk, Bangkok rooftop, old wooden house","เขียนอังกฤษสั้นๆ จะนิ่งกว่า")}
  ${inp("topic","หัวข้อ / สินค้า (ใช้กับ Hook และ Caption)","เช่น เซรั่มลดสิว / การเลื่อนขั้น")}
  ${productBlock()}
  ${foot(0)}</div>`;
}

function charCard(c,i){
  const pv = preview[i];
  return `<div class="char"><div class="char-head"><h3>ตัวละคร ${i+1} <span class="tag">${i===0?"Lead":"Support"}</span></h3>
    <div class="row-actions"><button class="btn sm ghost" type="button" data-act="rndChar" data-i="${i}">🎲 gen ทั้งตัว</button>${S.chars.length>1?`<button class="btn sm ghost danger" type="button" data-act="delChar" data-i="${i}">ลบ</button>`:""}</div></div>
  <div class="grid2">${inp(`chars.${i}.name`,"ชื่อ (ไทย)","เช่น นลิน")}${inp(`chars.${i}.nameEn`,"ชื่อ (อังกฤษ)","เช่น Nalin")}</div>
  <div class="grid3">${inp(`chars.${i}.role`,"บทบาท","Lead / Rival / Mentor")}${inp(`chars.${i}.age`,"อายุ","เช่น 28")}${inp(`chars.${i}.job`,"อาชีพ","เช่น CEO")}</div>
  <div class="grid2">${inp(`chars.${i}.traits`,"นิสัย 3 ข้อ","เช่น calm, observant, dry humor")}${inp(`chars.${i}.flaw`,"ข้อเสีย / ปม","เช่น never asks for help")}</div>
  ${sel(`chars.${i}.accent`,"สำเนียงเฉพาะตัวละคร (ถ้าต่างจากค่ารวม)",[["","ใช้ค่ารวมของโปรเจกต์"]].concat(ACCENTS.map(a=>[a,a])))}
  <div class="field"><span class="lbl">Locked appearance (ล็อกหน้าตา)</span>
    <div class="grid2">${inp(`chars.${i}.face`,"ใบหน้า","oval face, soft jawline, double eyelids")}${inp(`chars.${i}.hair`,"ผม","black shoulder-length straight hair")}</div>
    <div class="grid2">${inp(`chars.${i}.body`,"รูปร่าง","slim, 165 cm, narrow shoulders")}${inp(`chars.${i}.wardrobe`,"ชุดตั้งต้น","navy blazer, white blouse")}</div>
    <span class="hint">ถ้าเว้นว่าง ระบบจะสั่ง "exactly the face, hair and body of the reference image" ถ้าใช้รูปอ้างอิงจริง อย่าสุ่มช่องหน้า/ผม/รูปร่าง เพราะจะขัดกับรูป ให้พิมพ์ตามรูปแทน</span></div>
  <div class="up">${pv?`<img class="pv" src="${pv}" alt="ตัวอย่างรูปอ้างอิงของตัวละคร ${i+1}">`:`<div class="pv" role="img" aria-label="ยังไม่มีรูปอ้างอิง"></div>`}
    <div class="field" style="flex:1;min-width:200px"><span class="lbl">รูปอ้างอิง (ดูตัวอย่างเท่านั้น)</span>
      <input type="file" accept="image/*" data-file="${i}"><span class="hint">ไม่บันทึกรูปในแอป ให้แนบรูปเดียวกันนี้ใน Meta AI ทุกครั้งที่ gen</span></div></div></div>`;
}
function addBlock(){
  if(S.chars.length>=4) return `<p class="hint">ครบ 4 ตัวละครแล้ว</p>`;
  return `<div class="row-actions"><button class="btn" type="button" data-act="toggleAdd" aria-expanded="${addOpen}">＋ เพิ่มตัวละคร</button>${aiBtn("charGen","AI สร้างจากเรื่อง")}</div>`+
  (addOpen ? `<div class="hook-box"><span class="lbl">เลือกประเภท ระบบ gen ชื่อ นิสัย หน้าตา ชุดให้อัตโนมัติ แก้ต่อได้</span>
    <div class="cards">${Object.keys(ARCH).map(k=>`<button type="button" class="opt" data-act="addArch" data-v="${k}"><b>${esc(ARCH[k].th)}</b><span>${esc(ARCH[k].sub)}</span></button>`).join("")}</div>
    <div class="row-actions"><button class="btn sm" type="button" data-act="addArch" data-v="">🎲 สุ่มประเภท</button><button class="btn sm ghost" type="button" data-act="addArch" data-v="blank">ตัวละครว่าง</button></div></div>` : "");
}
function productBlock(){
  if(gBase()!=="ugc") return "";
  return `<div class="char"><div class="char-head"><h3>สินค้า (UGC)</h3><span class="tag">รูปสินค้า ${productImgs.length}/3</span></div>
  <div class="up">${productImgs.map((src,i)=>`<div style="position:relative"><img class="pv" src="${src}" alt="รูปสินค้า ${i+1}"><button type="button" class="btn sm" data-act="delPimg" data-i="${i}" aria-label="ลบรูปสินค้า ${i+1}" style="position:absolute;top:4px;right:4px;min-height:28px;padding:0 8px">✕</button></div>`).join("")}
    ${productImgs.length<3?`<div class="field" style="flex:1;min-width:200px"><span class="lbl">อัปโหลดรูปสินค้า (สูงสุด 3 รูป)</span><input type="file" accept="image/*" multiple data-pfile="1"><span class="hint">ดูตัวอย่างเท่านั้น ไม่บันทึกรูป ให้แนบรูปสินค้าเดียวกันใน Meta AI พร้อมรูปตัวละคร</span></div>`:""}</div>
  <div class="grid2">${inp("product.name","ชื่อสินค้า","เช่น เซรั่มบำรุงผิว")}${inp("product.usp","จุดขายหลัก (ภาษาไทยได้)","เช่น เนื้อบางเบา ซึมไว")}</div>
  ${inp("product.look","หน้าตาสินค้า (ล็อกบรรจุภัณฑ์)","เช่น white pump bottle, pastel green label","ถ้าเว้นว่าง ระบบสั่งให้ยึดตามรูปสินค้าที่แนบ")}</div>`;
}
function stepChars(){
  return `<div class="card">${head("Character Sheet & Lock","ยิ่งระบุรูปลักษณ์ละเอียด Identity Lock ยิ่งนิ่ง ใส่ได้สูงสุด 4 ตัว")}
  ${S.chars.map(charCard).join("")}
  ${addBlock()}${aiErr()}
  ${foot(1)}</div>`;
}

function stepProd(){
  return `<div class="card">${head("การผลิต","Meta AI ได้คลิปสั้น ดังนั้น 1 Prompt = 1 คลิป หากเป็นซีรีส์ให้ gen ทีละตอน/ทีละช่วง")}
  <div class="grid3">${inp("eps","จำนวนตอน","1","ใช้เมื่อเลือกซีรีส์","number")}${inp("mins","นาทีต่อตอน","1","","number")}
    ${sel("clipSec","ความยาวคลิปใน Prompt นี้",[[10,"10 วินาที"],[15,"15 วินาที"],[20,"20 วินาที"],[30,"30 วินาที"],[45,"45 วินาที"],[60,"60 วินาที"]],"≈ "+nShots()+" ช็อต ช็อตละ ~5 วิ")}</div>
  <div class="field"><span class="lbl">แพลตฟอร์ม</span>${chips("platform",PLAT_TH,"แพลตฟอร์ม")}<span class="hint">อัตราส่วน ${PLATFORMS[S.platform]}</span></div>
  <div class="grid2">${sel("lang","ภาษาพูด",[["ไทย","ไทย"],["English","English"],["日本語","日本語"],["中文","中文"]])}${sel("accent","สำเนียง",ACCENTS.map(a=>[a,a]))}</div>
  <div class="field"><span class="lbl">รูปแบบเสียงพูด</span>${chips("vo",VO_MODES,"รูปแบบเสียงพูด")}</div>
  ${foot(2)}</div>`;
}

function stepHook(){
  const h = HOOKS[S.hookType], n = [...S.hookText].length;
  return `<div class="card">${head("Hook 3 วินาที และ Story beats","Hook ต้องจบใน 3 วิแรก ไม่เกินราว 8 คำ แล้วค่อยไล่ beat ของเรื่อง")}
  <div class="hook-box"><span class="lbl">Hook type</span>${diceSet("hookType")}
    <div class="cards">${Object.keys(HOOKS).map(id=>`<button type="button" class="opt" data-set="hookType" data-val="${id}" aria-pressed="${S.hookType===id}"><b>${HOOKS[id].th}</b><span>${esc(HOOKS[id].ex)}</span></button>`).join("")}</div>
    <label class="field"><span class="lbl">บท Hook (พูด/ตัวอักษรบนจอ)</span><input type="text" data-k="hookText" value="${esc(S.hookText)}" placeholder="${esc(h.ex)}">${dice("hookText")}</label>
    <div class="row-actions"><span class="counter ${n>32?"over":""}" id="hookCount">${n}/32 ตัวอักษร</span>
      <button class="btn sm" type="button" data-act="hookTpl">เติมจาก template</button>${aiBtn("hooks","AI เสนอ Hook 3 แบบ")}</div>
    ${ai.hooks.length?`<div class="chips">${ai.hooks.map((x,i)=>`<button type="button" class="chip" data-act="pickHook" data-i="${i}">${esc(x)}</button>`).join("")}</div>`:""}</div>
  <div class="field"><span class="lbl">Story beats (${S.beats.length})</span>
    ${S.beats.length?S.beats.map((b,i)=>`<div class="beat"><span class="no">${i+1}</span><textarea rows="2" data-k="beats.${i}" aria-label="Beat ${i+1}">${esc(b)}</textarea><button class="btn sm ghost danger" type="button" data-act="delBeat" data-i="${i}" aria-label="ลบ beat ${i+1}">✕</button></div>`).join(""):`<p class="muted small">ยังไม่มี beat กด "สร้าง beats จาก preset" เพื่อเริ่ม</p>`}
    <div class="row-actions"><button class="btn sm" type="button" data-act="mkBeats">${S.beats.length?"สร้างใหม่จาก preset":"สร้าง beats จาก preset"}</button>
      <button class="btn sm" type="button" data-act="addBeat">＋ เพิ่ม beat</button>${aiBtn("beats","AI เขียน beats")}</div></div>
  ${aiErr()}${foot(3)}</div>`;
}

function stepBoard(){
  const tl = timeline(), tot = S.shots.length ? tl[S.shots.length-1][1] : 0;
  const whoOpts = i => S.chars.map((c,k)=>`<option value="${k}" ${String(S.shots[i].who)===String(k)?"selected":""}>${esc(shortName(c,k))}</option>`).join("")+`<option value="all" ${S.shots[i].who==="all"?"selected":""}>ทุกคน</option>`;
  const o = (arr,v)=>arr.map(x=>`<option ${x===v?"selected":""}>${x}</option>`).join("");
  return `<div class="card">${head("Storyboard","แต่ละช็อตมี 1 camera move ปรับเวลา มุม และบทพูดได้ บทพูดนำหน้าด้วย VO: เพื่อให้เป็น voice-over")}
  <div class="row-actions"><button class="btn" type="button" data-act="mkBoard">${S.shots.length?"สร้างใหม่จาก beats":"สร้าง Storyboard จาก beats"}</button>${aiBtn("board","AI เขียน action + บทพูด")}
    ${S.shots.length?`<span class="tag">${S.shots.length} ช็อต · ${fmt(tot)}${Math.abs(tot-S.clipSec)>0.6?" (เป้า "+S.clipSec+" วิ)":""}</span>`:""}</div>
  ${aiErr()}
  ${S.shots.length?`<div class="tbl-wrap"><table><thead><tr><th>#</th><th>เวลา</th><th>วินาที</th><th>ขนาด</th><th>กล้อง</th><th>ใคร</th><th>Action (EN)</th><th>บทพูด / เสียง</th><th>ต่อ</th><th></th></tr></thead><tbody>
  ${S.shots.map((s,i)=>`<tr><td class="tc">${i+1}</td><td class="tc">${fmt(tl[i][0])}-${fmt(tl[i][1])}</td>
    <td><input type="number" data-num="1" data-k="shots.${i}.dur" value="${esc(s.dur)}" style="width:64px" aria-label="วินาทีช็อต ${i+1}"></td>
    <td><select data-k="shots.${i}.size" aria-label="ขนาดช็อต ${i+1}">${o(Object.keys(SIZES),s.size)}</select></td>
    <td><select data-k="shots.${i}.move" aria-label="กล้อง ${i+1}">${o(MOVES,s.move)}</select></td>
    <td><select data-k="shots.${i}.who" aria-label="ตัวละคร ${i+1}">${whoOpts(i)}</select></td>
    <td style="min-width:220px"><textarea data-k="shots.${i}.action" aria-label="Action ${i+1}">${esc(s.action)}</textarea></td>
    <td style="min-width:200px"><textarea data-k="shots.${i}.dia" aria-label="บทพูด ${i+1}">${esc(s.dia)}</textarea></td>
    <td><select data-k="shots.${i}.trans" aria-label="transition ${i+1}">${o(TRANS,s.trans)}</select></td>
    <td><button class="btn sm ghost danger" type="button" data-act="delShot" data-i="${i}" aria-label="ลบช็อต ${i+1}">✕</button></td></tr>`).join("")}
  </tbody></table></div><div class="row-actions"><button class="btn sm" type="button" data-act="addShot">＋ เพิ่มช็อต</button></div>`
  :`<p class="muted">ยังไม่มีช็อต ระบบจะแบ่ง ${S.clipSec} วิ เป็น ${nShots()} ช็อต แล้วจับคู่กับ beats ตาม preset ของแนว ${esc(GENRES[S.genre].th)}</p>`}
  ${foot(4)}</div>`;
}

function monitor(extra){
  const p = buildPrompt();
  const curEng = S.engine || "minimax";
  const engLabel = (ENGINES[curEng] || ENGINES.minimax).th;
  return `<div class="mon ${extra||""}">
    <div style="padding:10px 12px 6px;border-bottom:1px solid #2a2c33;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;background:rgba(255,255,255,0.02)">
      <div style="font-size:11px;font-family:var(--font-mono);color:var(--muted);display:flex;align-items:center;gap:6px">
        <span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:#F59E0B"></span>
        เลือกโมเดลเป้าหมาย (AI Target):
      </div>
      <div style="display:flex;gap:4px;flex-wrap:wrap">
        ${Object.keys(ENGINES).map(k=>`<button type="button" class="btn sm ${curEng===k?"primary":""}" data-setengine="${k}" style="min-height:28px;padding:2px 8px;font-size:11.5px;font-weight:600">${esc(ENGINES[k].th)}</button>`).join("")}
      </div>
    </div>
    <div class="mon-bar">
      <span class="rec"><i class="dot"></i> ${esc(engLabel.toUpperCase())} PROMPT</span>
      <button class="btn primary sm" type="button" data-act="copyPrompt" ${p?"":"disabled"}>คัดลอก Prompt</button>
    </div>
    ${p?`<pre class="promptPre" tabindex="0">${esc(p)}</pre>`:`<div class="empty">ยังไม่มีข้อมูลพอสำหรับประกอบ Prompt เริ่มจากตั้งชื่อตัวละครและสร้าง Storyboard</div>`}
  </div>`;
}
function checkList(){
  return `<div class="check">${checks().map(c=>`<div class="${c[0]?"ok":"warn"}"><span aria-hidden="true">${c[0]?"✓":"!"}</span><span>${esc(c[1])}</span></div>`).join("")}</div>`;
}
function stepAudio(){
  const tl=timeline(), has = S.shots.some(x=>(x.sub||"").trim());
  const musicOpts=[["auto","ตามแนวเรื่อง (auto)"]].concat(Object.keys(MUSIC).map(k=>[k,MUSIC[k].th]));
  const ambOpts=[["auto","ตามฉาก (auto)"]].concat(Object.keys(AMBIENCE).map(k=>[k,AMBIENCE[k].th]));
  const table = S.shots.length ? `<div class="tbl-wrap"><table style="min-width:900px"><thead><tr><th>#</th><th>เวลา</th><th>บทพูดในฉาก</th><th>Voice-over</th><th>Subtitle · ${esc((LANGS.find(l=>l.code===S.sub.lang)||{}).en||"")}</th></tr></thead><tbody>${S.shots.map((x,i)=>`<tr><td class="tc">${i+1}</td><td class="tc">${fmt(tl[i][0])}-${fmt(tl[i][1])}</td>
    <td style="min-width:200px"><textarea data-k="shots.${i}.dia" aria-label="บทพูดในฉาก ช็อต ${i+1}">${esc(x.dia)}</textarea></td>
    <td style="min-width:200px"><textarea data-k="shots.${i}.vo" aria-label="Voice-over ช็อต ${i+1}">${esc(x.vo||"")}</textarea></td>
    <td style="min-width:220px"><textarea data-k="shots.${i}.sub" aria-label="Subtitle ช็อต ${i+1}">${esc(x.sub||"")}</textarea></td></tr>`).join("")}</tbody></table></div>`
    : `<p class="muted">ยังไม่มี Storyboard ต้องมีช็อตก่อนจึงใส่บทพูด / Voice-over / Subtitle รายช็อตได้ <button class="btn sm" type="button" data-go="4">ไปสร้าง Storyboard</button></p>`;
  return `<div class="card">${head("เสียง, Voice-over และ Subtitle","กำหนดแนวเสียงประกอบ บทพูดรายช็อต และ Subtitle หลายภาษา (เลือกได้ "+LANGS.length+" ภาษา)")}
  <div class="char"><div class="char-head"><h3>แนวเสียงประกอบ</h3></div>
    <div class="grid2">${sel("audio.music","ดนตรีประกอบ",musicOpts)}${sel("audio.ambience","เสียงบรรยากาศ",ambOpts)}</div>
    <div class="field"><span class="lbl">เสียงเอฟเฟกต์ (เลือกได้หลายอย่าง)</span><div class="chips" role="group" aria-label="เสียงเอฟเฟกต์">${Object.keys(SFX).map(k=>`<button type="button" class="chip" data-act="toggleSfx" data-v="${k}" aria-pressed="${S.audio.sfx.includes(k)}">${esc(SFX[k].th)}</button>`).join("")}</div>
      <div class="row-actions"><button class="btn sm ghost" type="button" data-act="rndSfx">🎲 สุ่มเอฟเฟกต์</button></div></div>
    <div class="field"><span class="lbl">สัดส่วนเสียง (Mix)</span>${chipsP("audio.mix",MIX,"สัดส่วนเสียง")}</div></div>
  <div class="char"><div class="char-head"><h3>สไตล์เสียง Voice-over</h3><span class="tag">${esc(VO_MODES[S.vo])}</span></div>
    <div class="field"><span class="lbl">เพศเสียง</span>${chipsP("voice.gender",V_GENDER,"เพศเสียง")}</div>
    <div class="field"><span class="lbl">น้ำเสียง</span>${chipsP("voice.tone",V_TONE,"น้ำเสียง")}</div>
    <div class="field"><span class="lbl">จังหวะพูด</span>${chipsP("voice.pace",V_PACE,"จังหวะพูด")}</div>
    <p class="hint">ภาษา สำเนียง และรูปแบบเสียงพูดตั้งไว้ที่ขั้น "การผลิต" ถ้าเลือก "ไม่มีเสียงพูด" ช่อง Voice-over จะไม่ถูกใส่ใน Prompt</p></div>
  <div class="field"><span class="lbl">บทพูดและ Subtitle รายช็อต</span>
    <div class="row-actions">${aiBtn("voGen","AI เขียน Voice-over")}${aiBtn("subTr","AI แปลเป็น Subtitle")}<button class="btn sm" type="button" data-act="subCopy">คัดลอกบทพูดเป็น Subtitle (ไม่แปล)</button><button class="btn sm" type="button" data-act="copySrt" ${has?"":"disabled"}>คัดลอกไฟล์ .srt</button></div>
    ${aiErr()}${table}
    <span class="hint">ไม่ใช้ AI: พิมพ์เองได้ทุกช่อง ระบบไม่เขียนบทไทยด้วย template เพื่อไม่ให้ได้บทที่ไม่เป็นธรรมชาติ</span></div>
  <div class="char"><div class="char-head"><h3>Subtitle</h3><span class="tag">${LANGS.length} ภาษา</span></div>
    <div class="field"><span class="lbl">ฝัง Subtitle ลงใน Prompt</span>${chipsP("sub.on",SUB_ON,"เปิดปิด Subtitle")}</div>
    <div class="grid2">${langField("sub.lang","ภาษาหลักของ Subtitle",false)}${langField("sub.lang2","ภาษาที่สอง (ถ้าต้องการ 2 ภาษา)",true)}</div>
    <div class="field"><span class="lbl">ตำแหน่ง</span>${chipsP("sub.pos",SUB_POS,"ตำแหน่ง Subtitle")}</div>
    <div class="field"><span class="lbl">สไตล์ตัวอักษร</span>${chipsP("sub.style",SUB_STYLE,"สไตล์ Subtitle")}</div>
    <p class="hint">โมเดลวิดีโอมักเรนเดอร์ตัวอักษรเพี้ยนได้ โดยเฉพาะอักษรที่ไม่ใช่ละติน ถ้าเพี้ยน ให้ปิดการฝังใน Prompt แล้วนำไฟล์ .srt ไปใส่ตอนตัดต่อแทน</p></div>
  ${foot(5)}</div>`;
}
function langField(path,label,allowNone){
  return `<div class="field"><span class="lbl">${label}</span><input type="text" data-lfilter="${path}" placeholder="ค้นหา เช่น ญี่ปุ่น, Arabic, Español" aria-label="ค้นหาภาษา ${label}"><select data-k="${path}" aria-label="${label}">${langOpts(getp(path),"",allowNone)}</select>${dice(path)}</div>`;
}
function syncHeader(){
  const b=$("#btnAiAll"), c=$("#btnAiCancel");
  if(b){ b.hidden=!ai.api; b.disabled=!!ai.busy; b.textContent = ai.busy==="all" ? "Thinking… "+(ai.progress||"") : "✦ AI สุ่มทั้งโปรเจกต์"; }
  if(c) c.hidden=!ai.busy;
}
function stepOut(){
  return `<div class="card">${head("Prompt พร้อมใช้","คัดลอกทั้งก้อน วางใน Meta AI แล้วแนบรูปอ้างอิงเดียวกับที่ใช้ตั้งตัวละคร")}
  <div class="only-m">${monitor()}</div>
  <div class="field"><span class="lbl">เช็กก่อนส่ง</span>${checkList()}</div>
  <div class="field"><span class="lbl">วิธีใช้ใน Meta AI</span>
    <p class="small muted">วางทั้งก้อนในช่อง prompt พร้อมแนบรูปอ้างอิง${productOn()?" และรูปสินค้า":""} ถ้าหน้าเพี้ยนระหว่างช็อต ให้ลดจำนวนช็อต ลดการหันหน้าเกิน 45 องศา และ gen ใหม่โดยคง SYSTEM PROMPT (LOCK) ไว้เหมือนเดิมทุกครั้ง</p></div>
  ${foot(6)}</div>`;
}

function stepSocial(){
  return `<div class="card">${head("Caption & Hashtag","เขียนแบบคนพูด เลือกโทนได้ ไม่ใส่ตัวเลขที่ไม่มีที่มา")}
  <div class="field"><span class="lbl">โทน</span>${chips("tone",TONES,"โทน")}</div>
  <div class="row-actions"><button class="btn sm" type="button" data-act="mkCaption">ร่างจาก template</button>${aiBtn("caption","AI เขียน Caption + Hashtag")}</div>
  ${aiErr()}
  ${ta("caption","Caption","กด “ร่างจาก template” หรือพิมพ์เอง","",8)}
  ${ta("hashtags","Hashtag (5–8 แท็ก ไทยผสมอังกฤษ)","#หนังสั้น #MetaAI","",2)}
  <div class="row-actions"><button class="btn primary" type="button" data-act="copyCaption">คัดลอก Caption + Hashtag</button></div>
  ${foot(7)}</div>`;
}

const RENDERERS = [stepConcept, stepChars, stepProd, stepHook, stepBoard, stepAudio, stepOut, stepSocial];

function renderSteps(){
  $("#steps").innerHTML = STEPS.map((s,i)=>`<button type="button" class="step ${i<S.step?"done":""}" data-go="${i}" ${i===S.step?'aria-current="step"':""}><span class="n">${i<S.step?"✓":i+1}</span>${s.t}</button>`).join("");
}
function renderPanel(){
  const p = buildPrompt(), sec = S.shots.length ? timeline()[S.shots.length-1][1] : 0;
  $("#panel").innerHTML = monitor() +
    `<div class="stats"><span class="tag">${p.length.toLocaleString()} ตัวอักษร</span><span class="tag">${S.shots.length} ช็อต</span><span class="tag">${fmt(sec)}</span><span class="tag">${PLATFORMS[S.platform]}</span></div>
     <div class="card" style="padding:14px;gap:10px"><span class="lbl">เช็กลิสต์</span>${checkList()}</div>`;
}
function render(){
  renderSteps();
  $("#stage").innerHTML = RENDERERS[S.step]();
  renderPanel(); syncHeader();
  const st = document.querySelector(".only-m"); if(st) st.style.display = "";
}
/* ===== APP: events, actions, AI, init ===== */
let toastT;
function toast(msg){ const t=$("#toast"); t.textContent=msg; t.hidden=false; clearTimeout(toastT); toastT=setTimeout(()=>{t.hidden=true;},2200); }

async function copyText(txt, selSel){
  try{ await navigator.clipboard.writeText(txt); toast("คัดลอกแล้ว"); }
  catch(e){
    const el = selSel && document.querySelector(selSel);
    if(el){ const r=document.createRange(); r.selectNodeContents(el); const s=getSelection(); s.removeAllRanges(); s.addRange(r); }
    toast("เบราว์เซอร์ไม่อนุญาตให้คัดลอก เลือกข้อความให้แล้ว กด Ctrl/⌘+C");
  }
}

function goStep(i){
  if(i===3 && !S.beats.length) S.beats = buildBeats();
  S.step = Math.max(0, Math.min(STEPS.length-1, i)); ai.err = ""; save(); render(); window.scrollTo({top:0});
  if(i===6) document.body.dataset.view = "wizard";
}

/* ---- AI ---- */
function aiError(e){
  const c = e && e.code;
  if(c==="cancelled") return "";
  if(c==="not_granted" || c==="sampling_disabled"){ ai.api = null; return ""; }
  if(c==="rate_limited") return "ใช้ AI ถี่เกินไป รอสักครู่แล้วกดใหม่";
  if(c==="invalid_json") return "AI ตอบรูปแบบไม่ตรง กดลองใหม่อีกครั้ง หรือแก้เองในตาราง";
  return "AI ใช้งานไม่ได้ตอนนี้ ใช้ตัวช่วยแบบ template ต่อได้";
}
async function runAI(kind, prompt, apply){
  if(!ai.api || ai.busy) return;
  ai.busy = kind; ai.err = ""; ai.ctrl = new AbortController(); render();
  try{
    const data = await ai.api.json(prompt, {signal: ai.ctrl.signal, cache: false});
    apply(data); save(); toast("AI เขียนให้แล้ว แก้ต่อได้ทุกช่อง");
  }catch(e){ ai.err = aiError(e); }
  finally{ ai.busy = null; render(); }
}
const AI_RULES = "Return ONLY valid JSON, no markdown fences. Never invent statistics, prices or product claims.";

const AI_JOBS = {
  hooks(){
    runAI("hooks", `You write 3-second UGC hooks in Thai. Context: ${aiContext()}. Hook type wanted: ${HOOKS[S.hookType].th}. Give 3 different options, each at most 8 Thai words (max 32 characters), spoken or on-screen text for the first 3 seconds. ${AI_RULES} Format: {"hooks":["...","...","..."]}`,
      d => { ai.hooks = (d.hooks||[]).slice(0,3).map(String); });
  },
  beats(){
    runAI("beats", `You are a film director planning a short video. Context: ${aiContext()}. Write exactly 5 story beats (hook, setup, conflict, turn, payoff) in English. Each beat is one sentence of VISIBLE action with no dialogue, naming the characters. Respect genre mood: ${GENRES[S.genre].mood}. ${AI_RULES} Format: {"beats":["","","","",""]}`,
      d => { if(Array.isArray(d.beats) && d.beats.length) S.beats = d.beats.slice(0,8).map(String); else throw {code:"invalid_json"}; });
  },
  board(){
    const n = S.shots.length;
    if(!n){ ai.err = "สร้าง Storyboard จาก beats ก่อน แล้วค่อยให้ AI เขียนรายละเอียด"; render(); return; }
    runAI("board", `You are a film director writing a storyboard. Context: ${aiContext()}. Beats: ${JSON.stringify(S.beats)}. Hook line (shot 1 dialogue if given): ${JSON.stringify(S.hookText)}. Write exactly ${n} shots. For each: "action" = one clear visible action in English, no camera words, max 25 words; "dia" = what is said, in ${S.lang} with ${S.accent} flavor, at most 2 short sentences, or "" when silent. Voice mode: ${VO_MODES[S.vo]}; when voice-over is used prefix that line with "VO: ". Dialogue must sound like a real person, not an ad. ${AI_RULES} Format: {"shots":[{"action":"","dia":""}]}`,
      d => { if(!Array.isArray(d.shots)) throw {code:"invalid_json"};
        S.shots.forEach((s,i)=>{ const x=d.shots[i]; if(x){ if(x.action) s.action=String(x.action); s.dia = S.vo==="none" ? "" : String(x.dia||""); } }); });
  },
  charGen(){
    if(S.chars.length>=4){ ai.err="ครบ 4 ตัวละครแล้ว"; render(); return; }
    runAI("charGen", `You are a film director casting one new character. Context: ${aiContext()}. Existing characters: ${JSON.stringify(S.chars.map(c=>({name:c.name,nameEn:c.nameEn,role:c.role,job:c.job})))}. Create ONE new character who adds conflict or contrast to the story. Thai name in "name" and romanized in "nameEn". "role","job","traits","flaw","face","hair","body","wardrobe" in English, short and concrete; "face"/"hair"/"body" describe a locked appearance for a consistent AI video character. "age" is a number string. ${AI_RULES} Format: {"name":"","nameEn":"","role":"","age":"","job":"","traits":"","flaw":"","face":"","hair":"","body":"","wardrobe":""}`,
      d => { if(!d || !d.nameEn && !d.name) throw {code:"invalid_json"}; const c = blankChar(S.chars.length);
        ["name","nameEn","role","age","job","traits","flaw","face","hair","body","wardrobe"].forEach(k=>{ if(d[k]!=null) c[k]=String(d[k]); });
        S.chars.push(c); addOpen=false; });
  },
  caption(){
    runAI("caption", `Write a social media caption in Thai for this video, sounding like a real person. Tone: ${TONES[S.tone].th}. Context: ${aiContext()}. Hook: ${JSON.stringify(S.hookText)}. Structure: one opening line that is not a stock opener, 2 to 3 short paragraphs, one genuine call to action. Use at most two of the same emoji. Also give 5 to 8 hashtags mixing Thai and English. ${AI_RULES} Format: {"caption":"","hashtags":["#..."]}`,
      d => { if(!d.caption) throw {code:"invalid_json"}; S.caption = String(d.caption); S.hashtags = (d.hashtags||[]).map(h=>String(h).startsWith("#")?h:"#"+h).slice(0,8).join(" "); });
  }
};

/* ---- actions ---- */
const ACTS = {
  addChar(){ if(S.chars.length<4) S.chars.push(blankChar(S.chars.length)); },
  toggleAdd(){ addOpen = !addOpen; },
  addArch(el){ snap(); const v = el.dataset.v; if(v==="blank"){ if(S.chars.length<4) S.chars.push(blankChar(S.chars.length)); } else genChar(v||undefined); addOpen = false; },
  rndChar(el){ snap(); const i=+el.dataset.i; fillChar(S.chars[i], i, i===0?undefined:undefined); },
  toggleSfx(el){ const v=el.dataset.v, a=S.audio.sfx, i=a.indexOf(v); if(i>=0) a.splice(i,1); else a.push(v); },
  rndSfx(){ snap(); rndSfxSet(); },
  subCopy(){ snap(); S.shots.forEach(x=>{ x.sub = spoken(x); }); },
  copySrt(){ const t=buildSrt(); if(t) copyText(t); return "noRender"; },
  aiCancel(){ if(ai.ctrl) ai.ctrl.abort(); return "noRender"; },
  delPimg(el){ productImgs.splice(+el.dataset.i,1); },
  delChar(el){ const i=+el.dataset.i; S.chars.splice(i,1); delete preview[i]; S.shots.forEach(s=>{ if(s.who!=="all" && +s.who>=S.chars.length) s.who="0"; }); },
  hookTpl(){ S.hookText = S.topic.trim() ? HOOKS[S.hookType].tpl.replace("{x}", S.topic.trim()) : HOOKS[S.hookType].ex; },
  pickHook(el){ S.hookText = ai.hooks[+el.dataset.i]||S.hookText; },
  mkBeats(){ S.beats = buildBeats(); },
  addBeat(){ S.beats.push(""); },
  delBeat(el){ S.beats.splice(+el.dataset.i,1); },
  mkBoard(){ if(!S.beats.length) S.beats = buildBeats(); S.shots = buildStoryboard(); },
  addShot(){ const l=S.shots[S.shots.length-1]||{size:"MS",move:"static",who:"0",trans:"cut",dur:5}; S.shots.push({size:l.size,move:l.move,action:"",who:l.who,dia:"",vo:"",sub:"",trans:"cut",dur:5}); },
  delShot(el){ S.shots.splice(+el.dataset.i,1); },
  mkCaption(){ S.caption = fallbackCaption(); S.hashtags = fallbackTags(); },
  copyPrompt(){ const p=buildPrompt(); if(p) copyText(p, ".promptPre"); return "noRender"; },
  copyCaption(){ copyText((S.caption+"\n\n"+S.hashtags).trim()); return "noRender"; }
};

document.addEventListener("click", e => {
  const t = e.target.closest("button"); if(!t) return;
  if(t.dataset.setengine){ S.engine = t.dataset.setengine; save(); render(); toast("เลือกเป้าหมายเป็น " + ENGINES[S.engine].th + " แล้ว"); return; }
  if(t.dataset.cpick){ const k=t.dataset.cpick, v=t.dataset.val, box=document.querySelector("#catres-"+k), sc=box?box.scrollTop:0;
    if(k==="genre"){ S.genre=v; S.beats=[]; } else if(k==="style") S.style=v; else if(k==="loc") S.setting=LOCS[+v].en;
    save(); render(); const r=document.querySelector("#catres-"+k); if(r) r.scrollTop=sc; return; }
  if(t.dataset.ccat){ catUI[t.dataset.ccat].cat=t.dataset.val; render(); return; }
  if(t.dataset.setp){ setp(t.dataset.setp,t.dataset.val); save(); render(); return; }
  if(t.dataset.airs!==undefined){ aiRandomRun([+t.dataset.airs]); return; }
  if(t.dataset.rnd){ snap(); randomField(t.dataset.rnd); save(); render(); return; }
  if(t.dataset.rndset){ snap(); rndSet(t.dataset.rndset); save(); render(); return; }
  if(t.dataset.rndstep!==undefined){ snap(); randomStep(+t.dataset.rndstep); save(); render(); toast("สุ่มทั้งหน้าแล้ว กดเลิกสุ่มได้ที่มุมบน"); return; }
  if(t.dataset.go!==undefined){ goStep(+t.dataset.go); return; }
  if(t.dataset.set){ S[t.dataset.set] = t.dataset.val; if(t.dataset.set==="genre"){ S.beats=[]; } save(); render(); return; }
  if(t.dataset.ai){ AI_JOBS[t.dataset.ai](); return; }
  if(t.dataset.act && ACTS[t.dataset.act]){ const r = ACTS[t.dataset.act](t); if(r!=="noRender"){ save(); render(); } return; }
});
function onField(e){
  const el = e.target; if(!el.dataset || !el.dataset.k) return;
  let v = el.value; if(el.dataset.num){ v = parseFloat(v); if(isNaN(v)) v = 0; }
  setp(el.dataset.k, v); save(); renderPanel();
  if(el.dataset.k==="hookText"){ const c=$("#hookCount"); if(c){ const n=[...S.hookText].length; c.textContent=n+"/32 ตัวอักษร"; c.className="counter "+(n>32?"over":""); } }
  if(e.type==="change" && /^(clipSec|platform)$/.test(el.dataset.k)) render();
  if(e.type==="change" && el.tagName==="SELECT" && /^shots\.\d+\.dur$/.test(el.dataset.k)) render();
}
document.addEventListener("input", onField);
document.addEventListener("input", e => { const el=e.target; if(!el.dataset) return;
  if(el.dataset.cq){ catUI[el.dataset.cq].q=el.value; const r=document.querySelector("#catres-"+el.dataset.cq); if(r) r.innerHTML=catResults(el.dataset.cq); }
  if(el.dataset.lfilter){ const p=el.dataset.lfilter, sl=document.querySelector('select[data-k="'+p+'"]'); if(sl) sl.innerHTML=langOpts(getp(p), el.value, p==="sub.lang2"); } });
document.addEventListener("change", e => {
  if(e.target.dataset && e.target.dataset.pfile){
    const files = [...(e.target.files||[])].slice(0, 3-productImgs.length);
    Promise.all(files.map(f => f.size>8*1024*1024 ? null : new Promise(r=>{ const fr=new FileReader(); fr.onload=()=>r(fr.result); fr.readAsDataURL(f); })))
      .then(a => { a.filter(Boolean).forEach(x=>productImgs.push(x)); render(); });
    return;
  }
  if(e.target.dataset && e.target.dataset.file!==undefined){
    const f = e.target.files && e.target.files[0], i = +e.target.dataset.file;
    if(!f) return;
    if(f.size>8*1024*1024){ toast("รูปใหญ่เกิน 8MB"); return; }
    const r = new FileReader(); r.onload = () => { preview[i] = r.result; render(); }; r.readAsDataURL(f); return;
  }
  onField(e);
  if(e.target.dataset && /^shots\.\d+\.dur$/.test(e.target.dataset.k||"")) render();
});

$("#btnTheme").addEventListener("click", () => {
  const cur = document.documentElement.dataset.theme || (matchMedia("(prefers-color-scheme:dark)").matches ? "dark" : "light");
  document.documentElement.dataset.theme = cur==="dark" ? "light" : "dark";
});
$("#btnReset").addEventListener("click", function(){
  if(this.dataset.arm!=="1"){ this.dataset.arm="1"; this.textContent="กดอีกครั้งเพื่อยืนยันล้าง"; setTimeout(()=>{ this.dataset.arm=""; this.textContent="ล้างโปรเจกต์"; },3000); return; }
  this.dataset.arm=""; this.textContent="ล้างโปรเจกต์";
  S = initialState(); Object.keys(preview).forEach(k=>delete preview[k]); ai.hooks=[]; ai.err=""; save(); render(); toast("ล้างโปรเจกต์แล้ว");
});
$("#btnRndAll").addEventListener("click", () => { snap(); randomAll(); save(); render(); toast("สุ่มทั้งโปรเจกต์แล้ว กดเลิกสุ่มได้ที่มุมบน"); });
$("#btnUndo").addEventListener("click", undoRandom);
$("#btnAiAll").addEventListener("click", () => aiRandomRun([0,1,2,3,4,5,7]));
$("#btnAiCancel").addEventListener("click", () => { if(ai.ctrl) ai.ctrl.abort(); });
function setView(v){
  document.body.dataset.view = v;
  $("#vwWizard").setAttribute("aria-pressed", v==="wizard"); $("#vwPrompt").setAttribute("aria-pressed", v==="prompt");
}
$("#vwWizard").addEventListener("click", ()=>setView("wizard"));
$("#vwPrompt").addEventListener("click", ()=>{ setView("prompt"); window.scrollTo({top:0}); });

/* ---- init ---- */
load(); setView("wizard"); render();
(async () => {
  try{
    if(window.claude && window.claude.use){
      const s = await window.claude.use("sample");
      if(s){ ai.api = s; render(); }
    }
  }catch(e){ ai.api = null; }
})();
/* ===== AI random (creative) + VO / subtitle jobs ===== */
ai.progress = "";
const J = (p, signal) => ai.api.json(p, {signal, cache:false});
const inObj = (v,o) => typeof v==="string" && Object.prototype.hasOwnProperty.call(o,v);
const str = v => v==null ? "" : String(v);
const RULES2 = "Return ONLY valid JSON, no markdown fences. Be original and specific, never invent statistics, prices or product claims.";
const GENRE_LIST = () => GENRE_IDS.map(id=>id+":"+GENRES[id].en).join(", ");
const STYLE_LIST = () => STYLE_IDS.map(id=>id+":"+STYLES[id].th).join(", ");

const AI_RAND = {
  async 0(sig){
    const d = await J(`You are a creative director inventing a fresh, original short-video concept. Pick ONE genre id and ONE style id from the lists. The style must suit the genre: anime or donghua genres use a stylized style, UGC genres use a UGC or advertisement style, others use a photoreal or film style. Genres: ${GENRE_LIST()}. Styles: ${STYLE_LIST()}. Also write: premise (Thai, 1-2 sentences), relation (Thai, how the main characters relate), ending (Thai, short), setting (English, concrete place with time of day, max 15 words), topic (Thai: the product or theme). If the genre is a UGC or advertisement type, add product {name (Thai), look (English description of the packaging), usp (Thai, one honest selling point)}. ${RULES2} Format: {"genre":"","style":"","premise":"","relation":"","ending":"","setting":"","topic":"","product":{"name":"","look":"","usp":""}}`, sig);
    if(inObj(d.genre,GENRES)){ S.genre=d.genre; S.beats=[]; }
    if(inObj(d.style,STYLES)) S.style=d.style; else S.style=rndStyleId();
    ["premise","relation","ending","setting","topic"].forEach(k=>{ if(d[k]) S[k]=str(d[k]); });
    if(d.product && gBase()==="ugc") S.product = {name:str(d.product.name),look:str(d.product.look),usp:str(d.product.usp)};
  },
  async 1(sig){
    const n = S.chars.length;
    const d = await J(`You are a casting director. Context: ${aiContext()}. Create exactly ${n} original characters for this story; the first is the Lead. Thai name in "name", romanized in "nameEn". "role","job","traits","flaw","face","hair","body","wardrobe" in English, short and concrete; face/hair/body describe a locked appearance for a consistent AI video character. "age" is a number string. ${RULES2} Format: {"characters":[{"name":"","nameEn":"","role":"","age":"","job":"","traits":"","flaw":"","face":"","hair":"","body":"","wardrobe":""}]}`, sig);
    if(!Array.isArray(d.characters)) throw {code:"invalid_json"};
    d.characters.slice(0,n).forEach((x,i)=>["name","nameEn","role","age","job","traits","flaw","face","hair","body","wardrobe"].forEach(k=>{ if(x[k]!=null) S.chars[i][k]=str(x[k]); }));
  },
  async 2(sig){
    const d = await J(`You are a producer planning one short video. Context: ${aiContext()}. Choose: eps (1-12, integer), mins (1-3, integer), clipSec (one of 10,15,20,30,45,60), platform (one of ${Object.keys(PLATFORMS).join(", ")}), lang (one of ไทย, English, 日本語, 中文), accent (one of ${ACCENTS.join(" | ")} matching lang), vo (one of ${Object.keys(VO_MODES).join(", ")}). ${RULES2} Format: {"eps":1,"mins":1,"clipSec":15,"platform":"","lang":"","accent":"","vo":""}`, sig);
    if(+d.eps>0) S.eps=Math.min(12,+d.eps); if(+d.mins>0) S.mins=Math.min(3,+d.mins);
    if([10,15,20,30,45,60].includes(+d.clipSec)) S.clipSec=+d.clipSec;
    if(inObj(d.platform,PLATFORMS)) S.platform=d.platform;
    if(["ไทย","English","日本語","中文"].includes(d.lang)) S.lang=d.lang;
    if(ACCENTS.includes(d.accent)) S.accent=d.accent;
    if(inObj(d.vo,VO_MODES)) S.vo=d.vo;
  },
  async 3(sig){
    const d = await J(`You are a film director. Context: ${aiContext()}. Write a 3-second hook (type: one of ${Object.keys(HOOKS).join(", ")}; text in Thai, max 8 words and at most 32 characters) and exactly 5 story beats (hook, setup, conflict, turn, payoff) in English; each beat is one sentence of visible action with no dialogue, naming the characters. Genre mood: ${GENRES[S.genre].mood}. ${RULES2} Format: {"hookType":"","hookText":"","beats":["","","","",""]}`, sig);
    if(inObj(d.hookType,HOOKS)) S.hookType=d.hookType;
    if(d.hookText) S.hookText=[...str(d.hookText)].slice(0,32).join("");
    if(Array.isArray(d.beats)&&d.beats.length) S.beats=d.beats.slice(0,8).map(str); else throw {code:"invalid_json"};
    ai.hooks=[];
  },
  async 4(sig){
    if(!S.beats.length) S.beats=buildBeats();
    S.shots=buildStoryboard(); const n=S.shots.length;
    const d = await J(`You are a film director writing a storyboard. Context: ${aiContext()}. Beats: ${JSON.stringify(S.beats)}. Hook line for shot 1: ${JSON.stringify(S.hookText)}. Write exactly ${n} shots. For each: "size" (one of ${Object.keys(SIZES).join(", ")}), "move" (one of ${MOVES.join(", ")}, exactly one move), "action" (English, one clear visible action, no camera words, max 25 words), "dia" (what is said, in ${S.lang} with ${S.accent} flavor, at most 2 short sentences, or "" when silent; prefix with "VO: " for voice-over), "trans" (one of ${TRANS.join(", ")}). Voice mode: ${VO_MODES[S.vo]}. Dialogue must sound like a real person, not an ad. ${RULES2} Format: {"shots":[{"size":"","move":"","action":"","dia":"","trans":""}]}`, sig);
    if(!Array.isArray(d.shots)) throw {code:"invalid_json"};
    S.shots.forEach((x,i)=>{ const y=d.shots[i]; if(!y) return;
      if(inObj(y.size,SIZES)) x.size=y.size; if(MOVES.includes(y.move)) x.move=y.move; if(TRANS.includes(y.trans)) x.trans=y.trans;
      if(y.action) x.action=str(y.action); x.dia = S.vo==="none" ? "" : str(y.dia); });
  },
  async 5(sig){
    if(!S.shots.length){ if(!S.beats.length) S.beats=buildBeats(); S.shots=buildStoryboard(); }
    const n=S.shots.length, spokenLang=S.lang+" ("+S.accent+")", sub=langName(S.sub.lang), sub2=S.sub.lang2?langName(S.sub.lang2):"";
    const d = await J(`You are a sound designer and script editor. Context: ${aiContext()}. Shots: ${JSON.stringify(S.shots.map((x,i)=>({n:i+1,action:x.action,dialogue:x.dia})))}. Choose: music (one of ${Object.keys(MUSIC).join(", ")}), ambience (one of ${Object.keys(AMBIENCE).join(", ")}), sfx (2 to 4 of ${Object.keys(SFX).join(", ")}), mix (one of ${Object.keys(MIX).join(", ")}), voice {gender (one of ${Object.keys(V_GENDER).join(", ")}), tone (one of ${Object.keys(V_TONE).join(", ")}), pace (one of ${Object.keys(V_PACE).join(", ")})}, subPos (one of ${Object.keys(SUB_POS).join(", ")}), subStyle (one of ${Object.keys(SUB_STYLE).join(", ")}). Then for exactly ${n} shots write "vo" (voice-over narration in ${spokenLang}, at most 2 short natural sentences, or "" if the shot needs none${S.vo==="none"||S.vo==="dialogue"?"; voice-over is disabled so use \"\" for all":""}) and "sub" (subtitle of everything spoken in that shot, translated into ${sub}${sub2?", then a second line in "+sub2:""}, max 2 lines and 42 characters per line, or "" if silent). ${RULES2} Format: {"music":"","ambience":"","sfx":[""],"mix":"","voice":{"gender":"","tone":"","pace":""},"subPos":"","subStyle":"","shots":[{"vo":"","sub":""}]}`, sig);
    if(inObj(d.music,MUSIC)) S.audio.music=d.music; if(inObj(d.ambience,AMBIENCE)) S.audio.ambience=d.ambience;
    if(Array.isArray(d.sfx)) S.audio.sfx=d.sfx.filter(k=>inObj(k,SFX)).slice(0,4);
    if(inObj(d.mix,MIX)) S.audio.mix=d.mix;
    if(d.voice){ if(inObj(d.voice.gender,V_GENDER)) S.voice.gender=d.voice.gender; if(inObj(d.voice.tone,V_TONE)) S.voice.tone=d.voice.tone; if(inObj(d.voice.pace,V_PACE)) S.voice.pace=d.voice.pace; }
    if(inObj(d.subPos,SUB_POS)) S.sub.pos=d.subPos; if(inObj(d.subStyle,SUB_STYLE)) S.sub.style=d.subStyle;
    if(Array.isArray(d.shots)) S.shots.forEach((x,i)=>{ const y=d.shots[i]; if(!y) return; x.vo = (S.vo==="none"||S.vo==="dialogue") ? "" : str(y.vo); x.sub=str(y.sub); });
  },
  async 7(sig){
    const d = await J(`Write a social media caption in Thai that sounds like a real person. Pick the tone (one of ${Object.keys(TONES).join(", ")}) that suits the story. Context: ${aiContext()}. Hook: ${JSON.stringify(S.hookText)}. Structure: an opening line that is not a stock opener, 2 to 3 short paragraphs, one genuine call to action, at most two of the same emoji. Also give 5 to 8 hashtags mixing Thai and English. ${RULES2} Format: {"tone":"","caption":"","hashtags":["#..."]}`, sig);
    if(!d.caption) throw {code:"invalid_json"};
    if(inObj(d.tone,TONES)) S.tone=d.tone;
    S.caption=str(d.caption); S.hashtags=(d.hashtags||[]).map(h=>str(h).startsWith("#")?str(h):"#"+str(h)).slice(0,8).join(" ");
  }
};

async function aiRandomRun(steps){
  if(!ai.api || ai.busy) return;
  ai.busy = steps.length>1 ? "all" : "rs"+steps[0]; ai.err=""; ai.ctrl=new AbortController(); ai.progress="";
  snap(); render();
  let done=0;
  try{
    for(const i of steps){ ai.progress=(done+1)+"/"+steps.length; syncHeader(); await AI_RAND[i](ai.ctrl.signal); done++; save(); }
    toast(steps.length>1 ? "AI สุ่มทั้งโปรเจกต์แล้ว แก้ต่อได้ทุกช่อง หรือกดเลิกสุ่ม" : "AI สุ่มทั้งหน้าแล้ว แก้ต่อได้ทุกช่อง หรือกดเลิกสุ่ม");
  }catch(e){
    ai.err = aiError(e) || "";
    if(done) toast("AI สุ่มได้ "+done+"/"+steps.length+" ขั้น ที่เหลือใช้ 🎲 หรือกดลองใหม่");
  }finally{ ai.busy=null; ai.progress=""; ai.ctrl=null; save(); render(); }
}

/* VO + subtitle jobs (use shared runAI from p6) */
AI_JOBS.voGen = function(){
  if(!S.shots.length){ ai.err="สร้าง Storyboard ก่อน แล้วค่อยให้ AI เขียน Voice-over"; render(); return; }
  if(S.vo==="none"||S.vo==="dialogue"){ ai.err="โหมดเสียงที่เลือกไว้ไม่มี Voice-over เปลี่ยนที่ขั้น การผลิต ก่อน"; render(); return; }
  runAI("voGen", `You are a script writer. Context: ${aiContext()}. Shots: ${JSON.stringify(S.shots.map((x,i)=>({n:i+1,action:x.action,dialogue:x.dia})))}. Write voice-over narration for exactly ${S.shots.length} shots in ${S.lang} with ${S.accent} flavor, voice style ${V_TONE_EN[S.voice.tone]} and ${V_PACE_EN[S.voice.pace]}. At most 2 short natural sentences per shot, complement the picture instead of repeating it, "" if a shot needs none. ${AI_RULES} Format: {"shots":[{"vo":""}]}`,
    d => { if(!Array.isArray(d.shots)) throw {code:"invalid_json"}; S.shots.forEach((x,i)=>{ if(d.shots[i]) x.vo=str(d.shots[i].vo); }); });
};
AI_JOBS.subTr = function(){
  if(!S.shots.length){ ai.err="สร้าง Storyboard ก่อน แล้วค่อยให้ AI แปล Subtitle"; render(); return; }
  const l1=langName(S.sub.lang), l2=S.sub.lang2?langName(S.sub.lang2):"";
  runAI("subTr", `You are a professional subtitler. Translate everything spoken in each shot into ${l1}${l2?", and add a second line in "+l2:""}. Source texts (spoken language ${S.lang}): ${JSON.stringify(S.shots.map((x,i)=>({n:i+1,text:spoken(x)})))}. Keep meaning and tone, max 2 lines and 42 characters per line, "" when the source is empty. ${AI_RULES} Format: {"shots":[{"sub":""}]}`,
    d => { if(!Array.isArray(d.shots)) throw {code:"invalid_json"}; S.shots.forEach((x,i)=>{ if(d.shots[i]) x.sub=str(d.shots[i].sub); }); });
};
