const fs = require('fs');

let code = fs.readFileSync('src/app/prompts/page.tsx', 'utf8');

// 1. Add targetEngine state
const oldState = `  // 500 Random Ideas & Prompts System States
  const [showPoolModal, setShowPoolModal] = useState(false);`;

const newState = `  // Selected AI Engine Target (Google Flow, Meta AI, DreamRadar, MiniMax Hailuo H3)
  const [targetEngine, setTargetEngine] = useState<'minimax' | 'flow' | 'meta' | 'dreamradar'>('minimax');

  // 500 Random Ideas & Prompts System States
  const [showPoolModal, setShowPoolModal] = useState(false);`;

code = code.replace(oldState, newState);

// 2. Format finalPrompt based on targetEngine in useMemo
const oldMemo = `  // Compute final generated prompt text by replacing placeholders
  const generatedPrompt = useMemo(() => {
    if (!selectedPrompt) return '';
    let result = selectedPrompt.templateContent;
    selectedPrompt.variables?.forEach(v => {
      const val = variableValues[v.key] ?? v.defaultValue ?? '';
      const regex = new RegExp(\`{{\${v.key}}}\`, 'g');
      result = result.replace(regex, val);
    });
    return result;
  }, [selectedPrompt, variableValues]);`;

const newMemo = `  // Compute final generated prompt text by replacing placeholders and adapting to targetEngine
  const generatedPrompt = useMemo(() => {
    if (!selectedPrompt) return '';
    let result = selectedPrompt.templateContent;
    selectedPrompt.variables?.forEach(v => {
      const val = variableValues[v.key] ?? v.defaultValue ?? '';
      const regex = new RegExp(\`{{\${v.key}}}\`, 'g');
      result = result.replace(regex, val);
    });

    // Format special syntax when targeting MiniMax H3, Google Flow, or DreamRadar
    if (targetEngine === 'minimax') {
      // Find voice-over / speech lines or append off-screen voiceover tag
      const voMatch = result.match(/(?:Voice-?over|บทพูด|เสียงพากย์|Dialogue)[:：]\\s*["']?([^"'\n]+)["']?/i);
      const voLine = voMatch ? voMatch[1].trim() : (variableValues['VOICE_SCRIPT'] || variableValues['HOOK_SENTENCE'] || 'กรุงเทพมหานคร เมืองหลวงที่ไม่เคยหลับใหล');
      
      const tagSuffix = \`\\n\\n<d> (S1) says in an off-screen voiceover; [th] \${voLine} </d> and state lips stay closed after </d>.\`;
      if (!result.includes('<d> (S1)')) {
        result = result + tagSuffix;
      }
    } else if (targetEngine === 'flow') {
      result = \`[TARGET: Google Flow Project / Multi-Camera Director]\\n\\n\` + result;
    } else if (targetEngine === 'dreamradar') {
      result = \`[TARGET: DreamRadar Video Engine]\\n\\n\` + result;
    }

    return result;
  }, [selectedPrompt, variableValues, targetEngine]);`;

code = code.replace(oldMemo, newMemo);

// 3. Add AI Engine Switcher UI in Terminal Header
const oldTermHeader = `                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-slate-500 hidden sm:inline">
                      {generatedPrompt.length.toLocaleString()} ตัวอักษร
                    </span>`;

const newTermHeader = `                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Engine Selector Pills */}
                    <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/5 mr-2">
                      {[
                        { key: 'minimax', label: 'MiniMax H3' },
                        { key: 'flow', label: 'Google Flow' },
                        { key: 'meta', label: 'Meta AI' },
                        { key: 'dreamradar', label: 'DreamRadar' }
                      ].map(eng => (
                        <button
                          key={eng.key}
                          type="button"
                          onClick={() => setTargetEngine(eng.key as any)}
                          className={\`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all \${
                            targetEngine === eng.key
                              ? 'bg-amber-400 text-slate-950 shadow-sm shadow-amber-400/30'
                              : 'text-slate-400 hover:text-white hover:bg-white/5'
                          }\`}
                        >
                          {eng.label}
                        </button>
                      ))}
                    </div>

                    <span className="text-[11px] font-mono text-slate-500 hidden sm:inline">
                      {generatedPrompt.length.toLocaleString()} ตัวอักษร
                    </span>`;

code = code.replace(oldTermHeader, newTermHeader);

fs.writeFileSync('src/app/prompts/page.tsx', code, 'utf8');
console.log('src/app/prompts/page.tsx updated with targetEngine switcher!');
