import React, { useState, useMemo, useEffect } from 'react';
import { 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PieChart, 
  Plus, 
  Trash2, 
  X, 
  ChevronLeft, 
  ChevronRight,
  ChevronDown, 
  Save,
  Settings,
  Edit2,
  ArrowLeft,
  BarChart3,
  Target,
  Download,
  Activity,
  MousePointerClick,
  Image as ImageIcon, 
  UploadCloud,
  Upload,
  Palette,
  MessageSquare,
  List,
  ExternalLink,
  Sparkles,
  AlertTriangle,
  Play,
  Pause,
  Clock,
  Zap
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { 
  saveJournalData, 
  loadJournalData, 
  clearJournalData, 
  downloadJournalData, 
  importJournalDataFromFile 
} from './utils/storage';

// --- DEFINICIÓN DE TEMAS ---
const THEMES = {
  // Dark Themes
  slate_blue: {
    id: 'slate_blue',
    name: 'Pro Blue',
    type: 'dark',
    colors: {
      bgMain: 'bg-slate-950',
      bgSec: 'bg-slate-900',
      bgCard: 'bg-slate-800',
      bgCard50: 'bg-slate-800/50',
      bgInput: 'bg-slate-900',
      bgHover: 'hover:bg-slate-700',
      border: 'border-slate-700',
      borderSec: 'border-slate-800',
      textMain: 'text-slate-200',
      textSec: 'text-slate-400',
      textMuted: 'text-slate-500',
      accentBg: 'bg-blue-600',
      accentHover: 'hover:bg-blue-500',
      accentText: 'text-blue-500',
      accentRing: 'ring-blue-500',
      accentBorder: 'border-blue-500',
      selection: 'selection:bg-blue-500/30'
    }
  },
  zinc_violet: {
    id: 'zinc_violet',
    name: 'Cyber Violet',
    type: 'dark',
    colors: {
      bgMain: 'bg-zinc-950',
      bgSec: 'bg-zinc-900',
      bgCard: 'bg-zinc-800',
      bgCard50: 'bg-zinc-800/50',
      bgInput: 'bg-zinc-900',
      bgHover: 'hover:bg-zinc-700',
      border: 'border-zinc-700',
      borderSec: 'border-zinc-800',
      textMain: 'text-zinc-200',
      textSec: 'text-zinc-400',
      textMuted: 'text-zinc-500',
      accentBg: 'bg-violet-600',
      accentHover: 'hover:bg-violet-500',
      accentText: 'text-violet-500',
      accentRing: 'ring-violet-500',
      accentBorder: 'border-violet-500',
      selection: 'selection:bg-violet-500/30'
    }
  },
  neutral_emerald: {
    id: 'neutral_emerald',
    name: 'Zen Emerald',
    type: 'dark',
    colors: {
      bgMain: 'bg-neutral-950',
      bgSec: 'bg-neutral-900',
      bgCard: 'bg-neutral-800',
      bgCard50: 'bg-neutral-800/50',
      bgInput: 'bg-neutral-900',
      bgHover: 'hover:bg-neutral-700',
      border: 'border-neutral-700',
      borderSec: 'border-neutral-800',
      textMain: 'text-neutral-200',
      textSec: 'text-neutral-400',
      textMuted: 'text-neutral-500',
      accentBg: 'bg-emerald-600',
      accentHover: 'hover:bg-emerald-500',
      accentText: 'text-emerald-500',
      accentRing: 'ring-emerald-500',
      accentBorder: 'border-emerald-500',
      selection: 'selection:bg-emerald-500/30'
    }
  },
  stone_orange: {
    id: 'stone_orange',
    name: 'Sunset Stone',
    type: 'dark',
    colors: {
      bgMain: 'bg-stone-950',
      bgSec: 'bg-stone-900',
      bgCard: 'bg-stone-800',
      bgCard50: 'bg-stone-800/50',
      bgInput: 'bg-stone-900',
      bgHover: 'hover:bg-stone-700',
      border: 'border-stone-700',
      borderSec: 'border-stone-800',
      textMain: 'text-stone-200',
      textSec: 'text-stone-400',
      textMuted: 'text-stone-500',
      accentBg: 'bg-orange-600',
      accentHover: 'hover:bg-orange-500',
      accentText: 'text-orange-500',
      accentRing: 'ring-orange-500',
      accentBorder: 'border-orange-500',
      selection: 'selection:bg-orange-500/30'
    }
  },
  gray_cyan: {
    id: 'gray_cyan',
    name: 'Ocean Cyan',
    type: 'dark',
    colors: {
      bgMain: 'bg-gray-950',
      bgSec: 'bg-gray-900',
      bgCard: 'bg-gray-800',
      bgCard50: 'bg-gray-800/50',
      bgInput: 'bg-gray-900',
      bgHover: 'hover:bg-gray-700',
      border: 'border-gray-700',
      borderSec: 'border-gray-800',
      textMain: 'text-gray-200',
      textSec: 'text-gray-400',
      textMuted: 'text-gray-500',
      accentBg: 'bg-cyan-600',
      accentHover: 'hover:bg-cyan-500',
      accentText: 'text-cyan-500',
      accentRing: 'ring-cyan-500',
      accentBorder: 'border-cyan-500',
      selection: 'selection:bg-cyan-500/30'
    }
  },
  slate_pink: {
    id: 'slate_pink',
    name: 'Neon Pink',
    type: 'dark',
    colors: {
      bgMain: 'bg-slate-950',
      bgSec: 'bg-slate-900',
      bgCard: 'bg-slate-800',
      bgCard50: 'bg-slate-800/50',
      bgInput: 'bg-slate-900',
      bgHover: 'hover:bg-slate-700',
      border: 'border-slate-700',
      borderSec: 'border-slate-800',
      textMain: 'text-slate-200',
      textSec: 'text-slate-400',
      textMuted: 'text-slate-500',
      accentBg: 'bg-pink-600',
      accentHover: 'hover:bg-pink-500',
      accentText: 'text-pink-500',
      accentRing: 'ring-pink-500',
      accentBorder: 'border-pink-500',
      selection: 'selection:bg-pink-500/30'
    }
  },
  zinc_amber: {
    id: 'zinc_amber',
    name: 'Golden Amber',
    type: 'dark',
    colors: {
      bgMain: 'bg-zinc-950',
      bgSec: 'bg-zinc-900',
      bgCard: 'bg-zinc-800',
      bgCard50: 'bg-zinc-800/50',
      bgInput: 'bg-zinc-900',
      bgHover: 'hover:bg-zinc-700',
      border: 'border-zinc-700',
      borderSec: 'border-zinc-800',
      textMain: 'text-zinc-200',
      textSec: 'text-zinc-400',
      textMuted: 'text-zinc-500',
      accentBg: 'bg-amber-600',
      accentHover: 'hover:bg-amber-500',
      accentText: 'text-amber-500',
      accentRing: 'ring-amber-500',
      accentBorder: 'border-amber-500',
      selection: 'selection:bg-amber-500/30'
    }
  },
  neutral_teal: {
    id: 'neutral_teal',
    name: 'Aqua Teal',
    type: 'dark',
    colors: {
      bgMain: 'bg-neutral-950',
      bgSec: 'bg-neutral-900',
      bgCard: 'bg-neutral-800',
      bgCard50: 'bg-neutral-800/50',
      bgInput: 'bg-neutral-900',
      bgHover: 'hover:bg-neutral-700',
      border: 'border-neutral-700',
      borderSec: 'border-neutral-800',
      textMain: 'text-neutral-200',
      textSec: 'text-neutral-400',
      textMuted: 'text-neutral-500',
      accentBg: 'bg-teal-600',
      accentHover: 'hover:bg-teal-500',
      accentText: 'text-teal-500',
      accentRing: 'ring-teal-500',
      accentBorder: 'border-teal-500',
      selection: 'selection:bg-teal-500/30'
    }
  },
  // Light/Clear Themes
  light_blue: {
    id: 'light_blue',
    name: 'Sky Blue',
    type: 'light',
    colors: {
      bgMain: 'bg-slate-50',
      bgSec: 'bg-white',
      bgCard: 'bg-slate-100',
      bgCard50: 'bg-slate-100/50',
      bgInput: 'bg-white',
      bgHover: 'hover:bg-slate-200',
      border: 'border-slate-300',
      borderSec: 'border-slate-200',
      textMain: 'text-slate-900',
      textSec: 'text-slate-700',
      textMuted: 'text-slate-500',
      accentBg: 'bg-blue-600',
      accentHover: 'hover:bg-blue-500',
      accentText: 'text-blue-600',
      accentRing: 'ring-blue-500',
      accentBorder: 'border-blue-500',
      selection: 'selection:bg-blue-500/30'
    }
  },
  light_violet: {
    id: 'light_violet',
    name: 'Lavender',
    type: 'light',
    colors: {
      bgMain: 'bg-zinc-50',
      bgSec: 'bg-white',
      bgCard: 'bg-zinc-100',
      bgCard50: 'bg-zinc-100/50',
      bgInput: 'bg-white',
      bgHover: 'hover:bg-zinc-200',
      border: 'border-zinc-300',
      borderSec: 'border-zinc-200',
      textMain: 'text-zinc-900',
      textSec: 'text-zinc-700',
      textMuted: 'text-zinc-500',
      accentBg: 'bg-violet-600',
      accentHover: 'hover:bg-violet-500',
      accentText: 'text-violet-600',
      accentRing: 'ring-violet-500',
      accentBorder: 'border-violet-500',
      selection: 'selection:bg-violet-500/30'
    }
  },
  light_emerald: {
    id: 'light_emerald',
    name: 'Mint Fresh',
    type: 'light',
    colors: {
      bgMain: 'bg-neutral-50',
      bgSec: 'bg-white',
      bgCard: 'bg-neutral-100',
      bgCard50: 'bg-neutral-100/50',
      bgInput: 'bg-white',
      bgHover: 'hover:bg-neutral-200',
      border: 'border-neutral-300',
      borderSec: 'border-neutral-200',
      textMain: 'text-neutral-900',
      textSec: 'text-neutral-700',
      textMuted: 'text-neutral-500',
      accentBg: 'bg-emerald-600',
      accentHover: 'hover:bg-emerald-500',
      accentText: 'text-emerald-600',
      accentRing: 'ring-emerald-500',
      accentBorder: 'border-emerald-500',
      selection: 'selection:bg-emerald-500/30'
    }
  },
  light_orange: {
    id: 'light_orange',
    name: 'Peach',
    type: 'light',
    colors: {
      bgMain: 'bg-stone-50',
      bgSec: 'bg-white',
      bgCard: 'bg-stone-100',
      bgCard50: 'bg-stone-100/50',
      bgInput: 'bg-white',
      bgHover: 'hover:bg-stone-200',
      border: 'border-stone-300',
      borderSec: 'border-stone-200',
      textMain: 'text-stone-900',
      textSec: 'text-stone-700',
      textMuted: 'text-stone-500',
      accentBg: 'bg-orange-600',
      accentHover: 'hover:bg-orange-500',
      accentText: 'text-orange-600',
      accentRing: 'ring-orange-500',
      accentBorder: 'border-orange-500',
      selection: 'selection:bg-orange-500/30'
    }
  }
};

// --- Componentes UI Base ---
const Card = ({ children, className = "", theme }) => (
  <div className={twMerge(clsx(theme.bgCard, "rounded-xl border", theme.border, "shadow-sm overflow-hidden"), className)}>
    {children}
  </div>
);

const Button = ({ children, onClick, variant = "primary", className = "", type="button", size="md", theme }) => {
  const baseStyle = "rounded-lg font-medium transition-all flex items-center justify-center gap-2";
  const sizes = { sm: "px-2 py-1 text-xs", md: "px-4 py-2 text-sm", icon: "p-2" };
  const variants = {
    primary: clsx(theme.accentBg, theme.accentHover, "text-white shadow-lg shadow-black/20"),
    danger: "bg-rose-600 hover:bg-rose-500 text-white",
    ghost: clsx(theme.bgHover, theme.textSec),
    outline: clsx("border", theme.border, theme.textSec, theme.bgHover)
  };
  return (
    <button type={type} onClick={onClick} className={twMerge(baseStyle, sizes[size], variants[variant], className)}>
      {children}
    </button>
  );
};

const Input = ({ label, value, onChange, type = "text", placeholder, autoFocus = false, onBlur, onKeyDown, theme }) => {
  const ringClass = theme.accentRing === 'ring-blue-500' ? 'focus:ring-blue-500' :
                    theme.accentRing === 'ring-violet-500' ? 'focus:ring-violet-500' :
                    theme.accentRing === 'ring-emerald-500' ? 'focus:ring-emerald-500' :
                    'focus:ring-orange-500';
  return (
    <div className="flex flex-col gap-1 w-full">
      {label && <label className={clsx("text-xs uppercase tracking-wider", theme.textSec, "font-semibold")}>{label}</label>}
      <input 
        type={type} value={value} onChange={onChange} onBlur={onBlur} onKeyDown={onKeyDown} autoFocus={autoFocus} placeholder={placeholder}
        className={clsx(theme.bgInput, "border", theme.border, theme.textMain, "px-3 py-2 rounded-lg focus:outline-none focus:ring-2", ringClass, "transition-all placeholder:opacity-40")}
      />
    </div>
  );
};

const Select = ({ label, value, onChange, options, theme }) => {
  const ringClass = theme.accentRing === 'ring-blue-500' ? 'focus:ring-blue-500' :
                    theme.accentRing === 'ring-violet-500' ? 'focus:ring-violet-500' :
                    theme.accentRing === 'ring-emerald-500' ? 'focus:ring-emerald-500' :
                    'focus:ring-orange-500';
  return (
    <div className="flex flex-col gap-1 w-full">
      {label && <label className={clsx("text-xs uppercase tracking-wider", theme.textSec, "font-semibold")}>{label}</label>}
      <div className="relative">
        <select 
          value={value} onChange={onChange}
          className={clsx(theme.bgInput, "border", theme.border, theme.textMain, "px-3 py-2 rounded-lg focus:outline-none focus:ring-2", ringClass, "transition-all w-full appearance-none cursor-pointer")}
        >
          <option value="" disabled>Seleccionar</option>
          {options.map(opt => <option key={opt} value={opt} className={clsx(theme.bgInput, theme.textMain)}>{opt}</option>)}
        </select>
        <div className={clsx("absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none", theme.textMuted)}>
          <ChevronDown size={14} />
        </div>
      </div>
    </div>
  );
};

// --- Componentes Gráficos ---
const DonutChart = ({ wins, losses, size = 60, theme }) => {
  const total = wins + losses;
  const winPercentage = total > 0 ? (wins / total) * 100 : 0;
  const radius = 15.9155;
  const safeWinPercentage = isNaN(winPercentage) ? 0 : winPercentage;
  
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg viewBox="0 0 40 40" className="transform -rotate-90 w-full h-full">
        <circle cx="20" cy="20" r={radius} fill="transparent" stroke="currentColor" className="text-slate-700 opacity-30" strokeWidth="5" />
        <circle cx="20" cy="20" r={radius} fill="transparent" stroke="#10B981" strokeWidth="5" strokeDasharray={`${safeWinPercentage} 100`} strokeDashoffset="0" className="transition-all duration-1000 ease-out" />
        {losses > 0 && <circle cx="20" cy="20" r={radius} fill="transparent" stroke="#F43F5E" strokeWidth="5" strokeDasharray={`${100 - safeWinPercentage} 100`} strokeDashoffset={-safeWinPercentage} className="transition-all duration-1000 ease-out" />}
      </svg>
      <div className={clsx("absolute inset-0 flex items-center justify-center text-[10px] font-bold", theme.textSec)}>
        {Math.round(safeWinPercentage)}%
      </div>
    </div>
  );
};

const HeaderMetric = ({ label, data, theme, showAsPercentage = false, accountBalance = 0 }) => {
  const isPositive = data.val >= 0;
  const percentage = accountBalance > 0 ? ((data.val / accountBalance) * 100) : 0;
  
  return (
    <div className={clsx("relative group flex flex-col items-center px-4 py-1 cursor-pointer rounded-lg", theme.bgHover, "transition-colors")}>
      <span className={clsx("text-[10px] uppercase tracking-widest", theme.textMuted, "font-bold mb-0.5")}>{label}</span>
      {showAsPercentage ? (
        <span className={clsx("text-lg font-mono font-bold", isPositive ? 'text-emerald-400' : 'text-rose-400')}>
          {isPositive ? '+' : ''}{percentage.toFixed(1)}%
        </span>
      ) : (
        <span className={clsx("text-lg font-mono font-bold", isPositive ? 'text-emerald-400' : 'text-rose-400')}>
          {isPositive ? '+' : ''}{data.val.toLocaleString()}$
        </span>
      )}
      <div className={clsx("absolute top-full left-1/2 -translate-x-1/2 mt-4 w-64", theme.bgSec, "border", theme.border, "rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[100] p-4 translate-y-2 group-hover:translate-y-0 pointer-events-none group-hover:pointer-events-auto")}>
        <div className={clsx("absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4", theme.bgSec, "border-t border-l", theme.border, "rotate-45")}></div>
        <div className="relative z-10">
          <div className={clsx("flex justify-between items-center mb-4 pb-2 border-b", theme.borderSec)}>
            <span className={clsx("text-xs font-bold", theme.textMain, "uppercase")}>{label} Performance</span>
            <span className={clsx("text-xs", theme.bgCard, "px-2 py-1 rounded", theme.textSec)}>{data.count} Trades</span>
          </div>
          <div className="flex items-center gap-6 justify-center">
             <div className="flex-shrink-0"><DonutChart wins={data.wins} losses={data.losses} size={70} theme={theme} /></div>
             <div className="flex flex-col gap-2 text-xs w-full">
                <div className="flex items-center justify-between"><div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500"></div><span className={theme.textSec}>Wins</span></div><span className="text-emerald-400 font-bold">{data.wins}</span></div>
                <div className="flex items-center justify-between"><div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-rose-500"></div><span className={theme.textSec}>Losses</span></div><span className="text-rose-400 font-bold">{data.losses}</span></div>
                <div className="flex items-center justify-between"><div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-yellow-500"></div><span className={theme.textSec}>Break Even</span></div><span className="text-yellow-400 font-bold">{data.breakEven || 0}</span></div>
             </div>
          </div>
          <div className={clsx("mt-4 pt-3 border-t", theme.borderSec, "flex justify-between items-center")}>
             <span className={clsx("text-xs", theme.textMuted)}>Profit Factor</span>
             <span className={clsx("text-xs font-mono", theme.textMain, "font-bold")}>{data.losses === 0 ? '∞' : Math.abs(data.wins / data.losses).toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Utilidades ---
const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay(); 
const isSameDay = (d1, d2) => d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
const getWeekNumber = (d) => {
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
};

// --- HOOK DE PERSISTENCIA (Local Storage) ---
function useStickyState(defaultValue, key) {
  const [value, setValue] = useState(() => {
    const stickyValue = window.localStorage.getItem(key);
    return stickyValue !== null ? JSON.parse(stickyValue) : defaultValue;
  });
  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);
  return [value, setValue];
}

// Data persistence is handled via the storage utility module (localStorage-based)

// --- Welcome Modal Component ---
const WelcomeModal = ({ onComplete, defaultTheme }) => {
  const [journalTitle, setJournalTitle] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('slate_blue');
  const [initialCapital, setInitialCapital] = useState('');
  const [selectedPairs, setSelectedPairs] = useState([]);
  const [newPairInput, setNewPairInput] = useState('');
  const [themeTypeFilter, setThemeTypeFilter] = useState('dark'); // 'dark' or 'light'
  
  const theme = THEMES[selectedTheme].colors;
  const commonPairs = ['XAUUSD', 'US30', 'EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD', 'GBPJPY', 'EURJPY', 'SPX500', 'NAS100', 'BTCUSD', 'ETHUSD'];
  
  const handleTogglePair = (pair) => {
    setSelectedPairs(prev => 
      prev.includes(pair) 
        ? prev.filter(p => p !== pair)
        : [...prev, pair]
    );
  };
  
  const handleAddCustomPair = () => {
    if (newPairInput && !selectedPairs.includes(newPairInput.toUpperCase()) && !commonPairs.includes(newPairInput.toUpperCase())) {
      setSelectedPairs([...selectedPairs, newPairInput.toUpperCase()]);
      setNewPairInput('');
    }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!journalTitle || !initialCapital || selectedPairs.length === 0) {
      alert('Por favor, completa todos los campos requeridos');
      return;
    }
    onComplete({
      title: journalTitle.trim() || 'ProTrader Journal',
      theme: selectedTheme,
      initialCapital: parseFloat(initialCapital) || 0,
      pairs: selectedPairs
    });
  };
  
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className={`w-full max-w-2xl p-4 sm:p-8 rounded-xl sm:rounded-2xl shadow-2xl border ${theme.bgCard} ${theme.border} transform transition-all scale-100 mx-2 sm:mx-4 max-h-[95vh] sm:max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center gap-3 mb-6">
          <div className={`p-3 rounded-xl ${theme.accentBg}`}>
            <Sparkles className={theme.textMain} size={24} />
          </div>
          <div>
            <h2 className={clsx("text-2xl font-bold", theme.textMain)}>¡Bienvenido a tu Journal!</h2>
            <p className={`text-sm ${theme.textSec} mt-1`}>Configura tu experiencia personalizada</p>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Journal Title */}
          <div>
            <Input
              label="Nombre de tu Journal"
              type="text"
              value={journalTitle}
              onChange={(e) => setJournalTitle(e.target.value)}
              placeholder="Ej: Mi Trading Journal 2024"
              theme={theme}
              autoFocus
            />
            <p className={`text-xs ${theme.textMuted} mt-1`}>Personaliza el nombre que aparecerá en la parte superior</p>
          </div>
          
          {/* Theme Selection */}
          <div>
            <label className={`text-xs uppercase tracking-wider ${theme.textSec} font-semibold mb-3 block flex items-center gap-2`}>
              <Palette size={14} /> Selecciona tu Tema Preferido
            </label>
            {/* Theme Type Toggle */}
            <div className={`flex items-center gap-2 mb-4 p-1 ${theme.bgCard} rounded-lg border ${theme.border}`}>
              <button
                type="button"
                onClick={() => setThemeTypeFilter('dark')}
                className={`flex-1 px-3 py-2 rounded-md text-xs font-semibold transition-all ${
                  themeTypeFilter === 'dark'
                    ? `${theme.accentBg} text-white shadow`
                    : `${theme.textSec} hover:${theme.textMain}`
                }`}
              >
                Dark
              </button>
              <button
                type="button"
                onClick={() => setThemeTypeFilter('light')}
                className={`flex-1 px-3 py-2 rounded-md text-xs font-semibold transition-all ${
                  themeTypeFilter === 'light'
                    ? `${theme.accentBg} text-white shadow`
                    : `${theme.textSec} hover:${theme.textMain}`
                }`}
              >
                Clear
              </button>
            </div>
            {/* Filtered Themes */}
            <div className="grid grid-cols-2 gap-3">
              {Object.values(THEMES)
                .filter((t) => t.type === themeTypeFilter)
                .map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedTheme(t.id)}
                    className={`flex items-center gap-3 p-4 rounded-lg border transition-all ${
                      selectedTheme === t.id 
                        ? `${t.colors.accentBorder} ${t.colors.bgCard} ring-2 ${t.colors.accentRing}` 
                        : `${theme.border} hover:${theme.bgCard}`
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full ${t.colors.bgMain} border ${t.colors.border} flex items-center justify-center`}>
                      <div className={`w-4 h-4 rounded-full ${t.colors.accentBg}`}></div>
                    </div>
                    <div className="text-left">
                      <div className={`text-sm font-bold ${selectedTheme === t.id ? t.colors.accentText : theme.textSec}`}>
                        {t.name}
                      </div>
                    </div>
                  </button>
                ))}
            </div>
          </div>
          
          {/* Initial Capital */}
          <div>
            <Input
              label="Capital Inicial ($)"
              type="number"
              value={initialCapital}
              onChange={(e) => setInitialCapital(e.target.value)}
              placeholder="Ej: 10000"
              theme={theme}
              autoFocus
            />
          </div>
          
          {/* Pairs Selection */}
          <div>
            <label className={`text-xs uppercase tracking-wider ${theme.textSec} font-semibold mb-3 block flex items-center gap-2`}>
              <List size={14} /> Selecciona los Pares que Operarás
            </label>
            <div className={`${theme.bgInput} border ${theme.border} rounded-lg p-4 max-h-48 overflow-y-auto`}>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {commonPairs.map(pair => (
                  <button
                    key={pair}
                    type="button"
                    onClick={() => handleTogglePair(pair)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedPairs.includes(pair)
                        ? `${theme.accentBg} text-white`
                        : `${theme.bgCard} ${theme.textSec} hover:${theme.bgHover} border ${theme.border}`
                    }`}
                  >
                    {pair}
                  </button>
                ))}
              </div>
              
              {/* Custom Pair Input */}
              <div className={`flex gap-2 pt-3 border-t ${theme.border}`}>
                <Input
                  value={newPairInput}
                  onChange={(e) => setNewPairInput(e.target.value)}
                  placeholder="Agregar par personalizado (ej: AUDCAD)"
                  theme={theme}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomPair();
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={handleAddCustomPair}
                  size="icon"
                  theme={theme}
                  variant="outline"
                >
                  <Plus size={18} />
                </Button>
              </div>
              
              {selectedPairs.length > 0 && (
                <div className={`mt-3 pt-3 border-t ${theme.border}`}>
                  <p className={`text-xs ${theme.textSec} mb-2`}>Pares seleccionados ({selectedPairs.length}):</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedPairs.map(pair => (
                      <div
                        key={pair}
                        className={`text-xs px-2 py-1 rounded border ${theme.border} ${theme.accentBg} text-white flex items-center gap-1`}
                      >
                        {pair}
                        <button
                          type="button"
                          onClick={() => handleTogglePair(pair)}
                          className="hover:text-rose-300 ml-1"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Reminder about customization */}
          <div className={`${theme.bgSec} border ${theme.border} rounded-lg p-4`}>
            <div className="flex items-start gap-3">
              <Settings size={16} className={`${theme.accentText} mt-0.5 shrink-0`} />
              <div>
                <p className={`text-xs font-semibold ${theme.textMain} mb-1`}>Recuerda</p>
                <p className={`text-xs ${theme.textSec}`}>
                  Puedes personalizar estos ajustes en cualquier momento desde el botón de <span className={`font-semibold ${theme.accentText}`}>Configuración</span> en la barra superior.
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              className="flex-1"
              theme={theme}
            >
              Comenzar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- Componente Principal ---
export default function TradingJournalApp() {
  // Check if it's the first time opening the app
  const [isFirstTime, setIsFirstTime] = useState(() => {
    const initialized = window.localStorage.getItem('journal_initialized_v1');
    return initialized === null;
  });
  
  // Estado Global con Persistencia (sin datos hardcodeados)
  const [entries, setEntries] = useStickyState([], 'journal_entries_v1');
  const [availablePairs, setAvailablePairs] = useStickyState([], 'journal_pairs_v1');
  const [motivationalImages, setMotivationalImages] = useStickyState([], 'journal_images_v1');
  const [appTitle, setAppTitle] = useStickyState("ProTrader Journal", 'journal_title_v1');
  const [accountBalance, setAccountBalance] = useStickyState(0, 'journal_balance_v1');
  const [currentTheme, setCurrentTheme] = useStickyState('slate_blue', 'journal_theme_v1');

  // Estados temporales (UI)
  const [isDragging, setIsDragging] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showSidebar, setShowSidebar] = useState(false); // Mobile sidebar toggle (vision board)
  const [showMetrics, setShowMetrics] = useState(false); // Mobile metrics overlay toggle 
  const [showSettings, setShowSettings] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false); // Dropdown menu for mobile
  const [isAddEntryModalOpen, setIsAddEntryModalOpen] = useState(false);
  const [isViewEntryModalOpen, setIsViewEntryModalOpen] = useState(false);
  const [isEditEntryModalOpen, setIsEditEntryModalOpen] = useState(false);
  const [viewingEntry, setViewingEntry] = useState(null);
  const [editingEntry, setEditingEntry] = useState(null);
  const [newPairInput, setNewPairInput] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetStep, setResetStep] = useState(1); // 1: initial warning, 2: export offer, 3: final confirmation
  const [showSettingsCloseConfirm, setShowSettingsCloseConfirm] = useState(false);
  // Track settings state for unsaved changes detection
  const [settingsBalance, setSettingsBalance] = useState(0); // Can be number or empty string while typing
  const [settingsTheme, setSettingsTheme] = useState('slate_blue');
  const [isSlideshowActive, setIsSlideshowActive] = useState(false);
  const [slideshowIndex, setSlideshowIndex] = useState(0);
  const [showPairSelectionModal, setShowPairSelectionModal] = useState(false);
  const [showVisionBoardConfig, setShowVisionBoardConfig] = useState(false);
  const [slideshowDuration, setSlideshowDuration] = useStickyState(4000, 'journal_slideshow_duration_v1'); // Duration in milliseconds
  const [slideshowAnimation, setSlideshowAnimation] = useStickyState('smooth', 'journal_slideshow_animation_v1'); // 'smooth' or 'plain'
  const [customDuration, setCustomDuration] = useState('');
  const [durationMode, setDurationMode] = useState('preset'); // 'preset' or 'custom'
  const [showMetricsAsPercentage, setShowMetricsAsPercentage] = useState(false);
  const [themeTypeFilter, setThemeTypeFilter] = useState(() => {
    // Initialize based on current theme type
    return THEMES[currentTheme]?.type || 'dark';
  }); // 'dark' or 'light'

  const theme = THEMES[currentTheme].colors; 
  const [formState, setFormState] = useState({ pair: '', type: 'BUY', rr: '', pnl: '', notes: '', screenshotUrl: '' });
  const RR_OPTIONS = ['SL', 'BE', '1:1', '1:2', '1:3', '1:4', '1:5'];

  // Sync theme type filter when current theme changes
  useEffect(() => {
    const currentThemeType = THEMES[currentTheme]?.type;
    if (currentThemeType) {
      setThemeTypeFilter(currentThemeType);
    }
  }, [currentTheme]);

  // Métricas
  const metrics = useMemo(() => {
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const createStat = () => ({ val: 0, count: 0, wins: 0, losses: 0, breakEven: 0, winRate: 0 });
    const stats = { daily: createStat(), weekly: createStat(), monthly: createStat(), annual: createStat(), global: createStat() };

    entries.forEach(entry => {
      const entryDate = new Date(entry.date);
      const pnl = parseFloat(entry.pnl);
      const isWin = pnl > 0;
      const isLoss = pnl < 0;
      const isBreakEven = pnl === 0;
      const updateStat = (statObj) => {
        statObj.val += pnl;
        statObj.count++;
        if (isWin) statObj.wins++;
        if (isLoss) statObj.losses++;
        if (isBreakEven) statObj.breakEven++;
      };
      updateStat(stats.global);
      if (entryDate.getFullYear() === currentYear) {
        updateStat(stats.annual);
        if (entryDate.getMonth() === currentMonth) updateStat(stats.monthly);
        const contextDate = selectedDate || new Date();
        if (getWeekNumber(entryDate) === getWeekNumber(contextDate)) updateStat(stats.weekly);
      }
      if (selectedDate && isSameDay(entryDate, selectedDate)) updateStat(stats.daily);
    });

    Object.keys(stats).forEach(key => {
      const s = stats[key];
      const totalDecisive = s.wins + s.losses;
      s.winRate = totalDecisive > 0 ? (s.wins / totalDecisive) * 100 : 0;
    });
    return { ...stats, currentBalance: accountBalance + stats.annual.val };
  }, [entries, currentDate, selectedDate, accountBalance]);

  // Handlers
  const handleDayClick = (day) => setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
  const handleBackToDashboard = () => setSelectedDate(null);
  const handleAddEntry = (e) => {
    e.preventDefault();
    if (!formState.pair || !formState.pnl) return;
    const newEntry = { 
      id: Date.now(), date: selectedDate.toISOString(), pair: formState.pair.toUpperCase(), type: formState.type, 
      rr: formState.rr || '1:1', pnl: parseFloat(formState.pnl), notes: formState.notes, screenshotUrl: formState.screenshotUrl
    };
    setEntries([...entries, newEntry]);
    setFormState({ pair: '', type: 'BUY', rr: '', pnl: '', notes: '', screenshotUrl: '' }); 
    setIsAddEntryModalOpen(false);
  };
  const handleAddPair = () => {
    if (newPairInput && !availablePairs.includes(newPairInput.toUpperCase())) {
      setAvailablePairs([...availablePairs, newPairInput.toUpperCase()]);
      setNewPairInput('');
    }
  };
  
  const handleTogglePairFromModal = (pair) => {
    const upperPair = pair.toUpperCase();
    if (availablePairs.includes(upperPair)) {
      setAvailablePairs(availablePairs.filter(p => p !== upperPair));
    } else {
      setAvailablePairs([...availablePairs, upperPair]);
    }
  };
  const handleRemovePair = (pair) => setAvailablePairs(availablePairs.filter(p => p !== pair));
  const handleDeleteEntry = (id) => setEntries(entries.filter(e => e.id !== id));
  const handleViewEntry = (entry) => {
    setViewingEntry(entry);
    setIsViewEntryModalOpen(true);
  };
  const handleEditEntry = (entry) => {
    setEditingEntry(entry);
    setFormState({
      pair: entry.pair,
      type: entry.type,
      rr: entry.rr,
      pnl: entry.pnl.toString(),
      notes: entry.notes || '',
      screenshotUrl: entry.screenshotUrl || ''
    });
    setIsViewEntryModalOpen(false);
    setIsEditEntryModalOpen(true);
  };
  const handleUpdateEntry = (e) => {
    e.preventDefault();
    if (!formState.pair || !formState.pnl || !editingEntry) return;
    const updatedEntry = {
      ...editingEntry,
      pair: formState.pair.toUpperCase(),
      type: formState.type,
      rr: formState.rr || '1:1',
      pnl: parseFloat(formState.pnl),
      notes: formState.notes,
      screenshotUrl: formState.screenshotUrl
    };
    setEntries(entries.map(e => e.id === editingEntry.id ? updatedEntry : e));
    setFormState({ pair: '', type: 'BUY', rr: '', pnl: '', notes: '', screenshotUrl: '' });
    setEditingEntry(null);
    setIsEditEntryModalOpen(false);
  };
  const changeMonth = (offset) => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + offset)));
  
  // Drag & Drop
  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e) => {
    e.preventDefault(); setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => setMotivationalImages(prev => [...prev, { id: Date.now() + Math.random(), src: event.target.result }]);
        reader.readAsDataURL(file);
      }
    });
  };
  const handleDeleteImage = (id, e) => { e.stopPropagation(); setMotivationalImages(prev => prev.filter(img => img.id !== id)); };

  // Slideshow handlers
  const toggleSlideshow = () => {
    if (motivationalImages.length >= 3) {
      setIsSlideshowActive(!isSlideshowActive);
      if (!isSlideshowActive) {
        setSlideshowIndex(0);
      }
    }
  };

  const handleSlideshowNext = () => {
    setSlideshowIndex((prev) => (prev + 1) % motivationalImages.length);
  };

  const handleSlideshowPrev = () => {
    setSlideshowIndex((prev) => (prev - 1 + motivationalImages.length) % motivationalImages.length);
  };

  // Auto-advance slideshow
  useEffect(() => {
    if (isSlideshowActive && motivationalImages.length >= 3) {
      const interval = setInterval(() => {
        setSlideshowIndex((prev) => (prev + 1) % motivationalImages.length);
      }, slideshowDuration); // Use configurable duration
      return () => clearInterval(interval);
    }
  }, [isSlideshowActive, motivationalImages.length, slideshowDuration]);

  // Reset slideshow index when images change or slideshow is disabled
  useEffect(() => {
    if (!isSlideshowActive || motivationalImages.length < 3) {
      setSlideshowIndex(0);
    }
    if (slideshowIndex >= motivationalImages.length && motivationalImages.length > 0) {
      setSlideshowIndex(0);
    }
  }, [motivationalImages.length, isSlideshowActive, slideshowIndex]);

  // Initialize duration mode when Vision Board config modal opens
  useEffect(() => {
    if (showVisionBoardConfig) {
      const currentSeconds = slideshowDuration / 1000;
      if (currentSeconds === 3 || currentSeconds === 5 || currentSeconds === 10) {
        setDurationMode('preset');
        setCustomDuration('');
      } else {
        setDurationMode('custom');
        setCustomDuration(currentSeconds.toString());
      }
    } else {
      // Reset when modal closes
      setCustomDuration('');
      setDurationMode('preset');
    }
  }, [showVisionBoardConfig, slideshowDuration]);

  // Handle Welcome Modal Completion
  const handleWelcomeComplete = (preferences) => {
    setAppTitle(preferences.title || 'ProTrader Journal');
    setCurrentTheme(preferences.theme);
    setAccountBalance(preferences.initialCapital);
    setAvailablePairs(preferences.pairs);
    window.localStorage.setItem('journal_initialized_v1', 'true');
    setIsFirstTime(false);
  };

  // --- Load data from localStorage on mount ---
  useEffect(() => {
    const data = loadJournalData();
    if (data) {
      if (data.entries) setEntries(data.entries);
      if (data.availablePairs) setAvailablePairs(data.availablePairs);
      if (data.motivationalImages) setMotivationalImages(data.motivationalImages);
      if (data.appTitle) setAppTitle(data.appTitle);
      if (data.accountBalance !== undefined) setAccountBalance(data.accountBalance);
      if (data.currentTheme) setCurrentTheme(data.currentTheme);
      if (data.initialized) setIsFirstTime(false);
    }
  }, []); // Only run on mount

  // --- Auto-save to localStorage when data changes (debounced) ---
  useEffect(() => {
    if (isFirstTime) return;

    const saveTimeout = setTimeout(() => {
      const allData = {
        entries,
        availablePairs,
        motivationalImages,
        appTitle,
        accountBalance,
        currentTheme,
        initialized: window.localStorage.getItem('journal_initialized_v1') === 'true'
      };
      saveJournalData(allData);
    }, 1000); // Save 1 second after last change

    return () => clearTimeout(saveTimeout);
  }, [entries, availablePairs, motivationalImages, appTitle, accountBalance, currentTheme, isFirstTime]);

  // CSV Parser Helper
  const parseCSVLine = (line) => {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];
      
      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          current += '"';
          i++; // Skip next quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim()); // Push last field
    return result;
  };

  // Importar CSV
  const handleImportData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const text = event.target.result;
          const lines = text.split('\n').filter(line => line.trim());
          
          if (lines.length < 2) {
            alert('El archivo CSV está vacío o no tiene el formato correcto');
            return;
          }
          
          // Skip header row
          const dataLines = lines.slice(1);
          const importedEntries = [];
          const existingIds = new Set(entries.map(e => e.id));
          
          dataLines.forEach((line, index) => {
            if (!line.trim()) return;
            
            try {
              const fields = parseCSVLine(line);
              
              if (fields.length < 8) {
                console.warn(`Línea ${index + 2} tiene formato incorrecto, se omite`);
                return;
              }
              
              const [idStr, fecha, hora, pair, type, rr, pnlStr, status, notes, screenshotUrl] = fields;
              
              // Parse date (format: DD/MM/YYYY)
              const [day, month, year] = fecha.split('/').map(Number);
              // Parse time (format: HH:MM:SS)
              const [hours, minutes, seconds] = hora.split(':').map(Number);
              
              const dateObj = new Date(year, month - 1, day, hours || 0, minutes || 0, seconds || 0);
              
              if (isNaN(dateObj.getTime())) {
                console.warn(`Fecha inválida en línea ${index + 2}, se omite`);
                return;
              }
              
              // Clean up pair (remove quotes if present)
              const cleanPair = pair.replace(/^"|"$/g, '');
              
              // Clean up notes and URL (remove quotes and unescape)
              const cleanNotes = notes ? notes.replace(/^"|"$/g, '').replace(/""/g, '"') : '';
              const cleanUrl = screenshotUrl ? screenshotUrl.replace(/^"|"$/g, '').replace(/""/g, '"') : '';
              
              const id = parseInt(idStr, 10);
              const pnl = parseFloat(pnlStr);
              
              if (isNaN(id) || isNaN(pnl)) {
                console.warn(`ID o P/L inválido en línea ${index + 2}, se omite`);
                return;
              }
              
              // Generate new ID if duplicate
              let finalId = id;
              if (existingIds.has(finalId)) {
                finalId = Date.now() + index;
              }
              existingIds.add(finalId);
              
              importedEntries.push({
                id: finalId,
                date: dateObj.toISOString(),
                pair: cleanPair.toUpperCase(),
                type: type.toUpperCase(),
                rr: rr || '1:1',
                pnl: pnl,
                notes: cleanNotes,
                screenshotUrl: cleanUrl
              });
            } catch (error) {
              console.warn(`Error procesando línea ${index + 2}:`, error);
            }
          });
          
          if (importedEntries.length === 0) {
            alert('No se pudieron importar entradas del archivo CSV');
            return;
          }
          
          // Ask user if they want to merge or replace
          const merge = window.confirm(
            `Se encontraron ${importedEntries.length} entradas.\n\n` +
            `¿Deseas fusionar con las entradas existentes (OK) o reemplazarlas (Cancelar)?`
          );
          
          if (merge) {
            // Merge: add new entries, avoid duplicates by ID
            const existingIdsSet = new Set(entries.map(e => e.id));
            const newEntries = importedEntries.filter(e => !existingIdsSet.has(e.id));
            const duplicates = importedEntries.length - newEntries.length;
            
            setEntries([...entries, ...newEntries]);
            
            if (duplicates > 0) {
              alert(`Se importaron ${newEntries.length} entradas nuevas. ${duplicates} entradas duplicadas se omitieron.`);
            } else {
              alert(`Se importaron ${newEntries.length} entradas exitosamente.`);
            }
          } else {
            // Replace: replace all entries
            setEntries(importedEntries);
            alert(`Se importaron ${importedEntries.length} entradas. Las entradas anteriores fueron reemplazadas.`);
          }
          
          // Update available pairs with imported pairs
          const importedPairs = new Set(importedEntries.map(e => e.pair));
          const currentPairs = new Set(availablePairs);
          const newPairs = Array.from(importedPairs).filter(p => !currentPairs.has(p));
          if (newPairs.length > 0) {
            setAvailablePairs([...availablePairs, ...newPairs]);
          }
          
        } catch (error) {
          console.error('Error importing CSV:', error);
          alert('Error al importar el archivo CSV: ' + error.message);
        }
      };
      
      reader.onerror = () => {
        alert('Error al leer el archivo');
      };
      
      reader.readAsText(file, 'UTF-8');
    };
    
    input.click();
  };

  // Exportar CSV
  const handleExportData = () => {
    if (entries.length === 0) { alert("No hay datos para exportar"); return; }
    const headers = ["ID,Fecha,Hora,Par,Tipo,R:R,Resultado ($),Estado,Notas,URL Captura"];
    const rows = entries.map(e => {
      const dateObj = new Date(e.date);
      const status = e.pnl > 0 ? "WIN" : e.pnl < 0 ? "LOSS" : "BREAK-EVEN";
      const safeNotes = e.notes ? `"${e.notes.replace(/"/g, '""')}"` : '""';
      const safeUrl = e.screenshotUrl ? `"${e.screenshotUrl}"` : '""';
      return `${e.id},${dateObj.toLocaleDateString('es-ES')},${dateObj.toLocaleTimeString('es-ES')},"${e.pair}",${e.type},${e.rr},${e.pnl},${status},${safeNotes},${safeUrl}`;
    });
    const csvContent = [headers, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Trading_Journal_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  // Exportar JSON (all journal data)
  const handleExportJSON = () => {
    const success = downloadJournalData();
    if (success) {
      alert('Datos exportados exitosamente en formato JSON');
    } else {
      alert('Error al exportar los datos');
    }
  };

  // Importar JSON
  const handleImportJSON = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const merge = window.confirm(
        '¿Deseas fusionar los datos importados con los existentes?\n\n' +
        'Sí: Los datos importados se combinarán con los actuales\n' +
        'No: Los datos importados reemplazarán los actuales'
      );

      const result = await importJournalDataFromFile(file, merge);
      
      if (result.success) {
        // Reload data from localStorage
        const data = loadJournalData();
        if (data) {
          if (data.entries) setEntries(data.entries);
          if (data.availablePairs) setAvailablePairs(data.availablePairs);
          if (data.motivationalImages) setMotivationalImages(data.motivationalImages);
          if (data.appTitle) setAppTitle(data.appTitle);
          if (data.accountBalance !== undefined) setAccountBalance(data.accountBalance);
          if (data.currentTheme) setCurrentTheme(data.currentTheme);
          if (data.initialized) setIsFirstTime(false);
        }
        alert('Datos importados exitosamente');
      } else {
        const errorMsg = result.errors && result.errors.length > 0 
          ? result.errors.join('\n')
          : 'Error desconocido al importar los datos';
        alert(`Error al importar los datos:\n\n${errorMsg}`);
      }
    };
    input.click();
  };

  // Reset Data Handler
  const handleResetData = () => {
    setShowResetConfirm(true);
    setResetStep(1);
  };

  const handleResetCancel = () => {
    setShowResetConfirm(false);
    setResetStep(1);
  };

  const handleResetExportAndContinue = () => {
    if (entries.length > 0) {
      handleExportData();
    }
    setResetStep(3); // Go to final confirmation
  };

  const handleResetSkipExport = () => {
    setResetStep(3); // Go to final confirmation
  };

  const handleResetConfirm = async () => {
    // Clear all localStorage data using utility
    clearJournalData();
    
    // Reset all state immediately
    setEntries([]);
    setAvailablePairs([]);
    setMotivationalImages([]);
    setAppTitle("ProTrader Journal");
    setAccountBalance(0);
    setCurrentTheme('slate_blue');
    setSelectedDate(null);
    setFormState({ pair: '', type: 'BUY', rr: '', pnl: '', notes: '', screenshotUrl: '' });
    setIsFirstTime(true);
    
    // Close modals
    setShowResetConfirm(false);
    setShowSettings(false);
    setResetStep(1);
    
    alert('Todos los datos han sido eliminados. El journal se reiniciará.');
  };

  // Render Calendario - Desktop Grid
  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
    const firstDay = getFirstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth());
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(<div key={`empty-${i}`} className={`h-full min-h-[100px] ${theme.bgCard50} opacity-30 border ${theme.border} border-opacity-50`}></div>);
    for (let d = 1; d <= daysInMonth; d++) {
      const dateToCheck = new Date(currentDate.getFullYear(), currentDate.getMonth(), d);
      const dayEntries = entries.filter(e => isSameDay(new Date(e.date), dateToCheck));
      const dayPnL = dayEntries.reduce((acc, curr) => acc + parseFloat(curr.pnl), 0);
      const hasTrades = dayEntries.length > 0;
      const isProfit = dayPnL > 0;
      const isBreakEven = dayPnL === 0;
      const isLoss = dayPnL < 0;
      const isSelected = selectedDate && isSameDay(dateToCheck, selectedDate);
      let bgClass = `${theme.bgCard} hover:${theme.bgHover}`;
      if (hasTrades) {
        if (isProfit) bgClass = `bg-gradient-to-br from-emerald-900/40 to-${theme.bgCard.replace('bg-', '')}`;
        else if (isBreakEven) bgClass = `bg-gradient-to-br from-yellow-900/40 to-${theme.bgCard.replace('bg-', '')}`;
        else bgClass = `bg-gradient-to-br from-rose-900/40 to-${theme.bgCard.replace('bg-', '')}`;
      }
      days.push(
        <div key={d} onClick={() => handleDayClick(d)} className={`h-full min-h-[100px] p-3 cursor-pointer transition-all relative group flex flex-col justify-between border ${theme.border} ${bgClass} ${isSelected ? `ring-2 ${theme.accentRing} z-10 shadow-xl` : ''}`}>
          <div className="flex justify-between items-start gap-1"><span className={`text-lg font-bold ${isSelected ? theme.textMain : `${theme.textMuted} group-hover:${theme.textMain}`}`}>{d}</span>{hasTrades && (<div className={`text-xs font-bold px-1.5 py-0.5 rounded shrink-0 ${isProfit ? 'bg-emerald-500/20 text-emerald-300' : isBreakEven ? 'bg-yellow-500/20 text-yellow-300' : 'bg-rose-500/20 text-rose-300'}`}>{dayEntries.length} Op</div>)}</div>
          {hasTrades ? (<div className={`text-lg font-mono font-bold tracking-tight truncate ${theme.textSec}`}>{dayPnL > 0 ? '+' : ''}{dayPnL}$</div>) : (<div className="opacity-0 group-hover:opacity-100 transition-opacity absolute inset-0 flex items-center justify-center bg-black/20"><Plus className={theme.textSec} size={16} /></div>)}
        </div>
      );
    }
    return days;
  };

  // Render Calendario - Mobile Round Cards
  const renderCalendarDaysMobile = () => {
    const daysInMonth = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
    const firstDay = getFirstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth());
    const today = new Date();
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="w-full aspect-square"></div>);
    }
    
    // Add day cards
    for (let d = 1; d <= daysInMonth; d++) {
      const dateToCheck = new Date(currentDate.getFullYear(), currentDate.getMonth(), d);
      const dayEntries = entries.filter(e => isSameDay(new Date(e.date), dateToCheck));
      const dayPnL = dayEntries.reduce((acc, curr) => acc + parseFloat(curr.pnl), 0);
      const hasTrades = dayEntries.length > 0;
      const isProfit = dayPnL > 0;
      const isBreakEven = dayPnL === 0;
      const isSelected = selectedDate && isSameDay(dateToCheck, selectedDate);
      const isToday = isSameDay(dateToCheck, today);
      
      let cardClass = `${theme.bgCard} border-2 ${theme.border}`;
      if (hasTrades) {
        if (isProfit) cardClass = `bg-gradient-to-br from-emerald-600/80 to-emerald-500/60 border-emerald-400`;
        else if (isBreakEven) cardClass = `bg-gradient-to-br from-yellow-600/80 to-yellow-500/60 border-yellow-400`;
        else cardClass = `bg-gradient-to-br from-rose-600/80 to-rose-500/60 border-rose-400`;
      }
      if (isSelected) cardClass += ` ring-4 ${theme.accentRing} shadow-2xl scale-105`;
      if (isToday && !isSelected && !hasTrades) cardClass += ` ring-2 ring-blue-500/50`;
      
      days.push(
        <div 
          key={d} 
          onClick={() => { handleDayClick(d); setShowSidebar(true); }} 
          className={`w-full aspect-square rounded-full ${cardClass} cursor-pointer transition-all relative flex flex-col items-center justify-center p-1.5 sm:p-2 ${isSelected ? 'z-10' : ''} active:scale-95 shadow-lg`}
        >
          <span className={`text-sm sm:text-base font-bold ${hasTrades || isSelected ? 'text-white' : theme.textMain}`}>{d}</span>
          {!hasTrades && isToday && (
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-blue-500 rounded-full border-2 border-white shadow"></div>
          )}
        </div>
      );
    }
    return days;
  };

  return (
    <div className={clsx("h-screen w-full", theme.bgMain, theme.textMain, "font-sans", theme.selection, "flex flex-col overflow-hidden transition-colors duration-500")}>
      {/* Welcome Modal */}
      {isFirstTime && (
        <WelcomeModal 
          onComplete={handleWelcomeComplete}
          defaultTheme={currentTheme}
        />
      )}
      
      {/* Header */}
      <header className={clsx("h-auto min-h-14 lg:min-h-20", theme.bgSec, "border-b", theme.borderSec, "px-3 lg:px-6 py-2 lg:py-0 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-2 lg:gap-0 shrink-0 z-20 relative shadow-md")}>
        <div className="flex items-center gap-2 lg:gap-4 w-full lg:w-auto">
          <div className="flex-1 lg:flex-none min-w-0">{isEditingTitle ? (<Input value={appTitle} onChange={(e) => setAppTitle(e.target.value)} onBlur={() => setIsEditingTitle(false)} autoFocus theme={theme} />) : (<div className="flex items-center gap-2 cursor-pointer group" onClick={() => setIsEditingTitle(true)}><h1 className={clsx("text-base lg:text-xl font-bold truncate", theme.textMain, theme.accentText, "hover:opacity-80 transition-colors")}>{appTitle}</h1><Edit2 size={12} className={clsx(theme.textMuted, "opacity-0 group-hover:opacity-100 transition-opacity shrink-0")} /></div>)}</div>
          {/* Mobile/Tablet: Balance, VisionBoard, Metrics, Settings */}
          <div className="flex items-center gap-2 lg:hidden">
            {/* Total Balance */}
            <div className="flex flex-col items-end">
              <span className={`text-[10px] uppercase tracking-widest ${theme.textMuted} font-bold`}>Balance Total</span>
              <span className={`text-lg font-mono font-bold ${metrics.currentBalance >= accountBalance ? 'text-emerald-400' : 'text-rose-400'}`}>{metrics.currentBalance.toLocaleString()}</span>
            </div>
            {/* VisionBoard icon - Hide when sidebar is always visible (sm and above) */}
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className={`sm:hidden p-2.5 ${theme.bgCard} rounded-lg border ${theme.border} ${theme.textMain} hover:${theme.bgSec} active:scale-95 transition-all`}
              title="Vision Board"
              aria-label="Vision Board"
            >
              <ImageIcon size={20} />
            </button>
            {/* Metrics icon */}
            <button
              onClick={() => setShowMetrics(!showMetrics)}
              className={`p-2.5 ${theme.bgCard} rounded-lg border ${theme.border} ${theme.textMain} hover:${theme.bgSec} active:scale-95 transition-all`}
              title="Mostrar Métricas"
              aria-label="Mostrar Métricas"
            >
              <BarChart3 size={20} />
            </button>
            {/* Settings icon */}
            <button
              onClick={() => {
                setSettingsBalance(accountBalance);
                setSettingsTheme(currentTheme);
                setShowSettings(true);
                if (showSettings === false) {
                  const currentThemeType = THEMES[currentTheme]?.type || 'dark';
                  setThemeTypeFilter(currentThemeType);
                }
              }}
              className={`p-2.5 ${theme.bgCard} rounded-lg border ${theme.border} ${theme.textMain} hover:${theme.bgSec} active:scale-95 transition-all`}
              title="Configuración"
              aria-label="Configuración"
            >
              <Settings size={20} />
            </button>
          </div>
        </div>
        {/* Metrics - Hidden on mobile/tablet/laptop, shown on xl screens */}
        <div className={`hidden xl:flex items-center ${theme.bgCard50} rounded-xl border ${theme.border} px-2 shadow-inner justify-end overflow-x-auto xl:overflow-visible`}>
            <div className={`px-2 lg:px-4 py-2 flex flex-col items-center border-r ${theme.border} shrink-0`}><div className={`text-[10px] uppercase tracking-widest ${theme.textMuted} font-bold flex items-center gap-1 mb-0.5`}><Activity size={12} /> Win Rate</div><span className={`text-sm lg:text-lg font-mono font-bold ${metrics.global.winRate >= 50 ? 'text-emerald-400' : 'text-orange-400'}`}>{metrics.global.winRate.toFixed(1)}%</span></div>
            <div className={`px-2 lg:px-4 py-2 flex flex-col items-center border-r ${theme.border} shrink-0`}><div className={`text-[10px] uppercase tracking-widest ${theme.textMuted} font-bold flex items-center gap-1 mb-0.5`}><BarChart3 size={12} /> Total Trades</div><span className={`text-sm lg:text-lg font-mono font-bold ${theme.textMain}`}>{metrics.global.count}</span></div>
            <div className={`px-2 lg:px-4 py-2 flex flex-col items-center border-r ${theme.border} shrink-0`}><div className={`text-[10px] uppercase tracking-widest ${theme.textMuted} font-bold flex items-center gap-1 mb-0.5`}><TrendingUp size={12} /> Wins</div><span className={`text-sm lg:text-lg font-mono font-bold text-emerald-400`}>{showMetricsAsPercentage && metrics.global.count > 0 ? `${((metrics.global.wins / metrics.global.count) * 100).toFixed(1)}%` : metrics.global.wins}</span></div>
            <div className={`px-2 lg:px-4 py-2 flex flex-col items-center border-r ${theme.border} shrink-0`}><div className={`text-[10px] uppercase tracking-widest ${theme.textMuted} font-bold flex items-center gap-1 mb-0.5`}><TrendingDown size={12} /> Losses</div><span className={`text-sm lg:text-lg font-mono font-bold text-rose-400`}>{showMetricsAsPercentage && metrics.global.count > 0 ? `${((metrics.global.losses / metrics.global.count) * 100).toFixed(1)}%` : metrics.global.losses}</span></div>
            <div className={`px-2 lg:px-4 py-2 flex flex-col items-center border-r ${theme.border} shrink-0`}><div className={`text-[10px] uppercase tracking-widest ${theme.textMuted} font-bold flex items-center gap-1 mb-0.5`}><Target size={12} /> Break Even</div><span className={`text-sm lg:text-lg font-mono font-bold text-yellow-400`}>{showMetricsAsPercentage && metrics.global.count > 0 ? `${((metrics.global.breakEven / metrics.global.count) * 100).toFixed(1)}%` : metrics.global.breakEven}</span></div>
            <div className={`px-2 flex items-center shrink-0`}>
              <button
                onClick={() => setShowMetricsAsPercentage(!showMetricsAsPercentage)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  showMetricsAsPercentage ? theme.accentBg : `${theme.bgCard} ${theme.border} border`
                }`}
                title={showMetricsAsPercentage ? "Mostrar valores absolutos" : "Mostrar porcentajes"}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    showMetricsAsPercentage ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            <HeaderMetric label="Semana" data={metrics.weekly} theme={theme} showAsPercentage={showMetricsAsPercentage} accountBalance={accountBalance} /><div className={`w-px h-8 ${theme.border} shrink-0`}></div><HeaderMetric label="Mes" data={metrics.monthly} theme={theme} showAsPercentage={showMetricsAsPercentage} accountBalance={accountBalance} /><div className={`w-px h-8 ${theme.border} shrink-0`}></div><HeaderMetric label="Año" data={metrics.annual} theme={theme} showAsPercentage={showMetricsAsPercentage} accountBalance={accountBalance} />
        </div>
        <div className="flex items-center gap-2 lg:gap-6 w-full lg:w-auto justify-end lg:justify-end">
          {/* Laptop/Desktop: Balance, Metrics button (laptop only), and Settings */}
          <div className="hidden lg:flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className={`text-[10px] uppercase tracking-widest ${theme.textMuted} font-bold`}>Balance Total</span>
              <span className={`text-lg lg:text-xl font-mono font-bold ${metrics.currentBalance >= accountBalance ? 'text-emerald-400' : 'text-rose-400'}`}>{metrics.currentBalance.toLocaleString()}</span>
            </div>
            {/* Metrics button - Show on laptop, hide on xl (where metrics bar is shown) */}
            <button
              onClick={() => setShowMetrics(!showMetrics)}
              className={`xl:hidden p-2.5 ${theme.bgCard} rounded-lg border ${theme.border} ${theme.textMain} hover:${theme.bgSec} active:scale-95 transition-all`}
              title="Mostrar Métricas"
              aria-label="Mostrar Métricas"
            >
              <BarChart3 size={18} />
            </button>
            <Button variant="ghost" size="icon" onClick={() => {
              setSettingsBalance(accountBalance);
              setSettingsTheme(currentTheme);
              setShowSettings(!showSettings);
              if (showSettings === false) {
                const currentThemeType = THEMES[currentTheme]?.type || 'dark';
                setThemeTypeFilter(currentThemeType);
              }
            }} title="Configuración" theme={theme}>
              <Settings size={18} />
            </Button>
          </div>
        </div>
      </header>

      {/* Settings Modal */}
      {showSettings && (
        <div className={`fixed lg:absolute top-0 lg:top-20 right-0 lg:right-6 w-full lg:w-96 h-full lg:h-auto ${theme.bgSec} border ${theme.border} rounded-none lg:rounded-xl shadow-2xl z-30 animate-in slide-in-from-top-5 p-4 lg:p-6 overflow-y-auto lg:max-h-[80vh]`}>
          <div className="flex justify-between items-center mb-4 lg:mb-6">
            <h3 className={clsx("text-base lg:text-lg font-bold", theme.textMain, "flex items-center gap-2")}>
              <Settings size={18} /> Configuración
            </h3>
            <button 
              onClick={() => {
                // Check for unsaved changes
                const hasChanges = settingsBalance !== accountBalance || settingsTheme !== currentTheme;
                if (hasChanges) {
                  setShowSettingsCloseConfirm(true);
                } else {
                  setShowSettings(false);
                }
              }} 
              className={`p-1 ${theme.textMuted} hover:${theme.textMain} active:scale-95 transition-all`}
              aria-label="Cerrar"
            >
              <X size={18} />
            </button>
          </div>
          <div className="space-y-6">
            <div>
              <Input 
                label="Balance Inicial ($)" 
                type="number" 
                value={settingsBalance === '' ? '' : settingsBalance} 
                onChange={(e) => {
                  const val = e.target.value;
                  // Allow empty string for typing, or valid number
                  if (val === '' || val === '-') {
                    setSettingsBalance('');
                  } else {
                    const numVal = parseFloat(val);
                    if (!isNaN(numVal)) {
                      setSettingsBalance(numVal);
                    } else {
                      // Keep the string value while typing invalid characters
                      setSettingsBalance(val);
                    }
                  }
                }}
                onBlur={(e) => {
                  // Ensure we have a valid number on blur
                  const val = parseFloat(e.target.value);
                  if (isNaN(val) || val === '') {
                    setSettingsBalance(0);
                  } else {
                    setSettingsBalance(val);
                  }
                }}
                theme={theme} 
              />
            </div>
            <div>
              <label className={`text-xs uppercase tracking-wider ${theme.textSec} font-semibold mb-3 block flex items-center gap-2`}><Palette size={14} /> Apariencia e Interfaz</label>
              {/* Theme Type Toggle */}
              <div className={`flex items-center gap-2 mb-4 p-1 ${theme.bgCard} rounded-lg border ${theme.border}`}>
                <button
                  onClick={() => {
                    setThemeTypeFilter('dark');
                    // If settings theme is not dark, switch to first dark theme
                    if (THEMES[settingsTheme]?.type !== 'dark') {
                      const firstDarkTheme = Object.values(THEMES).find(t => t.type === 'dark');
                      if (firstDarkTheme) setSettingsTheme(firstDarkTheme.id);
                    }
                  }}
                  className={`flex-1 px-3 py-2 rounded-md text-xs font-semibold transition-all ${
                    themeTypeFilter === 'dark'
                      ? `${theme.accentBg} text-white shadow`
                      : `${theme.textSec} hover:${theme.textMain}`
                  }`}
                >
                  Dark
                </button>
                <button
                  onClick={() => {
                    setThemeTypeFilter('light');
                    // If settings theme is not light, switch to first light theme
                    if (THEMES[settingsTheme]?.type !== 'light') {
                      const firstLightTheme = Object.values(THEMES).find(t => t.type === 'light');
                      if (firstLightTheme) setSettingsTheme(firstLightTheme.id);
                    }
                  }}
                  className={`flex-1 px-3 py-2 rounded-md text-xs font-semibold transition-all ${
                    themeTypeFilter === 'light'
                      ? `${theme.accentBg} text-white shadow`
                      : `${theme.textSec} hover:${theme.textMain}`
                  }`}
                >
                  Clear
                </button>
              </div>
              {/* Filtered Themes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.values(THEMES)
                  .filter((t) => t.type === themeTypeFilter)
                  .map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setSettingsTheme(t.id)}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                        settingsTheme === t.id
                          ? `${t.colors.accentBorder} ${theme.bgCard} ring-2 ${t.colors.accentRing}`
                          : `${theme.border} hover:${theme.bgCard}`
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full ${t.colors.bgMain} border ${t.colors.border} flex items-center justify-center`}>
                        <div className={`w-3 h-3 rounded-full ${t.colors.accentBg}`}></div>
                      </div>
                      <div className="text-left">
                        <div className={`text-sm font-bold ${settingsTheme === t.id ? t.colors.accentText : theme.textSec}`}>
                          {t.name}
                        </div>
                      </div>
                    </button>
                  ))}
              </div>
            </div>
            <div>
              <label className={`text-xs uppercase tracking-wider ${theme.textSec} font-semibold mb-3 block flex items-center gap-2`}><List size={14} /> Gestión de Pares</label>
              <div className="flex gap-2 mb-3">
                <Input 
                  value={newPairInput} 
                  onChange={(e) => setNewPairInput(e.target.value)} 
                  placeholder="Nuevo Par (ej: AUDCAD)" 
                  theme={theme}
                  onFocus={() => setShowPairSelectionModal(true)}
                />
                <Button onClick={handleAddPair} size="icon" theme={theme}><Plus size={18} /></Button>
                <Button 
                  onClick={() => setShowPairSelectionModal(true)} 
                  size="icon" 
                  theme={theme}
                  variant="outline"
                  title="Seleccionar pares comunes"
                >
                  <List size={18} />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">{availablePairs.map(pair => (<div key={pair} className={`text-xs px-2 py-1 rounded border ${theme.border} ${theme.bgCard} ${theme.textMain} flex items-center gap-1`}>{pair}<button onClick={() => handleRemovePair(pair)} className="hover:text-rose-500 ml-1 opacity-50 hover:opacity-100"><X size={12}/></button></div>))}</div>
            </div>
            <div className={`pt-4 border-t ${theme.borderSec}`}>
              <label className={`text-xs uppercase tracking-wider ${theme.textSec} font-semibold mb-3 block flex items-center gap-2`}><Download size={14} /> Importar / Exportar</label>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={handleImportData} theme={theme} className="flex items-center justify-center gap-2">
                  <Upload size={16} /> Importar CSV
                </Button>
                <Button variant="outline" onClick={handleExportData} theme={theme} className="flex items-center justify-center gap-2">
                  <Download size={16} /> Exportar CSV
                </Button>
                <Button variant="outline" onClick={handleImportJSON} theme={theme} className="flex items-center justify-center gap-2">
                  <UploadCloud size={16} /> Importar JSON
                </Button>
                <Button variant="outline" onClick={handleExportJSON} theme={theme} className="flex items-center justify-center gap-2">
                  <Download size={16} /> Exportar JSON
                </Button>
              </div>
            </div>
            <div className={`pt-4 border-t ${theme.borderSec}`}>
              <label className={`text-xs uppercase tracking-wider ${theme.textSec} font-semibold mb-3 block flex items-center gap-2`}><AlertTriangle size={14} className="text-rose-500" /> Zona de Peligro</label>
              <Button variant="danger" onClick={handleResetData} theme={theme} className="w-full flex items-center justify-center gap-2">
                <Trash2 size={18} /> Resetear Todos los Datos
              </Button>
              <p className={`text-xs ${theme.textMuted} mt-2 text-center`}>Eliminará todas las operaciones, pares e imágenes</p>
            </div>
            <Button 
              variant="primary" 
              onClick={() => {
                // Save changes
                setAccountBalance(typeof settingsBalance === 'number' ? settingsBalance : parseFloat(settingsBalance) || 0);
                setCurrentTheme(settingsTheme);
                setShowSettings(false);
              }} 
              theme={theme} 
              className="w-full"
            >
              Guardar Cambios
            </Button>
          </div>
        </div>
      )}

      {/* Pair Selection Modal */}
      {showPairSelectionModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className={`w-full max-w-lg p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-2xl border ${theme.bgCard} ${theme.border} transform transition-all scale-100 mx-2 sm:mx-4 max-h-[95vh] overflow-y-auto`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className={clsx("text-xl font-bold", theme.textMain, "flex items-center gap-2")}>
                <List size={20} /> Seleccionar Pares Comunes
              </h3>
              <button onClick={() => setShowPairSelectionModal(false)} className={theme.textMuted}>
                <X size={20} />
              </button>
            </div>
            <div className={`${theme.bgSec} border ${theme.border} rounded-lg p-4 max-h-96 overflow-y-auto`}>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {['XAUUSD', 'US30', 'EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD', 'GBPJPY', 'EURJPY', 'SPX500', 'NAS100', 'BTCUSD', 'ETHUSD'].map(pair => (
                  <button
                    key={pair}
                    onClick={() => handleTogglePairFromModal(pair)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      availablePairs.includes(pair)
                        ? `${theme.accentBg} text-white`
                        : `${theme.bgCard} ${theme.textSec} hover:${theme.bgHover} border ${theme.border}`
                    }`}
                  >
                    {pair}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button 
                variant="ghost" 
                onClick={() => setShowPairSelectionModal(false)} 
                theme={theme} 
                className="flex-1"
              >
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Vision Board Configuration Modal */}
      {showVisionBoardConfig && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className={`w-full max-w-md p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-2xl border ${theme.bgCard} ${theme.border} transform transition-all scale-100 mx-2 sm:mx-4 max-h-[95vh] overflow-y-auto`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className={clsx("text-xl font-bold", theme.textMain, "flex items-center gap-2")}>
                <Settings size={20} /> Configuración del Vision Board
              </h3>
              <button onClick={() => setShowVisionBoardConfig(false)} className={theme.textMuted}>
                <X size={20} />
              </button>
            </div>
            <div className="space-y-6">
              <div>
                <label className={`text-xs uppercase tracking-wider ${theme.textSec} font-semibold mb-3 block flex items-center gap-2`}>
                  <Clock size={14} /> Duración de cada Imagen
                </label>
                <div className={`flex items-center gap-2 p-1 ${theme.bgCard} rounded-lg border ${theme.border} mb-3`}>
                  <button
                    onClick={() => {
                      setDurationMode('preset');
                      setSlideshowDuration(3000);
                    }}
                    className={`flex-1 px-3 py-2 rounded-md text-xs font-semibold transition-all ${
                      durationMode === 'preset' && slideshowDuration === 3000
                        ? `${theme.accentBg} text-white shadow`
                        : `${theme.textSec} hover:${theme.textMain}`
                    }`}
                  >
                    3 seg
                  </button>
                  <button
                    onClick={() => {
                      setDurationMode('preset');
                      setSlideshowDuration(5000);
                    }}
                    className={`flex-1 px-3 py-2 rounded-md text-xs font-semibold transition-all ${
                      durationMode === 'preset' && slideshowDuration === 5000
                        ? `${theme.accentBg} text-white shadow`
                        : `${theme.textSec} hover:${theme.textMain}`
                    }`}
                  >
                    5 seg
                  </button>
                  <button
                    onClick={() => {
                      setDurationMode('preset');
                      setSlideshowDuration(10000);
                    }}
                    className={`flex-1 px-3 py-2 rounded-md text-xs font-semibold transition-all ${
                      durationMode === 'preset' && slideshowDuration === 10000
                        ? `${theme.accentBg} text-white shadow`
                        : `${theme.textSec} hover:${theme.textMain}`
                    }`}
                  >
                    10 seg
                  </button>
                  <button
                    onClick={() => {
                      setDurationMode('custom');
                      setCustomDuration((slideshowDuration / 1000).toString());
                    }}
                    className={`flex-1 px-3 py-2 rounded-md text-xs font-semibold transition-all ${
                      durationMode === 'custom'
                        ? `${theme.accentBg} text-white shadow`
                        : `${theme.textSec} hover:${theme.textMain}`
                    }`}
                  >
                    Personalizado
                  </button>
                </div>
                {durationMode === 'custom' && (
                  <div className="mt-3">
                    <Input
                      type="number"
                      value={customDuration}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '' || val === '-') {
                          setCustomDuration('');
                        } else {
                          const seconds = parseFloat(val);
                          if (!isNaN(seconds) && seconds >= 1 && seconds <= 20) {
                            setCustomDuration(val);
                            setSlideshowDuration(seconds * 1000);
                          } else if (!isNaN(seconds) && seconds > 20) {
                            setCustomDuration('20');
                            setSlideshowDuration(20000);
                          } else if (!isNaN(seconds) && seconds < 1) {
                            setCustomDuration('1');
                            setSlideshowDuration(1000);
                          }
                        }
                      }}
                      onBlur={(e) => {
                        const seconds = parseFloat(e.target.value) || 1;
                        const clampedSeconds = Math.max(1, Math.min(20, seconds));
                        setCustomDuration(clampedSeconds.toString());
                        setSlideshowDuration(clampedSeconds * 1000);
                      }}
                      min="1"
                      max="20"
                      placeholder="1-20 segundos"
                      theme={theme}
                    />
                    <p className={`text-xs ${theme.textMuted} mt-2`}>
                      Tiempo personalizado (máximo 20 segundos)
                    </p>
                  </div>
                )}
              </div>
              <div>
                <label className={`text-xs uppercase tracking-wider ${theme.textSec} font-semibold mb-3 block flex items-center gap-2`}>
                  <Zap size={14} /> Tipo de Animación
                </label>
                <div className={`flex items-center gap-2 p-1 ${theme.bgCard} rounded-lg border ${theme.border}`}>
                  <button
                    onClick={() => setSlideshowAnimation('smooth')}
                    className={`flex-1 px-3 py-2 rounded-md text-xs font-semibold transition-all ${
                      slideshowAnimation === 'smooth'
                        ? `${theme.accentBg} text-white shadow`
                        : `${theme.textSec} hover:${theme.textMain}`
                    }`}
                  >
                    Suave
                  </button>
                  <button
                    onClick={() => setSlideshowAnimation('plain')}
                    className={`flex-1 px-3 py-2 rounded-md text-xs font-semibold transition-all ${
                      slideshowAnimation === 'plain'
                        ? `${theme.accentBg} text-white shadow`
                        : `${theme.textSec} hover:${theme.textMain}`
                    }`}
                  >
                    Simple
                  </button>
                </div>
                <p className={`text-xs ${theme.textMuted} mt-2`}>
                  {slideshowAnimation === 'smooth' 
                    ? 'Transiciones suaves con efecto de desvanecimiento' 
                    : 'Cambios instantáneos sin animación'}
                </p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button 
                variant="primary" 
                onClick={() => setShowVisionBoardConfig(false)} 
                theme={theme} 
                className="flex-1"
              >
                Guardar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Close Confirmation Modal */}
      {showSettingsCloseConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className={`w-full max-w-md p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-2xl border ${theme.bgCard} ${theme.border} transform transition-all scale-100 mx-2 sm:mx-4 max-h-[95vh] overflow-y-auto`}>
            <div className="flex items-center gap-3 mb-6">
              <div className={`p-3 rounded-xl ${theme.accentBg}/20 border ${theme.accentBorder}/50`}>
                <AlertTriangle className={theme.accentText} size={24} />
              </div>
              <div>
                <h3 className={clsx("text-xl font-bold", theme.textMain)}>¿Descartar Cambios?</h3>
                <p className={`text-sm ${theme.textSec} mt-1`}>Tienes cambios sin guardar</p>
              </div>
            </div>
            <div className={`${theme.bgSec} border ${theme.border} rounded-lg p-4 mb-6`}>
              <p className={`text-sm ${theme.textMain} mb-2`}>Los siguientes cambios se perderán:</p>
              <ul className={`text-xs ${theme.textSec} space-y-1 list-disc list-inside`}>
                {settingsBalance !== accountBalance && (
                  <li>Balance Inicial: {accountBalance} → {typeof settingsBalance === 'number' ? settingsBalance : settingsBalance || 0}</li>
                )}
                {settingsTheme !== currentTheme && (
                  <li>Tema: {THEMES[currentTheme]?.name} → {THEMES[settingsTheme]?.name}</li>
                )}
              </ul>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="ghost" 
                onClick={() => {
                  // Discard changes - reset to original values
                  setSettingsBalance(accountBalance);
                  setSettingsTheme(currentTheme);
                  setShowSettingsCloseConfirm(false);
                  setShowSettings(false);
                }} 
                theme={theme} 
                className="flex-1"
              >
                Descartar
              </Button>
              <Button 
                onClick={() => {
                  // Save changes and close
                  setAccountBalance(typeof settingsBalance === 'number' ? settingsBalance : parseFloat(settingsBalance) || 0);
                  setCurrentTheme(settingsTheme);
                  setShowSettingsCloseConfirm(false);
                  setShowSettings(false);
                }} 
                theme={theme} 
                className="flex-1"
              >
                Guardar y Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className={`w-full max-w-md p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-2xl border ${theme.bgCard} ${theme.border} transform transition-all scale-100 mx-2 sm:mx-4 max-h-[95vh] overflow-y-auto`}>
            {resetStep === 1 && (
              <>
                <div className="flex items-center gap-3 mb-6">
                  <div className={`p-3 rounded-xl bg-rose-600/20 border border-rose-500/50`}>
                    <AlertTriangle className="text-rose-500" size={24} />
                  </div>
                  <div>
                    <h3 className={clsx("text-xl font-bold", theme.textMain)}>¿Resetear Todos los Datos?</h3>
                    <p className={`text-sm ${theme.textSec} mt-1`}>Esta acción no se puede deshacer</p>
                  </div>
                </div>
                <div className={`${theme.bgSec} border ${theme.border} rounded-lg p-4 mb-6`}>
                  <p className={`text-sm ${theme.textMain} mb-3`}>Se eliminará permanentemente:</p>
                  <ul className={`text-xs ${theme.textSec} space-y-2 list-disc list-inside`}>
                    <li>Todas las operaciones registradas ({entries.length} entradas)</li>
                    <li>Todos los pares personalizados ({availablePairs.length} pares)</li>
                    <li>Todas las imágenes del vision board ({motivationalImages.length} imágenes)</li>
                    <li>El balance inicial y configuración</li>
                  </ul>
                </div>
                <div className="flex gap-3">
                  <Button variant="ghost" onClick={handleResetCancel} theme={theme} className="flex-1">Cancelar</Button>
                  <Button variant="danger" onClick={() => setResetStep(2)} theme={theme} className="flex-1">Continuar</Button>
                </div>
              </>
            )}
            {resetStep === 2 && (
              <>
                <div className="flex items-center gap-3 mb-6">
                  <div className={`p-3 rounded-xl ${theme.accentBg}/20 border ${theme.accentBorder}/50`}>
                    <Download className={theme.accentText} size={24} />
                  </div>
                  <div>
                    <h3 className={clsx("text-xl font-bold", theme.textMain)}>Exportar Antes de Resetear</h3>
                    <p className={`text-sm ${theme.textSec} mt-1`}>Recomendamos exportar tus datos</p>
                  </div>
                </div>
                <div className={`${theme.bgSec} border ${theme.border} rounded-lg p-4 mb-6`}>
                  <p className={`text-sm ${theme.textMain} mb-3`}>
                    {entries.length > 0 
                      ? `Tienes ${entries.length} operaciones registradas. ¿Deseas exportarlas antes de eliminar todo?`
                      : 'No hay operaciones para exportar.'}
                  </p>
                  <p className={`text-xs ${theme.textMuted}`}>
                    El archivo CSV incluirá todas tus operaciones con fechas, pares, resultados y notas.
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button variant="ghost" onClick={handleResetCancel} theme={theme} className="flex-1">Cancelar</Button>
                  {entries.length > 0 && (
                    <Button variant="outline" onClick={handleResetExportAndContinue} theme={theme} className="flex-1 flex items-center justify-center gap-2">
                      <Download size={16} /> Exportar y Continuar
                    </Button>
                  )}
                  <Button variant="danger" onClick={handleResetSkipExport} theme={theme} className="flex-1">
                    {entries.length > 0 ? 'Omitir Exportación' : 'Continuar'}
                  </Button>
                </div>
              </>
            )}
            {resetStep === 3 && (
              <>
                <div className="flex items-center gap-3 mb-6">
                  <div className={`p-3 rounded-xl bg-rose-600/20 border border-rose-500/50`}>
                    <AlertTriangle className="text-rose-500" size={24} />
                  </div>
                  <div>
                    <h3 className={clsx("text-xl font-bold", theme.textMain)}>Confirmación Final</h3>
                    <p className={`text-sm ${theme.textSec} mt-1`}>Última oportunidad</p>
                  </div>
                </div>
                <div className={`${theme.bgSec} border-2 border-rose-500/50 rounded-lg p-4 mb-6`}>
                  <p className={`text-sm font-bold text-rose-400 mb-2 text-center`}>
                    ⚠️ ESTA ACCIÓN ES IRREVERSIBLE ⚠️
                  </p>
                  <p className={`text-sm ${theme.textMain} text-center`}>
                    ¿Estás completamente seguro de que deseas eliminar todos los datos del journal?
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button variant="ghost" onClick={handleResetCancel} theme={theme} className="flex-1">Cancelar</Button>
                  <Button variant="danger" onClick={handleResetConfirm} theme={theme} className="flex-1 flex items-center justify-center gap-2">
                    <Trash2 size={18} /> Sí, Eliminar Todo
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Add Entry Modal */}
      {isAddEntryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className={`w-full max-w-md p-6 rounded-2xl shadow-2xl border ${theme.bgCard} ${theme.border} transform transition-all scale-100`}>
            <div className="flex justify-between items-center mb-6"><h3 className={clsx("text-xl font-bold", theme.textMain, "flex items-center gap-2")}><Plus className={theme.accentText} size={24} /> Nueva Operativa</h3><button onClick={() => setIsAddEntryModalOpen(false)} className={`${theme.textMuted} hover:${theme.textMain} transition-colors`}><X size={20} /></button></div>
            <form onSubmit={handleAddEntry} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3"><Select label="Par" value={formState.pair} onChange={(e) => setFormState({...formState, pair: e.target.value})} options={availablePairs} theme={theme} /><div className={`flex ${theme.bgInput} rounded-lg border ${theme.border} p-1`}><button type="button" onClick={() => setFormState({...formState, type: 'BUY'})} className={`flex-1 text-xs font-bold rounded transition-all ${formState.type === 'BUY' ? 'bg-blue-600 text-white shadow' : `${theme.textMuted} hover:${theme.textMain}`}`}>BUY</button><button type="button" onClick={() => setFormState({...formState, type: 'SELL'})} className={`flex-1 text-xs font-bold rounded transition-all ${formState.type === 'SELL' ? 'bg-orange-600 text-white shadow' : `${theme.textMuted} hover:${theme.textMain}`}`}>SELL</button></div></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3"><Select label="R:R" value={formState.rr} onChange={(e) => setFormState({...formState, rr: e.target.value})} options={RR_OPTIONS} theme={theme} /><Input type="number" value={formState.pnl} onChange={(e) => setFormState({...formState, pnl: e.target.value})} placeholder="P/L ($)" theme={theme} /></div>
              <div className="w-full"><Input label="Trading View URL:" value={formState.screenshotUrl} onChange={(e) => setFormState({...formState, screenshotUrl: e.target.value})} placeholder="https://www.tradingview.com/x/..." theme={theme} /></div>
              <div className="w-full"><textarea value={formState.notes} onChange={(e) => setFormState({...formState, notes: e.target.value})} placeholder="Comentarios / Pensamientos..." className={`${theme.bgInput} border ${theme.border} ${theme.textMain} px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:${theme.accentRing} transition-all placeholder-opacity-40 resize-none h-24 w-full text-sm`} /></div>
              <div className="flex gap-3 pt-2"><Button onClick={() => setIsAddEntryModalOpen(false)} variant="ghost" theme={theme} className="flex-1">Cancelar</Button><Button type="submit" className="flex-1" theme={theme}>Agregar Entrada</Button></div>
            </form>
          </div>
        </div>
      )}

      {/* View Entry Modal */}
      {isViewEntryModalOpen && viewingEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className={`w-full max-w-md p-6 rounded-2xl shadow-2xl border ${theme.bgCard} ${theme.border} transform transition-all scale-100`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className={clsx("text-xl font-bold", theme.textMain, "flex items-center gap-2")}>
                <Activity className={theme.accentText} size={24} /> Detalles de la Operativa
              </h3>
              <button onClick={() => { setIsViewEntryModalOpen(false); setViewingEntry(null); }} className={`${theme.textMuted} hover:${theme.textMain} transition-colors`}>
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Trade Type and Pair */}
              <div className="flex items-center gap-3">
                <span className={`text-xs font-bold px-3 py-1.5 rounded uppercase ${viewingEntry.type === 'BUY' ? 'bg-blue-500/20 text-blue-400' : 'bg-orange-500/20 text-orange-400'}`}>
                  {viewingEntry.type}
                </span>
                <span className={clsx("font-bold text-2xl", theme.textMain)}>{viewingEntry.pair}</span>
              </div>

              {/* P/L Result */}
              <div className={`${theme.bgSec} border ${theme.border} rounded-lg p-4`}>
                <div className={`text-xs ${theme.textMuted} uppercase font-bold tracking-wider mb-2`}>Resultado</div>
                <div className={`text-3xl font-mono font-bold ${viewingEntry.pnl >= 0 ? 'text-emerald-400' : viewingEntry.pnl === 0 ? 'text-yellow-400' : 'text-rose-400'}`}>
                  {viewingEntry.pnl >= 0 ? '+' : ''}{viewingEntry.pnl}$
                </div>
              </div>

              {/* Risk:Reward */}
              <div className={`${theme.bgSec} border ${theme.border} rounded-lg p-4`}>
                <div className={`text-xs ${theme.textMuted} uppercase font-bold tracking-wider mb-2 flex items-center gap-2`}>
                  <Target size={14} /> Risk:Reward
                </div>
                <div className={clsx("text-lg font-bold", theme.textMain)}>{viewingEntry.rr}</div>
              </div>

              {/* Trading View URL */}
              {viewingEntry.screenshotUrl && (
                <div className={`${theme.bgSec} border ${theme.border} rounded-lg p-4`}>
                  <div className={`text-xs ${theme.textMuted} uppercase font-bold tracking-wider mb-2 flex items-center gap-2`}>
                    <ExternalLink size={14} /> Trading View URL
                  </div>
                  <a 
                    href={viewingEntry.screenshotUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className={clsx("text-sm break-all hover:underline", theme.accentText)}
                  >
                    {viewingEntry.screenshotUrl}
                  </a>
                </div>
              )}

              {/* Notes */}
              {viewingEntry.notes && (
                <div className={`${theme.bgSec} border ${theme.border} rounded-lg p-4`}>
                  <div className={`text-xs ${theme.textMuted} uppercase font-bold tracking-wider mb-2 flex items-center gap-2`}>
                    <MessageSquare size={14} /> Comentarios
                  </div>
                  <p className={clsx("text-sm whitespace-pre-wrap", theme.textMain)}>{viewingEntry.notes}</p>
                </div>
              )}

              {/* Date */}
              <div className={`${theme.bgSec} border ${theme.border} rounded-lg p-4`}>
                <div className={`text-xs ${theme.textMuted} uppercase font-bold tracking-wider mb-2 flex items-center gap-2`}>
                  <Calendar size={14} /> Fecha
                </div>
                <div className={clsx("text-sm", theme.textMain)}>
                  {new Date(viewingEntry.date).toLocaleDateString('es-ES', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <Button 
                  onClick={() => { setIsViewEntryModalOpen(false); setViewingEntry(null); }} 
                  variant="ghost" 
                  theme={theme} 
                  className="flex-1"
                >
                  Cerrar
                </Button>
                <Button 
                  onClick={() => handleEditEntry(viewingEntry)} 
                  theme={theme} 
                  className="flex-1"
                >
                  <Edit2 size={18} /> Editar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Entry Modal */}
      {isEditEntryModalOpen && editingEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className={`w-full max-w-md p-6 rounded-2xl shadow-2xl border ${theme.bgCard} ${theme.border} transform transition-all scale-100`}>
            <div className="flex justify-between items-center mb-6"><h3 className={clsx("text-xl font-bold", theme.textMain, "flex items-center gap-2")}><Edit2 className={theme.accentText} size={24} /> Editar Operativa</h3><button onClick={() => { setIsEditEntryModalOpen(false); setEditingEntry(null); setFormState({ pair: '', type: 'BUY', rr: '', pnl: '', notes: '', screenshotUrl: '' }); }} className={`${theme.textMuted} hover:${theme.textMain} transition-colors`}><X size={20} /></button></div>
            <form onSubmit={handleUpdateEntry} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3"><Select label="Par" value={formState.pair} onChange={(e) => setFormState({...formState, pair: e.target.value})} options={availablePairs} theme={theme} /><div className={`flex ${theme.bgInput} rounded-lg border ${theme.border} p-1`}><button type="button" onClick={() => setFormState({...formState, type: 'BUY'})} className={`flex-1 text-xs font-bold rounded transition-all ${formState.type === 'BUY' ? 'bg-blue-600 text-white shadow' : `${theme.textMuted} hover:${theme.textMain}`}`}>BUY</button><button type="button" onClick={() => setFormState({...formState, type: 'SELL'})} className={`flex-1 text-xs font-bold rounded transition-all ${formState.type === 'SELL' ? 'bg-orange-600 text-white shadow' : `${theme.textMuted} hover:${theme.textMain}`}`}>SELL</button></div></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3"><Select label="R:R" value={formState.rr} onChange={(e) => setFormState({...formState, rr: e.target.value})} options={RR_OPTIONS} theme={theme} /><Input type="number" value={formState.pnl} onChange={(e) => setFormState({...formState, pnl: e.target.value})} placeholder="P/L ($)" theme={theme} /></div>
              <div className="w-full"><Input label="Trading View URL:" value={formState.screenshotUrl} onChange={(e) => setFormState({...formState, screenshotUrl: e.target.value})} placeholder="https://www.tradingview.com/x/..." theme={theme} /></div>
              <div className="w-full"><textarea value={formState.notes} onChange={(e) => setFormState({...formState, notes: e.target.value})} placeholder="Comentarios / Pensamientos..." className={`${theme.bgInput} border ${theme.border} ${theme.textMain} px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:${theme.accentRing} transition-all placeholder-opacity-40 resize-none h-24 w-full text-sm`} /></div>
              <div className="flex gap-3 pt-2">
                <Button 
                  onClick={() => { 
                    setIsEditEntryModalOpen(false); 
                    setEditingEntry(null); 
                    setFormState({ pair: '', type: 'BUY', rr: '', pnl: '', notes: '', screenshotUrl: '' }); 
                  }} 
                  variant="ghost" 
                  theme={theme} 
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1" theme={theme}>
                  Guardar Cambios
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <main className="flex-1 flex overflow-hidden relative">
        {/* Main Calendar Area - Full width on mobile/tablet */}
        <div className="flex-1 w-full flex flex-col p-2 lg:p-4 overflow-hidden relative">
          <div className="flex items-center justify-between mb-2 lg:mb-4 shrink-0 gap-2">
            <div className="flex items-center gap-2 lg:gap-4 flex-1 min-w-0">
              <h2 className={clsx("text-xl lg:text-3xl font-bold", theme.textMain, "capitalize truncate")}>{currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}</h2>
            </div>
            <div className={`flex gap-1 ${theme.bgCard} p-1 rounded-lg border ${theme.border} shrink-0`}>
              <button onClick={() => changeMonth(-1)} className={`p-1.5 hover:${theme.bgSec} rounded ${theme.textSec} hover:${theme.textMain}`}><ChevronLeft size={18}/></button>
              <button onClick={() => setCurrentDate(new Date())} className={`px-2 lg:px-3 text-xs font-bold ${theme.textSec} hover:${theme.textMain}`}>HOY</button>
              <button onClick={() => changeMonth(1)} className={`p-1.5 hover:${theme.bgSec} rounded ${theme.textSec} hover:${theme.textMain}`}><ChevronRight size={18}/></button>
            </div>
          </div>
          
          {/* Mobile/Tablet: Round Card Calendar - Keep rounded cards until desktop */}
          <div className={`lg:hidden flex-1 overflow-y-auto w-full`}>
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2 p-2 sm:p-4 w-full">
              {renderCalendarDaysMobile()}
            </div>
          </div>
          
          {/* Desktop: Grid Calendar */}
          <div className={`hidden lg:flex flex-1 ${theme.bgCard50} border ${theme.border} rounded-2xl shadow-2xl overflow-hidden flex-col min-h-0`}>
            <div className={`grid grid-cols-7 border-b ${theme.border} ${theme.bgSec} opacity-90 shrink-0`}>{['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'].map(day => (<div key={day} className={`py-2 text-center font-bold ${theme.textMuted} text-xs uppercase tracking-widest`}>{day}</div>))}</div>
            <div className={`flex-1 overflow-y-auto min-h-0`}>
              <div className={`grid grid-cols-7 gap-px ${theme.border} bg-opacity-20`} style={{ gridAutoRows: 'minmax(100px, auto)' }}>{renderCalendarDays()}</div>
            </div>
          </div>
        </div>

        {/* Mobile/Tablet/Laptop Metrics Modal */}
        {showMetrics && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 xl:hidden">
            <div className={`w-full max-w-md mx-4 max-h-[90vh] ${theme.bgCard} border ${theme.border} rounded-2xl shadow-2xl flex flex-col overflow-hidden`}>
              <div className={`p-4 border-b ${theme.borderSec} ${theme.bgCard50} flex justify-between items-center shrink-0`}>
                <h3 className={clsx("text-lg font-bold", theme.textMain, "flex items-center gap-2")}>
                  <BarChart3 size={20} /> Métricas
                </h3>
                <button onClick={() => setShowMetrics(false)} className={`${theme.textMuted} hover:${theme.textMain} transition-colors`}>
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className={`${theme.bgSec} p-4 rounded-lg border ${theme.border}`}>
                  <h4 className={`text-sm font-bold ${theme.textMain} mb-3 flex items-center gap-2`}>
                    <Activity size={16} /> Global
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className={`text-xs ${theme.textMuted} mb-1`}>Win Rate</div>
                      <div className={`text-lg font-bold ${metrics.global.winRate >= 50 ? 'text-emerald-400' : 'text-orange-400'}`}>{metrics.global.winRate.toFixed(1)}%</div>
                    </div>
                    <div>
                      <div className={`text-xs ${theme.textMuted} mb-1`}>Total Trades</div>
                      <div className={`text-lg font-bold ${theme.textMain}`}>{metrics.global.count}</div>
                    </div>
                    <div>
                      <div className={`text-xs ${theme.textMuted} mb-1`}>Wins</div>
                      <div className={`text-lg font-bold text-emerald-400`}>{showMetricsAsPercentage && metrics.global.count > 0 ? `${((metrics.global.wins / metrics.global.count) * 100).toFixed(1)}%` : metrics.global.wins}</div>
                    </div>
                    <div>
                      <div className={`text-xs ${theme.textMuted} mb-1`}>Losses</div>
                      <div className={`text-lg font-bold text-rose-400`}>{showMetricsAsPercentage && metrics.global.count > 0 ? `${((metrics.global.losses / metrics.global.count) * 100).toFixed(1)}%` : metrics.global.losses}</div>
                    </div>
                    <div>
                      <div className={`text-xs ${theme.textMuted} mb-1`}>Break Even</div>
                      <div className={`text-lg font-bold text-yellow-400`}>{showMetricsAsPercentage && metrics.global.count > 0 ? `${((metrics.global.breakEven / metrics.global.count) * 100).toFixed(1)}%` : metrics.global.breakEven}</div>
                    </div>
                    <div>
                      <div className={`text-xs ${theme.textMuted} mb-1`}>P/L Total</div>
                      <div className={`text-lg font-bold ${metrics.global.val >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{metrics.global.val >= 0 ? '+' : ''}{metrics.global.val}$</div>
                    </div>
                    <div className="col-span-2">
                      <div className={`text-xs ${theme.textMuted} mb-1`}>Balance Total</div>
                      <div className={`text-xl font-bold ${metrics.currentBalance >= accountBalance ? 'text-emerald-400' : 'text-rose-400'}`}>{metrics.currentBalance.toLocaleString()}$</div>
                    </div>
                  </div>
                </div>
                <div className={`${theme.bgSec} p-4 rounded-lg border ${theme.border}`}>
                  <h4 className={`text-sm font-bold ${theme.textMain} mb-3 flex items-center gap-2`}>
                    <TrendingUp size={16} /> Períodos
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <div className={`text-xs ${theme.textMuted} mb-1`}>Semana</div>
                      <div className={`text-base font-bold ${metrics.weekly.val >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {showMetricsAsPercentage && accountBalance > 0 ? `${((metrics.weekly.val / accountBalance) * 100).toFixed(1)}%` : `${metrics.weekly.val >= 0 ? '+' : ''}${metrics.weekly.val}$`} ({metrics.weekly.count} trades)
                      </div>
                    </div>
                    <div>
                      <div className={`text-xs ${theme.textMuted} mb-1`}>Mes</div>
                      <div className={`text-base font-bold ${metrics.monthly.val >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {showMetricsAsPercentage && accountBalance > 0 ? `${((metrics.monthly.val / accountBalance) * 100).toFixed(1)}%` : `${metrics.monthly.val >= 0 ? '+' : ''}${metrics.monthly.val}$`} ({metrics.monthly.count} trades)
                      </div>
                    </div>
                    <div>
                      <div className={`text-xs ${theme.textMuted} mb-1`}>Año</div>
                      <div className={`text-base font-bold ${metrics.annual.val >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {showMetricsAsPercentage && accountBalance > 0 ? `${((metrics.annual.val / accountBalance) * 100).toFixed(1)}%` : `${metrics.annual.val >= 0 ? '+' : ''}${metrics.annual.val}$`} ({metrics.annual.count} trades)
                      </div>
                    </div>
                  </div>
                </div>
                <div className={`${theme.bgSec} p-4 rounded-lg border ${theme.border} flex items-center justify-between`}>
                  <span className={`text-sm ${theme.textMain} font-medium`}>Mostrar como porcentaje</span>
                  <button
                    onClick={() => setShowMetricsAsPercentage(!showMetricsAsPercentage)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      showMetricsAsPercentage ? theme.accentBg : `${theme.bgCard} ${theme.border} border`
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        showMetricsAsPercentage ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Sidebar Overlay - Vision Board */}
        {showSidebar && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 sm:hidden"
            onClick={() => setShowSidebar(false)}
          />
        )}

        <div className={`${showSidebar ? 'translate-x-0' : '-translate-x-full'} sm:translate-x-0 fixed sm:relative inset-y-0 left-0 w-80 sm:w-80 ${theme.bgSec} border-l ${theme.borderSec} flex flex-col shadow-2xl z-50 sm:z-10 transition-transform duration-300 ease-in-out`}>
          {selectedDate ? (
            <div className="flex flex-col h-full animate-in slide-in-from-right-10 duration-300">
              <div className={`p-4 sm:p-6 border-b ${theme.borderSec} ${theme.bgCard50}`}>
                <Button variant="ghost" size="sm" onClick={() => { handleBackToDashboard(); setShowSidebar(false); }} className={`mb-4 -ml-2 ${theme.textSec}`} theme={theme}><ArrowLeft size={16} /> Volver</Button>
                <h3 className={clsx("text-xl sm:text-2xl font-bold", theme.textMain, "flex items-center gap-2")}><Calendar className={theme.accentText} size={24} />{selectedDate.getDate()} de {selectedDate.toLocaleDateString('es-ES', { month: 'long' })}</h3>
                <div className="flex justify-between items-end mt-4"><div><div className={`text-xs ${theme.textMuted} uppercase font-bold tracking-wider`}>Resultado</div><div className={`text-2xl sm:text-3xl font-mono font-bold ${metrics.daily.val >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{metrics.daily.val >= 0 ? '+' : ''}{metrics.daily.val}$</div></div><div className="text-right"><div className={`text-xs ${theme.textMuted} uppercase font-bold`}>Trades</div><div className={clsx("text-lg sm:text-xl font-bold", theme.textMain)}>{metrics.daily.count}</div></div></div>
              </div>
              <div className={`flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 ${theme.bgSec}`}>
                {entries.filter(e => isSameDay(new Date(e.date), selectedDate)).length === 0 ? (
                  <div className="text-center py-20 opacity-40"><PieChart size={64} className={`mx-auto mb-4 ${theme.textMuted}`} /><p className={theme.textSec}>Sin operaciones este día</p></div>
                ) : (
                  entries.filter(e => isSameDay(new Date(e.date), selectedDate)).map(entry => (
                    <div key={entry.id} onClick={() => { handleViewEntry(entry); setShowSidebar(false); }} className={`${theme.bgCard} p-3 sm:p-4 rounded-lg sm:rounded-xl border ${theme.border} flex flex-col gap-2 sm:gap-3 group hover:${theme.borderSec} transition-all cursor-pointer`}>
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap"><span className={`text-[10px] font-bold px-2 py-1 rounded uppercase shrink-0 ${entry.type === 'BUY' ? 'bg-blue-500/20 text-blue-400' : 'bg-orange-500/20 text-orange-400'}`}>{entry.type}</span><span className={`font-bold ${theme.textMain} text-base sm:text-lg truncate`}>{entry.pair}</span>{entry.screenshotUrl && (<a href={entry.screenshotUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className={`ml-1 p-1 rounded hover:${theme.bgSec} ${theme.textMuted} hover:${theme.accentText} transition-colors shrink-0`} title="Ver Captura"><ExternalLink size={12} /></a>)}</div>
                          <div className={`text-xs ${theme.textMuted} font-medium flex items-center gap-2`}><Target size={12} /> R:R {entry.rr}</div>
                        </div>
                        <div className="text-right shrink-0"><div className={`font-mono text-base sm:text-lg font-bold ${entry.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{entry.pnl >= 0 ? '+' : ''}{entry.pnl}$</div><button onClick={(e) => { e.stopPropagation(); handleDeleteEntry(entry.id); }} className={`${theme.textSec} hover:text-rose-500 transition-colors mt-1 sm:mt-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100`}><Trash2 size={14} /></button></div>
                      </div>
                      {entry.notes && (<div className={`text-xs ${theme.textMuted} italic border-t ${theme.borderSec} pt-2 mt-1 flex gap-2 items-start`}><MessageSquare size={12} className="mt-0.5 opacity-50 shrink-0" /><span className="line-clamp-2 sm:hover:line-clamp-none transition-all">{entry.notes}</span></div>)}
                    </div>
                  ))
                )}
              </div>
              <div className={`p-3 sm:p-5 ${theme.bgCard} border-t ${theme.border}`}><Button onClick={() => { setIsAddEntryModalOpen(true); setShowSidebar(false); }} className="w-full py-2 sm:py-3 text-sm sm:text-base" theme={theme}><Plus size={18} /> Añadir Nueva Entrada</Button></div>
            </div>
          ) : (
            <div className={`flex flex-col h-full relative transition-all duration-300 ${isDragging ? `${theme.bgCard50} border-2 ${theme.accentBorder} border-dashed` : theme.bgSec}`} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
               <div className={`p-3 sm:p-4 border-b ${theme.borderSec} flex justify-between items-center ${theme.bgSec} sticky top-0 z-10`}>
                 <div className="flex items-center gap-2 sm:gap-3">
                   {/* Mobile: Back button */}
                   <button
                     onClick={() => setShowSidebar(false)}
                     className={`sm:hidden p-1.5 ${theme.bgCard} rounded-lg border ${theme.border} ${theme.textMain} hover:${theme.bgSec} active:scale-95 transition-all`}
                     title="Volver"
                     aria-label="Volver"
                   >
                     <ArrowLeft size={18} />
                   </button>
                   <h3 className={`text-sm font-bold ${theme.textSec} uppercase tracking-wider flex items-center gap-2`}>
                     <ImageIcon size={16} className={theme.accentText} /> Vision Board
                   </h3>
                   {motivationalImages.length >= 3 && (
                     <>
                       <button
                         onClick={toggleSlideshow}
                         className={`p-1.5 rounded-lg transition-all ${isSlideshowActive ? theme.accentBg : theme.bgCard} ${theme.border} border ${isSlideshowActive ? 'text-white' : theme.textSec} hover:${theme.accentBg} hover:text-white`}
                         title={isSlideshowActive ? "Pausar Slideshow" : "Iniciar Slideshow"}
                       >
                         {isSlideshowActive ? <Pause size={14} /> : <Play size={14} />}
                       </button>
                       <button
                         onClick={() => setShowVisionBoardConfig(true)}
                         className={`p-1.5 rounded-lg transition-all ${theme.bgCard} ${theme.border} border ${theme.textSec} hover:${theme.accentBg} hover:text-white`}
                         title="Configuración del Vision Board"
                       >
                         <Settings size={14} />
                       </button>
                     </>
                   )}
                 </div>
                 <div className={`text-[10px] font-bold ${theme.textMuted} ${theme.bgCard} px-2 py-1 rounded`}>{motivationalImages.length} Ítems</div>
               </div>
               <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
                 {motivationalImages.length === 0 ? (
                   <div className={`h-full flex flex-col items-center justify-center text-center ${theme.textMuted} opacity-60 pointer-events-none`}>
                     <UploadCloud size={48} className="mb-4" />
                     <p className="text-sm font-medium mb-1">Arrastra tus imágenes aquí</p>
                     <p className="text-xs max-w-[200px]">Crea tu tablero de motivación.</p>
                   </div>
                 ) : isSlideshowActive && motivationalImages.length >= 3 ? (
                   <div className="flex flex-col h-full min-h-0">
                     <div className={`relative flex-1 min-h-[400px] rounded-xl overflow-hidden border ${theme.border} ${theme.bgCard} group`}>
                       {motivationalImages.map((img, idx) => (
                         <img
                           key={img.id}
                           src={img.src}
                           alt={`Motivation ${idx + 1}`}
                           className={`absolute inset-0 w-full h-full object-cover ${
                             slideshowAnimation === 'smooth' 
                               ? `transition-opacity duration-700 ${idx === slideshowIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`
                               : `${idx === slideshowIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`
                           }`}
                         />
                       ))}
                       <button
                         onClick={(e) => handleDeleteImage(motivationalImages[slideshowIndex]?.id, e)}
                         className="absolute top-2 right-2 bg-black/50 hover:bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm z-20"
                       >
                         <X size={14} />
                       </button>
                       <button
                         onClick={handleSlideshowPrev}
                         className={`absolute left-2 top-1/2 -translate-y-1/2 ${theme.bgCard} ${theme.border} border p-2 rounded-full ${theme.textMain} hover:${theme.accentBg} hover:text-white transition-all opacity-0 group-hover:opacity-100 z-20`}
                       >
                         <ChevronLeft size={18} />
                       </button>
                       <button
                         onClick={handleSlideshowNext}
                         className={`absolute right-2 top-1/2 -translate-y-1/2 ${theme.bgCard} ${theme.border} border p-2 rounded-full ${theme.textMain} hover:${theme.accentBg} hover:text-white transition-all opacity-0 group-hover:opacity-100 z-20`}
                       >
                         <ChevronRight size={18} />
                       </button>
                       <div className={`absolute bottom-4 left-1/2 -translate-x-1/2 ${theme.bgCard}/80 backdrop-blur-sm px-3 py-1.5 rounded-full border ${theme.border} opacity-0 group-hover:opacity-100 transition-opacity z-20`}>
                         <span className={`text-xs font-bold ${theme.textMain}`}>
                           {slideshowIndex + 1} / {motivationalImages.length}
                         </span>
                       </div>
                     </div>
                   </div>
                 ) : (
                   <div className="grid grid-cols-1 gap-4">
                     {motivationalImages.map((img) => (
                       <div key={img.id} className={`group relative rounded-xl overflow-hidden shadow-lg border ${theme.border} ${theme.bgCard}`}>
                         <img src={img.src} alt="Motivation" className="w-full h-auto object-cover hover:scale-105 transition-transform duration-500" />
                         <button onClick={(e) => handleDeleteImage(img.id, e)} className="absolute top-2 right-2 bg-black/50 hover:bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm">
                           <X size={14} />
                         </button>
                       </div>
                     ))}
                   </div>
                 )}
               </div>
               <div className={`p-3 sm:p-4 ${theme.bgSec} border-t ${theme.borderSec} text-center`}><p className={`text-xs ${theme.textMuted} flex items-center justify-center gap-2`}><MousePointerClick size={12} /> Selecciona un día para ver detalles</p></div>
               {isDragging && (<div className={`absolute inset-0 ${theme.bgSec} bg-opacity-90 backdrop-blur-sm flex items-center justify-center z-50 border-2 ${theme.accentBorder} border-dashed rounded-lg m-2 pointer-events-none`}><div className={`text-center ${theme.accentText} animate-bounce`}><UploadCloud size={64} className="mx-auto mb-2" /><h3 className="text-2xl font-bold">Soltar Imagen</h3></div></div>)}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}