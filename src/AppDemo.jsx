/**
 * AppDemo.jsx
 * 
 * Thin wrapper that mounts TradingJournalApp in "Demo Mode":
 *   - Overrides the storage utilities to use LocalStorage instead of Supabase
 *   - Mocks isSupabaseConfigured() → false so Auth screen is never shown
 *   - Injects a small "DEMO" badge + upgrade CTA into the page without touching App.jsx
 * 
 * Implementation strategy:
 *   We override the module functions by monkey-patching the global window scope
 *   via a thin compatibility shim that gets loaded BEFORE App.jsx resolves its imports.
 *   
 *   Actually, since ES module imports are static, we can't intercept them at runtime.
 *   Instead, we set a global flag `window.__DEMO_MODE__ = true` BEFORE any imports
 *   resolve, and the modified storage.js checks this flag to decide which backend to use.
 */

import React, { useEffect } from 'react';
import TradingJournalApp from './App.jsx';
import { ExternalLink, Sparkles, X } from 'lucide-react';

// NOTE: window.__DEMO_MODE__ is set by main.jsx BEFORE this module is imported.
// Do NOT set it here at module level — it would leak into non-demo modes.

// Small floating badge that shows DEMO mode and CTA
function DemoBadge() {
  const [dismissed, setDismissed] = React.useState(false);

  if (dismissed) return null;

  return (
    <div
      style={{ zIndex: 9999 }}
      className="fixed bottom-4 right-4 flex items-center gap-2 bg-slate-900/95 border border-emerald-500/40 text-slate-200 px-3 py-2 rounded-xl shadow-2xl shadow-emerald-500/10 backdrop-blur-sm text-xs font-medium animate-in slide-in-from-bottom-4 duration-500"
    >
      <div className="flex items-center gap-1.5">
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-slate-400">Modo Demo</span>
        <span className="text-slate-600">·</span>
        <span className="text-slate-500">Datos en este dispositivo</span>
      </div>
      <a
        href="/?mode=landing"
        className="flex items-center gap-1 ml-1 bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-2.5 py-1 rounded-lg transition-colors"
      >
        <Sparkles size={11} />
        Premium
        <ExternalLink size={10} />
      </a>
      <button
        onClick={() => setDismissed(true)}
        className="ml-1 text-slate-600 hover:text-slate-400 transition-colors p-0.5"
        aria-label="Cerrar"
      >
        <X size={13} />
      </button>
    </div>
  );
}

export default function AppDemo() {
  // Cleanup demo flag on unmount
  useEffect(() => {
    window.__DEMO_MODE__ = true;
    return () => {
      window.__DEMO_MODE__ = false;
    };
  }, []);

  return (
    <>
      <TradingJournalApp />
      <DemoBadge />
    </>
  );
}
