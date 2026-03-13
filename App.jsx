import React, { useState, useRef, useEffect, createContext, useContext, useCallback } from 'react';
import { Video, Type, Play, Download, Save, FileVideo, Sparkles, Pause, RotateCcw, Scissors, Wand2, Plus, X, Clock, Film, Trash2, Zap, Blend, PanelRightClose, MoveRight, HardDriveDownload, AlertTriangle, Music, Volume2, UploadCloud, Bot, Copy, ExternalLink, CheckCheck, HelpCircle, Keyboard, Info, Image as ImageIcon, SquareMenu, PaintBucket, ChevronRight, Maximize2, Minimize2, Undo2, Redo2, Grid3X3 } from 'lucide-react';

// ==========================================
// 🎨 ふりがな用専用コンポーネント (重なり防止・ベースライン統一)
// ==========================================
const R = ({ r, children }) => (
  <ruby className="whitespace-nowrap" style={{ rubyPosition: 'over', rubyAlign: 'center', textDecoration: 'none' }}>
    {children}
    <rt className="text-[0.6em] opacity-80 pointer-events-none select-none font-normal" style={{ paddingBottom: '0.1em' }}>
      {r}
    </rt>
  </ruby>
);

// ==========================================
// 🎨 定数・データ定義
// ==========================================
const COLORS = [
  { name: <R r="しろ">白</R>, value: '#ffffff' }, { name: <R r="くろ">黒</R>, value: '#1e293b' },
  { name: <R r="あか">赤</R>, value: '#ef4444' }, { name: <R r="あお">青</R>, value: '#3b82f6' },
  { name: <R r="き">黄</R>, value: '#eab308' }, { name: <R r="みどり">緑</R>, value: '#22c55e' },
];
const OUTLINE_COLORS = [
  { name: <R r="くろ">黒</R>, value: '#1e293b' }, { name: <R r="しろ">白</R>, value: '#ffffff' },
  { name: <R r="あか">赤</R>, value: '#ef4444' }, { name: <R r="あお">青</R>, value: '#3b82f6' },
  { name: <R r="き">黄</R>, value: '#eab308' }, { name: <R r="みどり">緑</R>, value: '#22c55e' },
  { name: <R r="なし">なし</R>, value: 'transparent' }
];
const BG_COLORS = [
  { name: <R r="くろ">黒</R>, value: '#000000' }, { name: <R r="しろ">白</R>, value: '#ffffff' },
  { name: <R r="あか">赤</R>, value: '#ef4444' }, { name: <R r="あお">青</R>, value: '#3b82f6' },
  { name: <R r="みどり">緑</R>, value: '#22c55e' }, { name: <R r="むらさき">紫</R>, value: '#8b5cf6' },
];
const FILTERS = [
  { name: 'なし', value: 'none' }, { name: <><R r="しろ">白</R><R r="くろ">黒</R></>, value: 'grayscale(100%)' },
  { name: 'セピア', value: 'sepia(100%)' }, { name: <R r="はんてん">反転</R>, value: 'hue-rotate(90deg)' }, { name: 'ぼかし', value: 'blur(5px)' },
];
// selectのoptionはHTML仕様でrubyが使えないため、括弧書きでふりがなを追加
const FONTS = [
  { name: '丸(まる)ゴシック', value: 'Zen Maru Gothic' }, { name: 'ゴシック', value: 'Noto Sans JP' },
  { name: '明朝体(みんちょうたい)', value: 'Noto Serif JP' }, { name: '手書(てが)き風(ふう)', value: 'Yusei Magic' },
  { name: 'ポップ', value: 'Hachi Maru Pop' }, { name: 'ドット', value: 'DotGothic16' },
];
const VIBES = [
  "YouTuber風(ふう)（ポップで楽(たの)しい）", "シネマティック（映画(えいが)のような感動(かんどう)）",
  "ドキュメンタリー（真面目(まじめ)な雰囲気(ふんいき)）", "ミュージックビデオ（音楽(おんがく)重視(じゅうし)）", "ホラー（ドキドキする展開(てんかい)）"
];

// ==========================================
// 🛠 ヘルパー関数
// ==========================================
const formatTime = (time) => {
  if (isNaN(time)) return "00:00";
  const m = Math.floor(time / 60).toString().padStart(2, '0');
  const s = Math.floor(time % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

const getInitialVideos = () => {
  try {
    const saved = window.localStorage.getItem('movie-maker-videos-recipe-v2');
    if (saved && saved !== "undefined") {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed.map(v => {
          if (v.type === 'blank') return { ...v, url: null, file: null, needsReconnect: false };
          return { ...v, needsReconnect: true, url: null, file: null };
        });
      }
    }
  } catch (e) {}
  return [];
};

const getInitialTextList = () => {
  try {
    const saved = window.localStorage.getItem('movie-maker-text-list-v8');
    if (saved && saved !== "undefined") {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0 && parsed.every(item => typeof item === 'object' && item !== null && 'id' in item)) {
        return parsed;
      }
    }
  } catch (e) {}
  return [{ id: Date.now(), text: '', color: '#ffffff', pos: 'bottom', scale: 100, start: 0, end: 9999, font: 'Zen Maru Gothic', hasManuallyEditedTime: false }];
};

// ==========================================
// 💡 カスタムフック
// ==========================================
function useStickyState(defaultValue, key) {
  const [value, setValue] = useState(() => {
    try {
      const stickyValue = window.localStorage.getItem(key);
      return stickyValue !== null ? JSON.parse(stickyValue) : defaultValue;
    } catch (e) { return defaultValue; }
  });
  useEffect(() => {
    try { window.localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
  }, [key, value]);
  return [value, setValue];
}

const ToastContext = createContext(null);
const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  }, []);
  return (
    <ToastContext.Provider value={addToast}>
      {children}
      <div className="fixed top-4 md:top-6 left-1/2 -translate-x-1/2 z-[300] flex flex-col gap-2 pointer-events-none w-[90%] md:w-auto items-center">
        {toasts.map(t => (
          <div key={t.id} className={`flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-bold text-white transition-all animate-fade-in-down ${t.type === 'error' ? 'bg-slate-800' : t.type === 'success' ? 'bg-emerald-500' : 'bg-slate-800'}`}>
            {t.type === 'error' ? <AlertTriangle size={18} className="text-red-400" /> : t.type === 'success' ? <CheckCheck size={18} /> : <Info size={18} className="text-blue-400" />}
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
const useToast = () => useContext(ToastContext);

function useHistory(initialState) {
  const [state, setState] = useState({ history: [initialState], pointer: 0 });
  const set = useCallback((newStateOrUpdater) => {
    setState((prevState) => {
      const currentState = prevState.history[prevState.pointer];
      const newState = typeof newStateOrUpdater === 'function' ? newStateOrUpdater(currentState) : newStateOrUpdater;
      if (JSON.stringify(currentState) === JSON.stringify(newState)) return prevState;
      const newHistory = prevState.history.slice(0, prevState.pointer + 1);
      newHistory.push(newState);
      if (newHistory.length > 50) newHistory.shift();
      return { history: newHistory, pointer: newHistory.length - 1 };
    });
  }, []);
  const undo = useCallback(() => { setState((prev) => prev.pointer > 0 ? { ...prev, pointer: prev.pointer - 1 } : prev); }, []);
  const redo = useCallback(() => { setState((prev) => prev.pointer < prev.history.length - 1 ? { ...prev, pointer: prev.pointer + 1 } : prev); }, []);
  return [state.history[state.pointer], set, undo, redo, state.pointer > 0, state.pointer < state.history.length - 1];
}

const TUTORIAL_STEPS = [
  { title: <>ようこそ<R r="えいぞう">映像</R><R r="せいさく">制作</R>スタジオへ！</>, text: <>ここはプロみたいにカッコいい<R r="どうが">動画</R>が<R r="つく">作</R>れる<R r="まほう">魔法</R>のアプリだよ。<br/>1<R r="ぷん">分</R>で<R r="つか">使</R>い<R r="かた">方</R>をマスターしよう！</>, targetId: null },
  { title: <>1. メディアを<R r="なら">並</R>べよう</>, text: <>まずは<R r="みぎがわ">右側</R>のパネルから、<R r="つか">使</R>いたい<R r="どうが">動画</R>や「<R r="がぞう">画像</R>」、<R r="もじ">文字</R>を<R r="い">入</R>れるための「<R r="くうはく">空白</R>ページ」を<R r="えら">選</R>んでね。</>, targetId: 'tutorial-step1' },
  { title: <>2. テロップや<R r="おんがく">音楽</R>を<R r="い">入</R>れよう</>, text: <><R r="もじ">文字</R>（テロップ）を<R r="い">入</R>れたり、BGM（<R r="おんがく">音楽</R>）を<R r="ついか">追加</R>して、<R r="どうが">動画</R>をさらに<R r="も">盛</R>り<R r="あ">上</R>げよう！</>, targetId: 'tutorial-step2-3' },
  { title: <>3. タイムラインで<R r="ちょうせい">調整</R></>, text: <>プレビュー<R r="がめん">画面</R>の<R r="した">下</R>にある「タイムライン」で、テロップの<R r="で">出</R>るタイミングを<R r="ゆび">指</R>やマウスで<R r="ちょっかんてき">直感的</R>に<R r="うご">動</R>かせるよ。</>, targetId: 'tutorial-timeline' },
  { title: <>4. 🤖 AIディレクター</>, text: <>なんと、AIに「こんな<R r="どうが">動画</R>にしたい！」と<R r="つた">伝</R>えるだけで、プロの<R r="かんとく">監督</R>のように<R r="こうせいあん">構成案</R>を<R r="かんが">考</R>えてくれて、<R r="ぜんじどう">全自動</R>で<R r="へんしゅう">編集</R>してくれる<R r="まほう">魔法</R>のボタンがあるよ！</>, targetId: 'tutorial-ai' },
  { title: <>5. <R r="どうが">動画</R>を<R r="かんせい">完成</R>させる</>, text: <>プレビューで<R r="かくにん">確認</R>してバッチリだったら、ここで「<R r="どうが">動画</R>を<R r="ほぞん">保存</R>する」を<R r="お">押</R>してパソコンに<R r="ほぞん">保存</R>しよう！</>, targetId: 'tutorial-step4' }
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
  const nextStep = useCallback(() => { setCurrentStep(s => { if (s < TUTORIAL_STEPS.length - 1) return s + 1; endTutorial(); return s; }); }, [endTutorial]);
  const prevStep = useCallback(() => { setCurrentStep(s => (s > 0 ? s - 1 : s)); }, []);
  return { isActive, currentStep, startTutorial, endTutorial, nextStep, prevStep };
}

// ==========================================
// 🎨 UIコンポーネント群
// ==========================================
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

  useEffect(() => {
    if (!isActive) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); endTutorial(); }
      else if (e.key === 'Enter' || e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); nextStep(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); prevStep(); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, nextStep, prevStep, endTutorial]);

  if (!isActive) return null;
  let popoverStyle = { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
  if (targetRect) {
    const isTopHalf = targetRect.y < window.innerHeight / 2;
    const popoverY = isTopHalf ? targetRect.y + targetRect.h + 16 : window.innerHeight - targetRect.y + 16;
    const targetCenter = targetRect.x + targetRect.w / 2;
    const halfWidth = 160;
    if (targetCenter < halfWidth + 16) popoverStyle = isTopHalf ? { top: popoverY, left: 16 } : { bottom: popoverY, left: 16 };
    else if (window.innerWidth - targetCenter < halfWidth + 16) popoverStyle = isTopHalf ? { top: popoverY, right: 16 } : { bottom: popoverY, right: 16 };
    else popoverStyle = { top: popoverY, left: targetCenter, transform: 'translateX(-50%)', bottom: isTopHalf ? 'auto' : popoverY };
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
        <rect width="100%" height="100%" fill="rgba(15, 23, 42, 0.7)" mask="url(#tutorial-hole)" className="pointer-events-auto transition-all duration-500 ease-out" />
      </svg>
      <div className="absolute bg-white rounded-3xl shadow-2xl p-5 md:p-6 w-[90%] max-w-[380px] flex flex-col gap-3 transition-all duration-500 ease-out pointer-events-auto" style={popoverStyle} onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <h3 className="text-base md:text-lg font-bold text-slate-800">{stepData.title}</h3>
          <span className="text-xs font-bold bg-slate-100 text-slate-500 px-2.5 py-1 rounded-md">{currentStep + 1} / {TUTORIAL_STEPS.length}</span>
        </div>
        <div className="text-slate-600 font-medium leading-loose text-sm py-1">{stepData.text}</div>
        <div className="flex justify-between items-center mt-2 pt-3">
          <button onClick={endTutorial} className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors px-2 py-1">スキップ</button>
          <div className="flex gap-2">
            {currentStep > 0 && <button onClick={prevStep} className="px-4 py-2 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors text-sm"><R r="もど">戻</R>る</button>}
            <button onClick={nextStep} className="px-5 py-2 rounded-xl font-bold text-white bg-slate-800 hover:bg-slate-900 shadow-md hover:shadow-lg transition-all active:scale-95 text-sm">
              {currentStep === TUTORIAL_STEPS.length - 1 ? 'はじめる！' : <><R r="つぎ">次</R>へ</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Header = ({ onHelpClick, onShortcutsClick }) => (
  <nav className="bg-slate-900 border-b border-slate-800 px-4 md:px-6 py-3.5 flex justify-between items-center shadow-md z-20 shrink-0">
    <div className="flex items-center gap-2 md:gap-3">
      <div className="bg-gradient-to-br from-red-500 to-rose-600 p-2 rounded-xl text-white shadow-inner"><Video size={22} strokeWidth={2.5} /></div>
      <h1 className="text-lg md:text-xl font-black text-white tracking-wider drop-shadow-sm"><R r="えいぞう">映像</R><R r="せいさく">制作</R>スタジオ<span className="text-red-500 ml-1 text-3xl leading-none align-bottom">.</span></h1>
    </div>
    <div className="flex items-center gap-2 md:gap-4">
      <button onClick={onShortcutsClick} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-lg font-bold text-xs md:text-sm transition-colors border border-slate-700 shadow-sm backdrop-blur-sm">
        <Keyboard size={16} /> <span className="hidden md:inline"><R r="そうさ">操作</R><R r="いちらん">一覧</R></span>
      </button>
      <button onClick={onHelpClick} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-lg font-bold text-xs md:text-sm transition-colors border border-slate-700 shadow-sm backdrop-blur-sm">
        <HelpCircle size={16} /> <span className="hidden md:inline"><R r="つか">使</R>い<R r="かた">方</R></span>
      </button>
      <div className="h-6 w-px bg-slate-700 hidden md:block mx-1"></div>
      <span className="bg-emerald-950/40 text-emerald-400 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 border border-emerald-900/50 shadow-inner text-[10px] md:text-xs font-bold transition-all">
        <Save className="w-3.5 h-3.5" />
        <span className="hidden sm:inline"><R r="じどう">自動</R><R r="ほぞん">保存</R></span>
      </span>
    </div>
  </nav>
);

const ShortcutsModal = ({ show, onClose }) => {
  if (!show) return null;
  const ShortcutRow = ({ label, keys }) => (
    <div className="flex justify-between items-center py-2.5 border-b border-slate-100/50 last:border-0">
      <span className="text-sm font-bold text-slate-600">{label}</span>
      <div className="flex gap-1.5">
        {keys.map((k, i) => <span key={i} className="px-2 py-1 bg-slate-100 border border-slate-200 rounded-md text-xs font-bold text-slate-500 shadow-sm min-w-[28px] text-center">{k}</span>)}
      </div>
    </div>
  );
  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[150] flex items-center justify-center p-4 animate-fade-in-down" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all" onClick={e => e.stopPropagation()}>
        <div className="bg-slate-50 px-6 py-5 flex justify-between items-center border-b border-slate-200">
          <h3 className="text-lg font-black text-slate-800 flex items-center gap-2.5"><Keyboard className="text-slate-500" size={22} /> <span>ショートカット<R r="そうさ">操作</R></span></h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors bg-slate-100 rounded-full p-1.5"><X size={18} /></button>
        </div>
        <div className="p-6 flex flex-col gap-1 bg-white max-h-[60vh] overflow-y-auto custom-scrollbar">
          <ShortcutRow label={<><R r="さいせい">再生</R> / <R r="いちじていし">一時停止</R></>} keys={["Space"]} />
          <ShortcutRow label={<>1<R r="びょう">秒</R> <R r="すす">進</R>む / <R r="もど">戻</R>る</>} keys={["→", "←"]} />
          <ShortcutRow label={<><R r="もと">元</R>に<R r="もど">戻</R>す</>} keys={["Ctrl", "Z"]} />
          <ShortcutRow label={<>やり<R r="なお">直</R>し</>} keys={["Ctrl", "Y"]} />
          <ShortcutRow label={<>メディア<R r="ついか">追加</R></>} keys={["I"]} />
          <ShortcutRow label={<>テロップ<R r="ついか">追加</R></>} keys={["T"]} />
          <ShortcutRow label={<>BGM<R r="ついか">追加</R></>} keys={["M"]} />
          <ShortcutRow label={<>タイムライン<R r="かくだい">拡大</R>/<R r="しゅくしょう">縮小</R></>} keys={["L"]} />
          <ShortcutRow label={<>AIディレクターを<R r="ひら">開</R>く</>} keys={["A"]} />
          <ShortcutRow label={<><R r="せんたく">選択</R>アイテムを<R r="さくじょ">削除</R></>} keys={["Backspace"]} />
          <ShortcutRow label={<><R r="ぜんしょうきょ">全消去</R>メニュー</>} keys={["Shift", "Backspace"]} />
          <ShortcutRow label={<><R r="そうさ">操作</R><R r="いちらん">一覧</R>を<R r="ひら">開</R>く</>} keys={["?"]} />
          <ShortcutRow label={<><R r="せんたく">選択</R><R r="かいじょ">解除</R> / モーダルを<R r="と">閉</R>じる</>} keys={["Esc"]} />
        </div>
      </div>
    </div>
  );
};

const ClearConfirmModal = ({ show, onConfirm, onCancel }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[150] flex items-center justify-center p-4 animate-fade-in-down" onClick={onCancel}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all p-8 text-center" onClick={e => e.stopPropagation()}>
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5 text-red-500 shadow-inner"><Trash2 size={36} /></div>
        <h3 className="text-xl font-black text-slate-800 mb-3"><R r="ほんとう">本当</R>に<R r="ぜんしょうきょ">全消去</R>しますか？</h3>
        <p className="text-slate-500 text-sm font-medium mb-8 leading-loose"><R r="ついか">追加</R>した<R r="どうが">動画</R>やテロップ、BGMなど<br/><R r="すべ">全</R>ての<R r="せってい">設定</R>がリセットされます。<br />この<R r="そうさ">操作</R>は<R r="と">取</R>り<R r="け">消</R>せません。</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition-all active:scale-95">キャンセル</button>
          <button onClick={onConfirm} className="flex-1 py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all active:scale-95 shadow-md hover:shadow-lg">すべて<R r="しょうきょ">消去</R></button>
        </div>
      </div>
    </div>
  );
};

const AiDirectorModal = ({ isOpen, onClose, videos, applyAiRecipe }) => {
  const [step, setStep] = useState(1);
  const [theme, setTheme] = useState("");
  const [vibe, setVibe] = useState("YouTuber風（ポップで楽しい）");
  const [jsonInput, setJsonInput] = useState("");
  const toast = useToast();

  if (!isOpen) return null;

  const generateMaterialList = () => {
    if (!videos || videos.length === 0) return "（現在、素材は何も追加されていません）";
    return videos.map((v, i) => {
      if (v.type === 'video') return `- シーン${i+1} [動画]: "${v.name}" (長さ: 約${Math.ceil(v.duration)}秒)`;
      if (v.type === 'image') return `- シーン${i+1} [画像]: "${v.name}"`;
      if (v.type === 'blank') return `- シーン${i+1} [空白ページ]`;
      return "";
    }).join("\n");
  };

  const promptA = `あなたはプロの映像クリエイター兼放送作家です。私はいま、動画編集アプリを使って映像を作ろうとしています。
【作りたい動画のテーマ】\n${theme || 'おまかせ（素材から推測して最高のテーマを決めてください）'}
【希望する雰囲気】\n${vibe}
【現在アプリに読み込んでいる素材リスト】\n${generateMaterialList()}
これらの素材を使って、視聴者の心を動かす最高の動画の「構成案（絵コンテ）」を提案してください。単なる文字起こしではなく、魅力的なキャッチコピーや、感情を代弁するようなプロっぽいテロップを考えてください。
★重要：動画が間延びしないよう、1つのカットは「1〜4秒程度」を目安に、見どころだけを短くテンポよく切り抜く構成にしてください。
また、世界観をさらに完璧にするために「こんな背景画像があると良い」「こんなBGMがあると良い」というアイデアがあれば教えてください。もし私が画像生成AIや音楽生成AIを使う場合の「生成用プロンプト」も一緒に提案してくれると嬉しいです。
※素材ファイルを添付できる場合は、全ての内容を確認してから提案してください。`;

  const promptB = `素晴らしい構成案をありがとうございます！この構成で進めます。
（※もし私が新しく画像や音楽を追加でアップロードした場合は、それも含めて構成を最適化してください）
それでは、動画編集アプリに読み込ませるための「編集レシピ」を出力してください。他の文章や説明は一切不要です。必ず以下の【JSONフォーマット】のコードのみを出力してください。
【要件】
1. テロップの表示時間（start, end）や、動画の切り抜き時間（trimStart, trimEnd）を秒単位で細かく指定してください。
2. ★重要★ 同じ表示位置（pos）のテロップは、絶対に表示時間が重ならないようにしてください（前のテロップのend時間より後に、次のテロップのstart時間を設定する）。ただし、表示位置（pos: top, middle, bottom）が異なる場合は同時に表示させても構いません。
3. transitionType は none, fade, wipe, slide から選んでください。
4. filterType は none, grayscale(100%), sepia(100%), hue-rotate(90deg), blur(5px) から選んでください。
5. font は Zen Maru Gothic, Noto Sans JP, Noto Serif JP, Yusei Magic, Hachi Maru Pop, DotGothic16 から選んでください。
6. テロップを改行する場合は、テキスト内に \\n を使用してください。
7. ★重要★ 1つの素材動画から「見どころ」を複数回切り抜きたい場合は、同じ \`scene\` 番号を持つオブジェクトを \`videos\` 配列の中に必要な回数だけ追加して、それぞれの \`trimStart\` と \`trimEnd\` を指定してください。
【JSONフォーマット】
{
  "videos": [ { "scene": 1, "type": "video", "trimStart": 0.0, "trimEnd": 3.5, "filterType": "none", "transitionType": "fade", "bgColor": "#000000" } ],
  "texts": [ { "text": "表示する\\nテロップ", "start": 0.0, "end": 3.5, "pos": "bottom", "color": "#ffffff", "scale": 120, "font": "Zen Maru Gothic" } ]
}`;

  const handleCopy = (text) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try { document.execCommand('copy'); toast(<><R r="しじぶん">指示文</R>をコピーしました！</>, 'success'); }
    catch (err) { toast(<>コピーに<R r="しっぱい">失敗</R>しました</>, 'error'); }
    document.body.removeChild(textArea);
  };

  const handleApply = () => {
    applyAiRecipe(jsonInput);
    setStep(1); setJsonInput("");
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 z-[150] flex items-center justify-center p-3 md:p-4 backdrop-blur-md animate-fade-in-down" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90dvh] overflow-hidden transform transition-all" onClick={e => e.stopPropagation()}>
        <div className="bg-slate-900 px-6 py-4 flex justify-between items-center flex-shrink-0">
          <h3 className="text-lg md:text-xl font-black text-white flex items-center gap-2.5"><Bot size={24} className="text-blue-400" /> <span>AIディレクター</span></h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white hover:bg-slate-800 transition-colors rounded-full p-1.5 active:scale-95"><X size={20}/></button>
        </div>
        <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex justify-between items-center text-[10px] md:text-xs font-bold text-slate-400 shadow-inner">
          {[1, 2, 3, 4].map((s, i) => (
            <React.Fragment key={s}>
              <div className={`flex flex-col items-center gap-1.5 transition-colors ${step >= s ? 'text-blue-600' : ''}`}><div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${step >= s ? 'bg-blue-600 text-white' : 'bg-slate-200'}`}>{s}</div>{i===0?<><R r="せってい">設定</R></>:i===1?<><R r="こうせい">構成</R>の<R r="そうだん">相談</R></>:i===2?<><R r="しゅつりょく">出力</R></>:i===3?<><R r="かんせい">完成</R>！</>:""}</div>
              {s < 4 && <div className={`h-1 flex-1 mx-2 rounded-full transition-colors ${step > s ? 'bg-blue-600' : 'bg-slate-200'}`}></div>}
            </React.Fragment>
          ))}
        </div>
        <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-grow bg-white">
          {step === 1 && (
            <div className="flex flex-col gap-6 animate-fade-in-down">
              <p className="text-slate-600 font-bold text-sm md:text-base leading-loose bg-blue-50/50 p-4 rounded-2xl border border-blue-100">AIはプロの<R r="えいぞう">映像</R><R r="かんとく">監督</R>です。<br/>どんな<R r="どうが">動画</R>を<R r="つく">作</R>りたいか、イメージを<R r="つた">伝</R>えてみましょう！</p>
              <div>
                <label className="block text-xs font-black text-slate-700 mb-2"><R r="つく">作</R>りたい<R r="どうが">動画</R>のテーマ</label>
                <textarea value={theme} onChange={e => setTheme(e.target.value)} placeholder="例(れい)：運動会(うんどうかい)のかっこいいハイライト！" className="w-full h-24 border border-slate-300 rounded-2xl px-4 py-3 text-sm font-bold bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all resize-none shadow-sm" />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-700 mb-2"><R r="きぼう">希望</R>する<R r="ふんいき">雰囲気</R></label>
                <select value={vibe} onChange={e => setVibe(e.target.value)} className="w-full border border-slate-300 rounded-2xl px-4 py-3.5 text-sm font-bold bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none cursor-pointer shadow-sm appearance-none">
                  {VIBES.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <button onClick={() => setStep(2)} className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"><span><R r="つぎ">次</R>へ（AIへの<R r="そうだんぶん">相談文</R>を<R r="つく">作</R>る）</span> <ChevronRight className="w-5 h-5" /></button>
            </div>
          )}
          {step === 2 && (
            <div className="flex flex-col gap-5 animate-fade-in-down">
              <div className="bg-slate-50 border border-slate-200 p-5 rounded-3xl shadow-sm">
                <p className="text-slate-700 font-bold text-xs md:text-sm leading-loose mb-3"><R r="いか">以下</R>の<R r="しじぶん">指示文</R>をコピーして、AI（ChatGPTなど）に<R r="おく">送</R>ってください。</p>
                <div className="relative">
                  <textarea readOnly value={promptA} className="w-full h-40 text-[10px] md:text-xs text-slate-500 bg-white rounded-2xl p-4 border border-slate-200 focus:outline-none custom-scrollbar shadow-inner resize-none font-mono leading-relaxed" />
                  <button onClick={() => handleCopy(promptA)} className="absolute bottom-4 right-4 bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-slate-900 shadow-md active:scale-95 transition-all"><Copy className="w-4 h-4"/> コピー</button>
                </div>
              </div>
              <div className="flex gap-2.5">
                {[{ n: 'ChatGPT', u: 'https://chatgpt.com/' }, { n: 'Gemini', u: 'https://gemini.google.com/' }, { n: 'Claude', u: 'https://claude.ai/' }].map(l => (
                  <a key={l.n} href={l.u} target="_blank" rel="noreferrer" className="flex flex-1 items-center justify-center gap-1.5 bg-white border border-slate-200 py-3 rounded-2xl text-xs font-bold text-slate-600 hover:border-blue-400 hover:text-blue-600 transition-all shadow-sm hover:shadow-md"><ExternalLink className="w-3.5 h-3.5"/> {l.n}</a>
                ))}
              </div>
              <div className="flex gap-3 mt-2">
                <button onClick={() => setStep(1)} className="px-6 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-2xl active:scale-95 transition-colors"><R r="もど">戻</R>る</button>
                <button onClick={() => setStep(3)} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"><span>AIから<R r="こうせいあん">構成案</R>をもらったら<R r="つぎ">次</R>へ</span> <ChevronRight className="w-5 h-5" /></button>
              </div>
            </div>
          )}
          {step === 3 && (
            <div className="flex flex-col gap-5 animate-fade-in-down">
              <div className="bg-slate-50 border border-slate-200 p-5 rounded-3xl shadow-sm">
                <p className="text-slate-700 font-bold text-xs md:text-sm leading-loose mb-3 flex items-start gap-2.5"><Info className="w-5 h-5 shrink-0 text-blue-500" /><span>AIからの<R r="ついか">追加</R><R r="そざい">素材</R>があればアップロードし、<R r="じゅんび">準備</R>ができたら<R r="いか">以下</R>の<R r="しじぶん">指示文</R>を<R r="おく">送</R>ってください！</span></p>
                <div className="relative">
                  <textarea readOnly value={promptB} className="w-full h-40 text-[10px] md:text-xs text-slate-500 bg-white rounded-2xl p-4 border border-slate-200 focus:outline-none custom-scrollbar shadow-inner resize-none font-mono leading-relaxed" />
                  <button onClick={() => handleCopy(promptB)} className="absolute bottom-4 right-4 bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-slate-900 shadow-md active:scale-95 transition-all"><Copy className="w-4 h-4"/> コピー</button>
                </div>
              </div>
              <div className="flex gap-3 mt-2">
                <button onClick={() => setStep(2)} className="px-6 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-2xl active:scale-95 transition-colors"><R r="もど">戻</R>る</button>
                <button onClick={() => setStep(4)} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"><span>プログラムをもらったら<R r="つぎ">次</R>へ</span> <ChevronRight className="w-5 h-5" /></button>
              </div>
            </div>
          )}
          {step === 4 && (
            <div className="flex flex-col gap-5 animate-fade-in-down">
              <p className="text-slate-700 font-bold text-sm leading-loose">AIが<R r="つく">作</R>ってくれたプログラム（JSONコード）をここに<R r="は">貼</R>り<R r="つ">付</R>けてね。</p>
              <textarea value={jsonInput} onChange={(e) => setJsonInput(e.target.value)} placeholder='{"videos": [...], "texts": [...]}' className="w-full h-48 text-xs font-mono bg-slate-50 rounded-3xl p-5 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all shadow-inner custom-scrollbar" />
              <div className="flex gap-3 mt-2">
                <button onClick={() => setStep(3)} className="px-6 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-2xl active:scale-95 transition-colors"><R r="もど">戻</R>る</button>
                <button onClick={handleApply} disabled={!jsonInput.trim() || !videos || videos.length === 0} className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black py-4 rounded-2xl shadow-md hover:shadow-lg disabled:opacity-50 transition-all active:scale-95 flex items-center justify-center gap-2"><Sparkles className="w-5 h-5"/><span>レシピを<R r="てきよう">適用</R>して<R r="かんせい">完成</R>！</span></button>
              </div>
              {(!videos || videos.length === 0) && <p className="text-[10px] text-red-500 text-center font-bold mt-1 bg-red-50 p-2 rounded-lg"><R r="さき">先</R>に<R r="そざい">素材</R>を<R r="ついか">追加</R>してください。</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const PreviewArea = ({ videos, playingVideoIdRef, isRecording, draggingTextId, canvasRef, videoRefs, imageRefs, bgmAudioRef, bgmUrl, handleLoadedMetadata, handleBgmLoaded, handleCanvasPointerDown, setReconnectTargetId, reconnectInputRef, isTimelineExpanded, showSafeArea }) => {
  return (
    <div className={`${isTimelineExpanded ? 'flex-none h-[25vh] md:h-[30vh]' : 'flex-grow'} bg-slate-900 rounded-2xl overflow-hidden relative flex items-center justify-center min-h-0 shadow-inner transition-all duration-500 border border-slate-800`}>
      {!videos || videos.length === 0 ? (
        <div className="text-center flex flex-col items-center text-slate-500">
          <div className="bg-slate-800/50 p-4 rounded-full mb-4 shadow-inner"><Film className="w-12 h-12 md:w-14 md:h-14 opacity-50 text-slate-400" /></div>
          <p className="text-sm md:text-base font-bold"><R r="みぎ">右</R>のパネルから</p>
          <p className="text-sm md:text-base font-bold"><R r="どうが">動画</R>や<R r="がぞう">画像</R>を<R r="ついか">追加</R>してね</p>
        </div>
      ) : (
        <>
          <div style={{ position: 'absolute', width: '1px', height: '1px', opacity: 0.01, pointerEvents: 'none', zIndex: -10, overflow: 'hidden' }}>
            {videos.map(v => v.type === 'video' && v.url ? (<video key={v.id} ref={el => videoRefs.current[v.id] = el} src={v.url} playsInline muted={false} preload="auto" onLoadedMetadata={(e) => handleLoadedMetadata(v.id, e)} onLoadedData={(e) => { if (e.target.currentTime === 0) e.target.currentTime = 0.001; }} />) : null)}
            {bgmUrl && <audio ref={bgmAudioRef} src={bgmUrl} loop preload="auto" onLoadedMetadata={handleBgmLoaded} />}
            {videos.filter(v => v.type === 'image' && v.url).map(v => (<img key={v.id} ref={el => imageRefs.current[v.id] = el} src={v.url} alt="cache" />))}
          </div>
          
          <canvas ref={canvasRef} className={`max-w-full max-h-full object-contain ${draggingTextId ? 'cursor-grabbing' : 'cursor-pointer hover:opacity-90'} transition-opacity`} onMouseDown={handleCanvasPointerDown} onTouchStart={handleCanvasPointerDown} />
          
          {isRecording && (<div className="absolute top-4 right-4 bg-red-600 text-white px-3.5 py-1.5 rounded-lg text-[10px] md:text-sm font-black flex items-center gap-2 animate-pulse shadow-lg backdrop-blur-sm"><div className="w-2.5 h-2.5 bg-white rounded-full"></div><R r="ろくがちゅう">録画中</R>...</div>)}
          {showSafeArea && (<div className="absolute top-4 left-4 bg-black/60 text-white px-2.5 py-1 rounded-md text-[9px] font-bold tracking-wider backdrop-blur-md border border-white/20 pointer-events-none">SAFE AREA ON</div>)}
          {videos.find(v => v.id === playingVideoIdRef.current)?.needsReconnect && (
            <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center z-20 backdrop-blur-md text-white p-6 text-center">
              <div className="bg-red-500/20 p-4 rounded-full mb-3"><AlertTriangle className="w-10 h-10 md:w-14 md:h-14 text-red-400 animate-pulse" /></div>
              <h3 className="text-base md:text-xl font-black mb-2"><R r="もと">元</R>ファイルが<R r="み">見</R>つかりません</h3>
              <button onClick={() => { setReconnectTargetId(playingVideoIdRef.current); setTimeout(() => reconnectInputRef.current?.click(), 0); }} className="bg-white text-slate-900 hover:bg-slate-200 font-bold py-2.5 px-6 rounded-xl shadow-lg mt-3 flex items-center gap-2 text-sm transition-all active:scale-95"><FileVideo className="w-4 h-4" />ファイルを<R r="さいせんたく">再選択</R></button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

const PlaybackBar = ({ isPlaying, isRecording, togglePlay, seekToGlobalTime, displayTime, totalDuration, canUndo, canRedo, undo, redo, videos, showSafeArea, setShowSafeArea }) => {
  const [isScrubbing, setIsScrubbing] = useState(false);
  const progressBarRef = useRef(null);

  const updateSeek = useCallback((e) => {
    if (!progressBarRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const clientX = e.clientX ?? e.touches?.[0]?.clientX;
    if (clientX === undefined) return;
    const ratio = Math.max(0, Math.min((clientX - rect.left) / rect.width, 1));
    seekToGlobalTime(ratio * totalDuration);
  }, [totalDuration, seekToGlobalTime]);

  const handleScrubStart = (e) => {
    if (isRecording) return;
    setIsScrubbing(true);
    updateSeek(e);
  };

  useEffect(() => {
    if (!isScrubbing) return;
    const handleMove = (e) => updateSeek(e);
    const handleUp = () => setIsScrubbing(false);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('touchmove', handleMove, { passive: false });
    window.addEventListener('touchend', handleUp);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleUp);
    };
  }, [isScrubbing, updateSeek]);

  return (
    <div className="flex-none flex items-center gap-2.5 md:gap-4 w-full max-w-4xl mx-auto px-2 py-1">
      <button onClick={togglePlay} disabled={isRecording || !videos || videos.some(v => v.needsReconnect)} className="bg-slate-800 text-white hover:bg-slate-900 w-11 h-11 md:w-14 md:h-14 rounded-full transition-all active:scale-95 disabled:opacity-40 flex-shrink-0 shadow-md flex items-center justify-center outline-none focus-visible:ring-4 ring-slate-300">
        {isPlaying ? <Pause className="w-5 h-5 md:w-6 md:h-6" /> : <Play className="w-5 h-5 md:w-6 md:h-6 ml-1" />}
      </button>
      <button onClick={() => { seekToGlobalTime(0); if(!isPlaying) togglePlay(); }} disabled={isRecording || !videos || videos.some(v => v.needsReconnect)} className="bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 w-10 h-10 md:w-12 md:h-12 rounded-full transition-all active:scale-95 disabled:opacity-40 flex-shrink-0 shadow-sm flex items-center justify-center outline-none">
        <RotateCcw className="w-4 h-4 md:w-5 md:h-5" />
      </button>
      <div className="hidden sm:flex items-center gap-1.5 border-l border-r border-slate-200 px-3 mx-1">
        <button onClick={undo} disabled={!canUndo || isRecording} className="text-slate-500 hover:bg-slate-100 disabled:opacity-30 p-2.5 rounded-xl transition-colors"><Undo2 className="w-5 h-5" /></button>
        <button onClick={redo} disabled={!canRedo || isRecording} className="text-slate-500 hover:bg-slate-100 disabled:opacity-30 p-2.5 rounded-xl transition-colors"><Redo2 className="w-5 h-5" /></button>
      </div>
      <div className="flex-grow flex items-center gap-3 md:gap-4 bg-white rounded-full px-4 md:px-5 py-2.5 border border-slate-200 shadow-sm">
        <span className="text-[10px] md:text-xs font-black text-slate-500 w-9 md:w-11 text-right font-mono tracking-tighter" translate="no">{formatTime(displayTime)}</span>
        <div 
          className="flex-grow h-2 md:h-2.5 bg-slate-100 rounded-full overflow-hidden cursor-pointer relative shadow-inner touch-none" 
          ref={progressBarRef}
          onMouseDown={handleScrubStart} 
          onTouchStart={handleScrubStart}
        >
          <div className="h-full bg-slate-800 transition-all duration-75 ease-linear pointer-events-none rounded-full relative" style={{ width: `${totalDuration > 0 ? (displayTime / totalDuration) * 100 : 0}%` }}>
            <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/30 rounded-full"></div>
          </div>
        </div>
        <span className="text-[10px] md:text-xs font-black text-slate-400 w-9 md:w-11 font-mono tracking-tighter" translate="no">{formatTime(totalDuration)}</span>
      </div>
      <button onClick={() => setShowSafeArea(!showSafeArea)} className={`hidden md:flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full transition-all active:scale-95 shadow-sm border outline-none ${showSafeArea ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-white text-slate-400 border-slate-200 hover:bg-slate-50 hover:text-slate-600'}`} title="セーフエリアを表示(ひょうじ)">
        <Grid3X3 className="w-4 h-4 md:w-5 md:h-5" />
      </button>
    </div>
  );
};

const TimelineArea = ({ isTimelineExpanded, setIsTimelineExpanded, zoomLevel, setZoomLevel, timelineRef, progressRef, totalDuration, videos, textList, handleMouseDownTimeline, snapGuide, seekToGlobalTime, setIsPlaying, setActiveTextId }) => {
  const handleTextInteraction = (e, tId, type) => {
    e.stopPropagation(); handleMouseDownTimeline(e, tId, type); setActiveTextId(tId);
    setTimeout(() => document.getElementById(`text-card-${tId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
  };

  const [panState, setPanState] = useState({ isPanning: false, startX: 0, startScrollLeft: 0, hasMoved: false });

  useEffect(() => {
    const el = timelineRef.current;
    if (!el) return;
    const handleWheel = (e) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX) && !e.shiftKey) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
      }
    };
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [timelineRef]);

  const handlePointerDownBg = (e) => {
    if (e.target.classList.contains('timeline-bg') || e.target.classList.contains('timeline-container')) {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      setPanState({ isPanning: true, startX: clientX, startScrollLeft: timelineRef.current.scrollLeft, hasMoved: false });
    }
  };

  useEffect(() => {
    if (!panState.isPanning) return;
    const handlePointerMove = (e) => {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const dx = clientX - panState.startX;
      if (Math.abs(dx) > 3) {
        setPanState(p => ({ ...p, hasMoved: true }));
        if (timelineRef.current) timelineRef.current.scrollLeft = panState.startScrollLeft - dx;
      }
    };
    const handlePointerUp = (e) => {
      if (!panState.hasMoved && timelineRef.current) {
        const rect = timelineRef.current.getBoundingClientRect();
        const clientX = e.changedTouches ? e.changedTouches[0].clientX : (e.clientX ?? panState.startX);
        const newTime = ((clientX - rect.left + timelineRef.current.scrollLeft) / timelineRef.current.scrollWidth) * totalDuration;
        seekToGlobalTime(Math.max(0, Math.min(newTime, totalDuration)));
        setIsPlaying(false);
      }
      setPanState({ isPanning: false, startX: 0, startScrollLeft: 0, hasMoved: false });
    };

    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);
    window.addEventListener('touchmove', handlePointerMove, { passive: false });
    window.addEventListener('touchend', handlePointerUp);
    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);
    };
  }, [panState, totalDuration, seekToGlobalTime, setIsPlaying, timelineRef]);

  return (
    <div id="tutorial-timeline" className={`${isTimelineExpanded ? 'flex-grow min-h-[180px]' : 'flex-none h-[110px] md:h-36'} bg-white border border-slate-200 rounded-2xl p-2.5 shadow-sm flex flex-col gap-1.5 w-full mx-auto transition-all duration-500 relative z-0`}>
      <div className="text-[10px] md:text-xs font-bold text-slate-500 flex items-center justify-between flex-none px-2 pt-1">
        <div className="flex items-center gap-1.5 font-black text-slate-700 tracking-wider"><Clock className="w-4 h-4 text-slate-400" /> TIMELINE</div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
            <span className="text-[10px] font-bold text-slate-400"><R r="かくだいりつ">拡大率</R></span>
            <input type="range" min="1" max="5" step="0.5" value={zoomLevel} onChange={(e) => setZoomLevel(parseFloat(e.target.value))} className="w-20 h-1.5 accent-slate-600 bg-slate-200 rounded-full appearance-none cursor-pointer" />
          </div>
          <button onClick={() => setIsTimelineExpanded(!isTimelineExpanded)} className="text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-200 rounded-md p-1.5 transition-colors">
            {isTimelineExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>
      <div 
        className={`flex-grow relative bg-slate-50/50 rounded-xl select-none overflow-y-auto overflow-x-auto custom-scrollbar border border-slate-200 shadow-inner touch-pan-y ${panState.isPanning ? 'cursor-grabbing' : 'cursor-pointer'}`} 
        ref={timelineRef} 
        onMouseDown={handlePointerDownBg} 
        onTouchStart={handlePointerDownBg}
      >
        <div className="timeline-container" style={{ width: `${zoomLevel * 100}%`, height: `${Math.max(100, (textList || []).length * 38 + 24)}px`, minHeight: '100%', position: 'relative' }}>
          <div className="absolute inset-0 timeline-bg pointer-events-auto" style={{ backgroundSize: `${10 / zoomLevel}% 100%`, backgroundImage: 'linear-gradient(to right, rgba(203, 213, 225, 0.4) 1px, transparent 1px)' }}></div>
          {(() => { let acc = 0; return (videos || []).map((v, i) => { acc += (v.type === 'video' ? v.trimEnd - v.trimStart : v.trimEnd); if (i === (videos || []).length - 1) return null; return <div key={`sep-${i}`} className="absolute top-0 bottom-0 w-px bg-slate-300 pointer-events-none" style={{ left: `${(acc / totalDuration) * 100}%` }}></div>; }); })()}
          {textList && textList.map((t, index) => {
            const safeTotal = totalDuration > 0 ? totalDuration : 1; const leftPercent = (Math.min(t.start, safeTotal) / safeTotal) * 100; const widthPercent = ((Math.min(t.end, safeTotal) - Math.min(t.start, safeTotal)) / safeTotal) * 100;
            return (
              <div key={t.id} className="absolute h-8 rounded-lg bg-white border border-slate-300 flex items-center justify-between group cursor-grab active:cursor-grabbing hover:border-slate-400 transition-colors shadow-sm mt-4 overflow-hidden" style={{ left: `${leftPercent}%`, width: `${widthPercent}%`, top: `${index * 36 + 8}px` }} onMouseDown={(e) => handleTextInteraction(e, t.id, 'move')} onTouchStart={(e) => handleTextInteraction(e, t.id, 'move')}>
                <div className="touch-none w-5 md:w-6 h-full cursor-ew-resize bg-slate-200 hover:bg-slate-300 flex items-center justify-center shrink-0 border-r border-slate-300" onMouseDown={(e) => handleTextInteraction(e, t.id, 'start')} onTouchStart={(e) => handleTextInteraction(e, t.id, 'start')}><div className="w-0.5 h-3.5 bg-slate-400 rounded-full pointer-events-none"></div></div>
                <div className="flex-grow text-center text-[10px] md:text-xs font-bold text-slate-600 truncate px-2 pointer-events-none flex items-center justify-center gap-1.5"><span className="bg-slate-100 text-slate-500 rounded w-4 h-4 flex items-center justify-center text-[9px] shrink-0 font-black">{index + 1}</span><span className="truncate">{t.text || '（空）'}</span></div>
                <div className="touch-none w-5 md:w-6 h-full cursor-ew-resize bg-slate-200 hover:bg-slate-300 flex items-center justify-center shrink-0 border-l border-slate-300" onMouseDown={(e) => handleTextInteraction(e, t.id, 'end')} onTouchStart={(e) => handleTextInteraction(e, t.id, 'end')}><div className="w-0.5 h-3.5 bg-slate-400 rounded-full pointer-events-none"></div></div>
              </div>
            );
          })}
          {snapGuide !== null && totalDuration > 0 && <div className="absolute top-0 bottom-0 w-[2px] bg-blue-500 pointer-events-none z-20 shadow-[0_0_8px_rgba(59,130,246,0.8)]" style={{ left: `${(snapGuide / totalDuration) * 100}%` }}></div>}
          <div ref={progressRef} className="absolute top-0 bottom-0 w-[2px] bg-red-500 pointer-events-none z-10" style={{ left: '0%' }}><div className="w-4 h-4 bg-red-500 rounded-full absolute -top-2 -left-[7px] shadow-md border-2 border-white"></div></div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 🚀 メインアプリケーション
// ==========================================
const AppContent = () => {
  const tutorial = useTutorial(); const toast = useToast(); 
  const [showShortcuts, setShowShortcuts] = useState(false); const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isTimelineExpanded, setIsTimelineExpanded] = useState(false); const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [showSafeArea, setShowSafeArea] = useState(false);

  const [historyState, setHistoryState, undo, redo, canUndo, canRedo] = useHistory({ videos: getInitialVideos(), textList: getInitialTextList() });
  const videos = historyState?.videos || []; const textList = historyState?.textList || [];

  const updateVideosAndHistory = useCallback((resolver) => setHistoryState(prev => ({ ...prev, videos: typeof resolver === 'function' ? resolver(prev.videos) : resolver })), [setHistoryState]);
  const updateTextListAndHistory = useCallback((resolver) => setHistoryState(prev => ({ ...prev, textList: typeof resolver === 'function' ? resolver(prev.textList) : resolver })), [setHistoryState]);
  const updateAllStateAndHistory = useCallback((v, t) => setHistoryState({ videos: v, textList: t }), [setHistoryState]);

  useEffect(() => { if (videos) window.localStorage.setItem('movie-maker-videos-recipe-v2', JSON.stringify(videos.map(v => ({ id: v.id, type: v.type, name: v.name, duration: v.duration, trimStart: v.trimStart, trimEnd: v.trimEnd, filterType: v.filterType, transitionType: v.transitionType, bgColor: v.bgColor })))); }, [videos]);
  useEffect(() => { try { window.localStorage.setItem('movie-maker-text-list-v8', JSON.stringify(textList)); } catch (e) {} }, [textList]);

  const [activeVideoId, setActiveVideoId] = useState(null); const [playingVideoId, setPlayingVideoId] = useState(null);
  useEffect(() => { if (videos && videos.length > 0 && !playingVideoId) { setPlayingVideoId(videos[0].id); setActiveVideoId(videos[0].id); } }, [videos, playingVideoId]);

  const [bgmFile, setBgmFile] = useState(null); const [bgmUrl, setBgmUrl] = useState(null);
  const [bgmVolume, setBgmVolume] = useStickyState(50, 'movie-maker-bgm-volume');
  const [isRecording, setIsRecording] = useState(false); const [recordingProgress, setRecordingProgress] = useState(0); 
  const [downloadUrl, setDownloadUrl] = useState(null); const [isPlaying, setIsPlaying] = useState(false); const [isDragging, setIsDragging] = useState(false);
  const [draggingTextId, setDraggingTextId] = useState(null); const [activeTextId, setActiveTextId] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1); const [snapGuide, setSnapGuide] = useState(null);
  const [dragging, setDragging] = useState(null); const [reconnectTargetId, setReconnectTargetId] = useState(null);
  
  const [draggedMediaId, setDraggedMediaId] = useState(null);
  const [dragOverMediaId, setDragOverMediaId] = useState(null);

  const videoRefs = useRef({}); const imageRefs = useRef({}); const canvasRef = useRef(null); const recorderRef = useRef(null);
  const fileInputRef = useRef(null); const bgmInputRef = useRef(null); const reconnectInputRef = useRef(null);
  const timelineRef = useRef(null); const progressRef = useRef(null); const virtualTimeRef = useRef(0); const lastFrameTimeRef = useRef(0); 
  const audioCtxRef = useRef(null); const destRef = useRef(null); const audioNodesRef = useRef({});
  const bgmAudioRef = useRef(null); const bgmNodeRef = useRef(null); const bgmGainRef = useRef(null);
  const canvasSnapGuideRef = useRef({ x: false, y: false }); const showSafeAreaRef = useRef(showSafeArea); useEffect(() => { showSafeAreaRef.current = showSafeArea; }, [showSafeArea]);

  const videosRef = useRef(videos); useEffect(() => { videosRef.current = videos; }, [videos]);
  const textListRef = useRef(textList); useEffect(() => { textListRef.current = textList; }, [textList]);
  const playingVideoIdRef = useRef(playingVideoId); useEffect(() => { playingVideoIdRef.current = playingVideoId; }, [playingVideoId]);
  const isPlayingRef = useRef(isPlaying); useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);
  const draggingRef = useRef(dragging); useEffect(() => { draggingRef.current = dragging; }, [dragging]);
  const isRecordingRef = useRef(isRecording); useEffect(() => { isRecordingRef.current = isRecording; }, [isRecording]);

  const totalDuration = (videos || []).reduce((acc, v) => v.type === 'video' ? acc + Math.max(0, v.trimEnd - v.trimStart) : acc + Math.max(0, v.trimEnd), 0);

  const getGlobalTimeFromRef = useCallback(() => {
    const vList = videosRef.current; const currentId = playingVideoIdRef.current;
    if (!currentId || !vList || vList.length === 0) return 0; 
    let time = 0;
    for (const v of vList) {
      if (v.id === currentId) {
        if (v.type === 'video') { const el = videoRefs.current[v.id]; if (el && !v.needsReconnect) time += Math.max(0, el.currentTime - v.trimStart); }
        else time += Math.max(0, virtualTimeRef.current);
        break;
      } else time += Math.max(0, v.trimEnd - (v.type === 'video' ? v.trimStart : 0));
    }
    return time;
  }, []);

  const [displayTime, setDisplayTime] = useState(0);
  useEffect(() => {
    let intervalId;
    if (isPlaying || isRecording) {
      intervalId = setInterval(() => {
        const newTime = getGlobalTimeFromRef(); setDisplayTime(newTime);
        if (timelineRef.current && totalDuration > 0 && zoomLevel > 1) {
          const el = timelineRef.current; const currentX = (newTime / totalDuration) * el.scrollWidth;
          if (currentX > el.scrollLeft + el.clientWidth * 0.8) el.scrollTo({ left: currentX - el.clientWidth * 0.2, behavior: 'smooth' });
          else if (currentX < el.scrollLeft) el.scrollTo({ left: Math.max(0, currentX - el.clientWidth * 0.2), behavior: 'smooth' });
        }
      }, 100);
    } else setDisplayTime(getGlobalTimeFromRef());
    return () => clearInterval(intervalId);
  }, [isPlaying, isRecording, getGlobalTimeFromRef, totalDuration, zoomLevel]);

  const initAudioCtx = () => {
    if (!audioCtxRef.current) { audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)(); destRef.current = audioCtxRef.current.createMediaStreamDestination(); }
    else if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();
  };

  const executeClearAll = () => {
    if (videos) videos.forEach(v => { if (v.url) URL.revokeObjectURL(v.url); });
    if (bgmUrl) URL.revokeObjectURL(bgmUrl);

    updateAllStateAndHistory([], [{ id: Date.now(), text: '', color: '#ffffff', pos: 'bottom', scale: 100, start: 0, end: 9999, font: 'Zen Maru Gothic', hasManuallyEditedTime: false }]);
    setActiveVideoId(null); setPlayingVideoId(null); setBgmFile(null); setBgmUrl(null);
    if (bgmNodeRef.current) { bgmNodeRef.current.disconnect(); bgmNodeRef.current = null; }
    if (bgmGainRef.current) { bgmGainRef.current.disconnect(); bgmGainRef.current = null; }
    setIsPlaying(false); setShowClearConfirm(false); window.localStorage.removeItem('movie-maker-videos-recipe-v2');
    toast(<><R r="すべ">全</R>てのデータをリセットしました</>, 'success');
  };

  const processFiles = (files) => {
    if (files.length === 0) return;
    initAudioCtx();
    Array.from(files).forEach(file => {
      const id = Date.now().toString() + Math.random().toString(36).substr(2, 5);
      const url = URL.createObjectURL(file);
      if (file.type.startsWith('video/')) updateVideosAndHistory(prev => { const upd = [...(prev||[]), { id, type: 'video', file, url, name: file.name, duration: 0, trimStart: 0, trimEnd: 0, filterType: 'none', transitionType: 'none', needsReconnect: false }]; if (upd.length === 1) { setActiveVideoId(id); setPlayingVideoId(id); } return upd; });
      else if (file.type.startsWith('image/')) updateVideosAndHistory(prev => { const upd = [...(prev||[]), { id, type: 'image', file, url, name: file.name, duration: 5, trimStart: 0, trimEnd: 5, filterType: 'none', transitionType: 'none', needsReconnect: false }]; if (upd.length === 1) { setActiveVideoId(id); setPlayingVideoId(id); } return upd; });
      else if (file.type.startsWith('audio/')) { setBgmFile(file); setBgmUrl(url); }
    });
    setDownloadUrl(null); toast(<>{files.length}個(こ)のメディアを<R r="ついか">追加</R>しました</>, 'success');
  };

  const addBlankPage = () => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 5);
    updateVideosAndHistory(prev => { const upd = [...(prev||[]), { id, type: 'blank', file: null, url: null, name: '空白ページ', duration: 3, trimStart: 0, trimEnd: 3, filterType: 'none', transitionType: 'none', needsReconnect: false, bgColor: '#000000' }]; if (upd.length === 1) { setActiveVideoId(id); setPlayingVideoId(id); } return upd; });
    toast(<><R r="くうはく">空白</R>ページを<R r="ついか">追加</R>しました</>);
  };

  const handleGlobalDragOver = (e) => {
    e.preventDefault();
    if (e.dataTransfer.types && e.dataTransfer.types.includes('Files') && !isDragging) {
      setIsDragging(true);
    }
  };

  const handleGlobalDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (!isRecording && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleMediaDrop = (targetId) => {
    if (!draggedMediaId || draggedMediaId === targetId) {
      setDraggedMediaId(null); setDragOverMediaId(null); return;
    }
    updateVideosAndHistory(prev => {
      const arr = [...(prev || [])];
      const draggedIndex = arr.findIndex(v => v.id === draggedMediaId);
      const targetIndex = arr.findIndex(v => v.id === targetId);
      if (draggedIndex === -1 || targetIndex === -1) return prev;
      const [draggedItem] = arr.splice(draggedIndex, 1);
      arr.splice(targetIndex, 0, draggedItem);
      return arr;
    });
    setDraggedMediaId(null); setDragOverMediaId(null);
    seekToGlobalTime(0); setIsPlaying(false);
  };

  const handleReconnectSelect = (e) => {
    const file = e.target.files[0];
    if (file && reconnectTargetId) {
      updateVideosAndHistory(prev => (prev || []).map(v => v.id === reconnectTargetId ? { ...v, file, url: URL.createObjectURL(file), name: file.name, needsReconnect: false } : v));
      initAudioCtx(); toast(<>ファイルを<R r="さいせんたく">再選択</R>しました</>, 'success');
    }
    e.target.value = ''; setReconnectTargetId(null);
  };

  const handleLoadedMetadata = (id, e) => {
    const d = e.target.duration;
    updateVideosAndHistory(prev => (prev || []).map(v => v.id === id ? { ...v, duration: d, trimStart: v.trimStart > d ? 0 : v.trimStart, trimEnd: (v.trimEnd === 0 || v.trimEnd > d) ? d : v.trimEnd } : v));
    const el = videoRefs.current[id];
    if (el && audioCtxRef.current && destRef.current && !audioNodesRef.current[id]) {
      try { const source = audioCtxRef.current.createMediaElementSource(el); source.connect(destRef.current); source.connect(audioCtxRef.current.destination); audioNodesRef.current[id] = source; } catch (err) {}
    }
  };

  const handleBgmLoaded = () => {
    const el = bgmAudioRef.current;
    if (el && audioCtxRef.current && destRef.current && !bgmNodeRef.current) {
      try { const source = audioCtxRef.current.createMediaElementSource(el); const gainNode = audioCtxRef.current.createGain(); gainNode.gain.value = bgmVolume / 100; source.connect(gainNode); gainNode.connect(destRef.current); gainNode.connect(audioCtxRef.current.destination); bgmNodeRef.current = source; bgmGainRef.current = gainNode; } catch (err) {}
    } else if (bgmGainRef.current) bgmGainRef.current.gain.value = bgmVolume / 100;
  };

  useEffect(() => { if (bgmGainRef.current && audioCtxRef.current) bgmGainRef.current.gain.setTargetAtTime(bgmVolume / 100, audioCtxRef.current.currentTime, 0.1); }, [bgmVolume]);

  const removeVideo = (id) => {
    updateVideosAndHistory(prev => {
      const target = (prev || []).find(v => v.id === id);
      if (target && target.url) URL.revokeObjectURL(target.url);

      const next = (prev||[]).filter(v => v.id !== id);
      if (playingVideoId === id) setPlayingVideoId(next[0]?.id || null); 
      if (activeVideoId === id) setActiveVideoId(next[0]?.id || null);
      return next;
    });
    if (audioNodesRef.current[id]) { audioNodesRef.current[id].disconnect(); delete audioNodesRef.current[id]; }
  };

  const removeBgm = () => { 
    if (bgmUrl) URL.revokeObjectURL(bgmUrl);
    setBgmFile(null); setBgmUrl(null); 
    if (bgmNodeRef.current) bgmNodeRef.current.disconnect(); bgmNodeRef.current = null; 
    if (bgmGainRef.current) bgmGainRef.current.disconnect(); bgmGainRef.current = null; 
  };

  const updateVideo = (id, field, value) => {
    updateVideosAndHistory(prev => (prev || []).map(v => v.id === id ? { ...v, [field]: value } : v));
    if (field === 'trimStart' || field === 'trimEnd') {
      setPlayingVideoId(id); setIsPlaying(false);
      const target = (videos || []).find(v => v.id === id); 
      if (target && target.type === 'video' && videoRefs.current[id]) videoRefs.current[id].currentTime = field === 'trimStart' ? value : target.trimStart;
      else if (target && target.type !== 'video') virtualTimeRef.current = 0;
    }
  };

  const updateText = (id, field, value) => {
    updateTextListAndHistory(prev => (prev || []).map(t => {
      if (t.id === id) {
        const upd = { ...t, [field]: value };
        if ((field === 'text' || field === 'pos') && !t.hasManuallyEditedTime && upd.text.length > 0) {
           let dur = Math.max(2.0, (upd.text.length * 0.25) + 1.5);
           let maxEnd = totalDuration > 0 ? totalDuration : 9999;
           const nextTexts = prev.filter(o => o.pos === upd.pos && o.start > upd.start && o.id !== id);
           if (nextTexts.length > 0) maxEnd = Math.min(maxEnd, Math.min(...nextTexts.map(o => o.start)) - 0.1);
           upd.end = Math.min(upd.start + dur, maxEnd);
           if (upd.end <= upd.start) upd.end = upd.start + 1.0;
        }
        if (field === 'start' || field === 'end') upd.hasManuallyEditedTime = true;
        return upd;
      }
      return t;
    }));
  };

  const addText = () => {
    updateTextListAndHistory(prev => {
      let nStart = 0, nEnd = totalDuration > 0 ? totalDuration : 9999, nPos = 'bottom', nX = 0.5, nY = 0.85, nFont = 'Zen Maru Gothic', nColor = '#ffffff', nOutline = '#1e293b';
      if (prev && prev.length > 0) { const lt = prev[prev.length - 1]; nPos = lt.pos; nX = lt.x ?? 0.5; nY = lt.y ?? 0.85; nFont = lt.font || 'Zen Maru Gothic'; nColor = lt.color; nOutline = lt.outlineColor ?? '#1e293b'; }
      const samePos = prev ? prev.filter(t => t.pos === nPos || (Math.abs((t.x || 0.5) - nX) < 0.1 && Math.abs((t.y || 0.85) - nY) < 0.1)) : [];
      if (samePos.length > 0) { nStart = samePos[samePos.length - 1].end + 0.1; if (totalDuration > 0 && nStart >= totalDuration) nStart = Math.max(0, totalDuration - 2.0); } else nStart = displayTime;
      return [...(prev || []), { id: Date.now(), text: '', color: nColor, outlineColor: nOutline, pos: nPos, x: nX, y: nY, scale: 100, start: nStart, end: Math.min(totalDuration > 0 ? totalDuration : 9999, nStart + 2.0), font: nFont, hasManuallyEditedTime: false }];
    });
  };

  const seekToGlobalTime = useCallback((targetTime) => {
    let acc = 0; const vList = videosRef.current;
    for (let i = 0; i < (vList || []).length; i++) {
      const v = vList[i]; const d = v.type === 'video' ? Math.max(0, v.trimEnd - v.trimStart) : Math.max(0, v.trimEnd);
      if (targetTime <= acc + d || i === vList.length - 1) {
        setPlayingVideoId(v.id); playingVideoIdRef.current = v.id;
        const localTime = (v.type === 'video' ? v.trimStart : 0) + (targetTime - acc);
        if (v.type === 'video') { const el = videoRefs.current[v.id]; if (el && !v.needsReconnect) el.currentTime = localTime; }
        else virtualTimeRef.current = localTime;
        vList.forEach(other => { if (other.type === 'video' && other.id !== v.id && videoRefs.current[other.id]) videoRefs.current[other.id].pause(); });
        break;
      }
      acc += d;
    }
    if (bgmAudioRef.current && bgmUrl && bgmAudioRef.current.duration > 0) bgmAudioRef.current.currentTime = targetTime % bgmAudioRef.current.duration;
    setDisplayTime(targetTime);
  }, [bgmUrl]);

  const togglePlay = useCallback(() => {
    if (!videos || videos.length === 0 || videos.some(v => v.needsReconnect)) return;
    initAudioCtx();
    if (!playingVideoIdRef.current) { setPlayingVideoId(videos[0].id); playingVideoIdRef.current = videos[0].id; seekToGlobalTime(0); }
    const activeV = (videosRef.current || []).find(v => v.id === playingVideoIdRef.current);
    if (isPlayingRef.current) {
      if (activeV?.type === 'video') videoRefs.current[playingVideoIdRef.current]?.pause();
      if (bgmAudioRef.current) bgmAudioRef.current.pause();
      setIsPlaying(false); isPlayingRef.current = false;
    } else {
      if (getGlobalTimeFromRef() >= totalDuration - 0.1) seekToGlobalTime(0);
      lastFrameTimeRef.current = performance.now();
      if (activeV?.type === 'video') videoRefs.current[playingVideoIdRef.current]?.play().catch(e=>{});
      if (bgmAudioRef.current && bgmUrl) bgmAudioRef.current.play().catch(e=>{});
      setIsPlaying(true); isPlayingRef.current = true;
    }
  }, [videos, seekToGlobalTime, getGlobalTimeFromRef, totalDuration, bgmUrl]);

  const togglePlayRef = useRef(togglePlay); useEffect(() => { togglePlayRef.current = togglePlay; }, [togglePlay]);
  
  const activeTextIdRef = useRef(activeTextId); useEffect(() => { activeTextIdRef.current = activeTextId; }, [activeTextId]);
  const activeVideoIdRef = useRef(activeVideoId); useEffect(() => { activeVideoIdRef.current = activeVideoId; }, [activeVideoId]);
  const addTextRef = useRef(addText); useEffect(() => { addTextRef.current = addText; }, [addText]);
  const removeVideoRef = useRef(removeVideo); useEffect(() => { removeVideoRef.current = removeVideo; }, [removeVideo]);
  const seekToGlobalTimeRef = useRef(seekToGlobalTime); useEffect(() => { seekToGlobalTimeRef.current = seekToGlobalTime; }, [seekToGlobalTime]);

  const handleCanvasPointerDown = useCallback((e) => {
    if (isRecording || !canvasRef.current) return;
    const canvas = canvasRef.current; const rect = canvas.getBoundingClientRect();
    const cx = e.touches ? e.touches[0].clientX : e.clientX; const cy = e.touches ? e.touches[0].clientY : e.clientY;
    if (typeof cx !== 'number') return;
    const ratio = Math.min(rect.width / canvas.width, rect.height / canvas.height);
    const dW = canvas.width * ratio; const dH = canvas.height * ratio;
    const ox = (rect.width - dW) / 2; const oy = (rect.height - dH) / 2;
    const rx = (cx - rect.left - ox) / dW; const ry = (cy - rect.top - oy) / dH;
    
    const gTime = getGlobalTimeFromRef(); const tList = textListRef.current || []; let foundId = null;
    for (let i = tList.length - 1; i >= 0; i--) {
      const t = tList[i];
      if (t && t.text && gTime >= t.start && gTime <= t.end) {
        const lines = t.text.split('\n'); const fSize = Math.floor(canvas.height / 8) * ((t.scale || 100) / 100);
        const hR = (fSize * 1.3 * lines.length) / canvas.height; const wR = (fSize * Math.max(...lines.map(l => l.length))) / canvas.width;
        if (Math.abs(rx - (t.x ?? 0.5)) < (wR / 2 + 0.1) && Math.abs(ry - (t.y ?? (t.pos === 'top' ? 0.15 : t.pos === 'middle' ? 0.5 : 0.85))) < (hR / 2 + 0.1)) { foundId = t.id; break; }
      }
    }
    if (foundId) { 
      if (e.cancelable) e.preventDefault(); 
      setDraggingTextId(foundId); setActiveTextId(foundId); 
      canvasSnapGuideRef.current = { x: false, y: false };
      setTimeout(() => document.getElementById(`text-card-${foundId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50); 
    } else {
      setActiveTextId(null);
    }
  }, [isRecording, getGlobalTimeFromRef]);

  useEffect(() => {
    const handleMove = (e) => {
      if (!draggingTextId || !canvasRef.current) return;
      const canvas = canvasRef.current; const rect = canvas.getBoundingClientRect();
      const cx = e.touches ? e.touches[0].clientX : e.clientX; const cy = e.touches ? e.touches[0].clientY : e.clientY;
      const r = Math.min(rect.width / canvas.width, rect.height / canvas.height);
      let rx = Math.max(0, Math.min((cx - rect.left - (rect.width - canvas.width * r) / 2), canvas.width * r)) / (canvas.width * r);
      let ry = Math.max(0, Math.min((cy - rect.top - (rect.height - canvas.height * r) / 2), canvas.height * r)) / (canvas.height * r);
      
      const snapThreshold = 0.03; let snapX = false, snapY = false;
      if (Math.abs(rx - 0.5) < snapThreshold) { rx = 0.5; snapX = true; }
      if (Math.abs(ry - 0.5) < snapThreshold) { ry = 0.5; snapY = true; }
      canvasSnapGuideRef.current = { x: snapX, y: snapY };

      updateTextListAndHistory(prev => (prev||[]).map(t => t.id === draggingTextId ? { ...t, x: rx, y: ry, pos: 'custom' } : t));
    };
    const handleUp = () => { setDraggingTextId(null); canvasSnapGuideRef.current = { x: false, y: false }; };
    if (draggingTextId) { window.addEventListener('mousemove', handleMove, { passive: false }); window.addEventListener('touchmove', handleMove, { passive: false }); window.addEventListener('mouseup', handleUp); window.addEventListener('touchend', handleUp); }
    return () => { window.removeEventListener('mousemove', handleMove); window.removeEventListener('touchmove', handleMove); window.removeEventListener('mouseup', handleUp); window.removeEventListener('touchmove', handleUp); };
  }, [draggingTextId, updateTextListAndHistory]);

  const handleMouseDownTimeline = (e, id, type) => {
    e.preventDefault(); if (!timelineRef.current || totalDuration <= 0) return;
    const cx = e.touches ? e.touches[0].clientX : e.clientX; if (typeof cx !== 'number') return;
    const textItem = (textListRef.current || []).find(t => t.id === id); if (!textItem) return;
    setDragging({ id, type, startOffset: ((cx - timelineRef.current.getBoundingClientRect().left + timelineRef.current.scrollLeft) / timelineRef.current.scrollWidth) * totalDuration - textItem.start });
  };
  
  useEffect(() => {
    const getSnapPoints = () => {
      const pts = new Set([0, totalDuration, displayTime]); let acc = 0;
      (videosRef.current||[]).forEach(v => { pts.add(acc); acc += (v.type === 'video' ? v.trimEnd - v.trimStart : v.trimEnd); pts.add(acc); });
      (textListRef.current||[]).forEach(t => { if (t && t.id !== draggingRef.current?.id) { pts.add(t.start); pts.add(t.end); } });
      return Array.from(pts).sort((a, b) => a - b);
    };
    const handleMove = (e) => {
      const drag = draggingRef.current; const tList = textListRef.current;
      if (!drag || !timelineRef.current || totalDuration <= 0 || !tList) return;
      const target = tList.find(t => t && t.id === drag.id); if (!target) return;
      const cx = e.touches ? e.touches[0].clientX : e.clientX; if (typeof cx !== 'number') return;
      let newTime = Math.max(0, Math.min((((cx - timelineRef.current.getBoundingClientRect().left + timelineRef.current.scrollLeft) / timelineRef.current.scrollWidth) * totalDuration), totalDuration));
      const snaps = getSnapPoints(); const thr = Math.max(0.1, 1.0 / zoomLevel); let snapT = newTime; let didSnap = false;
      for (const p of snaps) if (Math.abs(newTime - p) < thr) { snapT = p; didSnap = true; break; }

      let nS = target.start, nE = target.end;
      if (drag.type === 'start') { nS = Math.max(0, Math.min(snapT, target.end - 0.2)); setSnapGuide(didSnap ? snapT : null); }
      else if (drag.type === 'end') { nE = Math.min(totalDuration, Math.max(snapT, target.start + 0.2)); setSnapGuide(didSnap ? snapT : null); }
      else if (drag.type === 'move') {
        const len = target.end - target.start; let propS = newTime - drag.startOffset; let bestD = thr; let fS = propS; let mvSnap = false;
        for(const p of snaps) { if(Math.abs(propS - p) < Math.abs(bestD)) { bestD = propS - p; fS = p; mvSnap = true; } if(Math.abs((propS + len) - p) < Math.abs(bestD)) { bestD = (propS + len) - p; fS = p - len; mvSnap = true; } }
        setSnapGuide(mvSnap ? (fS === propS ? fS : fS + len) : null);
        nS = Math.max(0, Math.min(fS, totalDuration - len)); nE = nS + len;
      }
      seekToGlobalTime(nS); setIsPlaying(false);
      updateTextListAndHistory(prev => (prev||[]).map(t => t && t.id === drag.id ? { ...t, start: nS, end: nE, hasManuallyEditedTime: true } : t));
    };
    const handleUp = () => { setDragging(null); setSnapGuide(null); };
    if (dragging) { window.addEventListener('mousemove', handleMove, { passive: false }); window.addEventListener('touchmove', handleMove, { passive: false }); window.addEventListener('mouseup', handleUp); window.addEventListener('touchend', handleUp); }
    return () => { window.removeEventListener('mousemove', handleMove); window.removeEventListener('touchmove', handleMove); window.removeEventListener('mouseup', handleUp); window.removeEventListener('touchmove', handleUp); };
  }, [dragging, totalDuration, zoomLevel, seekToGlobalTime, updateTextListAndHistory, displayTime]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName) || tutorial.isActive) return;
      
      if ((e.ctrlKey || e.metaKey) && String(e.key).toLowerCase() === 'z') { e.preventDefault(); if (e.shiftKey) { if (canRedo) redo(); } else { if (canUndo) undo(); } return; }
      if ((e.ctrlKey || e.metaKey) && String(e.key).toLowerCase() === 'y') { e.preventDefault(); if (canRedo) redo(); return; }
      
      if (e.key === 'Escape') { 
        setIsAiModalOpen(false); setShowClearConfirm(false); setShowShortcuts(false); setActiveTextId(null); 
        return; 
      }

      if (e.key.toLowerCase() === 'a') { e.preventDefault(); setIsAiModalOpen(p => !p); return; }
      if (e.key === '?' || e.key === '/') { e.preventDefault(); setShowShortcuts(p => !p); return; }

      if (isAiModalOpen || showClearConfirm || showShortcuts) return;

      switch (e.key) { 
        case ' ': 
          e.preventDefault(); 
          togglePlayRef.current(); 
          break; 
        case 'l': case 'L': 
          e.preventDefault(); 
          setIsTimelineExpanded(p => !p); 
          break; 
        case 'Backspace': case 'Delete': 
          e.preventDefault(); 
          if (e.shiftKey) {
            setShowClearConfirm(true); 
          } else {
            if (activeTextIdRef.current) {
              updateTextListAndHistory(p => p.filter(x => x.id !== activeTextIdRef.current));
              setActiveTextId(null);
            } else if (activeVideoIdRef.current) {
              removeVideoRef.current(activeVideoIdRef.current);
            }
          }
          break; 
        case 't': case 'T': 
          e.preventDefault(); 
          addTextRef.current(); 
          break;
        case 'i': case 'I': 
          e.preventDefault(); 
          fileInputRef.current?.click(); 
          break;
        case 'm': case 'M': 
          e.preventDefault(); 
          bgmInputRef.current?.click(); 
          break;
        case 'ArrowRight': 
          e.preventDefault(); 
          seekToGlobalTimeRef.current(Math.min(totalDuration, getGlobalTimeFromRef() + 1)); 
          break;
        case 'ArrowLeft': 
          e.preventDefault(); 
          seekToGlobalTimeRef.current(Math.max(0, getGlobalTimeFromRef() - 1)); 
          break;
        default: 
          break; 
      }
    };
    window.addEventListener('keydown', handleKeyDown); return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAiModalOpen, showClearConfirm, showShortcuts, tutorial.isActive, canUndo, canRedo, undo, redo, totalDuration, getGlobalTimeFromRef, updateTextListAndHistory]);

  const startRecording = async () => {
    const canvas = canvasRef.current; if (!canvas || !videos || videos.length === 0 || videos.some(v => v.needsReconnect)) return;
    let writableStream = null;
    if ('showSaveFilePicker' in window) { try { writableStream = await (await window.showSaveFilePicker({ suggestedName: `映像制作スタジオ_${new Date().getTime()}.webm`, types: [{ description: 'WebM 動画ファイル', accept: { 'video/webm': ['.webm'] } }] })).createWritable(); } catch (err) { return; } }
    try {
      const stream = new MediaStream([...canvas.captureStream(30).getVideoTracks(), ...(destRef.current ? destRef.current.stream.getAudioTracks() : [])]);
      let options = { mimeType: 'video/webm;codecs=vp9', videoBitsPerSecond: 8000000 };
      if (!MediaRecorder.isTypeSupported(options.mimeType)) { options = { mimeType: 'video/webm', videoBitsPerSecond: 8000000 }; }
      const recorder = new MediaRecorder(stream, options); const chunks = []; let elChunks = 0;
      recorder.ondataavailable = async (e) => { if (e.data.size > 0) { if (writableStream) await writableStream.write(e.data); else chunks.push(e.data); } elChunks++; setRecordingProgress(Math.min(99, Math.floor((elChunks / totalDuration) * 100))); };
      recorder.onstop = async () => { if (writableStream) { await writableStream.close(); setDownloadUrl('direct_saved'); } else setDownloadUrl(URL.createObjectURL(new Blob(chunks, { type: 'video/webm' }))); setIsRecording(false); setRecordingProgress(100); toast(<><R r="か">書</R>き<R r="だ">出</R>しが<R r="かんりょう">完了</R>しました</>, 'success'); };
      recorderRef.current = recorder; recorder.start(1000); setIsRecording(true); setRecordingProgress(0); setDownloadUrl(null); toast(<><R r="どうが">動画</R>の<R r="か">書</R>き<R r="だ">出</R>しを<R r="かいし">開始</R>しました</>);
      seekToGlobalTime(0); setIsPlaying(true);
      if (videos[0].type === 'video' && videoRefs.current[videos[0].id]) videoRefs.current[videos[0].id].play();
      if (bgmAudioRef.current && bgmUrl) bgmAudioRef.current.play();
    } catch (err) { toast(<>エラーが<R r="はっせい">発生</R>しました</>, 'error'); setIsRecording(false); if (writableStream) await writableStream.close(); }
  };
  
  const stopRecording = () => {
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
    (videos||[]).forEach(v => { if (v.type === 'video' && videoRefs.current[v.id]) videoRefs.current[v.id].pause(); });
    if (bgmAudioRef.current) bgmAudioRef.current.pause(); setIsPlaying(false);
  };

  const applyAiRecipe = (jsonStr) => {
    try {
      const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("JSONが見つかりません");
      const recipe = JSON.parse(jsonMatch[0]); 
      let nv = videos, nt = textList;
      if (recipe.videos && Array.isArray(recipe.videos)) {
        const arr = [];
        recipe.videos.forEach((rv, i) => { 
          const orig = videos[rv.scene - 1]; 
          if (orig) arr.push({ ...orig, id: Date.now().toString() + Math.random().toString(36).substr(2, 5) + i, trimStart: typeof rv.trimStart === 'number' ? rv.trimStart : orig.trimStart, trimEnd: typeof rv.trimEnd === 'number' ? rv.trimEnd : orig.trimEnd, filterType: rv.filterType || orig.filterType, transitionType: rv.transitionType || orig.transitionType, bgColor: rv.bgColor || orig.bgColor }); 
        });
        if (arr.length > 0) nv = arr;
      }
      if (recipe.texts && Array.isArray(recipe.texts)) {
        nt = recipe.texts.map((t, i) => ({ id: Date.now() + i, text: t.text || '', color: t.color || '#ffffff', outlineColor: t.outlineColor || '#1e293b', pos: t.pos || 'bottom', scale: typeof t.scale === 'number' ? t.scale : 100, start: typeof t.start === 'number' ? t.start : 0, end: typeof t.end === 'number' ? t.end : 9999, font: t.font || 'Zen Maru Gothic', hasManuallyEditedTime: true }));
      }
      updateAllStateAndHistory(nv, nt); setIsAiModalOpen(false); toast(<>AIのレシピを<R r="てきよう">適用</R>しました！</>, 'success'); seekToGlobalTime(0);
    } catch (err) { toast(<>レシピの<R r="けいしき">形式</R>が<R r="まちが">間違</R>っています</>, 'error'); }
  };

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return; const ctx = canvas.getContext('2d', { alpha: false }); let animId;
    const drawFrame = (ts) => {
      animId = requestAnimationFrame(drawFrame);
      const vList = videosRef.current; const cId = playingVideoIdRef.current;
      if (!vList || vList.length === 0 || !cId) { lastFrameTimeRef.current = 0; ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, canvas.width || 1280, canvas.height || 720); return; }
      if (!lastFrameTimeRef.current) lastFrameTimeRef.current = ts;
      const dt = (ts - lastFrameTimeRef.current) / 1000; lastFrameTimeRef.current = ts;
      const cIdx = vList.findIndex(v => v.id === cId); if (cIdx === -1) return; const aV = vList[cIdx]; if (aV.needsReconnect) return;
      let locT = aV.type === 'video' ? (videoRefs.current[cId]?.currentTime || 0) : ((isPlayingRef.current || isRecordingRef.current ? virtualTimeRef.current += dt : virtualTimeRef.current));
      
      const firstV = vList.find(v => v.type === 'video'); let tW = 1280, tH = 720;
      if (firstV && videoRefs.current[firstV.id]?.videoWidth > 0) { tW = videoRefs.current[firstV.id].videoWidth; tH = videoRefs.current[firstV.id].videoHeight; }
      if (canvas.width !== tW) canvas.width = tW; if (canvas.height !== tH) canvas.height = tH;

      if (locT >= aV.trimEnd && !draggingRef.current) {
        if (cIdx < vList.length - 1) {
          const nV = vList[cIdx + 1]; if (aV.type === 'video') videoRefs.current[cId]?.pause();
          playingVideoIdRef.current = nV.id; setPlayingVideoId(nV.id);
          if (nV.type === 'video') { const nEl = videoRefs.current[nV.id]; if (nEl && !nV.needsReconnect) { nEl.currentTime = nV.trimStart; if (isPlayingRef.current || isRecordingRef.current) nEl.play().catch(()=>{}); } }
          else virtualTimeRef.current = 0; return;
        } else {
          if (isRecordingRef.current) recorderRef.current?.stop();
          if (aV.type === 'video') videoRefs.current[cId]?.pause();
          if (bgmAudioRef.current) bgmAudioRef.current.pause();
          setIsPlaying(false); isPlayingRef.current = false;
        }
      }

      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, canvas.width, canvas.height);
      const drawMedia = (obj, flt, alpha = 1.0) => {
        if (alpha <= 0) return; ctx.filter = flt || 'none'; ctx.globalAlpha = alpha;
        if (obj.type === 'video') { const el = videoRefs.current[obj.id]; if (el?.videoWidth > 0 && el.readyState >= 2) { const s = Math.min(canvas.width / el.videoWidth, canvas.height / el.videoHeight); ctx.drawImage(el, (canvas.width - el.videoWidth * s) / 2, (canvas.height - el.videoHeight * s) / 2, el.videoWidth * s, el.videoHeight * s); } }
        else if (obj.type === 'image') { const el = imageRefs.current[obj.id]; if (el?.complete && el.naturalWidth > 0) { const s = Math.min(canvas.width / el.naturalWidth, canvas.height / el.naturalHeight); ctx.drawImage(el, (canvas.width - el.naturalWidth * s) / 2, (canvas.height - el.naturalHeight * s) / 2, el.naturalWidth * s, el.naturalHeight * s); } }
        else if (obj.type === 'blank') { ctx.fillStyle = obj.bgColor || '#000000'; ctx.fillRect(0, 0, canvas.width, canvas.height); }
        ctx.filter = 'none'; ctx.globalAlpha = 1.0;
      };

      const tSinceStart = locT - (aV.type === 'video' ? aV.trimStart : 0); const isTrans = aV.transitionType !== 'none' && tSinceStart >= 0 && tSinceStart < 1.0; const prog = isTrans ? tSinceStart / 1.0 : 0;
      if (isTrans && cIdx > 0) {
        const pV = vList[cIdx - 1];
        if (aV.transitionType === 'fade') { if (!pV.needsReconnect) drawMedia(pV, pV.filterType, 1.0); drawMedia(aV, aV.filterType, prog); }
        else if (aV.transitionType === 'wipe') { if (!pV.needsReconnect) drawMedia(pV, pV.filterType, 1.0); ctx.save(); ctx.beginPath(); ctx.rect(0, 0, canvas.width * prog, canvas.height); ctx.clip(); drawMedia(aV, aV.filterType, 1.0); ctx.restore(); }
        else if (aV.transitionType === 'slide') { ctx.save(); ctx.translate(-canvas.width * prog, 0); if (!pV.needsReconnect) drawMedia(pV, pV.filterType, 1.0); ctx.restore(); ctx.save(); ctx.translate(canvas.width * (1.0 - prog), 0); drawMedia(aV, aV.filterType, 1.0); ctx.restore(); }
        else drawMedia(aV, aV.filterType, 1.0);
      } else drawMedia(aV, aV.filterType, 1.0);

      if (showSafeAreaRef.current && canvas.width > 0) {
        ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)'; ctx.setLineDash([4, 4]);
        ctx.strokeRect(canvas.width * 0.05, canvas.height * 0.05, canvas.width * 0.9, canvas.height * 0.9); // 90%
        ctx.strokeRect(canvas.width * 0.1, canvas.height * 0.1, canvas.width * 0.8, canvas.height * 0.8); // 80%
        ctx.beginPath(); ctx.moveTo(canvas.width/2, 0); ctx.lineTo(canvas.width/2, canvas.height); ctx.moveTo(0, canvas.height/2); ctx.lineTo(canvas.width, canvas.height/2); ctx.stroke();
        ctx.setLineDash([]);
      }

      const gTime = getGlobalTimeFromRef();
      if (canvas.width > 0 && textListRef.current) {
        ctx.lineJoin = 'round'; ctx.miterLimit = 2;
        textListRef.current.forEach(t => {
          if (t && t.text && gTime >= t.start && gTime <= t.end) {
            const lines = t.text.split('\n'); const fs = Math.floor(canvas.height / 8) * (t.scale / 100); const lh = fs * 1.3; const th = lh * lines.length;
            ctx.font = `bold ${fs}px "${t.font || 'Zen Maru Gothic'}", sans-serif`; ctx.fillStyle = t.color; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            const x = (t.x ?? 0.5) * canvas.width; const sY = (t.y ?? (t.pos === 'top' ? 0.15 : t.pos === 'middle' ? 0.5 : 0.85)) * canvas.height - (th / 2) + (fs / 2);
            ctx.lineWidth = t.outlineWidth ?? Math.max(4, fs / 10); ctx.strokeStyle = t.outlineColor ?? (t.color === '#ffffff' ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.9)');
            lines.forEach((l, i) => { const y = sY + (i * lh); if (ctx.strokeStyle !== 'rgba(0, 0, 0, 0)' && ctx.strokeStyle !== 'transparent') ctx.strokeText(l, x, y); ctx.fillText(l, x, y); });
            if ((activeTextId === t.id || draggingTextId === t.id) && !isRecordingRef.current) { const mW = fs * Math.max(...lines.map(l => l.length)); ctx.lineWidth = 2; ctx.setLineDash([8, 8]); ctx.strokeStyle = 'rgba(59, 130, 246, 0.8)'; ctx.strokeRect(x - (mW/2) - 10, sY - (fs/2) - 10, mW + 20, th + 10); ctx.setLineDash([]); }
          }
        });
      }

      if (canvasSnapGuideRef.current.x) { ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(canvas.width / 2, 0); ctx.lineTo(canvas.width / 2, canvas.height); ctx.stroke(); }
      if (canvasSnapGuideRef.current.y) { ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, canvas.height / 2); ctx.lineTo(canvas.width, canvas.height / 2); ctx.stroke(); }

      if (progressRef.current && totalDuration > 0) progressRef.current.style.left = `${(gTime / totalDuration) * 100}%`;
    };
    
    animId = requestAnimationFrame(drawFrame); 
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div className="h-[100dvh] flex flex-col bg-slate-100 antialiased font-['Zen_Maru_Gothic'] text-slate-800 leading-loose outline-none overflow-hidden selection:bg-blue-200" onDragOver={handleGlobalDragOver} onDragLeave={e => { e.preventDefault(); setIsDragging(false); }} onDrop={handleGlobalDrop} tabIndex={0}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DotGothic16&family=Hachi+Maru+Pop&family=Noto+Sans+JP:wght@700&family=Noto+Serif+JP:wght@700&family=Yusei+Magic&family=Zen+Maru+Gothic:wght@400;500;700;900&display=swap'); body { font-family: 'Zen Maru Gothic', sans-serif; overflow: hidden; margin: 0; padding: 0; } .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; } .custom-scrollbar::-webkit-scrollbar-track { background: transparent; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; } .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; } @keyframes fadeInDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } } .animate-fade-in-down { animation: fadeInDown 0.2s ease-out forwards; }`}</style>
      
      <TutorialOverlay {...tutorial} />
      <ShortcutsModal show={showShortcuts} onClose={() => setShowShortcuts(false)} />
      <ClearConfirmModal show={showClearConfirm} onConfirm={executeClearAll} onCancel={() => setShowClearConfirm(false)} />
      <AiDirectorModal isOpen={isAiModalOpen} onClose={() => setIsAiModalOpen(false)} videos={videos} applyAiRecipe={applyAiRecipe} />

      {isDragging && (
        <div className="fixed inset-0 bg-blue-600/90 z-[400] flex flex-col items-center justify-center text-white backdrop-blur-md pointer-events-none transition-all duration-300">
          <UploadCloud className="w-24 h-24 mb-6 animate-bounce" />
          <h2 className="text-3xl md:text-5xl font-black tracking-wider drop-shadow-md"><R r="どうが">動画</R>や<R r="おんがく">音楽</R>をドロップ</h2>
        </div>
      )}

      <Header onHelpClick={tutorial.startTutorial} onShortcutsClick={() => setShowShortcuts(true)} />

      <main className="flex-grow flex flex-col lg:flex-row min-h-0 overflow-hidden">
        <section className="flex-none h-[45dvh] lg:h-auto lg:flex-1 flex flex-col p-3 md:p-5 gap-3 border-b lg:border-b-0 lg:border-r border-slate-200/80 bg-slate-50 z-10 overflow-hidden shadow-[inset_0_0_15px_rgba(0,0,0,0.02)]">
          <PreviewArea videos={videos} playingVideoIdRef={playingVideoIdRef} isRecording={isRecording} draggingTextId={draggingTextId} canvasRef={canvasRef} videoRefs={videoRefs} imageRefs={imageRefs} bgmAudioRef={bgmAudioRef} bgmUrl={bgmUrl} handleLoadedMetadata={handleLoadedMetadata} handleBgmLoaded={handleBgmLoaded} handleCanvasPointerDown={handleCanvasPointerDown} setReconnectTargetId={setReconnectTargetId} reconnectInputRef={reconnectInputRef} isTimelineExpanded={isTimelineExpanded} showSafeArea={showSafeArea} />
          <PlaybackBar isPlaying={isPlaying} isRecording={isRecording} togglePlay={togglePlay} seekToGlobalTime={seekToGlobalTime} displayTime={displayTime} totalDuration={totalDuration} canUndo={canUndo} canRedo={canRedo} undo={undo} redo={redo} videos={videos} showSafeArea={showSafeArea} setShowSafeArea={setShowSafeArea} />
          <TimelineArea isTimelineExpanded={isTimelineExpanded} setIsTimelineExpanded={setIsTimelineExpanded} zoomLevel={zoomLevel} setZoomLevel={setZoomLevel} timelineRef={timelineRef} progressRef={progressRef} totalDuration={totalDuration} videos={videos} textList={textList} handleMouseDownTimeline={handleMouseDownTimeline} snapGuide={snapGuide} seekToGlobalTime={seekToGlobalTime} setIsPlaying={setIsPlaying} setActiveTextId={setActiveTextId} />
        </section>

        <aside className="flex-grow lg:flex-none lg:w-[440px] xl:w-[500px] p-4 md:p-6 overflow-y-auto custom-scrollbar bg-white flex flex-col gap-6 border-l border-slate-200">
          <button id="tutorial-ai" onClick={() => setIsAiModalOpen(true)} className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white font-black rounded-2xl py-4 px-6 flex items-center justify-between shadow-lg hover:shadow-xl transition-all active:scale-95 outline-none focus-visible:ring-4 ring-blue-300 shrink-0">
            <div className="flex items-center gap-3"><Bot className="w-6 h-6 animate-bounce text-blue-200" /><span className="text-lg md:text-xl tracking-wider">AIディレクター</span></div>
            <Sparkles className="w-5 h-5 opacity-90 animate-pulse text-indigo-200" />
          </button>

          <div id="tutorial-step1" className="bg-white rounded-3xl shadow-sm p-5 md:p-6 border border-slate-200 hover:border-slate-300 transition-colors shrink-0">
            <h2 className="text-lg font-black text-slate-800 flex items-center gap-2.5 mb-4"><span className="bg-slate-800 text-white w-6 h-6 rounded-md flex items-center justify-center text-xs shadow-sm">1</span>メディア</h2>
            <input type="file" accept="video/mp4,video/webm,video/ogg,image/png,image/jpeg,image/webp" onChange={(e) => { processFiles(e.target.files); e.target.value = ''; }} ref={fileInputRef} className="hidden" multiple />
            <input type="file" accept="video/mp4,video/webm,video/ogg,image/png,image/jpeg,image/webp" onChange={handleReconnectSelect} ref={reconnectInputRef} className="hidden" />
            <div className="flex gap-2.5 mb-4">
              <button onClick={() => fileInputRef.current?.click()} disabled={isRecording} className="flex-1 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center gap-2 text-slate-600 hover:bg-white hover:text-blue-600 hover:border-blue-300 hover:shadow-md transition-all active:scale-95 py-2.5"><ImageIcon className="w-4 h-4" /><span className="text-xs font-bold"><R r="どうが">動画</R> / <R r="がぞう">画像</R></span></button>
              <button onClick={addBlankPage} disabled={isRecording} className="flex-1 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center gap-2 text-slate-600 hover:bg-white hover:text-blue-600 hover:border-blue-300 hover:shadow-md transition-all active:scale-95 py-2.5"><SquareMenu className="w-4 h-4" /><span className="text-xs font-bold"><R r="くうはく">空白</R>ページ</span></button>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar px-1 touch-pan-x">
              {(videos || []).map((v, i) => (
                v.needsReconnect ? (
                  <div key={v.id} 
                       draggable={!isRecording}
                       onDragStart={(e) => { setDraggedMediaId(v.id); e.dataTransfer.effectAllowed = 'move'; }}
                       onDragOver={(e) => { e.preventDefault(); setDragOverMediaId(v.id); }}
                       onDragLeave={() => setDragOverMediaId(null)}
                       onDrop={(e) => { e.preventDefault(); e.stopPropagation(); handleMediaDrop(v.id); }}
                       onDragEnd={() => { setDraggedMediaId(null); setDragOverMediaId(null); }}
                       className={`group flex-shrink-0 w-28 h-16 bg-slate-50 rounded-xl relative cursor-grab active:cursor-grabbing border-2 border-dashed flex flex-col items-center justify-center p-1 transition-all ${activeVideoId === v.id ? 'border-slate-800 shadow-md' : 'border-slate-300'} ${dragOverMediaId === v.id ? 'border-blue-500 bg-blue-50 scale-105' : ''} ${draggedMediaId === v.id ? 'opacity-40' : ''}`} onClick={() => { setActiveVideoId(v.id); setPlayingVideoId(v.id); setIsPlaying(false); }}>
                    <div className="text-slate-400 mb-0.5"><AlertTriangle className="w-4 h-4" /></div><div className="text-[9px] font-bold text-slate-500 text-center truncate w-full px-1">{v.name}</div>
                    <button onClick={(e) => { e.stopPropagation(); setReconnectTargetId(v.id); setTimeout(() => reconnectInputRef.current?.click(), 0); }} className="absolute inset-0 w-full h-full bg-slate-800/90 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-xl z-10 backdrop-blur-sm"><span className="bg-white text-slate-800 text-[10px] px-3 py-1.5 rounded-lg shadow font-bold"><R r="さいせんたく">再選択</R></span></button>
                    <button onClick={(e) => { e.stopPropagation(); removeVideo(v.id); }} className={`absolute -top-2.5 -right-2.5 bg-white text-slate-400 hover:text-red-500 border border-slate-200 rounded-full p-1.5 shadow-sm z-20 transition-colors ${activeVideoId === v.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}><Trash2 className="w-3.5 h-3.5"/></button>
                  </div>
                ) : (
                  <div key={v.id} 
                       draggable={!isRecording}
                       onDragStart={(e) => { setDraggedMediaId(v.id); e.dataTransfer.effectAllowed = 'move'; }}
                       onDragOver={(e) => { e.preventDefault(); setDragOverMediaId(v.id); }}
                       onDragLeave={() => setDragOverMediaId(null)}
                       onDrop={(e) => { e.preventDefault(); e.stopPropagation(); handleMediaDrop(v.id); }}
                       onDragEnd={() => { setDraggedMediaId(null); setDragOverMediaId(null); }}
                       className={`group flex-shrink-0 w-28 h-16 rounded-xl relative cursor-grab active:cursor-grabbing border-2 transition-all overflow-hidden ${activeVideoId === v.id ? 'border-blue-500 shadow-lg ring-4 ring-blue-100' : 'border-transparent shadow-sm'} ${v.type !== 'blank' ? 'bg-slate-800' : ''} ${dragOverMediaId === v.id ? 'ring-4 ring-blue-400 opacity-80 scale-105' : ''} ${draggedMediaId === v.id ? 'opacity-40' : ''}`} style={{ backgroundColor: v.type === 'blank' ? (v.bgColor || '#000000') : undefined }} onClick={() => { setActiveVideoId(v.id); setPlayingVideoId(v.id); if (v.type === 'video' && videoRefs.current[v.id]) videoRefs.current[v.id].currentTime = v.trimStart; setIsPlaying(false); }}>
                    {v.type === 'video' && v.url && <video src={v.url} className="w-full h-full object-cover" />}
                    {v.type === 'image' && v.url && <img src={v.url} className="w-full h-full object-cover" alt="thumb" />}
                    <div className="absolute top-1.5 left-1.5 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm">{v.type === 'video' ? <Film className="w-3 h-3"/> : v.type === 'image' ? <ImageIcon className="w-3 h-3"/> : <SquareMenu className="w-3 h-3"/>}{i + 1}</div>
                    <button onClick={(e) => { e.stopPropagation(); removeVideo(v.id); }} className={`absolute -top-2.5 -right-2.5 bg-white text-slate-400 hover:text-red-500 border border-slate-200 rounded-full p-1.5 shadow-sm z-20 transition-colors ${activeVideoId === v.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}><Trash2 className="w-3.5 h-3.5"/></button>
                  </div>
                )
              ))}
            </div>
            
            {activeVideoId && videos && videos.find(v => v.id === activeVideoId) && (() => {
              const aV = videos.find(v => v.id === activeVideoId); const sIdx = videos.findIndex(v => v.id === activeVideoId) + 1;
              return (
                <div className="bg-slate-50 rounded-2xl p-4 md:p-5 border border-slate-200 shadow-inner mt-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-slate-700 font-black text-sm"><Scissors className="w-4 h-4 text-slate-500"/> シーン {sIdx} の<R r="せってい">設定</R></div>
                    <button onClick={() => removeVideo(aV.id)} className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 bg-white border border-slate-200 hover:border-red-200 hover:text-red-500 hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition-all shadow-sm active:scale-95"><Trash2 className="w-3.5 h-3.5" /><span><R r="さくじょ">削除</R></span></button>
                  </div>
                  <div className="flex flex-col gap-5">
                    {aV.type === 'video' ? (
                      <div>
                        <div className="flex justify-between text-xs font-bold text-slate-500 mb-2"><span>クリップ<R r="ちょうせい">調整</R></span><span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{formatTime(aV.trimEnd - aV.trimStart)}</span></div>
                        <div className="flex flex-col gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                          <div><div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1.5"><span><R r="かいし">開始</R></span><span className="font-mono">{formatTime(aV.trimStart)}</span></div><input type="range" min="0" max={aV.duration} step="0.1" value={aV.trimStart} onChange={(e) => updateVideo(aV.id, 'trimStart', Math.min(parseFloat(e.target.value), aV.trimEnd - 0.5))} className="w-full accent-blue-500 h-1.5 bg-slate-100 rounded-full appearance-none cursor-pointer" /></div>
                          <div><div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1.5"><span><R r="しゅうりょう">終了</R></span><span className="font-mono">{formatTime(aV.trimEnd)}</span></div><input type="range" min="0" max={aV.duration} step="0.1" value={aV.trimEnd} onChange={(e) => updateVideo(aV.id, 'trimEnd', Math.max(parseFloat(e.target.value), aV.trimStart + 0.5))} className="w-full accent-blue-500 h-1.5 bg-slate-100 rounded-full appearance-none cursor-pointer" /></div>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex justify-between text-xs font-bold text-slate-500 mb-2"><span><R r="ひょうじ">表示</R><R r="じかん">時間</R></span><span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{formatTime(aV.trimEnd)}</span></div>
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm"><input type="range" min="0.5" max="30" step="0.5" value={aV.trimEnd} onChange={(e) => updateVideo(aV.id, 'trimEnd', parseFloat(e.target.value))} className="w-full accent-blue-500 h-1.5 bg-slate-100 rounded-full appearance-none cursor-pointer" /></div>
                      </div>
                    )}
                    {aV.type === 'blank' && (
                      <div><h3 className="text-xs font-bold text-slate-500 mb-2 flex items-center gap-1.5"><PaintBucket className="w-3.5 h-3.5"/> <R r="はいけいいろ">背景色</R></h3><div className="flex gap-2">{BG_COLORS.map(c => (<button key={c.value} onClick={() => updateVideo(aV.id, 'bgColor', c.value)} className={`w-7 h-7 rounded-lg border shadow-sm transition-all active:scale-95 ${aV.bgColor === c.value ? 'border-blue-500 scale-110 ring-2 ring-blue-200' : 'border-slate-300'}`} style={{ backgroundColor: c.value }} />))}</div></div>
                    )}
                    {aV.type !== 'blank' && (
                      <div><h3 className="text-xs font-bold text-slate-500 mb-2 flex items-center gap-1.5"><Wand2 className="w-3.5 h-3.5"/> <R r="えいぞう">映像</R>フィルター</h3><div className="grid grid-cols-5 gap-2">{FILTERS.map(f => (<button key={f.value} onClick={() => updateVideo(aV.id, 'filterType', f.value)} className={`py-2 px-1 text-[10px] font-bold rounded-lg border transition-all active:scale-95 ${aV.filterType === f.value ? 'bg-white border-blue-500 text-blue-700 shadow-md' : 'bg-white border-slate-200 text-slate-500 shadow-sm hover:border-slate-300'}`}>{f.name}</button>))}</div></div>
                    )}
                    <div>
                      <h3 className="text-xs font-bold text-slate-500 mb-2 flex items-center gap-1.5"><Zap className="w-3.5 h-3.5"/>{sIdx === 1 ? <><R r="かいし">開始</R></> : <><R r="き">切</R>り<R r="か">替</R>え</>}エフェクト</h3>
                      <div className="flex gap-2">
                        <button onClick={() => updateVideo(aV.id, 'transitionType', 'none')} className={`flex-1 py-2 text-[10px] font-bold rounded-lg border flex flex-col items-center gap-1 transition-all active:scale-95 ${aV.transitionType === 'none' ? 'bg-white border-blue-500 text-blue-700 shadow-md' : 'bg-white border-slate-200 text-slate-500 shadow-sm hover:border-slate-300'}`}><Zap className="w-3.5 h-3.5"/><R r="なし">なし</R></button>
                        <button onClick={() => updateVideo(aV.id, 'transitionType', 'fade')} className={`flex-1 py-2 text-[10px] font-bold rounded-lg border flex flex-col items-center gap-1 transition-all active:scale-95 ${aV.transitionType === 'fade' ? 'bg-white border-blue-500 text-blue-700 shadow-md' : 'bg-white border-slate-200 text-slate-500 shadow-sm hover:border-slate-300'}`}><Blend className="w-3.5 h-3.5"/>フェード</button>
                        {sIdx > 1 && (
                          <>
                            <button onClick={() => updateVideo(aV.id, 'transitionType', 'wipe')} className={`flex-1 py-2 text-[10px] font-bold rounded-lg border flex flex-col items-center gap-1 transition-all active:scale-95 ${aV.transitionType === 'wipe' ? 'bg-white border-blue-500 text-blue-700 shadow-md' : 'bg-white border-slate-200 text-slate-500 shadow-sm hover:border-slate-300'}`}><PanelRightClose className="w-3.5 h-3.5"/>ワイプ</button>
                            <button onClick={() => updateVideo(aV.id, 'transitionType', 'slide')} className={`flex-1 py-2 text-[10px] font-bold rounded-lg border flex flex-col items-center gap-1 transition-all active:scale-95 ${aV.transitionType === 'slide' ? 'bg-white border-blue-500 text-blue-700 shadow-md' : 'bg-white border-slate-200 text-slate-500 shadow-sm hover:border-slate-300'}`}><MoveRight className="w-3.5 h-3.5"/>スライド</button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          <div id="tutorial-step2-3" className="flex flex-col gap-6 shrink-0">
            <div className="bg-white rounded-3xl shadow-sm p-5 md:p-6 border border-slate-200 hover:border-slate-300 transition-colors">
              <h2 className="text-lg font-black text-slate-800 flex items-center gap-2.5 mb-4"><span className="bg-slate-800 text-white w-6 h-6 rounded-md flex items-center justify-center text-xs shadow-sm">2</span><R r="おんがく">音楽</R> (BGM)</h2>
              <input type="file" accept="audio/*" onChange={(e) => { processFiles(e.target.files); e.target.value = ''; }} ref={bgmInputRef} className="hidden" />
              {!bgmFile ? (
                <button onClick={() => bgmInputRef.current?.click()} disabled={isRecording} className="w-full bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl flex items-center justify-center gap-2 text-slate-500 hover:bg-white hover:text-blue-600 hover:border-blue-300 py-5 shadow-sm transition-all active:scale-95 font-bold"><Music className="w-5 h-5" /><span>ファイルを<R r="せんたく">選択</R></span></button>
              ) : (
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 relative shadow-sm">
                  <button onClick={removeBgm} className="absolute -top-2.5 -right-2.5 bg-white text-slate-400 hover:text-red-500 rounded-full p-1.5 shadow-md border border-slate-200 transition-colors"><X className="w-4 h-4" /></button>
                  <div className="flex items-center gap-2 mb-3 truncate text-sm font-bold text-blue-900"><Music className="w-4 h-4 text-blue-600 shrink-0"/> {bgmFile.name}</div>
                  <div className="flex items-center gap-3 bg-white p-3 rounded-xl shadow-sm border border-blue-100">
                    <Volume2 className="w-5 h-5 text-blue-400 shrink-0" />
                    <input type="range" min="0" max="100" value={bgmVolume} onChange={(e) => setBgmVolume(parseInt(e.target.value))} className="w-full accent-blue-500 h-2 bg-slate-100 rounded-full appearance-none cursor-pointer" />
                    <span className="text-xs font-black text-blue-600 w-8 text-right">{bgmVolume}%</span>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white rounded-3xl shadow-sm p-5 md:p-6 border border-slate-200 hover:border-slate-300 transition-colors">
              <h2 className="text-lg font-black text-slate-800 flex items-center gap-2.5 mb-4"><span className="bg-slate-800 text-white w-6 h-6 rounded-md flex items-center justify-center text-xs shadow-sm">3</span>テロップ</h2>
              <div className="space-y-4" onClick={(e) => { if(e.target === e.currentTarget) setActiveTextId(null); }}>
                {textList && textList.map((t, i) => (
                  <div id={`text-card-${t.id}`} key={t.id} className={`bg-slate-50 rounded-2xl p-4 md:p-5 relative transition-all cursor-default ${activeTextId === t.id ? 'border-2 border-blue-400 ring-4 ring-blue-50 shadow-md transform scale-[1.02]' : 'border border-slate-200 shadow-sm'}`} onClick={() => setActiveTextId(t.id)}>
                    {textList.length > 1 && <button onClick={(e) => { e.stopPropagation(); updateTextListAndHistory(p=>p.filter(x=>x.id!==t.id)); }} className="absolute -top-3 -right-3 bg-white text-slate-400 hover:text-red-500 rounded-full p-2 shadow-md border border-slate-200 z-10 transition-colors"><Trash2 className="w-4 h-4" /></button>}
                    <div className="mb-4">
                      <label className="block text-[11px] font-black text-slate-500 mb-1.5 flex items-center gap-1.5"><Type className={`w-3.5 h-3.5 ${activeTextId === t.id ? 'text-blue-600' : 'text-slate-400'}`} /> No. {i + 1}</label>
                      <textarea value={t.text} onChange={(e) => updateText(t.id, 'text', e.target.value)} placeholder="テキストを入力(にゅうりょく)（Enterで改行(かいぎょう)）" className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-blue-500 text-sm font-bold bg-white shadow-inner resize-none transition-colors" rows={2} style={{ fontFamily: t.font || 'Zen Maru Gothic' }} />
                    </div>
                    <div className="flex flex-col gap-4 pt-4 border-t border-slate-200/60">
                      <div className="flex justify-between items-center"><span className="text-[10px] font-bold text-slate-500"><R r="もじいろ">文字色</R></span><div className="flex gap-2">{COLORS.map(c => <button key={c.value} onClick={(e) => { e.stopPropagation(); updateText(t.id, 'color', c.value); }} className={`w-5 h-5 rounded-full border shadow-sm transition-all ${t.color === c.value ? 'border-blue-500 scale-125 ring-2 ring-blue-100' : 'border-slate-300 hover:scale-110'}`} style={{ backgroundColor: c.value }} />)}</div></div>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-500"><R r="ふちど">縁取</R>り</span>
                        <div className="flex gap-2">
                          {OUTLINE_COLORS.map(c => {
                            const isSel = t.outlineColor === c.value || (t.outlineColor === undefined && c.value === (t.color === '#ffffff' ? '#1e293b' : '#ffffff'));
                            return (
                              <button key={c.value} onClick={(e) => { e.stopPropagation(); updateText(t.id, 'outlineColor', c.value); }} className={`w-5 h-5 rounded-full border shadow-sm relative overflow-hidden transition-all ${isSel ? 'border-blue-500 scale-125 ring-2 ring-blue-100' : 'border-slate-300 hover:scale-110'}`} style={{ backgroundColor: c.value === 'transparent' ? '#f8fafc' : c.value }}>
                                {c.value === 'transparent' && <div className="absolute w-full h-[2px] bg-red-500 -rotate-45"></div>}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      <div className="flex gap-4 items-center bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex-1"><span className="block text-[9px] font-bold text-slate-400 mb-1">フォント</span><select value={t.font || 'Zen Maru Gothic'} onChange={(e) => updateText(t.id, 'font', e.target.value)} className="w-full border-none bg-slate-50 rounded-lg p-1.5 text-xs font-bold focus:ring-2 focus:ring-blue-100 cursor-pointer text-slate-700" style={{ fontFamily: t.font || 'Zen Maru Gothic' }}>{FONTS.map(f => <option key={f.value} value={f.value}>{f.name}</option>)}</select></div>
                        <div className="w-px h-8 bg-slate-200"></div>
                        <div className="flex-1"><span className="block text-[9px] font-bold text-slate-400 mb-1">サイズ</span><input type="range" min="50" max="200" step="10" value={t.scale} onChange={(e) => updateText(t.id, 'scale', parseInt(e.target.value))} className="w-full accent-blue-500 h-1.5 bg-slate-200 rounded-full appearance-none mt-1 cursor-pointer" /></div>
                      </div>
                      {activeTextId === t.id && <div className="text-[10px] text-blue-600 font-bold bg-blue-50 border border-blue-100 p-2 rounded-lg flex items-center justify-center gap-1.5 mt-1 animate-fade-in-down"><ImageIcon className="w-3.5 h-3.5"/> プレビュー<R r="がめん">画面</R>の<R r="もじ">文字</R>を<R r="ちょくせつ">直接</R>ドラッグできます</div>}
                    </div>
                  </div>
                ))}
                <button onClick={addText} className="w-full bg-slate-50 hover:bg-blue-50 text-blue-600 font-black border-2 border-dashed border-slate-300 hover:border-blue-300 rounded-2xl py-4 flex items-center justify-center gap-2 transition-all active:scale-95 text-sm shadow-sm"><Plus className="w-5 h-5" /><span>テロップを<R r="ついか">追加</R></span></button>
              </div>
            </div>
          </div>

          <div id="tutorial-step4" className="bg-slate-900 rounded-3xl shadow-xl p-5 md:p-6 border border-slate-800 mt-2 mb-8 text-white relative overflow-hidden shrink-0">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 rounded-full filter blur-[60px] opacity-20 pointer-events-none"></div>
            <h2 className="text-lg font-black flex items-center gap-2.5 mb-5 relative z-10"><span className="bg-white text-slate-900 w-6 h-6 rounded-md flex items-center justify-center text-xs shadow-sm">{videos && videos.length > 0 ? '4' : '3'}</span>エクスポート</h2>
            
            {!isRecording && !downloadUrl && (
              <div className="relative z-10">
                <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-3.5 mb-4 flex items-start gap-2.5"><Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" /><p className="text-xs text-slate-300 font-medium leading-loose"><R r="しょり">処理</R>には<R r="どうが">動画</R>の<R r="なが">長</R>さ（<span translate="no" className="font-mono text-white font-bold">{formatTime(totalDuration)}</span>）と<R r="どうとう">同等</R>の<R r="じかん">時間</R>がかかります。※<R r="こうがしつ">高画質</R>(8Mbps)で<R r="しゅつりょく">出力</R>します。</p></div>
                <button onClick={startRecording} disabled={!videos || videos.length === 0 || videos.some(v => v.needsReconnect)} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl py-4 px-6 flex items-center justify-center gap-2.5 shadow-lg transition-all disabled:opacity-50 disabled:bg-slate-700 text-sm md:text-base active:scale-95"><HardDriveDownload className="w-5 h-5" /><span><R r="どうが">動画</R>を<R r="ほぞん">保存</R>する</span></button>
              </div>
            )}
            
            {isRecording && (
              <div className="flex flex-col gap-5 relative z-10">
                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 shadow-inner">
                  <div className="flex justify-between items-end mb-3"><span className="text-sm font-black text-blue-400 flex items-center gap-2"><Save className="w-4 h-4 animate-bounce"/> エンコード<R r="ちゅう">中</R>...</span><span className="text-xl font-black text-white font-mono tracking-tighter" translate="no">{recordingProgress}%</span></div>
                  <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden shadow-inner"><div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300 ease-out" style={{ width: `${recordingProgress}%` }}></div></div>
                  <p className="text-[10px] text-slate-400 mt-3 text-center font-bold"><R r="かんりょう">完了</R>するまでブラウザを<R r="と">閉</R>じないでください</p>
                </div>
                <button onClick={stopRecording} className="w-full bg-transparent border border-slate-700 text-slate-300 hover:bg-slate-800 font-bold rounded-xl py-3 shadow-sm text-xs transition-colors"><R r="しょり">処理</R>を<R r="ちゅうだん">中断</R></button>
              </div>
            )}
            
            {!isRecording && downloadUrl === 'direct_saved' && (
              <div className="flex flex-col gap-4 animate-fade-in relative z-10">
                <div className="bg-emerald-900/50 text-emerald-400 border border-emerald-800 rounded-2xl p-5 text-sm font-black text-center flex flex-col items-center justify-center gap-2 shadow-inner"><Sparkles className="w-6 h-6 text-emerald-500" />パソコンへの<R r="ほぞん">保存</R>が<R r="かんりょう">完了</R>しました！</div>
                <button onClick={() => setDownloadUrl(null)} className="w-full bg-slate-800 border border-slate-700 text-white font-bold rounded-xl py-3.5 shadow-sm text-sm hover:bg-slate-700 transition-colors"><R r="へんしゅう">編集</R>に<R r="もど">戻</R>る</button>
              </div>
            )}
            
            {!isRecording && downloadUrl && downloadUrl !== 'direct_saved' && (
              <div className="flex flex-col gap-4 animate-fade-in relative z-10">
                <div className="bg-emerald-900/50 text-emerald-400 border border-emerald-800 rounded-2xl p-4 text-sm font-black text-center flex flex-col items-center justify-center gap-2 shadow-inner"><Sparkles className="w-6 h-6 text-emerald-500" /><R r="しょり">処理</R>が<R r="かんりょう">完了</R>しました！</div>
                <a href={downloadUrl} download={`映像制作スタジオ_${new Date().getTime()}.webm`} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl py-4 flex items-center justify-center gap-2.5 shadow-lg text-sm transition-all active:scale-95"><Download className="w-5 h-5" /><span><R r="たんまつ">端末</R>にダウンロード</span></a>
                <button onClick={() => setDownloadUrl(null)} className="w-full bg-slate-800 border border-slate-700 text-white font-bold rounded-xl py-3 shadow-sm text-sm hover:bg-slate-700 transition-colors"><R r="へんしゅう">編集</R>に<R r="もど">戻</R>る</button>
              </div>
            )}
            
            <div className="mt-6 pt-4 border-t border-slate-800 relative z-10">
              <button onClick={() => setShowClearConfirm(true)} className="w-full py-3 bg-transparent hover:bg-slate-800 text-slate-400 rounded-xl font-bold text-xs border border-slate-800 flex items-center justify-center gap-2 transition-colors"><Trash2 size={14} /> <span>プロジェクトを<R r="しょきか">初期化</R></span></button>
            </div>
          </div>
          
          <div className="mt-auto pt-2 pb-4 text-center text-[10px] text-slate-400 font-medium shrink-0"><p>© 2026 <R r="えいぞう">映像</R><R r="せいさく">制作</R>スタジオ <a href="https://note.com/cute_borage86" target="_blank" rel="noopener noreferrer" className="hover:text-slate-500 font-bold">GIGA<R r="やま">山</R></a></p></div>
        </aside>
      </main>
    </div>
  );
};

export default function App() {
  return <ToastProvider><AppContent /></ToastProvider>;
}
