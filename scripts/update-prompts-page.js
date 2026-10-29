const fs = require('fs');

let code = fs.readFileSync('src/app/prompts/page.tsx', 'utf8');

// 1. Add pool500Data import
if (!code.includes('pool500Data')) {
  code = code.replace(
    "import { PromptTemplate } from '@/lib/types';",
    "import { PromptTemplate } from '@/lib/types';\nimport pool500Data from '@/data/random-500-prompts.json';"
  );
}

// 2. Add interface Random500Item
if (!code.includes('interface Random500Item')) {
  code = code.replace(
    'interface RandomPreset {',
    `interface Random500Item {
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

interface RandomPreset {`
  );
}

// 3. Add states for 500 pool modal and random picking
const oldStates = `  // Randomizer & Modal states
  const [isRandomizing, setIsRandomizing] = useState(false);
  const [showGeneratedModal, setShowGeneratedModal] = useState(false);
  const [randomPresetTitle, setRandomPresetTitle] = useState<string>('');`;

const newStates = `  // Randomizer & Modal states
  const [isRandomizing, setIsRandomizing] = useState(false);
  const [showGeneratedModal, setShowGeneratedModal] = useState(false);
  const [randomPresetTitle, setRandomPresetTitle] = useState<string>('');

  // 500 Random Ideas & Prompts System States
  const [showPoolModal, setShowPoolModal] = useState(false);
  const [selectedPoolCategory, setSelectedPoolCategory] = useState<string>('all');
  const [poolSearchQuery, setPoolSearchQuery] = useState<string>('');
  const [activePoolItem, setActivePoolItem] = useState<Random500Item | null>(null);
  const [poolCopiedId, setPoolCopiedId] = useState<string | null>(null);`;

code = code.replace(oldStates, newStates);

// 4. Add handlers for 500 pool
const oldHandlers = `  // Randomize variables for the CURRENT active prompt
  const handleRandomizeCurrentVariables = () => {`;

const newHandlers = `  // 500 Random Ideas: Quick pick 1 random from 500 catalog
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
  const handleRandomizeCurrentVariables = () => {`;

code = code.replace(oldHandlers, newHandlers);

// 5. Add 500 Random buttons in Hero section
const oldHeroButtons = `          {/* HERO AI RANDOM PROMPT BUTTON */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleRandomPrompt}
              disabled={isRandomizing || prompts.length === 0}
              className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-sm sm:text-base shadow-xl shadow-amber-400/25 hover:shadow-amber-400/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 border border-amber-200/50"
            >
              <Dices className={\`w-5 h-5 text-slate-950 \${isRandomizing ? 'animate-spin' : ''}\`} />
              <span>{isRandomizing ? 'กำลังสุ่มไอเดียด้วย AI...' : '🎲 สุ่ม Prompt ด้วย AI (Random Prompt)'}</span>
            </button>

            <a
              href="#prompt-builder"
              className="w-full sm:w-auto px-5 py-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 text-sm font-semibold border border-white/10 hover:border-amber-400/30 transition-all flex items-center justify-center gap-2"
            >
              <Sliders className="w-4 h-4 text-amber-400" />
              <span>ปรับแต่ง Prompt ด้วยตนเอง</span>
            </a>
          </div>`;

const newHeroButtons = `          {/* HERO AI RANDOM PROMPT & 500 POOL BUTTONS */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => handleRandomFrom500()}
              disabled={isRandomizing}
              className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-sm sm:text-base shadow-xl shadow-amber-400/25 hover:shadow-amber-400/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 border border-amber-200/50"
            >
              <Dices className={\`w-5 h-5 text-slate-950 \${isRandomizing ? 'animate-spin' : ''}\`} />
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
          </div>`;

code = code.replace(oldHeroButtons, newHeroButtons);

// 6. Add 500 Pool Modal before end of return statement
const modalTarget = `      {/* GENERATED MASTER PROMPT MODAL */}`;

const poolModalJSX = `      {/* 500 RANDOM IDEAS & PROMPTS CATALOG MODAL */}
      {showPoolModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#0b121e] border border-white/10 rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden relative">
            
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-white/10 bg-slate-900/60 flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-500 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-amber-400/20 shrink-0">
                  <Dices className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 uppercase tracking-wide">
                      500 CURATED ITEMS
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                      AI Powered Library
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-white mt-0.5 flex items-center gap-2">
                    คลังสุ่มไอเดียและ Prompt 500 แบบสำเร็จรูป
                  </h3>
                  <p className="text-xs text-slate-400">
                    5 หมวดหมู่ใหญ่: ภาพเคลื่อนไหว Motion (100) · ละครสั้น Micro-Drama (100) · สไตล์วิดีโอ Cinematic (100) · UI/UX Web Design (100) · ระบบ SaaS (100)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleRandomFrom500(selectedPoolCategory)}
                  disabled={isRandomizing}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 text-xs font-black shadow-md flex items-center gap-1.5 transition-all"
                  title="สุ่ม 1 รายการใหม่ทันที"
                >
                  <Dices className={\`w-4 h-4 \${isRandomizing ? 'animate-spin' : ''}\`} />
                  <span className="hidden sm:inline">สุ่มอีกรอบ</span>
                </button>
                <button
                  onClick={() => setShowPoolModal(false)}
                  className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition border border-white/5"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* If an active pool item is highlighted, show its full detail card */}
            {activePoolItem && (
              <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-slate-900/80 border-b border-white/10">
                <div className="flex flex-col lg:flex-row items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-400 text-slate-950 uppercase font-mono">
                        {activePoolItem.badge}
                      </span>
                      <span className="text-[11px] font-semibold text-amber-300">
                        {activePoolItem.categoryTh}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        ID: {activePoolItem.id}
                      </span>
                      <span className="text-[10px] text-cyan-300 bg-cyan-950/60 border border-cyan-800/60 px-2 py-0.5 rounded-full">
                        🎯 {activePoolItem.targetAi}
                      </span>
                    </div>

                    <h4 className="text-base sm:text-lg font-bold text-white mb-2 leading-snug">
                      {activePoolItem.title}
                    </h4>

                    <p className="text-xs text-slate-300 leading-relaxed mb-3 bg-black/30 p-2.5 rounded-xl border border-white/5">
                      {activePoolItem.ideaSummary}
                    </p>

                    <div className="relative">
                      <pre className="max-h-36 overflow-y-auto p-3 rounded-xl bg-[#060a12] border border-white/10 font-mono text-[11px] text-slate-200 whitespace-pre-wrap leading-relaxed select-text">
                        {activePoolItem.fullPrompt}
                      </pre>
                    </div>
                  </div>

                  <div className="flex lg:flex-col gap-2 shrink-0 w-full lg:w-auto">
                    <button
                      onClick={() => handleCopyPoolPrompt(activePoolItem.fullPrompt, activePoolItem.id)}
                      className={\`flex-1 lg:flex-none px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition-all \${
                        poolCopiedId === activePoolItem.id
                          ? 'bg-emerald-500 text-white'
                          : 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-amber-400/20'
                      }\`}
                    >
                      {poolCopiedId === activePoolItem.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{poolCopiedId === activePoolItem.id ? 'คัดลอกแล้ว!' : 'คัดลอก Master Prompt'}</span>
                    </button>
                    <button
                      onClick={() => setActivePoolItem(null)}
                      className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium border border-white/5"
                    >
                      ปิดดูรายการอื่นใน 500
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Filter Pills & Search within 500 pool */}
            <div className="p-4 border-b border-white/10 bg-slate-950/70 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-xs">
                {[
                  { key: 'all', label: 'ทั้งหมด (500)' },
                  { key: 'Motion & Animations', label: 'Motion Claude (100)' },
                  { key: 'Micro Drama & Series', label: 'ละครสั้น Drama (100)' },
                  { key: 'Cinematic Styles', label: 'Cinematic Styles (100)' },
                  { key: 'UI/UX & Web Design', label: 'UI/UX Design (100)' },
                  { key: 'SaaS & AI Agents', label: 'SaaS & Agents (100)' },
                ].map(c => (
                  <button
                    key={c.key}
                    onClick={() => setSelectedPoolCategory(c.key)}
                    className={\`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all text-xs font-semibold \${
                      selectedPoolCategory === c.key
                        ? 'bg-amber-400 text-slate-950 shadow-sm shadow-amber-400/30'
                        : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                    }\`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>

              <div className="relative min-w-[220px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={poolSearchQuery}
                  onChange={(e) => setPoolSearchQuery(e.target.value)}
                  placeholder="ค้นหาใน 500 รายการ..."
                  className="w-full bg-[#101c2d] border border-white/10 text-xs rounded-xl pl-8 pr-3 py-1.5 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Scrollable List of 500 Items */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {(pool500Data as Random500Item[])
                .filter(item => {
                  if (selectedPoolCategory !== 'all' && item.category !== selectedPoolCategory) {
                    return false;
                  }
                  if (poolSearchQuery.trim()) {
                    const q = poolSearchQuery.toLowerCase();
                    return item.title.toLowerCase().includes(q) ||
                           item.ideaSummary.toLowerCase().includes(q) ||
                           item.categoryTh.toLowerCase().includes(q) ||
                           item.tags.some(t => t.toLowerCase().includes(q));
                  }
                  return true;
                })
                .slice(0, 100)
                .map(item => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-slate-900/40 hover:bg-slate-900/80 border border-white/5 hover:border-amber-400/30 transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-400/10 text-amber-400 border border-amber-400/20">
                          {item.badge}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {item.categoryTh}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-1 mb-1">
                        {item.title}
                      </h4>

                      <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed mb-3">
                        {item.ideaSummary}
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/5 mt-auto">
                      <span className="text-[10px] text-cyan-400 truncate max-w-[150px]">
                        🎯 {item.targetAi}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setActivePoolItem(item)}
                          className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-[11px] font-medium transition"
                        >
                          ดูรายละเอียด
                        </button>
                        <button
                          onClick={() => handleCopyPoolPrompt(item.fullPrompt, item.id)}
                          className={\`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition \${
                            poolCopiedId === item.id
                              ? 'bg-emerald-500 text-white'
                              : 'bg-amber-400 hover:bg-amber-300 text-slate-950'
                          }\`}
                        >
                          {poolCopiedId === item.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          <span>{poolCopiedId === item.id ? 'ก๊อปแล้ว' : 'คัดลอก'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 sm:p-4 border-t border-white/10 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
              <span>แสดงตัวอย่างตามการค้นหา (คลังทั้งหมด 500 ไอเดียพร้อมใช้)</span>
              <button
                onClick={() => setShowPoolModal(false)}
                className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GENERATED MASTER PROMPT MODAL */}`;

code = code.replace(modalTarget, poolModalJSX);

fs.writeFileSync('src/app/prompts/page.tsx', code, 'utf8');
console.log('src/app/prompts/page.tsx updated with 500 random ideas system!');
