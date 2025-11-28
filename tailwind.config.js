/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    // Background colors
    'bg-slate-950', 'bg-slate-900', 'bg-slate-800', 'bg-slate-800/50', 'bg-slate-700',
    'bg-zinc-950', 'bg-zinc-900', 'bg-zinc-800', 'bg-zinc-800/50', 'bg-zinc-700',
    'bg-neutral-950', 'bg-neutral-900', 'bg-neutral-800', 'bg-neutral-800/50', 'bg-neutral-700',
    'bg-stone-950', 'bg-stone-900', 'bg-stone-800', 'bg-stone-800/50', 'bg-stone-700',
    // Border colors
    'border-slate-700', 'border-slate-800',
    'border-zinc-700', 'border-zinc-800',
    'border-neutral-700', 'border-neutral-800',
    'border-stone-700', 'border-stone-800',
    // Text colors
    'text-slate-200', 'text-slate-400', 'text-slate-500',
    'text-zinc-200', 'text-zinc-400', 'text-zinc-500',
    'text-neutral-200', 'text-neutral-400', 'text-neutral-500',
    'text-stone-200', 'text-stone-400', 'text-stone-500',
    // Accent colors
    'bg-blue-600', 'hover:bg-blue-500', 'text-blue-500', 'ring-blue-500', 'border-blue-500',
    'bg-violet-600', 'hover:bg-violet-500', 'text-violet-500', 'ring-violet-500', 'border-violet-500',
    'bg-emerald-600', 'hover:bg-emerald-500', 'text-emerald-500', 'ring-emerald-500', 'border-emerald-500',
    'bg-orange-600', 'hover:bg-orange-500', 'text-orange-500', 'ring-orange-500', 'border-orange-500',
    // Hover states
    'hover:bg-slate-700', 'hover:bg-zinc-700', 'hover:bg-neutral-700', 'hover:bg-stone-700',
    'hover:bg-slate-800', 'hover:bg-zinc-800', 'hover:bg-neutral-800', 'hover:bg-stone-800',
    // Focus rings
    'focus:ring-blue-500', 'focus:ring-violet-500', 'focus:ring-emerald-500', 'focus:ring-orange-500',
    // Selection
    'selection:bg-blue-500/30', 'selection:bg-violet-500/30', 'selection:bg-emerald-500/30', 'selection:bg-orange-500/30',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

