import React, { useState, useRef, useEffect, createContext, useContext, useCallback } from 'react';
import { Video, Type, Play, Download, Save, FileVideo, Sparkles, Pause, RotateCcw, Scissors, Wand2, Plus, X, Clock, Film, Trash2, Zap, Blend, PanelRightClose, MoveRight, HardDriveDownload, AlertTriangle, Music, Volume2, UploadCloud, ToggleLeft, ToggleRight, Bot, Copy, ExternalLink, CheckCheck, HelpCircle, Keyboard, Info, Image as ImageIcon, SquareMenu, PaintBucket, ChevronRight, MessageSquareText, FileJson } from 'lucide-react';

// ==========================================
// 💡 ルビ（ふりがな）の表示状態を管理するContext
// ==========================================
const RubyContext = createContext(true);

const R = ({ t, r }) => {
  const showRuby = useContext(RubyContext);
  if (!showRuby) return <span translate="no">{t}</span>;
  return (
    <span translate="no">
      <ruby className="relative inline-block text-inherit" style={{ rubyAlign: 'center' }}>
        {t}
        <rt className="absolute left-1/2 -top-[1.1em] -translate-x-1/2 text-[0.6em] text-slate-500 font-medium whitespace-nowrap pointer-events-none tracking-widest">
          {r}
        </rt>
      </ruby>
    </span>
  );
};

// ==========================================
// 💡 カスタムフック: 設定の保存 (LocalStorage)
// ==========================================
function useStickyState(defaultValue, key) {
  const [value, setValue] = useState(() => {
    try {
      const stickyValue = window.localStorage.getItem(key);
      return stickyValue !== null ? JSON.parse(stickyValue) : defaultValue;
    } catch (e) {
      return defaultValue;
    }
  });
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {}
  }, [key, value]);
  return [value, setValue];
}

// ==========================================
// 💡 トースト通知
// ==========================================
const ToastContext = createContext(null);

const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      <div className="fixed top-4 md:top-6 left-1/2 -translate-x-1/2 z-[300] flex flex-col gap-2 pointer-events-none w-[90%] md:w-auto items-center">
        {toasts.map(t => (
          <div key={t.id} className={`flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-bold text-white transition-all animate-fade-in-down ${
            t.type === 'error' ? 'bg-slate-800' : t.type === 'success' ? 'bg-emerald-500' : 'bg-red-600'
          }`}>
            {t.type === 'error' ? <AlertTriangle size={18} /> : t.type === 'success' ? <CheckCheck size={18} /> : <Info size={18} />}
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);

// ==========================================
// 💡 ガイドツアー
// ==========================================
const TUTORIAL_STEPS = [
  {
    title: <>ようこそ<R t="動画編集" r="どうがへんしゅう" />スタジオへ！</>,
    text: <>ここはプロみたいにカッコいい<R t="動画" r="どうが" />が<R t="作" r="つく" />れる<R t="魔法" r="まほう" />のアプリだよ。<br />1<R t="分" r="ぷん" />で<R t="使" r="つか" />い<R t="方" r="かた" />をマスターしよう！</>,
    targetId: null
  },
  {
    title: <>1. メディアを<R t="並" r="なら" />べよう</>,
    text: <>まずは<R t="右側" r="みぎがわ" />（スマホなら<R t="下" r="した" />）のパネルから、<R t="使" r="つか" />いたい<R t="動画" r="どうが" />や「<R t="画像" r="がぞう" />」、文字を入れるための「<R t="空白" r="くうはく" />ページ」を<R t="選" r="えら" />んでね。</>,
    targetId: 'tutorial-step1'
  },
  {
    title: <>2. テロップや<R t="音楽" r="おんがく" />を<R t="入" r="い" />れよう</>,
    text: <><R t="文字" r="もじ" />（テロップ）を<R t="入" r="い" />れたり、BGM（<R t="音楽" r="おんがく" />）を<R t="追加" r="ついか" />して、<R t="動画" r="どうが" />をさらに<R t="盛" r="も" />り<R t="上" r="あ" />げよう！</>,
    targetId: 'tutorial-step2-3'
  },
  {
    title: <>3. タイムラインで<R t="調整" r="ちょうせい" /></>,
    text: <>プレビュー<R t="画面" r="がめん" />の<R t="下" r="した" />にある「タイムライン」で、テロップの<R t="出" r="で" />るタイミングを<R t="指" r="ゆび" />やマウスで<R t="直感的" r="ちょっかんてき" />に<R t="動" r="うご" />かせるよ。</>,
    targetId: 'tutorial-timeline'
  },
  {
    title: <>4. 🤖 AIディレクター</>,
    text: <>なんと、AIに「こんな<R t="動画" r="どうが" />にしたい！」と<R t="伝" r="つた" />えるだけで、プロの<R t="監督" r="かんとく" />のように<R t="構成案" r="こうせいあん" />を<R t="考" r="かんが" />えてくれて、<R t="全自動" r="ぜんじどう" />で<R t="編集" r="へんしゅう" />してくれる<R t="魔法" r="まほう" />のボタンがあるよ！</>,
    targetId: 'tutorial-ai'
  },
  {
    title: <>5. <R t="動画" r="どうが" />を<R t="完成" r="かんせい" />させる</>,
    text: <>プレビューで<R t="確認" r="かくにん" />してバッチリだったら、ここで「<R t="動画" r="どうが" />を<R t="書" r="か" />き<R t="出" r="だ" />す」を<R t="押" r="お" />してパソコンに<R t="保存" r="ほぞん" />しよう！</>,
    targetId: 'tutorial-step4'
  }
];

function useTutorial() {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const isCompleted = localStorage.getItem('movieMaker_tutorialCompleted_v5');
    if (!isCompleted) setIsActive(true);
  }, []);

  const startTutorial = useCallback(() => { setCurrentStep(0); setIsActive(true); }, []);
  const endTutorial = useCallback(() => { setIsActive(false); localStorage.setItem('movieMaker_tutorialCompleted_v5', 'true'); }, []);
  
  const nextStep = useCallback(() => { 
    setCurrentStep(s => {
      if (s < TUTORIAL_STEPS.length - 1) return s + 1;
      endTutorial();
      return s;
    });
  }, [endTutorial]);

  const prevStep = useCallback(() => { setCurrentStep(s => (s > 0 ? s - 1 : s)); }, []);

  return { isActive, currentStep, startTutorial, endTutorial, nextStep, prevStep };
}

const TutorialOverlay = ({ isActive, currentStep, nextStep, prevStep, endTutorial }) => {
  const [targetRect, setTargetRect] = useState(null);
  const stepData = TUTORIAL_STEPS[currentStep];

  useEffect(() => {
    if (!isActive) return;
    const updateRect = () => {
      if (stepData.targetId) {
        const el = document.getElementById(stepData.targetId);
        if (el) {
          const rect = el.getBoundingClientRect();
          setTargetRect({ x: rect.left - 8, y: rect.top - 8, w: rect.width + 16, h: rect.height + 16 });
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else setTargetRect(null);
      } else setTargetRect(null);
    };

    updateRect();
    const timer = setTimeout(updateRect, 300);
    window.addEventListener('resize', updateRect);
    return () => { clearTimeout(timer); window.removeEventListener('resize', updateRect); };
  }, [isActive, currentStep, stepData]);

  if (!isActive) return null;

  let popoverStyle = {};
  if (targetRect) {
    const isTopHalf = targetRect.y < window.innerHeight / 2;
    const popoverY = isTopHalf ? targetRect.y + targetRect.h + 16 : window.innerHeight - targetRect.y + 16;
    const targetCenter = targetRect.x + targetRect.w / 2;
    const halfWidth = 160;

    if (targetCenter < halfWidth + 16) {
      popoverStyle = isTopHalf ? { top: popoverY, left: 16 } : { bottom: popoverY, left: 16 };
    } else if (window.innerWidth - targetCenter < halfWidth + 16) {
      popoverStyle = isTopHalf ? { top: popoverY, right: 16 } : { bottom: popoverY, right: 16 };
    } else {
      popoverStyle = isTopHalf
        ? { top: popoverY, left: targetCenter, transform: 'translateX(-50%)' }
        : { bottom: popoverY, left: targetCenter, transform: 'translateX(-50%)' };
    }
  } else {
    popoverStyle = { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
  }

  return (
    <div className="fixed inset-0 z-[200]" onClick={endTutorial}>
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          <mask id="tutorial-hole">
            <rect width="100%" height="100%" fill="white" />
            <rect x={targetRect ? targetRect.x : 0} y={targetRect ? targetRect.y : 0} width={targetRect ? targetRect.w : 0} height={targetRect ? targetRect.h : 0} rx="12" fill="black" opacity={targetRect ? 1 : 0} />
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="rgba(15, 23, 42, 0.6)" mask="url(#tutorial-hole)" className="pointer-events-auto transition-all duration-300" />
      </svg>
      <div 
        className="absolute" 
        style={{
          display: targetRect ? 'block' : 'none',
          left: targetRect ? targetRect.x : 0,
          top: targetRect ? targetRect.y : 0,
          width: targetRect ? targetRect.w : 0,
          height: targetRect ? targetRect.h : 0
        }}
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
      />
      <div className="absolute bg-white rounded-2xl shadow-2xl p-5 md:p-6 w-[90%] max-w-[360px] flex flex-col gap-3 transition-all duration-300 pointer-events-auto" style={popoverStyle} onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center border-b border-slate-100 pb-2">
          <h3 className="text-base md:text-lg font-bold text-red-700"><span key={`title-${currentStep}`}>{stepData.title}</span></h3>
          <span className="text-xs font-bold bg-red-50 text-red-500 px-2 py-1 rounded-md">{currentStep + 1} / {TUTORIAL_STEPS.length}</span>
        </div>
        <div className="text-slate-600 font-medium whitespace-pre-line leading-relaxed text-sm">
          <span key={`text-${currentStep}`}>{stepData.text}</span>
        </div>
        <div className="flex justify-between items-center mt-3 pt-2">
          <button onClick={endTutorial} className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors px-2 py-1"><R t="終了" r="スキップ" /></button>
          <div className="flex gap-2">
            {currentStep > 0 && <button onClick={prevStep} className="px-3 py-2 rounded-lg font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors text-sm"><R t="戻" r="もど" />る</button>}
            <button onClick={nextStep} className="px-4 py-2 rounded-lg font-bold text-white bg-red-500 hover:bg-red-600 shadow-sm transition-transform active:scale-95 text-sm">
              <span key={`btn-${currentStep === TUTORIAL_STEPS.length - 1}`}>{currentStep === TUTORIAL_STEPS.length - 1 ? 'はじめる！' : <><R t="次" r="つぎ" />へ</>}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 🎨 UIコンポーネント
// ==========================================
const Header = ({ showRuby, setShowRuby, onHelpClick, onShortcutsClick }) => (
  <nav className="bg-slate-900 border-b-[3px] border-red-500 px-4 md:px-6 py-3 flex justify-between items-center shadow-md z-20 shrink-0">
    <div className="flex items-center gap-2 md:gap-3">
      <div className="bg-red-500/20 p-2 rounded-lg text-red-400"><Video size={22} strokeWidth={2.5} /></div>
      <h1 className="text-lg md:text-xl font-bold text-white tracking-wide"><span><R t="映像制作" r="えいぞうせいさく" /> <span className="text-red-400">スタジオ</span></span></h1>
    </div>
    <div className="flex items-center gap-2 md:gap-4">
      <button onClick={onShortcutsClick} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-red-300 rounded-lg font-bold text-xs md:text-sm transition-colors border border-slate-700 shadow-sm">
        <Keyboard size={16} /> <span className="hidden md:inline"><R t="操作一覧" r="ショートカット" /></span>
      </button>
      <button onClick={onHelpClick} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-red-300 rounded-lg font-bold text-xs md:text-sm transition-colors border border-slate-700 shadow-sm">
        <HelpCircle size={16} /> <span className="hidden md:inline"><R t="使い方" r="あそびかた" /></span>
      </button>
      
      <div className="h-6 w-px bg-slate-700 hidden md:block mx-1"></div>

      <button onClick={() => setShowRuby(!showRuby)} className="flex items-center gap-1 text-xs font-bold text-red-300 hover:text-red-200 transition-colors bg-slate-800 px-2 py-1.5 rounded-lg border border-slate-700 shadow-sm" title="ふりがなの表示/非表示を切り替えます">
        <span className="hidden md:inline mt-px">ふりがな</span>
        {showRuby ? <ToggleRight className="w-4 h-4 md:w-5 md:h-5 text-red-400" /> : <ToggleLeft className="w-4 h-4 md:w-5 md:h-5" />}
      </button>
      <span className="bg-emerald-900/30 text-emerald-400 px-2.5 py-1.5 rounded-lg flex items-center gap-1 border border-emerald-800 shadow-sm text-[10px] md:text-xs font-bold transition-all">
        <Save className="w-3.5 h-3.5" />
        <span className="hidden sm:inline"><R t="自動保存中" r="じどうほぞんちゅう" /></span>
      </span>
    </div>
  </nav>
);

const ShortcutsModal = ({ show, onClose }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4 animate-fade-in-down" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden transform transition-all" onClick={e => e.stopPropagation()}>
        <div className="bg-red-50 px-6 py-4 flex justify-between items-center border-b border-red-100">
          <h3 className="text-lg font-bold text-red-800 flex items-center gap-2"><Keyboard size={20} /> <span><R t="操作一覧" r="ショートカット" /></span></h3>
          <button onClick={onClose} className="text-red-400 hover:text-red-600 transition-colors bg-white rounded-full p-1"><X size={20} /></button>
        </div>
        <div className="p-6 flex flex-col gap-3">
          <ShortcutRow label={<span><R t="再生" r="さいせい" /> / <R t="停止" r="ていし" /></span>} keys={["Space"]} />
          <ShortcutRow label={<span>AIモーダルの<R t="開閉" r="かいへい" /></span>} keys={["A"]} />
          <ShortcutRow label={<span><R t="全消去" r="すべてけす" />の<R t="開閉" r="かいへい" /></span>} keys={["Backspace"]} />
          <ShortcutRow label={<span><R t="操作一覧" r="そうさいちらん" />の<R t="開閉" r="かいへい" /></span>} keys={["?", "/"]} />
          <ShortcutRow label={<span>モーダルを<R t="閉" r="と" />じる</span>} keys={["Esc"]} />
        </div>
      </div>
    </div>
  );
};

const ShortcutRow = ({ label, keys }) => (
  <div className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
    <span className="text-sm font-bold text-slate-600">{label}</span>
    <div className="flex gap-1.5">
      {keys.map((k, i) => (
        <span key={i} className="px-2 py-1 bg-slate-100 border border-slate-200 rounded text-xs font-bold text-slate-500 shadow-sm">{k}</span>
      ))}
    </div>
  </div>
);

const ClearConfirmModal = ({ show, onConfirm, onCancel }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4 animate-fade-in-down" onClick={onCancel}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden transform transition-all p-6 text-center" onClick={e => e.stopPropagation()}>
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-600 shadow-inner"><Trash2 size={32} /></div>
        <h3 className="text-xl font-bold text-slate-800 mb-2"><R t="全消去" r="すべてけす" /></h3>
        <p className="text-slate-500 text-sm font-medium mb-6 leading-relaxed">本当に追加した動画やテロップを<br/>全て消去しますか？<br />この操作は元に戻せません。</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition-all active:scale-95 border-b-[3px] border-slate-300">やめる</button>
          <button onClick={onConfirm} className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all active:scale-95 border-b-[3px] border-red-800 shadow-sm">ぜんぶ消す</button>
        </div>
      </div>
    </div>
  );
};


// ==========================================
// 🚀 メインアプリケーション (AppContent)
// ==========================================
const AppContent = () => {
  const [showRuby, setShowRuby] = useStickyState(true, 'movie-maker-show-ruby');
  const tutorial = useTutorial();
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const toast = useToast(); 

  // --- 状態管理 (State) ---
  const [videos, setVideos] = useState(() => {
    try {
      const saved = window.localStorage.getItem('movie-maker-videos-recipe-v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.map(v => {
          if (v.type === 'blank') return { ...v, url: null, file: null, needsReconnect: false };
          return { ...v, needsReconnect: true, url: null, file: null };
        });
      }
    } catch (e) {}
    return [];
  });

  useEffect(() => {
    const dataToSave = videos.map(v => ({
      id: v.id, type: v.type, name: v.name, duration: v.duration, trimStart: v.trimStart, trimEnd: v.trimEnd, filterType: v.filterType, transitionType: v.transitionType, bgColor: v.bgColor
    }));
    window.localStorage.setItem('movie-maker-videos-recipe-v2', JSON.stringify(dataToSave));
  }, [videos]);

  const [activeVideoId, setActiveVideoId] = useState(null);
  const [playingVideoId, setPlayingVideoId] = useState(null);

  useEffect(() => {
    if (videos.length > 0 && !playingVideoId) {
      setPlayingVideoId(videos[0].id);
      setActiveVideoId(videos[0].id);
    }
  }, [videos, playingVideoId]);

  const [textList, setTextList] = useStickyState([
    { id: 1, text: '', color: '#ffffff', pos: 'bottom', scale: 100, start: 0, end: 9999, font: 'Zen Maru Gothic', hasManuallyEditedTime: false }
  ], 'movie-maker-text-list-v8');
  
  const [bgmFile, setBgmFile] = useState(null);
  const [bgmUrl, setBgmUrl] = useState(null);
  const [bgmVolume, setBgmVolume] = useStickyState(50, 'movie-maker-bgm-volume');
  
  const [isRecording, setIsRecording] = useState(false);
  const [recordingProgress, setRecordingProgress] = useState(0); 
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // ★ AIディレクター関連ステート
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiStep, setAiStep] = useState(1);
  const [aiTheme, setAiTheme] = useState("");
  const [aiVibe, setAiVibe] = useState("YouTuber風（ポップで楽しい）");
  const [aiJsonInput, setAiJsonInput] = useState("");
  const [isCopied, setIsCopied] = useState(false);

  const vibes = [
    "YouTuber風（ポップで楽しい）",
    "シネマティック（映画のような感動・かっこよさ）",
    "ドキュメンタリー（真面目でメッセージ性が強い）",
    "ミュージックビデオ（音楽とリズム重視）",
    "ホラー・サスペンス（ドキドキする展開）"
  ];

  // --- 参照 (Ref) ---
  const videoRefs = useRef({});
  const imageRefs = useRef({});
  const canvasRef = useRef(null);
  const recorderRef = useRef(null);
  const fileInputRef = useRef(null);
  const bgmInputRef = useRef(null); 
  const reconnectInputRef = useRef(null);
  const timelineRef = useRef(null);
  const progressRef = useRef(null);
  const mainRef = useRef(null);
  
  const virtualTimeRef = useRef(0); 
  const lastFrameTimeRef = useRef(0); 

  const audioCtxRef = useRef(null);
  const destRef = useRef(null);
  const audioNodesRef = useRef({});
  const bgmAudioRef = useRef(null); 
  const bgmNodeRef = useRef(null);
  const bgmGainRef = useRef(null);

  const [dragging, setDragging] = useState(null);
  const [reconnectTargetId, setReconnectTargetId] = useState(null);

  // --- 定数データ ---
  const colors = [
    { name: '白', value: '#ffffff' }, { name: '黒', value: '#1e293b' },
    { name: '赤', value: '#ef4444' }, { name: '青', value: '#3b82f6' },
    { name: '黄', value: '#eab308' }, { name: '緑', value: '#22c55e' },
  ];
  const bgColors = [
    { name: '黒', value: '#000000' }, { name: '白', value: '#ffffff' },
    { name: '赤', value: '#ef4444' }, { name: '青', value: '#3b82f6' },
    { name: '緑', value: '#22c55e' }, { name: '紫', value: '#8b5cf6' },
  ];
  const filters = [
    { name: 'なし', value: 'none' }, { name: '白黒', value: 'grayscale(100%)' },
    { name: 'セピア', value: 'sepia(100%)' }, { name: '反転', value: 'hue-rotate(90deg)' }, { name: 'ぼかし', value: 'blur(5px)' },
  ];
  const fonts = [
    { name: '丸ゴシック', value: 'Zen Maru Gothic' }, { name: 'ゴシック', value: 'Noto Sans JP' },
    { name: '明朝体', value: 'Noto Serif JP' }, { name: '手書き風', value: 'Yusei Magic' },
    { name: 'ポップ', value: 'Hachi Maru Pop' }, { name: 'ドット', value: 'DotGothic16' },
  ];

  const formatTime = (time) => {
    if (isNaN(time)) return "00:00";
    const m = Math.floor(time / 60).toString().padStart(2, '0');
    const s = Math.floor(time % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const totalDuration = videos.reduce((acc, v) => {
    if (v.type === 'video') return acc + Math.max(0, v.trimEnd - v.trimStart);
    else return acc + Math.max(0, v.trimEnd); 
  }, 0);

  const getGlobalTime = () => {
    if (!playingVideoId || videos.length === 0) return 0;
    let time = 0;
    for (const v of videos) {
      if (v.id === playingVideoId) {
        if (v.type === 'video') {
          const el = videoRefs.current[v.id];
          if (el && !v.needsReconnect) time += Math.max(0, el.currentTime - v.trimStart);
        } else {
          time += Math.max(0, virtualTimeRef.current);
        }
        break;
      } else {
        if (v.type === 'video') time += Math.max(0, v.trimEnd - v.trimStart);
        else time += Math.max(0, v.trimEnd);
      }
    }
    return time;
  };

  const initAudioCtx = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      destRef.current = audioCtxRef.current.createMediaStreamDestination();
    } else if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  const executeClearAll = () => {
    videos.forEach(v => { if (v.url) URL.revokeObjectURL(v.url); });
    setVideos([]);
    setActiveVideoId(null);
    setPlayingVideoId(null);
    setTextList([{ id: Date.now(), text: '', color: '#ffffff', pos: 'bottom', scale: 100, start: 0, end: 9999, font: 'Zen Maru Gothic', hasManuallyEditedTime: false }]);
    
    if (bgmUrl) URL.revokeObjectURL(bgmUrl);
    setBgmFile(null);
    setBgmUrl(null);
    
    if (bgmNodeRef.current) { bgmNodeRef.current.disconnect(); bgmNodeRef.current = null; }
    if (bgmGainRef.current) { bgmGainRef.current.disconnect(); bgmGainRef.current = null; }
    setIsPlaying(false);
    setShowClearConfirm(false);
    window.localStorage.removeItem('movie-maker-videos-recipe-v2');
    toast('すべてのデータをリセットしました', 'success');
  };

  // ==========================================
  // 🤖 AIディレクター（複数回やり取りプロンプト）
  // ==========================================
  const generateMaterialList = () => {
    if (videos.length === 0) return "（現在、素材は何も追加されていません）";
    return videos.map((v, i) => {
      if (v.type === 'video') return `- シーン${i+1} [動画]: "${v.name}" (全体の長さ: 約${Math.ceil(v.duration)}秒)`;
      if (v.type === 'image') return `- シーン${i+1} [画像]: "${v.name}"`;
      if (v.type === 'blank') return `- シーン${i+1} [空白ページ]`;
      return "";
    }).join("\n");
  };

  const promptA = `あなたはプロの映像クリエイター兼放送作家です。
私はいま、動画編集アプリを使って映像を作ろうとしています。

【作りたい動画のテーマ】
${aiTheme || 'おまかせ（素材から推測して最高のテーマを決めてください）'}

【希望する雰囲気】
${aiVibe}

【現在アプリに読み込んでいる素材リスト】
${generateMaterialList()}

これらの素材を使って、視聴者の心を動かす最高の動画の「構成案（絵コンテ）」を提案してください。
単なる文字起こしではなく、魅力的なキャッチコピーや、感情を代弁するようなプロっぽいテロップを考えてください。
動画が長い場合は、見どころだけを短くテンポよく切り抜く提案をしてください。

また、世界観をさらに完璧にするために「こんな背景画像があると良い」「こんなBGMがあると良い」というアイデアがあれば教えてください。もし私が画像生成AIや音楽生成AIを使う場合の「生成用プロンプト」も一緒に提案してくれると嬉しいです。

※素材ファイルを添付できる場合は、全ての内容を確認してから提案してください。`;

  const promptB = `素晴らしい構成案をありがとうございます！この構成で進めます。
（※もし私が新しく画像や音楽を追加でアップロードした場合は、それも含めて構成を最適化してください）

それでは、動画編集アプリに読み込ませるための「編集レシピ」を出力してください。
他の文章や説明は一切不要です。必ず以下の【JSONフォーマット】のコードのみを出力してください。（\`\`\`json などのマークダウンも不要です）

【要件】
1. テロップの表示時間（start, end）や、動画の切り抜き時間（trimStart, trimEnd）を秒単位で細かく指定してください。
2. transitionType は none, fade, wipe, slide から選んでください。
3. filterType は none, grayscale(100%), sepia(100%), hue-rotate(90deg), blur(5px) から選んでください。
4. font は Zen Maru Gothic, Noto Sans JP, Noto Serif JP, Yusei Magic, Hachi Maru Pop, DotGothic16 から選んでください。
5. 提案したテロップを必ず \`texts\` 配列にすべて含めてください。

【JSONフォーマット】
{
  "videos": [
    {
      "scene": 1, // 素材リストのscene番号
      "type": "video", // video か image か blank
      "trimStart": 0.0, 
      "trimEnd": 5.0, 
      "filterType": "none",
      "transitionType": "fade",
      "bgColor": "#000000"
    }
  ],
  "texts": [
    {
      "text": "表示するテロップ",
      "start": 0.0,
      "end": 3.0,
      "pos": "bottom", // top, middle, bottom
      "color": "#ffffff",
      "scale": 120, // 50〜200
      "font": "Zen Maru Gothic"
    }
  ]
}`;

  const handleCopyPrompt = (text) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      setIsCopied(true);
      toast('プロンプトをコピーしました！AIに貼り付けてください', 'success');
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      toast('コピーに失敗しました', 'error');
    }
    document.body.removeChild(textArea);
  };

  const applyAiRecipe = () => {
    try {
      let cleanJson = aiJsonInput.trim();
      if (cleanJson.startsWith('```json')) cleanJson = cleanJson.replace(/^```json/, '').replace(/```$/, '').trim();
      else if (cleanJson.startsWith('```')) cleanJson = cleanJson.replace(/^```/, '').replace(/```$/, '').trim();
      
      const recipe = JSON.parse(cleanJson);
      
      if (recipe.videos && Array.isArray(recipe.videos)) {
        setVideos(prev => prev.map((v, idx) => {
          const recipeV = recipe.videos.find(rv => (rv.scene - 1) === idx);
          if (recipeV) {
            return {
              ...v,
              trimStart: recipeV.trimStart !== undefined ? recipeV.trimStart : v.trimStart,
              trimEnd: recipeV.trimEnd !== undefined ? recipeV.trimEnd : v.trimEnd,
              filterType: recipeV.filterType || v.filterType,
              transitionType: recipeV.transitionType || v.transitionType,
              bgColor: recipeV.bgColor || v.bgColor
            };
          }
          return v;
        }));
      }
      
      if (recipe.texts && Array.isArray(recipe.texts)) {
        const newTexts = recipe.texts.map((t, idx) => ({
          id: Date.now() + idx,
          text: t.text || '',
          color: t.color || '#ffffff',
          pos: t.pos || 'bottom',
          scale: t.scale || 100,
          start: t.start || 0,
          end: t.end || 9999,
          font: t.font || 'Zen Maru Gothic',
          hasManuallyEditedTime: true // AIが設定した時間は勝手に変えない
        }));
        setTextList(newTexts);
      }
      
      setIsAiModalOpen(false);
      setAiStep(1);
      setAiJsonInput("");
      toast('AIの編集レシピを適用しました！', 'success');
      seekToGlobalTime(0);
    } catch (err) {
      toast('コードの形式が間違っています。中身を確認してください。', 'error');
      console.error(err);
    }
  };

  // --- メディア追加処理 ---
  const processFiles = (files) => {
    if (files.length === 0) return;
    initAudioCtx();

    Array.from(files).forEach(file => {
      const id = Date.now().toString() + Math.random().toString(36).substr(2, 5);
      const url = URL.createObjectURL(file);
      
      if (file.type.startsWith('video/')) {
        setVideos(prev => {
          const updated = [...prev, { id, type: 'video', file, url, name: file.name, duration: 0, trimStart: 0, trimEnd: 0, filterType: 'none', transitionType: 'none', needsReconnect: false }];
          if (updated.length === 1) { setActiveVideoId(id); setPlayingVideoId(id); }
          return updated;
        });
      } else if (file.type.startsWith('image/')) {
        setVideos(prev => {
          const updated = [...prev, { id, type: 'image', file, url, name: file.name, duration: 5, trimStart: 0, trimEnd: 5, filterType: 'none', transitionType: 'none', needsReconnect: false }];
          if (updated.length === 1) { setActiveVideoId(id); setPlayingVideoId(id); }
          return updated;
        });
      } else if (file.type.startsWith('audio/')) {
        if (bgmUrl) URL.revokeObjectURL(bgmUrl); 
        setBgmFile(file);
        setBgmUrl(url);
      }
    });
    setDownloadUrl(null);
    toast(`${files.length}個のメディアを追加しました`);
  };

  const addBlankPage = () => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 5);
    setVideos(prev => {
      const updated = [...prev, { id, type: 'blank', file: null, url: null, name: '空白ページ', duration: 3, trimStart: 0, trimEnd: 3, filterType: 'none', transitionType: 'none', needsReconnect: false, bgColor: '#000000' }];
      if (updated.length === 1) { setActiveVideoId(id); setPlayingVideoId(id); }
      return updated;
    });
    toast(`空白ページを追加しました`);
  };

  const handleVideoSelect = (e) => { processFiles(e.target.files); e.target.value = ''; };
  const handleBgmSelect = (e) => { processFiles(e.target.files); e.target.value = ''; };

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (!isRecording) processFiles(e.dataTransfer.files);
  };

  const handleReconnectSelect = (e) => {
    const file = e.target.files[0];
    if (file && reconnectTargetId) {
      const url = URL.createObjectURL(file);
      setVideos(prev => prev.map(v => v.id === reconnectTargetId ? { ...v, file, url, name: file.name, needsReconnect: false } : v));
      initAudioCtx();
      toast('ファイルを再接続しました', 'success');
    }
    e.target.value = '';
    setReconnectTargetId(null);
  };

  const handleLoadedMetadata = (id, e) => {
    const d = e.target.duration;
    setVideos(prev => prev.map(v => {
      if (v.id === id) {
        const newTrimEnd = (v.trimEnd === 0 || v.trimEnd > d) ? d : v.trimEnd;
        const newTrimStart = v.trimStart > d ? 0 : v.trimStart;
        return { ...v, duration: d, trimStart: newTrimStart, trimEnd: newTrimEnd };
      }
      return v;
    }));
    
    const el = videoRefs.current[id];
    if (el && audioCtxRef.current && destRef.current && !audioNodesRef.current[id]) {
      try {
        const source = audioCtxRef.current.createMediaElementSource(el);
        source.connect(destRef.current);
        source.connect(audioCtxRef.current.destination);
        audioNodesRef.current[id] = source;
      } catch (err) { console.warn("音声接続エラー:", err); }
    }
  };

  const handleBgmLoaded = () => {
    const el = bgmAudioRef.current;
    if (el && audioCtxRef.current && destRef.current && !bgmNodeRef.current) {
      try {
        const source = audioCtxRef.current.createMediaElementSource(el);
        const gainNode = audioCtxRef.current.createGain();
        gainNode.gain.value = bgmVolume / 100;
        
        source.connect(gainNode);
        gainNode.connect(destRef.current);
        gainNode.connect(audioCtxRef.current.destination);
        
        bgmNodeRef.current = source;
        bgmGainRef.current = gainNode;
      } catch (err) { console.warn("BGM接続エラー:", err); }
    } else if (bgmGainRef.current) {
      bgmGainRef.current.gain.value = bgmVolume / 100;
    }
  };

  useEffect(() => {
    if (bgmGainRef.current && audioCtxRef.current) {
      bgmGainRef.current.gain.setTargetAtTime(bgmVolume / 100, audioCtxRef.current.currentTime, 0.1);
    }
  }, [bgmVolume]);

  const removeVideo = (id) => {
    setVideos(prev => {
      const target = prev.find(v => v.id === id);
      if (target && target.url) URL.revokeObjectURL(target.url); 
      const next = prev.filter(v => v.id !== id);
      if (playingVideoId === id) setPlayingVideoId(next[0]?.id || null);
      if (activeVideoId === id) setActiveVideoId(next[0]?.id || null);
      return next;
    });
    if (audioNodesRef.current[id]) { audioNodesRef.current[id].disconnect(); delete audioNodesRef.current[id]; }
  };

  const removeBgm = () => {
    if (bgmUrl) URL.revokeObjectURL(bgmUrl);
    setBgmFile(null); setBgmUrl(null);
    if (bgmNodeRef.current) { bgmNodeRef.current.disconnect(); bgmNodeRef.current = null; }
    if (bgmGainRef.current) { bgmGainRef.current.disconnect(); bgmGainRef.current = null; }
  };

  const updateVideo = (id, field, value) => {
    setVideos(prev => prev.map(v => v.id === id ? { ...v, [field]: value } : v));
    if (field === 'trimStart' || field === 'trimEnd') {
      setPlayingVideoId(id);
      setIsPlaying(false);
      const target = videos.find(v => v.id === id);
      if (target && target.type === 'video' && videoRefs.current[id]) {
        videoRefs.current[id].currentTime = field === 'trimStart' ? value : target.trimStart;
      } else if (target && target.type !== 'video') {
        virtualTimeRef.current = 0; 
      }
    }
  };

  const updateText = (id, field, value) => {
    setTextList(prev => prev.map(t => {
      if (t.id === id) {
        const updated = { ...t, [field]: value };
        // 自動長さ調整
        if (field === 'text' && !t.hasManuallyEditedTime && value.length > 0) {
           let optimalDuration = (value.length * 0.3) + 1.0;
           optimalDuration = Math.max(2.0, Math.min(optimalDuration, 8.0));
           const newEnd = Math.min(totalDuration > 0 ? totalDuration : 9999, updated.start + optimalDuration);
           updated.end = newEnd;
        }
        if (field === 'start' || field === 'end') {
          updated.hasManuallyEditedTime = true;
        }
        return updated;
      }
      return t;
    }));
  };

  const addText = () => {
    setTextList(prev => {
      let newStart = 0;
      let newEnd = totalDuration > 0 ? totalDuration : 9999;
      let newPos = 'bottom';
      let newFont = 'Zen Maru Gothic';
      let newColor = '#ffffff';

      if (prev.length > 0) {
        const lastText = prev[prev.length - 1];
        newPos = lastText.pos; 
        newFont = lastText.font || 'Zen Maru Gothic'; 
        newColor = lastText.color; 
        
        newStart = lastText.end + 0.1;
        newEnd = Math.min(totalDuration > 0 ? totalDuration : 9999, newStart + 3.0);
        
        if (totalDuration > 0 && newStart >= totalDuration) {
          newStart = 0;
          newEnd = Math.min(totalDuration, 3.0);
        }
      } else if (totalDuration > 0) {
        newEnd = Math.min(totalDuration, 3.0);
      }

      return [...prev, { 
        id: Date.now(), 
        text: '', 
        color: newColor, 
        pos: newPos, 
        scale: 100, 
        start: newStart, 
        end: newEnd, 
        font: newFont,
        hasManuallyEditedTime: false 
      }];
    });
  };

  const removeText = (id) => { setTextList(prev => prev.filter(t => t.id !== id)); };

  const seekToGlobalTime = (targetTime) => {
    let accumulated = 0;
    for (let i = 0; i < videos.length; i++) {
      const v = videos[i];
      const d = v.type === 'video' ? Math.max(0, v.trimEnd - v.trimStart) : Math.max(0, v.trimEnd);
      
      if (targetTime <= accumulated + d || i === videos.length - 1) {
        setPlayingVideoId(v.id);
        const localTime = (v.type === 'video' ? v.trimStart : 0) + (targetTime - accumulated);
        
        if (v.type === 'video') {
          if (videoRefs.current[v.id] && !v.needsReconnect) {
            videoRefs.current[v.id].currentTime = localTime;
          }
        } else {
          virtualTimeRef.current = localTime;
        }
        
        videos.forEach(other => {
          if (other.type === 'video' && other.id !== v.id && videoRefs.current[other.id]) {
            videoRefs.current[other.id].pause();
          }
        });
        break;
      }
      accumulated += d;
    }
    
    if (bgmAudioRef.current && bgmUrl) {
      const bgmDuration = bgmAudioRef.current.duration;
      if (bgmDuration > 0) bgmAudioRef.current.currentTime = targetTime % bgmDuration; 
    }
  };

  const handleMouseDownTimeline = (e, id, type) => {
    e.preventDefault();
    if (!timelineRef.current || totalDuration <= 0) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const timePerPixel = totalDuration / rect.width;
    const clickTime = ((e.clientX ?? e.touches?.[0].clientX) - rect.left) * timePerPixel;
    const textItem = textList.find(t => t.id === id);
    if (!textItem) return;
    setDragging({ id, type, startOffset: clickTime - textItem.start });
  };

  const togglePlay = () => {
    if (videos.length === 0) return;
    if (videos.some(v => v.needsReconnect)) return toast('ファイルが見つからないメディアがあります', 'error');
    
    initAudioCtx();

    if (!playingVideoId) { setPlayingVideoId(videos[0].id); seekToGlobalTime(0); }

    const activeV = videos.find(v => v.id === playingVideoId);

    if (isPlaying) {
      if (activeV?.type === 'video') videoRefs.current[playingVideoId]?.pause();
      if (bgmAudioRef.current) bgmAudioRef.current.pause();
      setIsPlaying(false);
    } else {
      if (getGlobalTime() >= totalDuration - 0.1) seekToGlobalTime(0);
      
      lastFrameTimeRef.current = performance.now(); 
      
      if (activeV?.type === 'video') {
         videoRefs.current[playingVideoId]?.play();
      }
      
      if (bgmAudioRef.current && bgmUrl) bgmAudioRef.current.play();
      setIsPlaying(true);
    }
  };

  const togglePlayRef = useRef(togglePlay);
  useEffect(() => { togglePlayRef.current = togglePlay; }, [togglePlay]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
      if (tutorial.isActive) return; 

      if (e.key === 'Escape') {
        if (isAiModalOpen) setIsAiModalOpen(false);
        if (showClearConfirm) setShowClearConfirm(false);
        if (showShortcuts) setShowShortcuts(false);
        return;
      }

      switch (e.key) {
        case ' ':
          if (isAiModalOpen || showClearConfirm || showShortcuts) return;
          e.preventDefault();
          togglePlayRef.current();
          break;
        case 'a':
        case 'A':
          if (showClearConfirm || showShortcuts) return;
          e.preventDefault();
          setIsAiModalOpen(prev => !prev);
          break;
        case 'Backspace':
        case 'Delete':
          if (isAiModalOpen || showShortcuts) return;
          e.preventDefault();
          setShowClearConfirm(prev => !prev);
          break;
        case '?':
        case '/':
          if (isAiModalOpen || showClearConfirm) return;
          e.preventDefault();
          setShowShortcuts(prev => !prev);
          break;
        default:
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAiModalOpen, showClearConfirm, showShortcuts, tutorial.isActive]);

  const startRecording = async () => {
    const canvas = canvasRef.current;
    if (!canvas || videos.length === 0 || videos.some(v => v.needsReconnect)) return;

    let writableStream = null;
    if ('showSaveFilePicker' in window) {
      try {
        const fileHandle = await window.showSaveFilePicker({
          suggestedName: `映像制作スタジオ_${new Date().getTime()}.webm`,
          types: [{ description: 'WebM 動画ファイル', accept: { 'video/webm': ['.webm'] } }],
        });
        writableStream = await fileHandle.createWritable();
      } catch (err) { return; }
    }

    try {
      const canvasStream = canvas.captureStream(30);
      const tracks = [...canvasStream.getVideoTracks()];

      if (destRef.current) {
        const audioTracks = destRef.current.stream.getAudioTracks();
        if (audioTracks.length > 0) tracks.push(audioTracks[0]);
      }

      const stream = new MediaStream(tracks);
      const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
      const chunks = [];
      let elapsedChunks = 0;
      
      recorder.ondataavailable = async (e) => {
        if (e.data.size > 0) {
          if (writableStream) await writableStream.write(e.data);
          else chunks.push(e.data);
        }
        elapsedChunks += 1;
        setRecordingProgress(Math.min(99, Math.floor((elapsedChunks / totalDuration) * 100)));
      };
      
      recorder.onstop = async () => {
        if (writableStream) {
          await writableStream.close();
          setDownloadUrl('direct_saved'); 
        } else {
          const blob = new Blob(chunks, { type: 'video/webm' });
          setDownloadUrl(URL.createObjectURL(blob));
        }
        setIsRecording(false);
        setRecordingProgress(100);
        toast('動画の書き出しが完了しました', 'success');
      };

      recorderRef.current = recorder;
      recorder.start(1000); 
      setIsRecording(true);
      setRecordingProgress(0);
      setDownloadUrl(null);
      toast('動画の書き出しを開始しました');

      seekToGlobalTime(0);
      setIsPlaying(true);
      const firstV = videos[0];
      if (firstV.type === 'video' && videoRefs.current[firstV.id]) {
         videoRefs.current[firstV.id].play();
      }
      if (bgmAudioRef.current && bgmUrl) bgmAudioRef.current.play();

    } catch (err) {
      console.error("録画エラー:", err);
      toast('エラーが発生しました', 'error');
      setIsRecording(false);
      if (writableStream) await writableStream.close();
    }
  };

  const stopRecording = () => {
    if (recorderRef.current && recorderRef.current.state === 'recording') recorderRef.current.stop();
    videos.forEach(v => { if (v.type === 'video' && videoRefs.current[v.id]) videoRefs.current[v.id].pause(); });
    if (bgmAudioRef.current) bgmAudioRef.current.pause();
    setIsPlaying(false);
  };

  // --- Effects ---
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!dragging || !timelineRef.current || totalDuration <= 0) return;
      const rect = timelineRef.current.getBoundingClientRect();
      let newTime = (((e.clientX ?? e.touches?.[0].clientX) - rect.left) / rect.width) * totalDuration;
      newTime = Math.max(0, Math.min(newTime, totalDuration));

      setTextList(prev => prev.map(t => {
        if (t.id === dragging.id) {
          let updated = { ...t };
          if (dragging.type === 'start') updated.start = Math.max(0, Math.min(newTime, t.end - 0.5));
          else if (dragging.type === 'end') updated.end = Math.min(totalDuration, Math.max(newTime, t.start + 0.5));
          else if (dragging.type === 'move') {
            const len = t.end - t.start;
            updated.start = newTime - dragging.startOffset;
            updated.end = updated.start + len;
            if (updated.start < 0) { updated.start = 0; updated.end = len; }
            if (updated.end > totalDuration) { updated.end = totalDuration; updated.start = totalDuration - len; }
          }
          seekToGlobalTime(updated.start);
          setIsPlaying(false);
          return updated;
        }
        return t;
      }));
    };

    const handleMouseUp = () => setDragging(null);

    if (dragging) {
      window.addEventListener('mousemove', handleMouseMove, { passive: false });
      window.addEventListener('touchmove', handleMouseMove, { passive: false });
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchend', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [dragging, totalDuration, videos, playingVideoId]);

  useEffect(() => {
    if (videos.length === 0 || !canvasRef.current || !playingVideoId) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const drawFrame = (timestamp) => {
      if (!lastFrameTimeRef.current) lastFrameTimeRef.current = timestamp;
      const deltaTime = (timestamp - lastFrameTimeRef.current) / 1000;
      lastFrameTimeRef.current = timestamp;

      const activeV = videos.find(v => v.id === playingVideoId);
      if (!activeV || activeV.needsReconnect) return requestAnimationFrame(drawFrame);

      let currentLocalTime = 0;

      if (activeV.type === 'video') {
        const el = videoRefs.current[playingVideoId];
        if (el) currentLocalTime = el.currentTime;
      } else {
        if (isPlaying || isRecording) virtualTimeRef.current += deltaTime;
        currentLocalTime = virtualTimeRef.current;
      }

      const firstVideo = videos.find(v => v.type === 'video');
      if (firstVideo && videoRefs.current[firstVideo.id] && videoRefs.current[firstVideo.id].videoWidth > 0) {
         if (canvas.width !== videoRefs.current[firstVideo.id].videoWidth) {
           canvas.width = videoRefs.current[firstVideo.id].videoWidth;
           canvas.height = videoRefs.current[firstVideo.id].videoHeight;
         }
      } else if (canvas.width === 0 || canvas.width === 300) {
         canvas.width = 1280; canvas.height = 720;
      }

      const targetEndTime = activeV.type === 'video' ? activeV.trimEnd : activeV.trimEnd;
      if (currentLocalTime >= targetEndTime && !dragging) {
        const currentIndex = videos.findIndex(v => v.id === playingVideoId);
        if (currentIndex < videos.length - 1) {
          const nextV = videos[currentIndex + 1];
          
          if (activeV.type === 'video') videoRefs.current[playingVideoId]?.pause();
          
          setPlayingVideoId(nextV.id);
          
          if (nextV.type === 'video') {
            const nextEl = videoRefs.current[nextV.id];
            if (nextEl && !nextV.needsReconnect) {
              nextEl.currentTime = nextV.trimStart;
              if (isPlaying || isRecording) nextEl.play();
            }
          } else {
            virtualTimeRef.current = 0; 
          }
          return requestAnimationFrame(drawFrame);
        } else {
          if (isRecording) recorderRef.current?.stop();
          if (activeV.type === 'video') videoRefs.current[playingVideoId]?.pause();
          if (bgmAudioRef.current) bgmAudioRef.current.pause();
          setIsPlaying(false);
        }
      }

      const drawMedia = (mediaObj, filter, globalAlpha = 1.0) => {
        ctx.filter = filter; ctx.globalAlpha = globalAlpha;
        if (mediaObj.type === 'video') {
          const el = videoRefs.current[mediaObj.id];
          if (el && el.videoWidth > 0) {
            const scale = Math.min(canvas.width / el.videoWidth, canvas.height / el.videoHeight);
            const w = el.videoWidth * scale; const h = el.videoHeight * scale;
            const x = (canvas.width - w) / 2; const y = (canvas.height - h) / 2;
            ctx.drawImage(el, x, y, w, h);
          }
        } else if (mediaObj.type === 'image') {
          const el = imageRefs.current[mediaObj.id];
          if (el && el.complete && el.naturalWidth > 0) {
            const scale = Math.min(canvas.width / el.naturalWidth, canvas.height / el.naturalHeight);
            const w = el.naturalWidth * scale; const h = el.naturalHeight * scale;
            const x = (canvas.width - w) / 2; const y = (canvas.height - h) / 2;
            ctx.drawImage(el, x, y, w, h);
          }
        } else if (mediaObj.type === 'blank') {
          ctx.fillStyle = mediaObj.bgColor || '#000000';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        ctx.filter = 'none'; ctx.globalAlpha = 1.0;
      };

      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const currentIndex = videos.findIndex(v => v.id === playingVideoId);
      const timeSinceStart = currentLocalTime - (activeV.type === 'video' ? activeV.trimStart : 0);
      let isTransitioning = false; let progress = 0;
      
      if (activeV.transitionType !== 'none' && timeSinceStart >= 0 && timeSinceStart < 1.0) {
        isTransitioning = true; progress = timeSinceStart / 1.0;
      }

      if (isTransitioning) {
        if (currentIndex === 0) {
          drawMedia(activeV, activeV.filterType, activeV.transitionType === 'fade' ? progress : 1.0);
        } else {
          const prevV = videos[currentIndex - 1];
          if (activeV.transitionType === 'fade') {
            if (!prevV.needsReconnect) drawMedia(prevV, prevV.filterType, 1.0);
            drawMedia(activeV, activeV.filterType, progress);
          } else if (activeV.transitionType === 'wipe') {
            if (!prevV.needsReconnect) drawMedia(prevV, prevV.filterType, 1.0);
            ctx.save(); ctx.beginPath(); ctx.rect(0, 0, canvas.width * progress, canvas.height); ctx.clip();
            drawMedia(activeV, activeV.filterType, 1.0); ctx.restore();
          } else if (activeV.transitionType === 'slide') {
            ctx.save(); ctx.translate(-canvas.width * progress, 0);
            if (!prevV.needsReconnect) drawMedia(prevV, prevV.filterType, 1.0);
            ctx.restore();
            ctx.save(); ctx.translate(canvas.width * (1.0 - progress), 0);
            drawMedia(activeV, activeV.filterType, 1.0); ctx.restore();
          } else {
            drawMedia(activeV, activeV.filterType, 1.0);
          }
        }
      } else {
        drawMedia(activeV, activeV.filterType, 1.0);
      }

      const gTime = getGlobalTime();
      if (canvas.width > 0) {
        ctx.lineJoin = 'round';
        ctx.miterLimit = 2;
        textList.forEach(t => {
          if (t.text && gTime >= t.start && gTime <= t.end) {
            const fontSize = Math.floor(canvas.height / 8) * (t.scale / 100);
            const fontFamily = t.font || 'Zen Maru Gothic';
            ctx.font = `bold ${fontSize}px "${fontFamily}", sans-serif`;
            ctx.fillStyle = t.color; ctx.textAlign = 'center';
            const x = canvas.width / 2;
            let y = t.pos === 'top' ? fontSize / 2 : (t.pos === 'middle' ? canvas.height / 2 : canvas.height - (fontSize / 2));
            ctx.textBaseline = t.pos === 'middle' ? 'middle' : (t.pos === 'top' ? 'top' : 'bottom');
            
            ctx.lineWidth = Math.max(4, fontSize / 10);
            ctx.strokeStyle = t.color === '#ffffff' ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.9)';
            ctx.strokeText(t.text, x, y); 
            ctx.fillText(t.text, x, y);
          }
        });
      }

      if (progressRef.current && totalDuration > 0) progressRef.current.style.left = `${(gTime / totalDuration) * 100}%`;
      animationFrameId = requestAnimationFrame(drawFrame);
    };

    animationFrameId = requestAnimationFrame(drawFrame);
    return () => cancelAnimationFrame(animationFrameId);
  }, [videos, playingVideoId, isPlaying, textList, dragging]);

  return (
    <RubyContext.Provider value={showRuby}>
      <div 
        className="h-[100dvh] flex flex-col bg-slate-50 font-['Zen_Maru_Gothic'] text-slate-800 leading-[1.8] outline-none overflow-hidden"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        tabIndex={0}
      >
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=DotGothic16&family=Hachi+Maru+Pop&family=Noto+Sans+JP:wght@700&family=Noto+Serif+JP:wght@700&family=Yusei+Magic&family=Zen+Maru+Gothic:wght@400;500;700&display=swap');
          body { font-family: 'Zen Maru Gothic', sans-serif; overflow: hidden; margin: 0; padding: 0; }
          .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
          @keyframes fadeInDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
          .animate-fade-in-down { animation: fadeInDown 0.2s ease-out forwards; }
        `}</style>
        
        <TutorialOverlay {...tutorial} />
        <ShortcutsModal show={showShortcuts} onClose={() => setShowShortcuts(false)} />
        <ClearConfirmModal show={showClearConfirm} onConfirm={executeClearAll} onCancel={() => setShowClearConfirm(false)} />

        <div className="hidden">
          {videos.filter(v => v.type === 'image' && v.url).map(v => (
            <img key={v.id} ref={el => imageRefs.current[v.id] = el} src={v.url} alt="cache" />
          ))}
        </div>

        {isDragging && (
          <div className="fixed inset-0 bg-red-600/90 z-[400] flex flex-col items-center justify-center text-white backdrop-blur-sm pointer-events-none transition-opacity">
            <UploadCloud className="w-20 h-20 md:w-24 md:h-24 mb-6 animate-bounce" />
            <h2 className="text-2xl md:text-4xl font-bold tracking-wider"><R t="動画" r="どうが" />や<R t="音楽" r="おんがく" />をドロップ！</h2>
            <p className="text-base md:text-lg mt-4 opacity-80">ここにファイルを<R t="離" r="はな" />してね</p>
          </div>
        )}

        {/* ========================================== */}
        {/* 🤖 AIモーダル (ステップUI化) */}
        {/* ========================================== */}
        {isAiModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 z-[150] flex items-center justify-center p-3 md:p-4 backdrop-blur-sm animate-fade-in-down" onClick={() => setIsAiModalOpen(false)}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90dvh] overflow-hidden transform transition-all scale-100" onClick={e => e.stopPropagation()}>
              
              <div className="bg-gradient-to-r from-red-600 to-orange-500 px-5 py-3 md:px-6 md:py-4 flex justify-between items-center flex-shrink-0">
                <h3 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                  <Bot size={22} className="text-red-100" /> <span>AIディレクターに<R t="頼" r="たの" />む</span>
                </h3>
                <button onClick={() => setIsAiModalOpen(false)} className="text-white/70 hover:text-white transition-colors bg-white/10 rounded-full p-1 active:scale-95"><X size={20}/></button>
              </div>

              {/* ステップインジケーター */}
              <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex justify-between items-center text-[10px] md:text-xs font-bold text-slate-400">
                <div className={`flex flex-col items-center gap-1 ${aiStep === 1 ? 'text-red-600' : ''}`}><div className={`w-6 h-6 rounded-full flex items-center justify-center ${aiStep === 1 ? 'bg-red-500 text-white' : 'bg-slate-200'}`}>1</div>テーマ設定</div>
                <div className="h-px bg-slate-200 flex-1 mx-2"></div>
                <div className={`flex flex-col items-center gap-1 ${aiStep === 2 ? 'text-red-600' : ''}`}><div className={`w-6 h-6 rounded-full flex items-center justify-center ${aiStep === 2 ? 'bg-red-500 text-white' : 'bg-slate-200'}`}>2</div>構成の相談</div>
                <div className="h-px bg-slate-200 flex-1 mx-2"></div>
                <div className={`flex flex-col items-center gap-1 ${aiStep === 3 ? 'text-red-600' : ''}`}><div className={`w-6 h-6 rounded-full flex items-center justify-center ${aiStep === 3 ? 'bg-red-500 text-white' : 'bg-slate-200'}`}>3</div>レシピ出力</div>
                <div className="h-px bg-slate-200 flex-1 mx-2"></div>
                <div className={`flex flex-col items-center gap-1 ${aiStep === 4 ? 'text-red-600' : ''}`}><div className={`w-6 h-6 rounded-full flex items-center justify-center ${aiStep === 4 ? 'bg-red-500 text-white' : 'bg-slate-200'}`}>4</div>完成！</div>
              </div>

              <div className="p-5 md:p-8 overflow-y-auto custom-scrollbar flex-grow bg-white">
                
                {/* STEP 1: テーマと雰囲気の設定 */}
                {aiStep === 1 && (
                  <div className="flex flex-col gap-5 animate-fade-in-down">
                    <p className="text-slate-600 font-bold text-sm md:text-base leading-relaxed">
                      AIはプロの映像監督です。<br/>どんな動画を作りたいか、イメージを伝えてみましょう！
                    </p>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5"><R t="作" r="つく" />りたい動画のテーマ</label>
                      <textarea 
                        value={aiTheme} 
                        onChange={e => setAiTheme(e.target.value)} 
                        placeholder="例：運動会のかっこいいハイライト！ / 朝顔が咲いた感動の記録" 
                        className="w-full h-20 border-2 border-slate-200 rounded-xl px-3 py-2 text-sm font-bold bg-slate-50 focus:bg-white focus:border-red-400 focus:ring-4 focus:ring-red-100 outline-none transition-all resize-none" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5"><R t="希望" r="きぼう" />する<R t="雰囲気" r="ふんいき" /></label>
                      <select 
                        value={aiVibe} 
                        onChange={e => setAiVibe(e.target.value)} 
                        className="w-full border-2 border-slate-200 rounded-xl p-3 text-sm font-bold bg-slate-50 focus:bg-white focus:border-red-400 outline-none cursor-pointer"
                      >
                        {vibes.map(v => <option key={v} value={v}>{v}</option>)}
                      </select>
                    </div>
                    <button onClick={() => setAiStep(2)} className="w-full mt-2 bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2">
                      <R t="次" r="つぎ" />へ（AIへの<R t="相談文" r="そうだんぶん" />を<R t="作" r="つく" />る） <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                )}

                {/* STEP 2: プロンプトA（構成の相談） */}
                {aiStep === 2 && (
                  <div className="flex flex-col gap-4 animate-fade-in-down">
                    <div className="bg-red-50 border border-red-100 p-4 rounded-xl">
                      <p className="text-red-800 font-bold text-xs md:text-sm leading-relaxed mb-2">
                        以下の<R t="指示文" r="しじぶん" />をコピーして、AI（ChatGPTなど）に送ってください。<br/>
                        AIが、プロの目線で<span className="bg-red-200 px-1 rounded">最高の構成案</span>や<span className="bg-red-200 px-1 rounded">足りない画像・BGMの作り方</span>を提案してくれます！
                      </p>
                      <div className="relative">
                        <textarea readOnly value={promptA} className="w-full h-32 text-[10px] md:text-xs text-slate-600 bg-white rounded-lg p-3 border border-red-200 focus:outline-none custom-scrollbar shadow-inner" />
                        <button onClick={() => handleCopyPrompt(promptA)} className="absolute bottom-3 right-3 bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-red-700 transition-all shadow-sm active:scale-95">
                          <Copy className="w-4 h-4"/> コピー
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <a href="https://chatgpt.com/" target="_blank" rel="noreferrer" className="flex flex-1 items-center justify-center gap-1.5 bg-white border border-slate-300 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:border-red-400 hover:text-red-600 transition-all active:scale-95 shadow-sm"><ExternalLink className="w-3.5 h-3.5"/> ChatGPT</a>
                      <a href="https://gemini.google.com/" target="_blank" rel="noreferrer" className="flex flex-1 items-center justify-center gap-1.5 bg-white border border-slate-300 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:border-red-400 hover:text-red-600 transition-all active:scale-95 shadow-sm"><ExternalLink className="w-3.5 h-3.5"/> Gemini</a>
                      <a href="https://claude.ai/" target="_blank" rel="noreferrer" className="flex flex-1 items-center justify-center gap-1.5 bg-white border border-slate-300 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:border-red-400 hover:text-red-600 transition-all active:scale-95 shadow-sm"><ExternalLink className="w-3.5 h-3.5"/> Claude</a>
                    </div>

                    <div className="flex gap-3 mt-2">
                      <button onClick={() => setAiStep(1)} className="px-5 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition-all active:scale-95">戻る</button>
                      <button onClick={() => setAiStep(3)} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2">
                        AIから<R t="構成案" r="こうせいあん" />をもらったら<R t="次" r="つぎ" />へ <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 3: プロンプトB（JSONの出力） */}
                {aiStep === 3 && (
                  <div className="flex flex-col gap-4 animate-fade-in-down">
                    <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl">
                      <p className="text-indigo-800 font-bold text-xs md:text-sm leading-relaxed mb-2 flex items-start gap-2">
                        <Info className="w-5 h-5 shrink-0 mt-0.5 text-indigo-500" />
                        <span>AIが提案した「追加素材」があれば、この画面の下で追加してから進んでね。<br/>準備ができたら、以下の<R t="指示文" r="しじぶん" />をAIに送って、アプリ用のプログラム（JSON）をもらいましょう！</span>
                      </p>
                      <div className="relative mt-3">
                        <textarea readOnly value={promptB} className="w-full h-32 text-[10px] md:text-xs text-slate-600 bg-white rounded-lg p-3 border border-indigo-200 focus:outline-none custom-scrollbar shadow-inner" />
                        <button onClick={() => handleCopyPrompt(promptB)} className="absolute bottom-3 right-3 bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-indigo-700 transition-all shadow-sm active:scale-95">
                          <Copy className="w-4 h-4"/> コピー
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-3 mt-2">
                      <button onClick={() => setAiStep(2)} className="px-5 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition-all active:scale-95">戻る</button>
                      <button onClick={() => setAiStep(4)} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2">
                        プログラムをもらったら<R t="次" r="つぎ" />へ <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 4: レシピ適用 */}
                {aiStep === 4 && (
                  <div className="flex flex-col gap-4 animate-fade-in-down">
                    <p className="text-slate-600 font-bold text-xs md:text-sm">
                      AIが作ってくれたプログラム（JSONコード）をここに貼り付けてね。
                    </p>
                    <textarea 
                      value={aiJsonInput} 
                      onChange={(e) => setAiJsonInput(e.target.value)}
                      placeholder='{"videos": [...], "texts": [...]}'
                      className="w-full h-40 text-xs font-mono bg-slate-50 rounded-xl p-3 border-2 border-slate-200 focus:bg-white focus:border-red-400 focus:ring-4 focus:ring-red-100 outline-none transition-all shadow-inner custom-scrollbar"
                    />
                    
                    <div className="flex gap-3 mt-2">
                      <button onClick={() => setAiStep(3)} className="px-5 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition-all active:scale-95">戻る</button>
                      <button 
                        onClick={applyAiRecipe}
                        disabled={!aiJsonInput.trim() || videos.length === 0}
                        className="flex-1 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white font-bold py-3.5 rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        <Sparkles className="w-5 h-5"/>
                        レシピを<R t="適用" r="てきよう" />して<R t="完成" r="かんせい" />！
                      </button>
                    </div>
                    {videos.length === 0 && (
                      <p className="text-[10px] text-red-500 text-center font-bold flex items-center justify-center gap-1 mt-1">
                        <AlertTriangle className="w-3 h-3" /> 先に右のパネルから素材を追加してください。
                      </p>
                    )}
                  </div>
                )}

              </div>
            </div>
          </div>
        )}

        <Header showRuby={showRuby} setShowRuby={setShowRuby} onHelpClick={tutorial.startTutorial} onShortcutsClick={() => setShowShortcuts(true)} />

        {/* メインエリア：モバイル時は上下分割、PC時は左右分割 */}
        <main className="flex-grow flex flex-col lg:flex-row min-h-0 overflow-hidden">
          
          {/* 左側（モバイル時は上側）: プレビュー＆タイムライン */}
          <section className="flex-none h-[45dvh] lg:h-auto lg:flex-1 flex flex-col p-2 md:p-4 gap-2 border-b lg:border-b-0 lg:border-r border-slate-200 bg-slate-100/50 z-10 overflow-hidden shadow-sm lg:shadow-none">
            
            <div className="flex-grow bg-slate-900 rounded-xl overflow-hidden relative flex items-center justify-center min-h-0 shadow-inner">
              {videos.length === 0 ? (
                <div className="text-center flex flex-col items-center text-slate-400">
                  <Film className="w-12 h-12 md:w-16 md:h-16 mb-3 opacity-30 text-red-400" />
                  <p className="text-sm md:text-lg font-bold text-slate-500">ツールパネルから</p>
                  <p className="text-sm md:text-lg font-bold text-slate-500">素材を<R t="追加" r="ついか" />してね</p>
                </div>
              ) : (
                <>
                  {videos.map(v => (
                    v.type === 'video' && (
                      <video 
                        key={v.id} ref={el => videoRefs.current[v.id] = el}
                        src={v.url} className="hidden" crossOrigin="anonymous" playsInline muted={true}
                        onLoadedMetadata={(e) => handleLoadedMetadata(v.id, e)}
                      />
                    )
                  ))}
                  <audio ref={bgmAudioRef} src={bgmUrl} className="hidden" crossOrigin="anonymous" loop onLoadedMetadata={handleBgmLoaded} />
                  <canvas ref={canvasRef} className="max-w-full max-h-full object-contain" />
                  
                  {isRecording && (
                    <div className="absolute top-2 right-2 md:top-4 md:right-4 bg-red-600 text-white px-2.5 py-1 md:px-3 md:py-1.5 rounded-md text-[10px] md:text-sm font-bold flex items-center gap-1.5 animate-pulse shadow-md">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                      <R t="書" r="か" />き<R t="出" r="だ" />し<R t="中" r="ちゅう" />...
                    </div>
                  )}

                  {videos.find(v => v.id === playingVideoId)?.needsReconnect && (
                    <div className="absolute inset-0 bg-slate-900/80 flex flex-col items-center justify-center z-20 backdrop-blur-sm text-white p-4 text-center">
                      <AlertTriangle className="w-8 h-8 md:w-12 md:h-12 text-red-400 mb-2 md:mb-4 animate-pulse" />
                      <h3 className="text-sm md:text-lg font-bold mb-1 md:mb-2">ファイルがありません</h3>
                      <button
                        onClick={() => { setReconnectTargetId(playingVideoId); setTimeout(() => reconnectInputRef.current?.click(), 0); }}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold py-1.5 px-4 md:py-2.5 md:px-6 rounded-lg shadow-md transition-all active:scale-95 flex items-center gap-2 text-xs md:text-sm mt-2"
                      ><FileVideo className="w-4 h-4 md:w-5 md:h-5" />ファイルを<R t="選択" r="せんたく" />し<R t="直" r="なお" />す</button>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="flex-none flex items-center gap-2 md:gap-4 w-full max-w-3xl mx-auto px-1">
              <button 
                onClick={togglePlay} disabled={isRecording || videos.some(v => v.needsReconnect)}
                className="bg-red-600 text-white hover:bg-red-700 w-10 h-10 md:w-12 md:h-12 rounded-full transition-all active:scale-95 disabled:opacity-50 flex-shrink-0 shadow-md flex items-center justify-center focus-visible:ring-4 focus-visible:ring-red-300 outline-none"
              >{isPlaying ? <Pause className="w-5 h-5 md:w-6 md:h-6" /> : <Play className="w-5 h-5 md:w-6 md:h-6 ml-0.5 md:ml-1" />}</button>
              <button 
                onClick={() => { seekToGlobalTime(0); if(!isPlaying) togglePlay(); }} disabled={isRecording || videos.some(v => v.needsReconnect)}
                className="bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 w-10 h-10 md:w-12 md:h-12 rounded-full transition-all active:scale-95 disabled:opacity-50 flex-shrink-0 shadow-sm flex items-center justify-center focus-visible:ring-4 focus-visible:ring-slate-200 outline-none"
              ><RotateCcw className="w-4 h-4 md:w-5 md:h-5" /></button>
              
              <div className="flex-grow flex items-center gap-2 md:gap-3 bg-white rounded-full px-3 md:px-4 py-2 border border-slate-200 shadow-sm">
                <span className="text-[10px] md:text-xs font-bold text-slate-500 w-8 md:w-10 text-right font-mono" translate="no">{formatTime(getGlobalTime())}</span>
                <div className="flex-grow h-1.5 md:h-2 bg-slate-100 rounded-full overflow-hidden cursor-pointer" onClick={(e) => {
                  if (!isRecording) {
                    const rect = e.currentTarget.getBoundingClientRect();
                    seekToGlobalTime(((e.clientX - rect.left) / rect.width) * totalDuration);
                  }
                }}>
                   <div className="h-full bg-red-500 transition-all duration-75 ease-linear pointer-events-none rounded-full" style={{ width: `${totalDuration > 0 ? (getGlobalTime() / totalDuration) * 100 : 0}%` }}></div>
                </div>
                <span className="text-[10px] md:text-xs font-bold text-slate-500 w-8 md:w-10 font-mono" translate="no">{formatTime(totalDuration)}</span>
              </div>
            </div>

            <div id="tutorial-timeline" className="flex-none h-[100px] md:h-32 bg-white border border-slate-200 rounded-xl p-2 shadow-sm flex flex-col gap-1 w-full mx-auto">
              <div className="text-[10px] md:text-xs font-bold text-slate-600 flex items-center gap-1.5 flex-none pl-1">
                <Clock className="w-3.5 h-3.5 text-red-500" /> タイムライン
              </div>
              
              <div 
                className="flex-grow relative bg-slate-50 rounded-lg cursor-pointer select-none overflow-y-auto overflow-x-hidden custom-scrollbar border border-slate-200/60"
                ref={timelineRef}
                onClick={(e) => {
                   if (e.target.classList.contains('timeline-bg') || e.target.classList.contains('timeline-container')) {
                      const rect = timelineRef.current.getBoundingClientRect();
                      const newTime = (((e.clientX ?? e.touches?.[0].clientX) - rect.left) / rect.width) * totalDuration;
                      seekToGlobalTime(newTime); setIsPlaying(false);
                   }
                }}
              >
                <div className="timeline-container" style={{ height: `${Math.max(100, textList.length * 36 + 20)}px`, minHeight: '100%', position: 'relative' }}>
                  <div className="absolute inset-0 timeline-bg pointer-events-auto" style={{ backgroundSize: '10% 100%', backgroundImage: 'linear-gradient(to right, rgba(203, 213, 225, 0.3) 1px, transparent 1px)' }}></div>
                  
                  {(() => {
                    let acc = 0;
                    return videos.map((v, i) => {
                      acc += (v.type === 'video' ? v.trimEnd - v.trimStart : v.trimEnd);
                      if (i === videos.length - 1) return null;
                      return <div key={`sep-${i}`} className="absolute top-0 bottom-0 w-px bg-slate-300 pointer-events-none" style={{ left: `${(acc / totalDuration) * 100}%` }}></div>;
                    });
                  })()}

                  {textList.map((t, index) => {
                    const leftPercent = totalDuration > 0 ? (t.start / totalDuration) * 100 : 0;
                    const widthPercent = totalDuration > 0 ? ((t.end - t.start) / totalDuration) * 100 : 0;
                    return (
                      <div
                        key={t.id} className="absolute h-7 rounded-md bg-red-50 border border-red-300 flex items-center justify-between group cursor-grab active:cursor-grabbing hover:bg-red-100 hover:border-red-400 transition-colors shadow-sm mt-4"
                        style={{ left: `${leftPercent}%`, width: `${widthPercent}%`, top: `${index * 34 + 8}px` }}
                        onMouseDown={(e) => { e.stopPropagation(); handleMouseDownTimeline(e, t.id, 'move'); }}
                        onTouchStart={(e) => { e.stopPropagation(); handleMouseDownTimeline(e, t.id, 'move'); }}
                      >
                        <div className="touch-none w-5 md:w-6 h-full cursor-ew-resize bg-red-400 hover:bg-red-500 rounded-l-[5px] flex items-center justify-center shrink-0 transition-colors" onMouseDown={(e) => { e.stopPropagation(); handleMouseDownTimeline(e, t.id, 'start'); }} onTouchStart={(e) => { e.stopPropagation(); handleMouseDownTimeline(e, t.id, 'start'); }}><div className="w-0.5 h-3 bg-white rounded-full pointer-events-none"></div></div>
                        <div className="flex-grow text-center text-[10px] md:text-xs font-bold text-red-900 truncate px-1.5 pointer-events-none flex items-center justify-center gap-1">
                          <span className="bg-red-600 text-white rounded w-3.5 h-3.5 inline-flex items-center justify-center text-[9px] shrink-0">{index + 1}</span>
                          <span className="truncate">{t.text || '（空）'}</span>
                        </div>
                        <div className="touch-none w-5 md:w-6 h-full cursor-ew-resize bg-red-400 hover:bg-red-500 rounded-r-[5px] flex items-center justify-center shrink-0 transition-colors" onMouseDown={(e) => { e.stopPropagation(); handleMouseDownTimeline(e, t.id, 'end'); }} onTouchStart={(e) => { e.stopPropagation(); handleMouseDownTimeline(e, t.id, 'end'); }}><div className="w-0.5 h-3 bg-white rounded-full pointer-events-none"></div></div>
                      </div>
                    );
                  })}
                  <div ref={progressRef} className="absolute top-0 bottom-0 w-0.5 bg-slate-800 pointer-events-none z-10 shadow-[0_0_6px_rgba(30,41,59,0.6)]" style={{ left: '0%' }}>
                    <div className="w-3 h-3 bg-slate-800 rounded-full absolute -top-1.5 -left-[5px] shadow-sm border-2 border-white"></div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 右側（モバイル時は下側）: ツールパネル */}
          <aside className="flex-grow lg:flex-none lg:w-[420px] xl:w-[480px] p-3 md:p-5 overflow-y-auto custom-scrollbar bg-white flex flex-col gap-5 lg:gap-6 border-l border-slate-200">
            
            <button 
              id="tutorial-ai"
              onClick={() => setIsAiModalOpen(true)}
              className="w-full bg-gradient-to-r from-red-600 via-rose-500 to-orange-500 hover:from-red-700 hover:via-rose-600 hover:to-orange-600 text-white font-bold rounded-2xl py-3.5 px-5 flex items-center justify-between shadow-lg hover:shadow-xl transition-all active:scale-95 border border-red-400 focus-visible:ring-4 focus-visible:ring-red-300 outline-none"
            >
              <div className="flex items-center gap-2.5">
                <Bot className="w-5 h-5 animate-bounce text-white" />
                <span className="text-base md:text-lg tracking-wider">AIディレクター</span>
              </div>
              <Sparkles className="w-4 h-4 opacity-90 animate-pulse" />
            </button>

            <div id="tutorial-step1" className="bg-slate-50/50 rounded-2xl shadow-sm p-4 md:p-5 border border-slate-200">
              <h2 className="text-base md:text-lg font-bold text-slate-800 flex items-center gap-2 mb-3">
                <span className="bg-slate-800 text-white w-5 h-5 rounded flex items-center justify-center text-xs shadow-sm">1</span>
                メディアを<R t="並" r="なら" />べる
              </h2>
              <input type="file" accept="video/mp4,video/webm,video/ogg,image/png,image/jpeg,image/webp" onChange={handleVideoSelect} ref={fileInputRef} className="hidden" multiple />
              <input type="file" accept="video/mp4,video/webm,video/ogg,image/png,image/jpeg,image/webp" onChange={handleReconnectSelect} ref={reconnectInputRef} className="hidden" />
              
              <div className="flex gap-2 mb-3">
                <button onClick={() => fileInputRef.current?.click()} disabled={isRecording} className="flex-1 bg-white border border-slate-300 rounded-xl flex items-center justify-center gap-1.5 text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-all active:scale-95 disabled:opacity-50 py-2 shadow-sm">
                  <ImageIcon className="w-4 h-4" /><span className="text-xs font-bold"><R t="動画" r="どうが" />/<R t="画像" r="がぞう" /></span>
                </button>
                <button onClick={addBlankPage} disabled={isRecording} className="flex-1 bg-white border border-slate-300 rounded-xl flex items-center justify-center gap-1.5 text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-all active:scale-95 disabled:opacity-50 py-2 shadow-sm">
                  <SquareMenu className="w-4 h-4" /><span className="text-xs font-bold"><R t="空白" r="くうはく" />ページ</span>
                </button>
              </div>

              <div className="flex gap-2.5 overflow-x-auto pb-2 custom-scrollbar px-1 touch-pan-x">
                {videos.map((v, i) => (
                  v.needsReconnect ? (
                    <div key={v.id} className={`flex-shrink-0 w-24 h-16 bg-slate-100 rounded-lg relative cursor-pointer border-2 border-dashed flex flex-col items-center justify-center p-1 ${activeVideoId === v.id ? 'border-slate-800 shadow-md ring-2 ring-slate-200' : 'border-slate-300 hover:border-slate-400'}`} onClick={() => { setActiveVideoId(v.id); setPlayingVideoId(v.id); setIsPlaying(false); }}>
                      <div className="text-slate-400 mb-0.5"><AlertTriangle className="w-4 h-4" /></div>
                      <div className="text-[8px] font-bold text-slate-500 text-center truncate w-full px-1">{v.name}</div>
                      <button onClick={(e) => { e.stopPropagation(); setReconnectTargetId(v.id); setTimeout(() => reconnectInputRef.current?.click(), 0); }} className="absolute inset-0 w-full h-full bg-slate-800/90 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-lg backdrop-blur-sm z-10"><span className="bg-slate-700 text-white text-[9px] px-2 py-1 rounded shadow font-bold"><R t="再選択" r="さいせんたく" /></span></button>
                      <button onClick={(e) => { e.stopPropagation(); removeVideo(v.id); }} className="absolute -top-2 -right-2 bg-white text-slate-400 hover:text-slate-800 hover:border-slate-800 border border-slate-200 rounded-full p-1 shadow-sm transition-all active:scale-95 z-20"><Trash2 className="w-3 h-3"/></button>
                    </div>
                  ) : (
                    <div key={v.id} className={`flex-shrink-0 w-24 h-16 rounded-lg relative cursor-pointer border-2 transition-all overflow-hidden ${activeVideoId === v.id ? 'border-red-500 shadow-md ring-2 ring-red-100' : 'border-transparent hover:border-slate-400 opacity-90 hover:opacity-100'} ${v.type === 'blank' ? '' : 'bg-slate-800'}`} style={{ backgroundColor: v.type === 'blank' ? (v.bgColor || '#000000') : undefined }} onClick={() => { setActiveVideoId(v.id); setPlayingVideoId(v.id); if (v.type === 'video' && videoRefs.current[v.id]) videoRefs.current[v.id].currentTime = v.trimStart; setIsPlaying(false); }}>
                      {v.type === 'video' && <video src={v.url} className="w-full h-full object-cover" />}
                      {v.type === 'image' && <img src={v.url} className="w-full h-full object-cover" alt="thumb" />}
                      <div className="absolute top-1 left-1 bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                        {v.type === 'video' ? <Film className="w-2.5 h-2.5"/> : v.type === 'image' ? <ImageIcon className="w-2.5 h-2.5"/> : <SquareMenu className="w-2.5 h-2.5"/>}
                        {i + 1}
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); removeVideo(v.id); }} className="absolute -top-2 -right-2 bg-white text-slate-400 hover:text-red-500 hover:border-red-200 border border-slate-200 rounded-full p-1 shadow-sm transition-all active:scale-95 z-20"><Trash2 className="w-3 h-3"/></button>
                    </div>
                  )
                ))}
              </div>
            </div>

            <div id="tutorial-step2-3" className="flex flex-col gap-4">
              {/* BGM（音楽）パネル */}
              <div className="bg-slate-50/50 rounded-2xl shadow-sm p-4 md:p-5 border border-slate-200">
                <h2 className="text-base md:text-lg font-bold text-slate-800 flex items-center gap-2 mb-3">
                  <span className="bg-slate-800 text-white w-5 h-5 rounded flex items-center justify-center text-xs shadow-sm">2</span>
                  <R t="音楽" r="おんがく" /> (BGM) を<R t="入" r="い" />れる
                </h2>
                <input type="file" accept="audio/*" onChange={handleBgmSelect} ref={bgmInputRef} className="hidden" />
                
                {!bgmFile ? (
                  <button onClick={() => bgmInputRef.current?.click()} disabled={isRecording} className="w-full bg-white border border-dashed border-slate-300 rounded-xl flex items-center justify-center gap-2 text-slate-500 hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-all active:scale-95 py-3 shadow-sm">
                    <Music className="w-4 h-4" /><span className="text-xs font-bold"><R t="音楽" r="おんがく" />ファイルを<R t="選択" r="せんたく" /></span>
                  </button>
                ) : (
                  <div className="bg-white border border-red-100 rounded-xl p-3 relative shadow-sm">
                    <button onClick={removeBgm} className="absolute -top-2 -right-2 bg-white text-slate-400 hover:text-red-500 hover:border-red-200 rounded-full p-1 shadow-sm border border-slate-200 transition-colors"><X className="w-3.5 h-3.5" /></button>
                    <div className="flex items-center gap-1.5 mb-2 truncate text-xs font-bold text-red-900 bg-red-50/50 p-1.5 rounded-lg"><Music className="w-3.5 h-3.5 text-red-500 shrink-0"/> {bgmFile.name}</div>
                    <div className="flex items-center gap-2 px-1">
                      <Volume2 className="w-4 h-4 text-red-400 shrink-0" />
                      <input type="range" min="0" max="100" value={bgmVolume} onChange={(e) => setBgmVolume(parseInt(e.target.value))} className="w-full accent-red-500 h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer" />
                      <span className="text-[10px] font-bold text-red-600 w-6 text-right">{bgmVolume}%</span>
                    </div>
                  </div>
                )}
              </div>

              {activeVideoId && videos.find(v => v.id === activeVideoId) && (() => {
                const activeV = videos.find(v => v.id === activeVideoId);
                const sceneIndex = videos.findIndex(v => v.id === activeVideoId) + 1;
                return (
                  <div className="bg-red-50/30 rounded-2xl p-4 md:p-5 border border-red-100 animate-fade-in relative shadow-sm mt-2">
                    <div className="absolute -top-3.5 left-5 bg-red-600 text-white text-sm font-bold px-4 py-1.5 rounded-md shadow-md flex items-center gap-1.5">
                      <Scissors className="w-4 h-4"/> シーン {sceneIndex} の<R t="設定" r="せってい" />
                    </div>
                    <div className="mt-2 flex flex-col gap-4">
                      
                      {activeV.type === 'video' ? (
                        <div>
                          <h3 className="text-xs font-bold text-slate-700 mb-2"><R t="長" r="なが" />さを<R t="変更" r="へんこう" /></h3>
                          <div className="flex flex-col gap-2 bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                            <div>
                              <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1"><span><R t="開始" r="かいし" /></span><span className="text-red-700 font-mono" translate="no">{formatTime(activeV.trimStart)}</span></div>
                              <input type="range" min="0" max={activeV.duration} step="0.1" value={activeV.trimStart} onChange={(e) => { let val = parseFloat(e.target.value); if (val >= activeV.trimEnd) val = activeV.trimEnd - 0.5; updateVideo(activeV.id, 'trimStart', val); }} className="w-full accent-red-500 h-1.5 bg-slate-100 rounded-full appearance-none cursor-pointer" />
                            </div>
                            <div>
                              <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1"><span><R t="終了" r="しゅうりょう" /></span><span className="text-red-700 font-mono" translate="no">{formatTime(activeV.trimEnd)}</span></div>
                              <input type="range" min="0" max={activeV.duration} step="0.1" value={activeV.trimEnd} onChange={(e) => { let val = parseFloat(e.target.value); if (val <= activeV.trimStart) val = activeV.trimStart + 0.5; updateVideo(activeV.id, 'trimEnd', val); }} className="w-full accent-red-500 h-1.5 bg-slate-100 rounded-full appearance-none cursor-pointer" />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <h3 className="text-xs font-bold text-slate-700 mb-2"><R t="表示時間" r="ひょうじじかん" /></h3>
                          <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                            <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1"><span><R t="長" r="なが" />さ</span><span className="text-red-700 font-mono" translate="no">{formatTime(activeV.trimEnd)}</span></div>
                            <input type="range" min="0.5" max="30" step="0.5" value={activeV.trimEnd} onChange={(e) => updateVideo(activeV.id, 'trimEnd', parseFloat(e.target.value))} className="w-full accent-red-500 h-1.5 bg-slate-100 rounded-full appearance-none cursor-pointer" />
                          </div>
                        </div>
                      )}

                      {activeV.type === 'blank' && (
                        <div>
                          <h3 className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1"><PaintBucket className="w-3.5 h-3.5 text-red-400"/> <R t="背景色" r="はいけいいろ" /></h3>
                          <div className="flex gap-2">
                            {bgColors.map((c) => (<button key={c.value} onClick={() => updateVideo(activeV.id, 'bgColor', c.value)} className={`w-6 h-6 rounded border shadow-sm transition-all active:scale-95 ${activeV.bgColor === c.value ? 'border-red-500 scale-110 ring-2 ring-red-200' : 'border-slate-300'}`} style={{ backgroundColor: c.value }} />))}
                          </div>
                        </div>
                      )}

                      {activeV.type !== 'blank' && (
                        <div>
                          <h3 className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1"><Wand2 className="w-3.5 h-3.5 text-red-400"/> <R t="映像" r="えいぞう" />フィルター</h3>
                          <div className="grid grid-cols-5 gap-1.5">
                            {filters.map((f) => (<button key={f.value} onClick={() => updateVideo(activeV.id, 'filterType', f.value)} className={`py-1.5 px-1 text-[9px] font-bold rounded-md border transition-all active:scale-95 ${activeV.filterType === f.value ? 'bg-white border-red-500 text-red-700 shadow-sm' : 'bg-white/50 border-slate-200 text-slate-500 hover:bg-white hover:border-red-300'}`}><R t={f.name} r={f.name === '白黒' ? 'しろくろ' : (f.name === '反転' ? 'はんてん' : '')} /></button>))}
                          </div>
                        </div>
                      )}

                      <div>
                        <h3 className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1"><Zap className="w-3.5 h-3.5 text-red-400"/>{sceneIndex === 1 ? <R t="開始" r="かいし" /> : <R t="切" r="き" /> }{sceneIndex === 1 ? 'エフェクト' : <span>り<R t="替" r="か" />えエフェクト</span>}</h3>
                        <div className="flex gap-1.5">
                          {sceneIndex === 1 ? (
                            <>
                              <button onClick={() => updateVideo(activeV.id, 'transitionType', 'none')} className={`flex-1 py-1.5 px-2 text-[10px] font-bold rounded-md border transition-all active:scale-95 ${activeV.transitionType === 'none' ? 'bg-white border-red-500 text-red-700 shadow-sm' : 'bg-white/50 border-slate-200 text-slate-500 hover:bg-white hover:border-red-300'}`}>なし</button>
                              <button onClick={() => updateVideo(activeV.id, 'transitionType', 'fade')} className={`flex-1 py-1.5 px-2 text-[10px] font-bold rounded-md border transition-all active:scale-95 ${activeV.transitionType === 'fade' ? 'bg-white border-red-500 text-red-700 shadow-sm' : 'bg-white/50 border-slate-200 text-slate-500 hover:bg-white hover:border-red-300'}`}>フェード</button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => updateVideo(activeV.id, 'transitionType', 'none')} className={`flex-1 py-1.5 text-[9px] font-bold rounded-md border transition-all active:scale-95 flex flex-col items-center gap-1 ${activeV.transitionType === 'none' ? 'bg-white border-red-500 text-red-700 shadow-sm' : 'bg-white/50 border-slate-200 text-slate-500 hover:bg-white hover:border-red-300'} `}><Zap className="w-3 h-3"/>なし</button>
                              <button onClick={() => updateVideo(activeV.id, 'transitionType', 'fade')} className={`flex-1 py-1.5 text-[9px] font-bold rounded-md border transition-all active:scale-95 flex flex-col items-center gap-1 ${activeV.transitionType === 'fade' ? 'bg-white border-red-500 text-red-700 shadow-sm' : 'bg-white/50 border-slate-200 text-slate-500 hover:bg-white hover:border-red-300'} `}><Blend className="w-3 h-3"/>フェード</button>
                              <button onClick={() => updateVideo(activeV.id, 'transitionType', 'wipe')} className={`flex-1 py-1.5 text-[9px] font-bold rounded-md border transition-all active:scale-95 flex flex-col items-center gap-1 ${activeV.transitionType === 'wipe' ? 'bg-white border-red-500 text-red-700 shadow-sm' : 'bg-white/50 border-slate-200 text-slate-500 hover:bg-white hover:border-red-300'} `}><PanelRightClose className="w-3 h-3"/>ワイプ</button>
                              <button onClick={() => updateVideo(activeV.id, 'transitionType', 'slide')} className={`flex-1 py-1.5 text-[9px] font-bold rounded-md border transition-all active:scale-95 flex flex-col items-center gap-1 ${activeV.transitionType === 'slide' ? 'bg-white border-red-500 text-red-700 shadow-sm' : 'bg-white/50 border-slate-200 text-slate-500 hover:bg-white hover:border-red-300'} `}><MoveRight className="w-3 h-3"/>スライド</button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              <div className="bg-slate-50/50 rounded-2xl shadow-sm p-4 md:p-5 border border-slate-200">
                <h2 className="text-base md:text-lg font-bold text-slate-800 flex items-center gap-2 mb-3">
                  <span className="bg-slate-800 text-white w-5 h-5 rounded flex items-center justify-center text-xs shadow-sm">3</span>テロップを<R t="挿入" r="そうにゅう" />
                </h2>
                <div className="space-y-4">
                  {textList.map((t, index) => (
                    <div key={t.id} className="bg-white border border-slate-200 rounded-xl p-3.5 relative animate-fade-in shadow-sm">
                      {textList.length > 1 && (<button onClick={() => removeText(t.id)} className="absolute -top-2.5 -right-2.5 bg-white text-slate-400 hover:text-rose-500 hover:border-rose-200 rounded-full p-1 transition-all shadow-sm border border-slate-200 z-10"><X className="w-3.5 h-3.5" /></button>)}
                      <div className="mb-3">
                        <label className="block text-[10px] font-bold text-slate-500 mb-1 flex items-center gap-1"><Type className="w-3 h-3 text-red-400" /> テロップ {index + 1}</label>
                        <input type="text" value={t.text} onChange={(e) => updateText(t.id, 'text', e.target.value)} placeholder="テキストを入力" className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 font-bold text-xs bg-slate-50 transition-all shadow-inner" style={{ fontFamily: t.font || 'Zen Maru Gothic' }} />
                      </div>
                      <div className="flex flex-col gap-2.5 pt-2.5 border-t border-slate-100">
                        <div className="flex justify-between items-center"><span className="text-[10px] font-bold text-slate-500"><R t="文字色" r="もじいろ" /></span><div className="flex gap-1.5">{colors.map((c) => (<button key={c.value} onClick={() => updateText(t.id, 'color', c.value)} className={`w-4 h-4 rounded-full border shadow-sm transition-all active:scale-95 ${t.color === c.value ? 'border-red-500 scale-110 ring-2 ring-red-200' : 'border-slate-200'}`} style={{ backgroundColor: c.value }} />))}</div></div>
                        
                        <div className="flex-1"><span className="block text-[9px] font-bold text-slate-400 mb-0.5">フォント</span>
                          <select value={t.font || 'Zen Maru Gothic'} onChange={(e) => updateText(t.id, 'font', e.target.value)} className="w-full border border-slate-200 rounded-md p-1.5 text-[10px] font-bold bg-slate-50 focus:outline-none focus:border-red-400 cursor-pointer shadow-sm" style={{ fontFamily: t.font || 'Zen Maru Gothic' }}>
                            {fonts.map(f => <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>{f.name}</option>)}
                          </select>
                        </div>

                        <div className="flex gap-3 items-center">
                          <div className="flex-1"><span className="block text-[9px] font-bold text-slate-400 mb-0.5"><R t="配置" r="はいち" /></span><select value={t.pos} onChange={(e) => updateText(t.id, 'pos', e.target.value)} className="w-full border border-slate-200 rounded-md p-1.5 text-[10px] font-bold bg-slate-50 focus:outline-none focus:border-red-400 cursor-pointer shadow-sm"><option value="top">上</option><option value="middle">中央</option><option value="bottom">下</option></select></div>
                          <div className="flex-1"><span className="block text-[9px] font-bold text-slate-400 mb-0.5"><R t="大" r="おお" />きさ</span><input type="range" min="50" max="200" step="10" value={t.scale} onChange={(e) => updateText(t.id, 'scale', parseInt(e.target.value))} className="w-full accent-red-500 h-1 bg-slate-200 rounded-full appearance-none mt-1 cursor-pointer" /></div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <button onClick={addText} className="w-full bg-white hover:bg-red-50 text-red-600 font-bold border border-dashed border-slate-300 hover:border-red-400 rounded-lg py-2.5 flex items-center justify-center gap-1.5 transition-all active:scale-95 text-xs shadow-sm focus-visible:ring-2 outline-none">
                    <Plus className="w-4 h-4" /><R t="新規" r="しんき" />テロップ<R t="追加" r="ついか" />
                  </button>
                </div>
              </div>
            </div>

            <div id="tutorial-step4" className="bg-white rounded-2xl shadow-sm p-4 md:p-5 border border-slate-200 mb-8">
              <h2 className="text-base md:text-lg font-bold text-slate-800 flex items-center gap-2 mb-3">
                <span className="bg-slate-800 text-white w-5 h-5 rounded-md flex items-center justify-center text-xs shadow-sm">{videos.length > 0 ? '4' : '3'}</span>
                <R t="動画" r="どうが" />を<R t="完成" r="かんせい" />させる
              </h2>
              
              {!isRecording && !downloadUrl && (
                <>
                  <div className="bg-red-50 border border-red-100 rounded-xl p-3 mb-3 flex items-start gap-2">
                    <Info className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-red-800 font-bold leading-relaxed">
                      <R t="書" r="か" />き<R t="出" r="だ" />しには、<R t="動画" r="どうが" />の<R t="長" r="なが" />さ（<span translate="no">{formatTime(totalDuration)}</span>）と<R t="同" r="おな" />じ<R t="時間" r="じかん" />がかかります。
                    </p>
                  </div>
                  <button onClick={startRecording} disabled={videos.length === 0 || videos.some(v => v.needsReconnect)} className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl py-3.5 px-4 flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:shadow-none focus-visible:ring-4 focus-visible:ring-slate-300 outline-none text-sm md:text-base">
                    <HardDriveDownload className="w-5 h-5" /><R t="動画" r="どうが" />を<R t="書" r="か" />き<R t="出" r="だ" />す
                  </button>
                </>
              )}

              {isRecording && (
                <div className="flex flex-col gap-4">
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-inner">
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-xs font-bold text-red-700 flex items-center gap-1.5"><Save className="w-4 h-4 animate-pulse"/> <R t="保存中" r="ほぞんちゅう" />...</span>
                      <span className="text-lg font-black text-red-900 font-mono" translate="no">{recordingProgress}%</span>
                    </div>
                    <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden shadow-inner">
                      <div className="h-full bg-gradient-to-r from-red-500 to-orange-400 transition-all duration-300 ease-out" style={{ width: `${recordingProgress}%` }}></div>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-2 text-center font-bold"><R t="完了" r="かんりょう" />するまでブラウザを<R t="閉" r="と" />じないでください</p>
                  </div>
                  <button onClick={stopRecording} className="w-full bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-600 font-bold rounded-lg py-2 px-4 transition-all active:scale-95 text-xs shadow-sm">
                    <R t="処理" r="しょり" />を<R t="中断" r="ちゅうだん" />する
                  </button>
                </div>
              )}

              {downloadUrl === 'direct_saved' ? (
                <div className="flex flex-col gap-3 animate-fade-in">
                  <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl p-3 text-xs md:text-sm font-bold text-center flex flex-col items-center justify-center gap-1.5 shadow-sm">
                    <Sparkles className="w-5 h-5 text-emerald-500" />
                    パソコンへの<R t="保存" r="ほぞん" />が<R t="完了" r="かんりょう" />しました！
                  </div>
                  <button onClick={() => setDownloadUrl(null)} className="w-full bg-white border-2 border-slate-200 text-slate-600 hover:bg-slate-50 font-bold rounded-xl py-2.5 px-4 transition-all active:scale-95 shadow-sm text-sm"><R t="編集" r="へんしゅう" />にもどる</button>
                </div>
              ) : downloadUrl && !isRecording ? (
                <div className="flex flex-col gap-3 animate-fade-in">
                  <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl p-3 text-xs md:text-sm font-bold text-center flex flex-col items-center justify-center gap-1.5 shadow-sm">
                    <Sparkles className="w-5 h-5 text-emerald-500" />
                    <R t="完成" r="かんせい" />しました！
                  </div>
                  <a href={downloadUrl} download={`映像制作スタジオ_${new Date().getTime()}.webm`} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl py-3 px-4 flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 text-sm"><Download className="w-4 h-4" /><R t="端末" r="たんまつ" />に<R t="保存" r="ほぞん" />する</a>
                  <button onClick={() => setDownloadUrl(null)} className="w-full bg-white border-2 border-slate-200 text-slate-600 hover:bg-slate-50 font-bold rounded-xl py-2.5 px-4 transition-all active:scale-95 shadow-sm text-sm">もう<R t="一度作成" r="いちどさくせい" />する</button>
                </div>
              ) : null}

              <button 
                onClick={() => setShowClearConfirm(true)} 
                className="w-full mt-4 py-2.5 bg-white hover:bg-slate-50 text-slate-600 rounded-xl font-bold text-xs transition-all active:scale-95 border border-slate-200 hover:border-slate-300 flex items-center justify-center gap-1.5 shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-slate-200"
              >
                <Trash2 size={14} /> <R t="全消去" r="すべてけす" /> (リセット)
              </button>
            </div>
            
            {/* モバイル時に下部に表示されるコピーライト */}
            <div className="mt-auto pt-4 pb-2 text-center text-[10px] text-slate-400 font-medium">
              <p>© 2026 <R t="映像制作" r="えいぞうせいさく" />スタジオ <R t="開発者" r="かいはつしゃ" />: <a href="https://note.com/cute_borage86" target="_blank" rel="noopener noreferrer" className="text-red-400 hover:underline">GIGA山</a></p>
            </div>

          </aside>
        </main>
      </div>
    </RubyContext.Provider>
  );
};

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}
