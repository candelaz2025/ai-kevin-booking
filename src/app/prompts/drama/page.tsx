'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import { 
  Clapperboard, 
  Film, 
  Play, 
  Pause, 
  Copy, 
  Check, 
  Search, 
  Sparkles, 
  ArrowLeft, 
  ExternalLink, 
  X, 
  Info, 
  Video, 
  Image as ImageIcon,
  SlidersHorizontal, 
  ChevronRight, 
  Flame, 
  Volume2, 
  VolumeX, 
  Maximize2,
  Dices,
  Wand2,
  Shuffle,
  ArrowRight,
  Download,
  Terminal,
  Layers,
  RefreshCw,
  CheckCircle2,
  ShieldCheck,
  Users,
  Eye,
  Sliders,
  PenTool,
  Palette,
  Camera,
  Repeat,
  Edit3
} from 'lucide-react';
import { dramaCatalog, getDramaMediaUrl, filterDramaItems } from '@/lib/drama-service';
import { DramaItem, DRAMA_GROUP_NOTES } from '@/lib/drama-types';
import { 
  DRAMA_PRESETS_200, 
  DRAMA_CATEGORIES_10, 
  TropePreset 
} from '@/data/drama-presets-200';

const DECK_KEY = 'kevin_drama_deck_200';
const HISTORY_KEY = 'kevin_drama_history_200';

function getShuffledDeck(): number[] {
  const arr = Array.from({ length: DRAMA_PRESETS_200.length }, (_, i) => i);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const A9_TROPE_PRESETS: TropePreset[] = DRAMA_PRESETS_200;

export default function DramaPromptsPage() {
  // Page mode: 'producer' (A9 Engine) or 'catalog' (77 pins)
  const [activeTab, setActiveTab] = useState<'producer' | 'catalog'>('producer');

  // Producer form states
  const [selectedTrope, setSelectedTrope] = useState<TropePreset>(A9_TROPE_PRESETS[0]);
  const [seriesTitle, setSeriesTitle] = useState('The Secret Heiress: ทายาทหมื่นล้านในคราบแม่บ้าน');
  const [synopsis, setSynopsis] = useState(A9_TROPE_PRESETS[0].synopsis);
  const [protagonistVoice, setProtagonistVoice] = useState(A9_TROPE_PRESETS[0].protagonistVoice);
  const [antagonistVoice, setAntagonistVoice] = useState(A9_TROPE_PRESETS[0].antagonistVoice);
  const [aspectRatio, setAspectRatio] = useState<'9:16' | '16:9'>('9:16');
  const [softImpact, setSoftImpact] = useState(true);
  const [isRandomizing, setIsRandomizing] = useState(false);
  const [outputTab, setOutputTab] = useState<'json' | 'storyboard' | 'bible' | 'editor'>('json');
  const [studioTool, setStudioTool] = useState<'dreamscript' | 'anycook' | 'dreamshot' | 'editor'>('dreamscript');

  // Interactive Live Storyboard Shots (Editable & Regenerable)
  const [liveShots, setLiveShots] = useState([
    {
      shot: 1,
      role: 'HOOK (0-2s)',
      title: 'ระเบิดความขัดแย้ง 2 วินาทีแรก',
      speaker: 'Antagonist',
      dialogue: 'แค่แม่บ้านกระจอกอย่างเธอ... มีสิทธิ์อะไรมามองหน้าฉันแบบนี้!',
      camera: 'Dramatic push-in on eyes with micro-drama intensity, 9:16 vertical look',
      action: 'โคลสอัปหน้าตัวร้ายตวาดลั่นล็อบบี้ นางเอกยืนนิ่งส่งสายตาเยือกเย็น',
      sfx: 'Sharp glass shatter, office silence, sub-bass riser'
    },
    {
      shot: 2,
      role: 'SETUP (2-6s)',
      title: 'วางเดิมพัน & สเตตัสทางสังคม',
      speaker: 'Protagonist',
      dialogue: 'คิดว่ามีอำนาจแล้วจะทำอะไรกับใครก็ได้เหรอคะ?',
      camera: 'Slow push-in tracking shot, low angle',
      action: 'นางเอกหันกลับมาช้าๆ สง่างามท่ามกลางสายตาอึ้งของพนักงานทั้งบริษัท',
      sfx: 'Whispers from crowd, ambient room silence'
    },
    {
      shot: 3,
      role: 'PRESSURE (6-10s)',
      title: 'กดดันถึงขีดสุด & ไร้ทางถอย',
      speaker: 'Antagonist',
      dialogue: 'ฉันสั่งให้ก้มกราบขอโทษเดี๋ยวนี้! อย่าให้ต้องใช้กำลัง!',
      camera: 'Handheld intense wobble push',
      action: 'ตัวร้ายก้าวเข้ามาข่มขู่พร้อมทีมการ์ด บรรยากาศตึงเครียดถึงขีดสุด',
      sfx: 'Heavy footsteps, dramatic heartbeat kick'
    },
    {
      shot: 4,
      role: 'TURN (10-14s)',
      title: 'จุดพลิกกระดาน & พลิกอำนาจ',
      speaker: 'Protagonist',
      dialogue: 'เอกสารแต่งตั้งประธานคนใหม่... เพิ่งเซ็นเมื่อ 5 นาทีที่แล้ว',
      camera: 'Whip pan to reveal gold folder / VIP phone call',
      action: 'นางเอกเปิดซองทองคำ บอร์ดผู้บริหารระดับสูงวิ่งกรูเข้ามาก้มคำนับนางเอก',
      sfx: 'Sharp sub-bass riser, orchestral sting'
    },
    {
      shot: 5,
      role: 'PAYOFF (14-18s)',
      title: 'สะใจผู้ดู & ตัวร้ายหน้าซีด',
      speaker: 'Antagonist',
      dialogue: 'ทะ... ท่านประธานตัวจริง... เป็นไปไม่ได้!',
      camera: 'Dramatic vertigo zoom-out on trembling antagonist',
      action: 'ตัวร้ายทรุดเข่าลงกับพื้น โทรศัพท์หลุดมือ หน้าถอดสีจนถึงขีดสุด',
      sfx: 'Deep silence 0.5s before line, followed by orchestral swell'
    },
    {
      shot: 6,
      role: 'CLIFFHANGER (18-22s)',
      title: 'ทิ้งปมพีค บังคับกดดูตอนต่อไป',
      speaker: 'Protagonist',
      dialogue: 'และคนที่ต้องถูกไล่ออกและดำเนินคดีตั้งแต่วินาทีนี้... คือคุณ',
      camera: 'Slow confident push-in to piercing eyes, cut to black',
      action: 'นางเอกพูดคำตัดสิน ประตูปิดลง ตัดเข้าจอดำทันที',
      sfx: 'Heavy cinematic braam, heartbeat pulse into abrupt silence'
    }
  ]);

  // Catalog states
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'clip' | 'image'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeItem, setActiveItem] = useState<DramaItem | null>(null);

  // 200 Zero-Duplicate Random Deck & Browser States
  const [randomCount, setRandomCount] = useState<number>(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('ทั้งหมด');
  const [isBrowseModalOpen, setIsBrowseModalOpen] = useState(false);
  const [modalSearch, setModalSearch] = useState('');
  const [modalCategory, setModalCategory] = useState('ทั้งหมด');

  // Global UI feedback states
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Initialize deck state from localStorage
  useEffect(() => {
    try {
      const historyStr = localStorage.getItem(HISTORY_KEY);
      if (historyStr) {
        const history = JSON.parse(historyStr);
        if (Array.isArray(history)) {
          setRandomCount(history.length);
        }
      }
    } catch {}
  }, []);

  // Group count calculation for catalog
  const groupCounts = useMemo(() => {
    const counts: Record<string, number> = { all: dramaCatalog.items.length };
    dramaCatalog.items.forEach(item => {
      counts[item.group] = (counts[item.group] || 0) + 1;
    });
    return counts;
  }, []);

  // Filtered items for catalog
  const filteredItems = useMemo(() => {
    return filterDramaItems(dramaCatalog.items, selectedGroup, typeFilter, searchQuery);
  }, [selectedGroup, typeFilter, searchQuery]);

  // Filtered presets for Section 1
  const section1Presets = useMemo(() => {
    if (selectedCategory === 'ทั้งหมด') {
      return DRAMA_PRESETS_200.slice(0, 20);
    }
    return DRAMA_PRESETS_200.filter(p => p.category === selectedCategory);
  }, [selectedCategory]);

  // Filtered presets for Modal
  const modalFilteredPresets = useMemo(() => {
    const q = modalSearch.trim().toLowerCase();
    return DRAMA_PRESETS_200.filter(p => {
      const matchCat = modalCategory === 'ทั้งหมด' || p.category === modalCategory;
      if (!matchCat) return false;
      if (!q) return true;
      return (
        p.titleTh.toLowerCase().includes(q) ||
        p.title.toLowerCase().includes(q) ||
        p.synopsis.toLowerCase().includes(q) ||
        p.hookLine.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        p.badge.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    });
  }, [modalSearch, modalCategory]);

  // Handle trope selection
  const handleSelectTrope = (trope: TropePreset) => {
    setSelectedTrope(trope);
    setSynopsis(trope.synopsis);
    setProtagonistVoice(trope.protagonistVoice);
    setAntagonistVoice(trope.antagonistVoice);
    setSeriesTitle(`${trope.title}: ${trope.titleTh}`);
    
    // Update live shots with the newly selected trope's dialogue, camera and SFX
    const protagName = trope.protagonistVoice.split(':')[0]?.trim() || 'Protagonist';
    const antagName = trope.antagonistVoice.split(':')[0]?.trim() || 'Antagonist';

    setLiveShots([
      {
        shot: 1,
        role: 'HOOK (0-2s)',
        title: 'ระเบิดความขัดแย้ง 2 วินาทีแรก',
        speaker: antagName,
        dialogue: trope.hookLine,
        camera: trope.cameraMotion,
        action: `โคลสอัปหน้า ${antagName} ตวาดข่มขู่ในบรรยากาศ ${trope.colorTone} โดยมี ${protagName} ยืนนิ่งสายตาเยือกเย็น`,
        sfx: trope.sfx
      },
      {
        shot: 2,
        role: 'SETUP (2-6s)',
        title: 'วางเดิมพัน & สเตตัสทางสังคม',
        speaker: protagName,
        dialogue: 'คิดว่ามีอำนาจแล้วจะทำอะไรกับใครก็ได้เหรอคะ?',
        camera: 'Slow push-in tracking shot, low angle',
        action: `${protagName} หันกลับมาช้าๆ ส่งสายตาสง่างามเหนือชั้น ท่ามกลางคนรอบข้าง`,
        sfx: 'Whispers from crowd, ambient room silence'
      },
      {
        shot: 3,
        role: 'PRESSURE (6-10s)',
        title: 'กดดันถึงขีดสุด & ไร้ทางถอย',
        speaker: antagName,
        dialogue: 'ฉันสั่งให้คุกเข่าขอโทษเดี๋ยวนี้! อย่าให้ต้องใช้กำลัง!',
        camera: 'Handheld intense wobble push',
        action: `${antagName} สั่งการ์ดล้อมข่มขู่ บรรยากาศตึงเครียดตามกฎ Soft Impact`,
        sfx: 'Heavy footsteps, dramatic heartbeat kick'
      },
      {
        shot: 4,
        role: 'TURN (10-14s)',
        title: 'จุดพลิกกระดาน & พลิกอำนาจ',
        speaker: protagName,
        dialogue: 'เอกสารแต่งตั้งประธานคนใหม่... เพิ่งเซ็นเมื่อ 5 นาทีที่แล้ว',
        camera: 'Whip pan to reveal gold folder / VIP phone call',
        action: `${protagName} เผยตราประทับหรือเอกสารลับ บอร์ดผู้บริหารระดับสูงวิ่งเข้ามาก้มคำนับ`,
        sfx: 'Sharp sub-bass riser, orchestral sting'
      },
      {
        shot: 5,
        role: 'PAYOFF (14-18s)',
        title: 'สะใจผู้ดู & ตัวร้ายหน้าซีด',
        speaker: antagName,
        dialogue: 'ทะ... ท่านประธานตัวจริง... เป็นไปไม่ได้!',
        camera: 'Dramatic vertigo zoom-out on trembling antagonist',
        action: `${antagName} ทรุดเข่าลงกับพื้น หน้าถอดสี แววตาหวาดผวาถึงขีดสุด`,
        sfx: 'Deep silence 0.5s before line, followed by orchestral swell'
      },
      {
        shot: 6,
        role: 'CLIFFHANGER (18-22s)',
        title: 'ทิ้งปมพีค บังคับกดดูตอนต่อไป',
        speaker: protagName,
        dialogue: 'และคนที่ต้องถูกไล่ออกและดำเนินคดีตั้งแต่วินาทีนี้... คือคุณ',
        camera: 'Slow confident push-in to piercing eyes, cut to black',
        action: `${protagName} ประกาศคำตัดสินขั้นเด็ดขาด ประตูลิฟต์ปิดลงตัดเข้าจอดำ`,
        sfx: 'Heavy cinematic braam, heartbeat pulse into abrupt silence'
      }
    ]);
  };

  // Trigger celebration confetti
  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 75,
        spread: 65,
        origin: { y: 0.6 },
        colors: ['#fbbf24', '#f59e0b', '#ec4899', '#6366f1', '#10b981']
      });
    } catch {}
  };

  // Zero-duplicate Fisher-Yates Randomizer across 200 Presets
  const handleRandomizeDrama = () => {
    setIsRandomizing(true);
    try {
      let deck: number[] = [];
      let history: number[] = [];
      try {
        deck = JSON.parse(localStorage.getItem(DECK_KEY) || '[]');
        history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
      } catch {}

      if (!Array.isArray(deck) || deck.length === 0) {
        deck = getShuffledDeck();
        history = [];
      }

      const nextIndex = deck.pop()!;
      history.push(nextIndex);

      try {
        localStorage.setItem(DECK_KEY, JSON.stringify(deck));
        localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
      } catch {}

      const trope = DRAMA_PRESETS_200[nextIndex] || DRAMA_PRESETS_200[0];
      setRandomCount(history.length);

      setTimeout(() => {
        handleSelectTrope(trope);
        setIsRandomizing(false);
        triggerConfetti();
        const remaining = 200 - history.length;
        setToastMessage(`🎲 สุ่มแบบที่ ${history.length}/200: "${trope.titleTh}" (${trope.category}) — เหลืออีก ${remaining} แบบไม่ซ้ำ`);
        setTimeout(() => setToastMessage(null), 3500);
      }, 250);
    } catch {
      setIsRandomizing(false);
    }
  };

  const handleResetDeck = () => {
    const newDeck = getShuffledDeck();
    try {
      localStorage.setItem(DECK_KEY, JSON.stringify(newDeck));
      localStorage.setItem(HISTORY_KEY, JSON.stringify([]));
    } catch {}
    setRandomCount(0);
    setToastMessage('🔄 รีเซ็ตคลังสุ่ม 200 แบบเรียบร้อย (เริ่มนับ 0/200 ใหม่)');
    setTimeout(() => setToastMessage(null), 3000);
  };

  // GENERATED OUTPUT 1: EXACT GOOGLE FLOW & KLING VIDEO PROMPT JSON (Section 10.11 spec)
  const generatedVideoJson = useMemo(() => {
    const protagName = protagonistVoice.split(':')[0] || 'Mali';
    const antagName = antagonistVoice.split(':')[0] || 'Krit';

    const shots = liveShots.map((ls, idx) => ({
      shot: idx + 1,
      role: ls.role,
      dialogue: ls.dialogue,
      speaker: ls.speaker,
      timing: `speech starts at 0.3s and ends before ${(idx === 0 ? 3.8 : 4.5).toFixed(1)}s`,
      camera_movement: ls.camera,
      acting_energy: idx === 0 ? 'aggressive condescending outburst' : idx === 4 ? 'pure terror and shock' : 'high dramatic retention',
      scene_action: ls.action,
      sfx: ls.sfx
    }));

    const output = {
      project: seriesTitle,
      trope_code: selectedTrope.code,
      engine: 'Google Flow Drama Beat Engine V5.0',
      aspect_ratio: aspectRatio,
      soft_impact_rule: softImpact ? 'ENFORCED: Never show contact at impact; cut on reaction' : 'OFF',
      voice_locks: {
        [protagName]: protagonistVoice,
        [antagName]: antagonistVoice
      },
      shots: shots.map(s => ({
        shot_number: s.shot,
        beat_role: s.role,
        audio: {
          type: 'lip_sync_dialogue',
          spoken_language: 'Thai (Central Thai accent)',
          speaker: s.speaker,
          line: s.dialogue,
          timing: s.timing,
          delivery: s.acting_energy,
          others: 'everyone else keeps lips closed and reacts silently'
        },
        scene_action: s.scene_action,
        camera_movement: s.camera_movement,
        sfx: s.sfx,
        music: 'NO MUSIC (clean stem for AI video generator)',
        aspect_ratio: aspectRatio,
        render_rules: 'maintain character face consistency; zero text overlays; zero subtitles'
      }))
    };

    return JSON.stringify(output, null, 2);
  }, [selectedTrope, seriesTitle, protagonistVoice, antagonistVoice, aspectRatio, softImpact, liveShots]);

  // GENERATED OUTPUT 2: FULL STORYBOARD & SCREENPLAY
  const generatedStoryboardText = useMemo(() => {
    return `# สตูดิโอละครสั้น AI GENERATOR: SCREENPLAY & SHOT STORYBOARD
TITLE: ${seriesTitle}
TROPE: ${selectedTrope.title} (${selectedTrope.titleTh}) [${selectedTrope.code}]
ASPECT RATIO: ${aspectRatio} | SOFT IMPACT RULE: ${softImpact ? 'ENABLED' : 'DISABLED'}

==================================================
## 0. PREMISE, CHARACTERS & ANYCOOK VISUAL ASSETS
==================================================
SYNOPSIS:
${synopsis}

VOICE LOCKS & CAST:
- PROTAGONIST: ${protagonistVoice}
- ANTAGONIST: ${antagonistVoice}

COLOR TONE & LIGHTING:
${selectedTrope.colorTone}

==================================================
## 1. DREAMSHOT 6-BEAT EPISODIC BREAKDOWN
==================================================

${liveShots.map(ls => `### SHOT ${ls.shot} [${ls.role}] · ${ls.title}
- Speaker: ${ls.speaker}
- Dialogue (Thai): "${ls.dialogue}"
- Visual Action: ${ls.action}
- Camera Movement: ${ls.camera}
- SFX Stem: ${ls.sfx}
`).join('\n')}`;
  }, [selectedTrope, seriesTitle, synopsis, protagonistVoice, antagonistVoice, aspectRatio, softImpact, liveShots]);

  // GENERATED OUTPUT 3: SERIES BIBLE JSON (Section 11 spec)
  const generatedBibleJson = useMemo(() => {
    const protagName = protagonistVoice.split(':')[0] || 'Mali';
    const antagName = antagonistVoice.split(':')[0] || 'Krit';

    const bible = {
      a9Series: true,
      version: 5,
      title: seriesTitle,
      trope: selectedTrope.code,
      arc: [
        {
          ep: 1,
          arcBeat: 'Inciting Incident & Public Humiliation',
          outline: synopsis.slice(0, 120),
          cliffType: 'cl1_revelation',
          cliffLine: 'และคนที่ต้องถูกไล่ออกและดำเนินคดีตั้งแต่วินาทีนี้... คือคุณ'
        }
      ],
      characters: [
        {
          id: 'c1',
          name: protagName,
          dramaRole: 'protagonist',
          gender: 'Female',
          voiceLock: protagonistVoice
        },
        {
          id: 'c2',
          name: antagName,
          dramaRole: 'antagonist',
          gender: 'Male',
          voiceLock: antagonistVoice
        }
      ],
      secrets: [
        {
          id: 's1',
          text: 'The true heir of the multi-billion empire is undercover',
          knownBy: ['c1'],
          revealEp: 1,
          revealedTo: ['c2']
        }
      ]
    };
    return JSON.stringify(bible, null, 2);
  }, [seriesTitle, selectedTrope, synopsis, protagonistVoice, antagonistVoice]);

  // Copy active output
  const handleCopyActiveOutput = () => {
    let textToCopy = generatedVideoJson;
    if (outputTab === 'storyboard') textToCopy = generatedStoryboardText;
    if (outputTab === 'bible') textToCopy = generatedBibleJson;

    navigator.clipboard.writeText(textToCopy);
    setCopiedId('producer-output');
    triggerConfetti();
    setToastMessage('คัดลอก Master Prompt ละครสั้นเรียบร้อยแล้ว!');

    setTimeout(() => {
      setCopiedId(null);
      setToastMessage(null);
    }, 2800);
  };

  // Download active output
  const handleDownloadOutput = () => {
    let content = generatedVideoJson;
    let ext = 'json';
    if (outputTab === 'storyboard') {
      content = generatedStoryboardText;
      ext = 'md';
    } else if (outputTab === 'bible') {
      content = generatedBibleJson;
      ext = 'json';
    }

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `a9-drama-${selectedTrope.code}.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Copy Prompt to clipboard for catalog pins
  const handleCopyCatalogPrompt = (e: React.MouseEvent, item: DramaItem) => {
    e.stopPropagation();
    const promptText = item.metaPrompt || item.lines?.join('\n') || item.beat || item.label;
    navigator.clipboard.writeText(promptText);
    setCopiedId(item.id);
    setToastMessage(`คัดลอก Prompt "${item.label}" เรียบร้อยแล้ว!`);

    setTimeout(() => {
      setCopiedId(null);
      setToastMessage(null);
    }, 2800);
  };

  return (
    <div className="min-h-screen bg-[#070d18] text-slate-100 flex flex-col selection:bg-amber-400 selection:text-slate-950 pb-20">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-slate-900/95 border border-amber-400/40 text-amber-300 shadow-2xl shadow-black/80 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="w-6 h-6 rounded-lg bg-amber-400/20 text-amber-400 flex items-center justify-center">
            <Check className="w-3.5 h-3.5" />
          </div>
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Top Breadcrumb & Navigation */}
      <div className="bg-[#0a1220]/90 border-b border-white/10 px-4 sm:px-6 py-3 sticky top-20 z-30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
            <Link
              href="/prompts"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-white/5 transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Prompt Hub</span>
            </Link>
            <div className="h-4 w-px bg-white/10 hidden sm:block" />
            <Link
              href="/prompts/video"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-pink-400 hover:text-pink-300 bg-pink-500/10 hover:bg-pink-500/20 px-3 py-1.5 rounded-lg border border-pink-500/20 transition-all"
            >
              <Video className="w-3.5 h-3.5" />
              <span>Prompt Video</span>
            </Link>
            <div className="h-4 w-px bg-white/10 hidden sm:block" />
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 bg-amber-400/10 px-3 py-1.5 rounded-lg border border-amber-400/30">
              <Clapperboard className="w-3.5 h-3.5" />
              <span>สตูดิโอละครสั้น AI Generator</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="https://flow.google.com/project/e01ae45f-d33a-446f-99ea-798fe0d49c65"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 transition-all"
            >
              <span>Google Flow</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <Link
              href="/#classes"
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-400 to-amber-300 text-slate-950 shadow-md shadow-amber-400/20 hover:from-amber-300 hover:to-amber-200 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>เวิร์กช็อป AI Creator</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Hero Header */}
      <section className="relative overflow-hidden pt-8 pb-6 px-4 sm:px-6 lg:px-8 border-b border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(245,158,11,0.15),rgba(255,255,255,0))]" />
        
        <div className="relative max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/90 border border-amber-400/30 text-amber-400 text-xs font-semibold mb-4 shadow-lg shadow-amber-400/10">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span className="uppercase tracking-wider font-bold">AI SHORT DRAMA DIGITAL STUDIO</span>
            <span className="text-slate-400 font-normal">· พร้อม AI Suggestion Random 200+ แบบ</span>
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight mb-3">
            สตูดิโอละครสั้น <br className="sm:hidden" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500">
              AI Generator &amp; Director Suite
            </span>
          </h1>
          
          <p className="text-xs sm:text-sm text-slate-300 max-w-3xl mx-auto leading-relaxed mb-6 font-normal">
            ระบบดิจิทัลสตูดิโอสร้างละครสั้นและซีรีส์แนวตั้งครบวงจรด้วย AI พร้อม <strong>AI Suggestion Random กว่า 200+ แบบ</strong> พร้อมชื่อตัวละคร ล็อคเสียงพากย์ 
            รองรับ <strong>✍️ DreamScript</strong> (เขียนบท/ดัดแปลงบท), <strong>🎨 Anycook</strong> (สร้างตัวละคร + ฉาก), <strong>🎥 DreamShot</strong> (สตอรีบอร์ด + จัดมุมกล้อง) 
            และ <strong>🔁 ตัดต่อ เปลี่ยนช็อต สร้างเสียงใหม่</strong> ได้ในระบบเต็มรูปแบบ
          </p>

          {/* 4 Core Pillars Pills */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 max-w-4xl mx-auto mb-6 text-left">
            <div className="p-3 rounded-2xl bg-slate-900/80 border border-white/10 hover:border-amber-400/40 transition-all">
              <div className="flex items-center gap-2 text-amber-300 font-bold text-xs mb-1">
                <PenTool className="w-3.5 h-3.5" />
                <span>✍️ DreamScript</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">เขียนบท / ดัดแปลงบท วาง Hook 2 วินาทีแรก และปมขัดแย้ง</p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900/80 border border-white/10 hover:border-emerald-400/40 transition-all">
              <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs mb-1">
                <Palette className="w-3.5 h-3.5" />
                <span>🎨 Anycook</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">สร้างตัวละคร + ฉาก ล็อคใบหน้า เสื้อผ้า และบรรยากาศ</p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900/80 border border-white/10 hover:border-blue-400/40 transition-all">
              <div className="flex items-center gap-2 text-blue-300 font-bold text-xs mb-1">
                <Camera className="w-3.5 h-3.5" />
                <span>🎥 DreamShot</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">สตอรีบอร์ด 6 ช็อต จัดมุมกล้อง กำกับ Push-in, Vertigo</p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900/80 border border-white/10 hover:border-purple-400/40 transition-all">
              <div className="flex items-center gap-2 text-purple-300 font-bold text-xs mb-1">
                <Repeat className="w-3.5 h-3.5" />
                <span>🔁 ตัดต่อ/สร้างเสียง</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">เปลี่ยนช็อต สร้างเสียงพากย์ใหม่ Voice Lock ในระบบเต็มรูปแบบ</p>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="inline-flex p-1 rounded-2xl bg-slate-900/90 border border-white/10 shadow-xl max-w-md w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('producer')}
              className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'producer'
                  ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-lg shadow-amber-400/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Clapperboard className="w-4 h-4" />
              <span>สตูดิโอละครสั้น AI (Studio Suite)</span>
            </button>
            <button
              onClick={() => setActiveTab('catalog')}
              className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'catalog'
                  ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-lg shadow-amber-400/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Film className="w-4 h-4" />
              <span>คลัง 77 ตัวอย่างละคร (Catalog)</span>
            </button>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* MODE 1: A9 MICRO-DRAMA & SHORT FILM PRODUCER WORKSPACE   */}
      {/* ======================================================== */}
      {activeTab === 'producer' && (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
          
          {/* Top Google Flow Sync Bar */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-amber-500/10 border border-indigo-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center shrink-0">
                <Terminal className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500 text-white uppercase">
                    GOOGLE FLOW SYNC
                  </span>
                  <span className="text-xs font-semibold text-white">
                    เชื่อมต่อโครงสร้าง Tool Builder & Kling / Veo AI
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  สร้าง Prompt จากหน้านี้ แล้วกดเปิด Google Flow เพื่อรันช็อตวิดีโอสร้างหนังสั้นได้ทันที
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto flex-wrap">
              <button
                onClick={handleRandomizeDrama}
                disabled={isRandomizing}
                className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black shadow-md shadow-amber-400/20 transition-all flex items-center justify-center gap-1.5"
                title="สุ่มทีละแบบจาก 200 ไอเดียละครสั้นโดยไม่ซ้ำกันเลย"
              >
                <Dices className={`w-4 h-4 ${isRandomizing ? 'animate-spin' : ''}`} />
                <span>🎲 สุ่ม 200 แบบ (ไม่ซ้ำ)</span>
              </button>

              <span className="px-2.5 py-1.5 rounded-xl bg-amber-400/15 text-amber-300 border border-amber-400/30 font-mono text-xs font-bold" title="สุ่มไปแล้ว / จากทั้งหมด 200 แบบ">
                {randomCount}/200
              </span>

              <button
                onClick={() => setIsBrowseModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold border border-amber-400/30 transition-all flex items-center gap-1.5"
              >
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                <span>📋 คลัง 200 ไอเดีย</span>
              </button>

              <a
                href="https://flow.google.com/project/e01ae45f-d33a-446f-99ea-798fe0d49c65"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-white/10 transition-all flex items-center gap-1.5"
              >
                <span>เปิดใน Google Flow</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* 1. SELECT TROPE PRESET (200 PRESETS IN 10 CATEGORIES) */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-amber-400" />
                  <span>1. เลือกพล็อต &amp; Trope ละครสั้น (200 คลังไอเดียระดับโปร ไม่ซ้ำกัน)</span>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                    200 PRESETS
                  </span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  เลือกแนวเรื่องจาก 10 หมวดหลัก หรือเปิดคลัง 200 ไอเดียเพื่อค้นหาและเลือกใช้งานทันที
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsBrowseModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 text-amber-300 border border-amber-400/40 text-xs font-bold transition flex items-center gap-1.5 shadow-md"
                >
                  <Layers className="w-3.5 h-3.5 text-amber-400" />
                  <span>ดูครบ 200 แบบ</span>
                </button>
                <button
                  onClick={handleRandomizeDrama}
                  disabled={isRandomizing}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black transition flex items-center gap-1.5 shadow-md shadow-amber-400/20"
                >
                  <Dices className={`w-3.5 h-3.5 ${isRandomizing ? 'animate-spin' : ''}`} />
                  <span>สุ่ม ({randomCount}/200)</span>
                </button>
              </div>
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none mb-3">
              {DRAMA_CATEGORIES_10.map((cat) => {
                const isCatActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all border ${
                      isCatActive
                        ? 'bg-amber-400 text-slate-950 font-bold border-amber-400 shadow-md shadow-amber-400/20'
                        : 'bg-slate-900/80 text-slate-300 hover:text-white border-white/10 hover:border-white/20'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {section1Presets.map((trope) => {
                const isSelected = selectedTrope.id === trope.id;
                return (
                  <button
                    key={trope.id}
                    onClick={() => handleSelectTrope(trope)}
                    className={`p-3.5 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#15233c] border-amber-400 shadow-xl shadow-amber-400/10 ring-2 ring-amber-400/30'
                        : 'bg-slate-900/60 border-white/5 hover:border-white/20 hover:bg-slate-900'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-2">
                        <span className="text-[10px] font-mono text-amber-400 font-bold">
                          {trope.code}
                        </span>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-white/5 text-slate-300">
                          {trope.badge}
                        </span>
                      </div>
                      <h3 className="text-xs font-bold text-white line-clamp-1 mb-1">
                        {trope.titleTh}
                      </h3>
                      <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                        {trope.title}
                      </p>
                    </div>

                    <div className="pt-2.5 mt-2 border-t border-white/5 flex items-center justify-between text-[10px]">
                      <span className={isSelected ? 'text-amber-400 font-bold' : 'text-slate-500'}>
                        {isSelected ? 'กำลังเลือก' : 'เลือกใช้'}
                      </span>
                      <ArrowRight className={`w-3 h-3 ${isSelected ? 'text-amber-400' : 'text-slate-500'}`} />
                    </div>
                  </button>
                );
              })}
            </div>
            
            {selectedCategory === 'ทั้งหมด' && (
              <div className="mt-3 text-center">
                <button
                  onClick={() => setIsBrowseModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-400/30 text-xs font-bold transition inline-flex items-center gap-1.5"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>แสดง 20 รายการแรก · คลิกเพื่อเปิดดูคลังเต็ม 200 รายการ →</span>
                </button>
              </div>
            )}
          </div>

          {/* 2. PRODUCER WORKSPACE: 4 CORE PILLARS (DREAMSCRIPT · ANYCOOK · DREAMSHOT · ตัดต่อ/สร้างเสียง) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* LEFT COLUMN: Input Configuration Form with 4 Studio Pillars */}
            <div className="lg:col-span-5 bg-[#0e1828] border border-white/10 rounded-3xl p-6 shadow-2xl relative space-y-4">
              
              {/* Studio Tool Selection Tabs */}
              <div className="grid grid-cols-4 gap-1 p-1 bg-slate-900 rounded-2xl border border-white/5 text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setStudioTool('dreamscript')}
                  className={`py-2 px-1 rounded-xl text-center transition flex flex-col items-center justify-center gap-0.5 ${
                    studioTool === 'dreamscript' ? 'bg-amber-400 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <PenTool className="w-3.5 h-3.5" />
                  <span>✍️ DreamScript</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStudioTool('anycook')}
                  className={`py-2 px-1 rounded-xl text-center transition flex flex-col items-center justify-center gap-0.5 ${
                    studioTool === 'anycook' ? 'bg-emerald-400 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Palette className="w-3.5 h-3.5" />
                  <span>🎨 Anycook</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStudioTool('dreamshot');
                    setOutputTab('storyboard');
                  }}
                  className={`py-2 px-1 rounded-xl text-center transition flex flex-col items-center justify-center gap-0.5 ${
                    studioTool === 'dreamshot' ? 'bg-blue-400 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>🎥 DreamShot</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStudioTool('editor');
                    setOutputTab('editor');
                  }}
                  className={`py-2 px-1 rounded-xl text-center transition flex flex-col items-center justify-center gap-0.5 ${
                    studioTool === 'editor' ? 'bg-purple-400 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Repeat className="w-3.5 h-3.5" />
                  <span>🔁 ตัดต่อ/เสียง</span>
                </button>
              </div>

              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block">
                    {studioTool === 'dreamscript' && '✍️ DREAMSCRIPT — เขียนบท / ดัดแปลงบท'}
                    {studioTool === 'anycook' && '🎨 ANYCOOK — สร้างตัวละคร + ฉาก'}
                    {studioTool === 'dreamshot' && '🎥 DREAMSHOT — สตอรีบอร์ด + จัดมุมกล้อง'}
                    {studioTool === 'editor' && '🔁 ตัดต่อ เปลี่ยนช็อต สร้างเสียงใหม่'}
                  </span>
                  <h3 className="text-base font-bold text-white mt-0.5">
                    {selectedTrope.titleTh}
                  </h3>
                </div>

                <button
                  onClick={handleRandomizeDrama}
                  title="สุ่มไอเดียใหม่จาก 200 แบบ"
                  className="px-2.5 py-1.5 rounded-xl bg-amber-400/10 text-amber-400 hover:bg-amber-400/20 text-xs font-bold transition flex items-center gap-1 shrink-0"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                  <span>สุ่ม ({randomCount}/200)</span>
                </button>
              </div>

              {/* Title Input */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  ชื่อโปรเจกต์ / ชื่อเรื่อง (Title)
                </label>
                <input
                  type="text"
                  value={seriesTitle}
                  onChange={(e) => setSeriesTitle(e.target.value)}
                  className="w-full bg-[#080f1a] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Synopsis Input */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  เรื่องย่อ & ปมขัดแย้งหลัก (Dramatic Synopsis)
                </label>
                <textarea
                  rows={4}
                  value={synopsis}
                  onChange={(e) => setSynopsis(e.target.value)}
                  className="w-full bg-[#080f1a] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400 leading-relaxed font-sans"
                />
              </div>

              {/* Voice Lock Inputs */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-amber-400 flex items-center gap-1">
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Voice Lock (สูตรคุมเสียงตัวละครภาษาไทย)</span>
                  </label>
                  <span className="text-[10px] text-slate-500">AI TTS Spec</span>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[11px] text-slate-400 font-medium">ตัวเอก (Protagonist):</span>
                  <input
                    type="text"
                    value={protagonistVoice}
                    onChange={(e) => setProtagonistVoice(e.target.value)}
                    className="w-full bg-[#080f1a] border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-amber-400 font-mono text-[11px]"
                  />
                </div>

                <div className="space-y-1.5">
                  <span className="text-[11px] text-slate-400 font-medium">ตัวร้าย (Antagonist):</span>
                  <input
                    type="text"
                    value={antagonistVoice}
                    onChange={(e) => setAntagonistVoice(e.target.value)}
                    className="w-full bg-[#080f1a] border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-amber-400 font-mono text-[11px]"
                  />
                </div>
              </div>

              {/* Settings: Aspect Ratio & Soft Impact Rule */}
              <div className="pt-2 grid grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400 font-medium">สัดส่วนวิดีโอ (Ratio):</label>
                  <div className="flex rounded-xl bg-[#080f1a] p-1 border border-white/10">
                    <button
                      type="button"
                      onClick={() => setAspectRatio('9:16')}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${
                        aspectRatio === '9:16' ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      9:16 แนวตั้ง
                    </button>
                    <button
                      type="button"
                      onClick={() => setAspectRatio('16:9')}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${
                        aspectRatio === '16:9' ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      16:9 แนวนอน
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400 font-medium">Soft Impact Safety:</label>
                  <button
                    type="button"
                    onClick={() => setSoftImpact(!softImpact)}
                    className={`w-full py-2 px-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition ${
                      softImpact
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        : 'bg-slate-800 border-white/10 text-slate-400'
                    }`}
                  >
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{softImpact ? 'เปิดความปลอดภัย' : 'ปิด'}</span>
                    </span>
                    <span className="text-[10px]">{softImpact ? '✓' : '✕'}</span>
                  </button>
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="pt-3 space-y-2">
                <button
                  type="button"
                  onClick={handleCopyActiveOutput}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-amber-400/25 transition-all flex items-center justify-center gap-2 border border-amber-200/50"
                >
                  {copiedId === 'producer-output' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedId === 'producer-output' ? 'คัดลอก Master Prompt แล้ว!' : 'คัดลอก Master Prompt ละครสั้น'}</span>
                </button>

                <div className="flex items-center gap-2">
                  <a
                    href="https://flow.google.com/project/e01ae45f-d33a-446f-99ea-798fe0d49c65"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2.5 px-3 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 font-bold text-xs border border-indigo-500/40 transition flex items-center justify-center gap-1.5"
                  >
                    <span>เปิด Google Flow</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <button
                    type="button"
                    onClick={handleDownloadOutput}
                    className="py-2.5 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-white/5 transition flex items-center gap-1"
                    title="ดาวน์โหลดไฟล์"
                  >
                    <Download className="w-3.5 h-3.5 text-amber-400" />
                    <span>.{outputTab === 'storyboard' ? 'md' : 'json'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Real-Time Preview Terminal with Tabs */}
            <div className="lg:col-span-7 bg-[#0b1320] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
              
              {/* Terminal Tab Bar */}
              <div className="bg-[#0e1828] px-4 py-3 border-b border-white/10 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 mr-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                  </div>

                  <div className="flex rounded-xl bg-slate-900/80 p-0.5 border border-white/5 flex-wrap">
                    <button
                      onClick={() => setOutputTab('editor')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1 ${
                        outputTab === 'editor' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Repeat className="w-3.5 h-3.5" />
                      <span>🔁 สตูดิโอตัดต่อ & แก้ช็อต</span>
                    </button>
                    <button
                      onClick={() => setOutputTab('json')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                        outputTab === 'json' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Google Flow JSON
                    </button>
                    <button
                      onClick={() => setOutputTab('storyboard')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                        outputTab === 'storyboard' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      DreamShot Storyboard
                    </button>
                    <button
                      onClick={() => setOutputTab('bible')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                        outputTab === 'bible' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Series Bible
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyActiveOutput}
                    className="px-3 py-1.5 rounded-lg bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 text-xs font-bold border border-amber-400/30 transition flex items-center gap-1"
                  >
                    {copiedId === 'producer-output' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedId === 'producer-output' ? 'คัดลอกแล้ว!' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Terminal Code Display or Interactive Shot Editor */}
              <div className="p-5 font-mono text-xs leading-relaxed text-slate-300 max-h-[580px] overflow-y-auto whitespace-pre-wrap select-text bg-[#070d17]/90 font-sans">
                {outputTab === 'editor' && (
                  <div className="space-y-4">
                    <div className="p-3 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-between text-xs text-amber-300">
                      <div className="flex items-center gap-2">
                        <Repeat className="w-4 h-4 text-amber-400" />
                        <span><strong>🔁 สตูดิโอตัดต่อ &amp; จัดการช็อตสด:</strong> แก้ไขคำพูด, สลับมุมกล้อง หรือเปลี่ยน Sound FX ของแต่ละช็อตได้แบบ Real-time</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          handleSelectTrope(selectedTrope);
                          setToastMessage('รีเซ็ตช็อตกลับเป็นค่าเริ่มต้นของพล็อตนี้เรียบร้อย');
                          setTimeout(() => setToastMessage(null), 2500);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-amber-400/20 hover:bg-amber-400/30 text-amber-200 text-[11px] font-bold"
                      >
                        คืนค่าเดิม
                      </button>
                    </div>

                    <div className="space-y-3 font-sans">
                      {liveShots.map((shot, idx) => (
                        <div key={idx} className="p-3.5 rounded-2xl bg-slate-900/90 border border-white/10 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded-lg bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center">
                                {shot.shot}
                              </span>
                              <span className="text-xs font-bold text-white">
                                {shot.role} · {shot.title}
                              </span>
                            </div>
                            <span className="text-[11px] font-semibold text-amber-400">
                              ผู้พูด: {shot.speaker}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                            <div className="space-y-1">
                              <label className="text-[10px] text-slate-400 block font-semibold">บทพูดตัวละคร (Lip-Sync Line):</label>
                              <input
                                type="text"
                                value={shot.dialogue}
                                onChange={(e) => {
                                  const updated = [...liveShots];
                                  updated[idx].dialogue = e.target.value;
                                  setLiveShots(updated);
                                }}
                                className="w-full bg-[#080f1a] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-amber-300 focus:outline-none focus:border-amber-400"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[10px] text-slate-400 block font-semibold">มุมกล้อง (DreamShot Camera):</label>
                              <input
                                type="text"
                                value={shot.camera}
                                onChange={(e) => {
                                  const updated = [...liveShots];
                                  updated[idx].camera = e.target.value;
                                  setLiveShots(updated);
                                }}
                                className="w-full bg-[#080f1a] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-400 font-mono text-[11px]"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                            <div className="space-y-1">
                              <label className="text-[10px] text-slate-400 block font-semibold">การกระทำในช็อต (Visual Action):</label>
                              <input
                                type="text"
                                value={shot.action}
                                onChange={(e) => {
                                  const updated = [...liveShots];
                                  updated[idx].action = e.target.value;
                                  setLiveShots(updated);
                                }}
                                className="w-full bg-[#080f1a] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-amber-400"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[10px] text-slate-400 block font-semibold">เสียงประกอบ (Sound & SFX Stem):</label>
                              <input
                                type="text"
                                value={shot.sfx}
                                onChange={(e) => {
                                  const updated = [...liveShots];
                                  updated[idx].sfx = e.target.value;
                                  setLiveShots(updated);
                                }}
                                className="w-full bg-[#080f1a] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-amber-400 font-mono text-[11px]"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {outputTab === 'json' && generatedVideoJson}
                {outputTab === 'storyboard' && generatedStoryboardText}
                {outputTab === 'bible' && generatedBibleJson}
              </div>

              {/* Terminal Footer */}
              <div className="bg-[#0e1828]/90 px-5 py-3 border-t border-white/5 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>พร้อมนำไปสั่งการใน Google Flow, Kling AI v1.5, Runway Gen-3 และ Claude 3.7</span>
                </span>
                <span className="text-amber-400 font-mono">
                  {selectedTrope.code} · A9 Drama Beat V5.0
                </span>
              </div>
            </div>

          </div>

        </main>
      )}

      {/* ======================================================== */}
      {/* MODE 2: PINTEREST 77-STYLE CATALOG GALLERY SECTION       */}
      {/* ======================================================== */}
      {activeTab === 'catalog' && (
        <main className="flex-1 max-w-[1440px] w-full mx-auto px-3 sm:px-6 lg:px-8 py-6">
          
          {/* Sticky Filter & Search Bar */}
          <div className="sticky top-[133px] z-20 pb-4 pt-2 bg-[#070d18]/95 backdrop-blur-xl border-b border-white/5 space-y-3">
            
            {/* Search + Media Type Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ค้นหาแนวเรื่อง, บทพูด, สไตล์ภาพ, หรือ Prompt..."
                  className="w-full pl-10 pr-9 py-2 rounded-xl bg-slate-900/90 border border-white/10 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/50 transition-all shadow-inner"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    title="ล้างคำค้นหา"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Media Type Filter */}
              <div className="flex items-center gap-1.5 bg-slate-900/90 border border-white/10 p-1 rounded-xl shrink-0 self-start sm:self-auto">
                <button
                  onClick={() => setTypeFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    typeFilter === 'all'
                      ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  ทั้งหมด ({dramaCatalog.items.length})
                </button>
                <button
                  onClick={() => setTypeFilter('clip')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                    typeFilter === 'clip'
                      ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>คลิปวิดีโอ (39)</span>
                </button>
                <button
                  onClick={() => setTypeFilter('image')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                    typeFilter === 'image'
                      ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>รูปภาพ (38)</span>
                </button>
              </div>
            </div>

            {/* Category Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
              <button
                onClick={() => setSelectedGroup('all')}
                className={`shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  selectedGroup === 'all'
                    ? 'bg-amber-400 border-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                    : 'bg-slate-900/80 border-white/10 text-slate-300 hover:border-amber-400/40 hover:text-white'
                }`}
              >
                <span>ทั้งหมด</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${selectedGroup === 'all' ? 'bg-slate-950/20 text-slate-950' : 'bg-white/10 text-slate-400'}`}>
                  {groupCounts['all'] || 0}
                </span>
              </button>

              {Object.entries(dramaCatalog.groups).map(([groupKey, groupTitleTh]) => {
                const count = groupCounts[groupKey] || 0;
                if (count === 0) return null;
                const isSelected = selectedGroup === groupKey;

                return (
                  <button
                    key={groupKey}
                    onClick={() => setSelectedGroup(groupKey)}
                    className={`shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                      isSelected
                        ? 'bg-amber-400 border-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                        : 'bg-slate-900/80 border-white/10 text-slate-300 hover:border-amber-400/40 hover:text-white'
                    }`}
                  >
                    <span>{groupTitleTh}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-slate-950/20 text-slate-950' : 'bg-white/10 text-slate-400'}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Group Note Banner */}
            {DRAMA_GROUP_NOTES[selectedGroup] && (
              <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900/40 px-3.5 py-2 rounded-xl border border-white/5">
                <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{DRAMA_GROUP_NOTES[selectedGroup]}</span>
              </div>
            )}
          </div>

          {/* Pinterest Masonry Grid */}
          {filteredItems.length === 0 ? (
            <div className="py-20 text-center text-slate-400">
              <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center mx-auto mb-4 text-slate-500">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">ไม่พบผลลัพธ์ที่ค้นหา</h3>
              <p className="text-sm text-slate-400 max-w-md mx-auto">
                ลองค้นหาด้วยคำสำคัญอื่น หรือกดเลือกแท็บ &quot;ทั้งหมด&quot; เพื่อดูตัวอย่างทั้งหมด 77 รายการ
              </p>
              <button
                onClick={() => { setSelectedGroup('all'); setTypeFilter('all'); setSearchQuery(''); }}
                className="mt-4 px-4 py-2 rounded-xl bg-amber-400 text-slate-950 text-xs font-bold hover:bg-amber-300 transition-all shadow-md shadow-amber-400/20"
              >
                รีเซ็ตตัวกรองทั้งหมด
              </button>
            </div>
          ) : (
            <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-4 pt-4">
              {filteredItems.map((item) => (
                <PinterestPinCard
                  key={item.id}
                  item={item}
                  onSelect={() => setActiveItem(item)}
                  onCopyPrompt={(e) => handleCopyCatalogPrompt(e, item)}
                  isCopied={copiedId === item.id}
                />
              ))}
            </div>
          )}
        </main>
      )}

      {/* Pinterest-like Pin Detail Dialog / Modal */}
      {activeItem && (
        <DramaDetailModal
          item={activeItem}
          onClose={() => setActiveItem(null)}
          onCopyPrompt={(e) => handleCopyCatalogPrompt(e, activeItem)}
          isCopied={copiedId === activeItem.id}
        />
      )}

      {/* Floating Sticky Bottom Bar for A9 Producer */}
      {activeTab === 'producer' && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[94%] max-w-3xl bg-[#0b1424]/95 backdrop-blur-xl border border-amber-400/40 shadow-2xl shadow-black/80 rounded-2xl px-4 py-3 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="min-w-0 flex-1 flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">
                {selectedTrope.titleTh} · {seriesTitle}
              </p>
              <p className="text-[10px] text-slate-400 font-mono truncate hidden sm:block">
                A9 Drama Beat Engine V5.0 · 6 Shots Storyboard พร้อมใช้งาน
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleRandomizeDrama}
              disabled={isRandomizing}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-semibold border border-white/5 transition flex items-center gap-1.5"
              title="สุ่มไอเดียใหม่"
            >
              <Dices className={`w-4 h-4 ${isRandomizing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">สุ่มใหม่</span>
            </button>

            <a
              href="https://flow.google.com/project/e01ae45f-d33a-446f-99ea-798fe0d49c65"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 text-xs font-bold border border-indigo-500/40 transition flex items-center gap-1"
            >
              <span className="hidden sm:inline">Google Flow</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={handleCopyActiveOutput}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                copiedId === 'producer-output'
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                  : 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-lg shadow-amber-400/20'
              }`}
            >
              {copiedId === 'producer-output' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedId === 'producer-output' ? 'คัดลอกแล้ว!' : 'Copy'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Footer Banner */}
      <footer className="mt-16 border-t border-white/10 bg-[#09111e]/90 py-10 px-4 text-center">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="w-10 h-10 rounded-2xl overflow-hidden border border-amber-400/30 mx-auto bg-amber-400/10">
            <img src="/assets/logo.png" alt="Kevin AI Logo" className="w-full h-full object-cover" />
          </div>
          <h3 className="text-xl font-black text-white">
            อยากสร้างละครสั้น AI หรือคลิปวิดีโอระดับมืออาชีพแบบนี้?
          </h3>
          <p className="text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
            เรียนรู้เทคนิคการ Generate บทละคร, การทำ Character Consistency, การโคลนเสียงภาษาไทย 
            และการเชื่อมต่อระบบ Google Flow / Kling AI ในคลาส <strong className="text-amber-400">AI Creator Workshop</strong> กับ อ. Kevin
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/#classes"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-300 text-slate-950 text-sm font-bold shadow-lg shadow-amber-400/25 hover:from-amber-300 hover:to-amber-200 transition-all"
            >
              ดูรายละเอียดคอร์สเรียน & จองที่นั่ง
            </Link>
            <Link
              href="/prompts"
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold border border-white/10 transition-all"
            >
              ไปที่ Prompt Generator
            </Link>
          </div>
        </div>
      </footer>

      {/* 200 PRESETS BROWSE MODAL */}
      {isBrowseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="absolute inset-0" onClick={() => setIsBrowseModalOpen(false)} />

          <div className="relative w-full max-w-5xl max-h-[92vh] bg-[#0c1524] border border-amber-400/30 rounded-3xl shadow-2xl shadow-black overflow-hidden flex flex-col z-10 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between gap-4 bg-slate-900/80">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-xl bg-amber-400/20 text-amber-400">
                    <Layers className="w-4 h-4" />
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <span>📋 คลังไอเดียละครสั้น 200 แบบ (ไม่ซ้ำ)</span>
                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                      200 PRESETS
                    </span>
                  </h3>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  คลิกเพื่อโหลดแนวเรื่อง, บทพูดตัวละคร, จังหวะตัดต่อ, และคำสั่ง Master Prompt เข้าสู่ Producer Workspace ทันที
                </p>
              </div>

              <button
                onClick={() => setIsBrowseModalOpen(false)}
                className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Search & Category Filter */}
            <div className="p-4 border-b border-white/10 bg-slate-950/60 space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={modalSearch}
                  onChange={(e) => setModalSearch(e.target.value)}
                  placeholder="ค้นหาชื่อเรื่อง, บทพูด, ตอกกลับ, ประธานบริษัท, แม่ผัว, ย้อนเวลา, ไสยศาสตร์, บัตรดำ..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {DRAMA_CATEGORIES_10.map((cat) => {
                  const isCatActive = modalCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setModalCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-all border ${
                        isCatActive
                          ? 'bg-amber-400 text-slate-950 font-bold border-amber-400 shadow-sm'
                          : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border-white/5'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Modal Presets Grid */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 scrollbar-thin scrollbar-thumb-slate-800">
              {modalFilteredPresets.length > 0 ? (
                modalFilteredPresets.map((trope) => {
                  const isSelected = selectedTrope.id === trope.id;
                  return (
                    <div
                      key={trope.id}
                      onClick={() => {
                        handleSelectTrope(trope);
                        setIsBrowseModalOpen(false);
                        triggerConfetti();
                        setToastMessage(`✓ เลือกไอเดีย "${trope.titleTh}" เข้าสู่หน้า Producer เรียบร้อย!`);
                        setTimeout(() => setToastMessage(null), 3000);
                      }}
                      className={`p-4 rounded-2xl border text-left cursor-pointer transition-all flex flex-col justify-between group ${
                        isSelected
                          ? 'bg-[#15233c] border-amber-400 shadow-lg shadow-amber-400/10 ring-2 ring-amber-400/30'
                          : 'bg-slate-900/70 border-white/10 hover:border-amber-400/60 hover:bg-slate-900'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1.5 mb-2">
                          <span className="text-[10px] font-mono font-bold text-amber-400">
                            {trope.code}
                          </span>
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-white/5 text-slate-300">
                            {trope.badge}
                          </span>
                        </div>

                        <div className="text-[10px] text-amber-400/90 font-semibold mb-1">
                          {trope.category}
                        </div>

                        <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-1 mb-1">
                          {trope.titleTh}
                        </h4>

                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">
                          {trope.synopsis}
                        </p>

                        <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5 text-[11px] text-slate-300 italic line-clamp-2 mb-2">
                          &ldquo;{trope.hookLine}&rdquo;
                        </div>
                      </div>

                      <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                        <span className={`text-[11px] font-bold ${isSelected ? 'text-amber-400' : 'text-slate-400 group-hover:text-amber-400'}`}>
                          {isSelected ? 'กำลังเลือกใช้อยู่' : 'คลิกเพื่อเลือกใช้ →'}
                        </span>
                        <ArrowRight className={`w-3.5 h-3.5 transition-transform group-hover:translate-x-1 ${isSelected ? 'text-amber-400' : 'text-slate-500 group-hover:text-amber-400'}`} />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full py-16 text-center text-slate-400">
                  <p className="text-sm">ไม่พบไอเดียที่ตรงกับคำค้นหา &ldquo;{modalSearch}&rdquo;</p>
                  <button
                    onClick={() => { setModalSearch(''); setModalCategory('ทั้งหมด'); }}
                    className="mt-2 text-xs text-amber-400 hover:underline font-bold"
                  >
                    ล้างการค้นหา
                  </button>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 px-6 border-t border-white/10 bg-slate-900/90 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
              <div>
                แสดง <b>{modalFilteredPresets.length}</b> จาก 200 รายการไอเดียทั้งหมด
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetDeck}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition text-xs font-semibold"
                >
                  รีเซ็ตคิวสุ่ม (0/200)
                </button>
                <button
                  type="button"
                  onClick={() => setIsBrowseModalOpen(false)}
                  className="px-4 py-1.5 rounded-xl bg-amber-400 text-slate-950 font-bold hover:bg-amber-300 transition text-xs"
                >
                  ปิดหน้าต่าง
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

/**
 * Pinterest Pin Card Component
 */
function PinterestPinCard({
  item,
  onSelect,
  onCopyPrompt,
  isCopied
}: {
  item: DramaItem;
  onSelect: () => void;
  onCopyPrompt: (e: React.MouseEvent) => void;
  isCopied: boolean;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const imgUrl = getDramaMediaUrl(item.img);
  const clipUrl = item.clip ? getDramaMediaUrl(item.clip) : null;

  useEffect(() => {
    if (clipUrl && videoRef.current) {
      if (isHovered) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    }
  }, [isHovered, clipUrl]);

  return (
    <div
      onClick={onSelect}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="break-inside-avoid mb-4 group cursor-pointer relative rounded-2xl overflow-hidden bg-slate-900/90 border border-white/10 hover:border-amber-400/60 shadow-lg hover:shadow-2xl hover:shadow-amber-400/10 transition-all duration-300 flex flex-col"
    >
      <div className="relative aspect-[9/16] w-full bg-black overflow-hidden">
        <img
          src={imgUrl}
          alt={item.label}
          loading="lazy"
          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
            isHovered && clipUrl ? 'opacity-0' : 'opacity-100'
          }`}
        />

        {clipUrl && (
          <video
            ref={videoRef}
            src={clipUrl}
            muted
            loop
            playsInline
            preload="none"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
              isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          />
        )}

        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10 pointer-events-none">
          <div className="flex items-center gap-1.5">
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-black/75 backdrop-blur-md text-white border border-white/10 flex items-center gap-1">
              {item.kind === 'clip' ? (
                <>
                  <Film className="w-3 h-3 text-pink-400" />
                  <span>10s</span>
                </>
              ) : (
                <>
                  <ImageIcon className="w-3 h-3 text-cyan-400" />
                  <span>ภาพ</span>
                </>
              )}
            </span>
            {item.region && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-black/60 text-slate-300 backdrop-blur-sm">
                {item.region}
              </span>
            )}
          </div>

          <button
            onClick={onCopyPrompt}
            title="คัดลอก Master Prompt"
            className={`pointer-events-auto p-2 rounded-xl backdrop-blur-md transition-all shadow-lg ${
              isCopied
                ? 'bg-emerald-500 text-slate-950 scale-105'
                : 'bg-black/70 hover:bg-amber-400 text-white hover:text-slate-950 border border-white/20 hover:border-amber-400 opacity-90 group-hover:opacity-100'
            }`}
          >
            {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>

        {item.kind === 'clip' && !isHovered && (
          <div className="absolute bottom-2.5 right-2.5 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center border border-white/20 shadow-md">
            <Play className="w-4 h-4 ml-0.5 text-amber-400" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </div>

      <div className="p-3.5 flex flex-col gap-1.5 flex-1 bg-slate-900/90 border-t border-white/5">
        <div className="flex items-start justify-between gap-1.5">
          <h4 className="font-bold text-sm text-white group-hover:text-amber-400 transition-colors leading-snug line-clamp-1">
            {item.emoji ? `${item.emoji} ` : ''}{item.label}
          </h4>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
          <span className="font-semibold text-amber-400/90">{item.groupTh}</span>
          {item.settings?.['สไตล์'] && (
            <>
              <span>•</span>
              <span className="truncate max-w-[120px]">{item.settings['สไตล์']}</span>
            </>
          )}
        </div>

        {(item.lines?.[0] || item.beat) && (
          <p className="text-xs text-slate-300/80 line-clamp-2 leading-relaxed mt-0.5 font-light">
            {item.lines?.[0] ? `"${item.lines[0]}"` : item.beat}
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * Pinterest-like Detail Modal (Dialog)
 */
function DramaDetailModal({
  item,
  onClose,
  onCopyPrompt,
  isCopied
}: {
  item: DramaItem;
  onClose: () => void;
  onCopyPrompt: (e: React.MouseEvent) => void;
  isCopied: boolean;
}) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const imgUrl = getDramaMediaUrl(item.img);
  const clipUrl = item.clip ? getDramaMediaUrl(item.clip) : null;

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-4xl max-h-[92vh] bg-[#0c1524] border border-white/15 rounded-3xl shadow-2xl shadow-black overflow-hidden flex flex-col md:flex-row z-10 animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/60 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/10 transition-all backdrop-blur-md"
          title="ปิดหน้าต่าง (Esc)"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="md:w-[45%] bg-black flex items-center justify-center relative overflow-hidden shrink-0 min-h-[360px] md:min-h-[580px]">
          {clipUrl ? (
            <div className="relative w-full h-full flex items-center justify-center group">
              <video
                ref={videoRef}
                src={clipUrl}
                poster={imgUrl}
                controls
                autoPlay
                playsInline
                loop
                muted={isMuted}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                className="w-full max-h-[60vh] md:max-h-[92vh] object-contain"
              />

              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex items-center gap-2 pointer-events-auto">
                  <button
                    onClick={togglePlay}
                    className="p-2 rounded-xl bg-black/70 hover:bg-amber-400 text-white hover:text-slate-950 backdrop-blur-md border border-white/10 transition-all"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={toggleMute}
                    className="p-2 rounded-xl bg-black/70 hover:bg-amber-400 text-white hover:text-slate-950 backdrop-blur-md border border-white/10 transition-all"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <img
              src={imgUrl}
              alt={item.label}
              className="w-full max-h-[60vh] md:max-h-[92vh] object-contain"
            />
          )}

          <div className="absolute top-4 left-4 pointer-events-none">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-black/80 text-amber-400 border border-amber-400/30 backdrop-blur-md flex items-center gap-1.5 shadow-lg">
              {item.kind === 'clip' ? (
                <>
                  <Film className="w-3.5 h-3.5" />
                  <span>คลิปวิดีโอ 10s</span>
                </>
              ) : (
                <>
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>ภาพความละเอียดสูง</span>
                </>
              )}
            </span>
          </div>
        </div>

        <div className="md:w-[55%] p-5 sm:p-6 md:p-8 overflow-y-auto flex flex-col gap-6 scrollbar-thin scrollbar-thumb-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 mb-1.5">
              <span>{item.groupTh}</span>
              {item.region && <span>• {item.region}</span>}
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span className="text-slate-400 font-normal">Kevin AI Studio</span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
              {item.emoji ? `${item.emoji} ` : ''}{item.label}
            </h2>
          </div>

          {item.beat && (
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/10">
              <div className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>ฉากนี้ (Scene Beat)</span>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed font-light">
                {item.beat}
              </p>
            </div>
          )}

          {item.lines && item.lines.length > 0 && (
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-pink-400" />
                <span>บทพูดในช็อตนี้ ({item.lines.length} ประโยค)</span>
              </div>
              <div className="space-y-2">
                {item.lines.map((line, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-900/50 border border-white/5 text-sm text-slate-200 flex items-start gap-2.5"
                  >
                    <span className="w-5 h-5 rounded-full bg-pink-500/20 text-pink-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="leading-relaxed font-normal">{line}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {item.narration && (
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                เสียงบรรยาย (Voice Narration)
              </div>
              <p className="text-sm text-slate-300 italic bg-slate-900/40 p-3 rounded-xl border border-white/5">
                &ldquo;{item.narration}&rdquo;
              </p>
            </div>
          )}

          {item.settings && Object.keys(item.settings).length > 0 && (
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
                <span>ค่าที่ตั้งในระบบ (Parameters)</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(item.settings)
                  .filter(([, val]) => Boolean(val))
                  .map(([key, val]) => (
                  <div
                    key={key}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 border border-white/10 text-xs flex items-center gap-1.5"
                  >
                    <span className="text-slate-400 font-medium">{key}:</span>
                    <span className="text-amber-300 font-semibold">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {item.metaPrompt && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Film className="w-3.5 h-3.5" />
                  <span>คำสั่ง Master AI Prompt</span>
                </div>
                <button
                  onClick={onCopyPrompt}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md ${
                    isCopied
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-amber-400 text-slate-950 hover:bg-amber-300 shadow-amber-400/20'
                  }`}
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>คัดลอกสำเร็จ!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>คัดลอก Master Prompt</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-white/15 font-mono text-xs text-slate-300 leading-relaxed whitespace-pre-wrap selection:bg-amber-400 selection:text-slate-950 max-h-48 overflow-y-auto">
                {item.metaPrompt}
              </div>
            </div>
          )}

          <div className="mt-auto pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 bg-gradient-to-r from-amber-400/10 to-transparent p-4 rounded-2xl border border-amber-400/20">
            <div>
              <div className="text-xs font-bold text-amber-400">สนใจคอร์สสร้างละคร AI?</div>
              <p className="text-xs text-slate-300 mt-0.5">เวิร์กช็อปตัวต่อตัว & คลาสสดกับ อ. Kevin</p>
            </div>
            <Link
              href="/#classes"
              className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold shadow-md shadow-amber-400/20 shrink-0 transition-all"
            >
              ดูรอบเรียน & จองคอร์ส
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
