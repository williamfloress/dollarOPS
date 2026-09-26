import React, { useState, useEffect, useRef } from 'react';
import {
  TrendingUp,
  Calendar,
  BarChart3,
  Target,
  Brain,
  Zap,
  Trophy,
  ArrowRight,
  Shield,
  Cloud,
  CloudOff,
  Check,
  X,
  Mail,
  Activity,
  Image as ImageIcon,
  Sparkles,
  LogIn,
  Github,
} from 'lucide-react';

// ─── Helpers ───────────────────────────────────────────────────────────────
const cn = (...classes) => classes.filter(Boolean).join(' ');

const APP_NAME = 'DollarOPS';
const APP_SUBTITLE = 'Trading Journal';

// ─── Animated Counter ──────────────────────────────────────────────────────
const Counter = ({ to, suffix = '', duration = 1500 }) => {
  const [value, setValue] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const start = Date.now();
        const tick = () => {
          const elapsed = Date.now() - start;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setValue(Math.round(eased * to));
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [to, duration]);

  return <span ref={ref}>{value.toLocaleString()}{suffix}</span>;
};

// ─── Feature Card ─────────────────────────────────────────────────────────
const FeatureCard = ({ icon: Icon, title, description, delay = 0 }) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.2 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={cn(
        'group relative bg-slate-900/60 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm',
        'transition-all duration-700',
        'hover:border-yellow-500/40 hover:bg-slate-900/80 hover:shadow-xl hover:shadow-yellow-500/5',
        'hover:-translate-y-1',
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      )}
    >
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 bg-slate-800 border border-slate-700 group-hover:border-yellow-500/30 transition-colors">
        <Icon size={22} className="text-yellow-400" />
      </div>
      <h3 className="text-base font-bold text-slate-100 mb-2">{title}</h3>
      <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
    </div>
  );
};

// ─── Plan Card ────────────────────────────────────────────────────────────
const PlanCard = ({ title, badge, price, priceNote, features, excluded, ctaLabel, ctaAction, ctaSecondary, ctaSecondaryAction, highlighted, icon: PlanIcon }) => (
  <div className={cn(
    'relative flex flex-col rounded-2xl p-6 border transition-all duration-300',
    highlighted
      ? 'bg-gradient-to-b from-blue-950/80 to-slate-900/80 border-blue-500/50 shadow-2xl shadow-blue-500/10 scale-[1.02]'
      : 'bg-slate-900/60 border-slate-700/50 hover:border-slate-600'
  )}>
    {highlighted && (
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-slate-900 text-xs font-bold px-4 py-1 rounded-full shadow-lg">
        RECOMENDADO
      </div>
    )}

    <div className="flex items-center gap-3 mb-4">
      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center border', highlighted ? 'bg-blue-500/20 border-blue-500/40' : 'bg-slate-800 border-slate-700')}>
        <PlanIcon size={18} className={highlighted ? 'text-blue-400' : 'text-slate-400'} />
      </div>
      <div>
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-slate-100">{title}</h3>
          {badge && <span className="text-[10px] bg-slate-700 text-slate-400 px-2 py-0.5 rounded-full font-semibold">{badge}</span>}
        </div>
        <p className="text-lg font-mono font-bold text-slate-100 mt-0.5">{price}</p>
        {priceNote && <p className="text-xs text-slate-500 mt-0.5">{priceNote}</p>}
      </div>
    </div>

    <ul className="space-y-2 mb-6 flex-1">
      {features.map((f, i) => (
        <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
          <Check size={14} className={highlighted ? 'text-blue-400' : 'text-yellow-400'} style={{ marginTop: 2, flexShrink: 0 }} />
          <span>{f}</span>
        </li>
      ))}
      {excluded && excluded.map((f, i) => (
        <li key={`x-${i}`} className="flex items-start gap-2 text-sm text-slate-500">
          <X size={14} className="text-slate-600" style={{ marginTop: 2, flexShrink: 0 }} />
          <span>{f}</span>
        </li>
      ))}
    </ul>

    <div className="space-y-2">
      <button
        onClick={ctaAction}
        className={cn(
          'w-full py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2',
          highlighted
            ? 'bg-gradient-to-r from-blue-500 to-blue-400 text-white hover:from-blue-400 hover:to-blue-300 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50'
            : 'bg-gradient-to-r from-yellow-500 to-yellow-400 text-slate-900 hover:from-yellow-400 hover:to-yellow-300 shadow-lg shadow-yellow-500/20 font-bold'
        )}
      >
        {ctaLabel}
        <ArrowRight size={14} />
      </button>
      {/* Secondary CTA for Premium: login link for existing users */}
      {ctaSecondary && (
        <button
          onClick={ctaSecondaryAction}
          className="w-full py-2 rounded-xl text-xs text-slate-500 hover:text-slate-300 transition-colors flex items-center justify-center gap-1.5"
        >
          <LogIn size={12} />
          {ctaSecondary}
        </button>
      )}
    </div>
  </div>
);

// ─── Mini Calendar Preview ────────────────────────────────────────────────
const MiniCalendarPreview = () => {
  const days = [
    { empty: true }, // padding
    { d: 1, pnl: 120, type: 'win' }, { d: 2, pnl: -45, type: 'loss' }, { d: 3, pnl: 0, type: 'be' },
    { d: 4, pnl: 310, type: 'win' }, { d: 5, type: 'off' }, { d: 6, type: 'off' },
    { empty: true },
    { d: 8, pnl: -90, type: 'loss' }, { d: 9, pnl: 230, type: 'win' }, { d: 10, type: 'off' },
    { d: 11, pnl: 150, type: 'win' }, { d: 12, pnl: -30, type: 'loss' }, { d: 13, type: 'off' },
    { d: 14, type: 'off' },
    { d: 15, pnl: 420, type: 'win' }, { d: 16, pnl: -80, type: 'loss' }, { d: 17, pnl: 190, type: 'win' },
    { d: 18, pnl: 0, type: 'be' }, { d: 19, type: 'off' }, { d: 20, type: 'off' },
    { empty: true },
    { d: 22, pnl: 560, type: 'win' }, { d: 23, pnl: -120, type: 'loss' }, { d: 24, pnl: 280, type: 'win' },
  ];

  return (
    <div className="bg-slate-900/80 border border-slate-700/60 rounded-2xl p-4 backdrop-blur-sm shadow-2xl">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-bold text-slate-200">Octubre 2025</span>
        <span className="text-emerald-400 font-mono font-bold text-sm">+$1,430</span>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(d => (
          <div key={d} className="text-[9px] text-slate-500 font-semibold py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, i) => (
          <div key={i} className={cn(
            'aspect-square rounded-lg flex flex-col items-center justify-center text-[10px] font-bold',
            day.empty ? 'opacity-0' : '',
            day.type === 'win' ? 'bg-emerald-900/50 text-emerald-300 border border-emerald-700/40' : '',
            day.type === 'loss' ? 'bg-rose-900/50 text-rose-300 border border-rose-700/40' : '',
            day.type === 'be' ? 'bg-yellow-900/30 text-yellow-300 border border-yellow-700/30' : '',
            day.type === 'off' ? 'bg-slate-800/50 text-slate-600 border border-slate-700/30' : '',
          )}>
            {!day.empty && <span>{day.d}</span>}
            {day.type === 'win' && <span className="text-[8px] text-emerald-400">+{day.pnl}</span>}
            {day.type === 'loss' && <span className="text-[8px] text-rose-400">{day.pnl}</span>}
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Metrics Preview ──────────────────────────────────────────────────────
const MetricsPreview = () => (
  <div className="grid grid-cols-2 gap-2">
    {[
      { label: 'Win Rate', value: '68.4%', color: 'text-emerald-400', icon: TrendingUp },
      { label: 'Total Trades', value: '142', color: 'text-slate-200', icon: Activity },
      { label: 'Profit Factor', value: '2.14', color: 'text-emerald-400', icon: BarChart3 },
      { label: 'Net P&L', value: '+$4,830', color: 'text-emerald-400', icon: Target },
    ].map(({ label, value, color, icon: Icon }) => (
      <div key={label} className="bg-slate-900/70 border border-slate-700/50 rounded-xl p-3 flex flex-col gap-1">
        <div className="flex items-center gap-1.5">
          <Icon size={12} className="text-slate-500" />
          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">{label}</span>
        </div>
        <span className={cn('text-lg font-mono font-bold', color)}>{value}</span>
      </div>
    ))}
  </div>
);

// ─── Main Landing Page ────────────────────────────────────────────────────
export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const goToDemo = () => { window.location.href = '/?mode=demo'; };
  const goToApp = () => { window.location.href = '/?mode=app'; };
  const goToPremium = () => {
    window.location.href = 'mailto:contact@dollarops.pro?subject=Solicitud%20de%20Acceso%20Premium%20DollarOPS&body=Hola%2C%20estoy%20interesado%20en%20acceder%20a%20la%20versi%C3%B3n%20premium%20de%20DollarOPS.%0A%0ANombre%3A%20%0AEmail%3A%20%0AExperiencia%20en%20trading%3A%20';
  };

  const features = [
    { icon: Calendar, title: 'Calendario Visual de Trades', description: 'Visualiza cada día del mes con el P&L de tus operaciones. Verde para profits, rojo para losses, todo de un vistazo.', delay: 0 },
    { icon: BarChart3, title: 'Métricas en Tiempo Real', description: 'Win rate, profit factor, P&L diario/semanal/mensual/anual. Todo calculado automáticamente mientras registras tus trades.', delay: 80 },
    { icon: Brain, title: 'Registro de Pensamientos', description: 'Documenta tu mentalidad, análisis pre-trade y reflexiones post-mercado. El diario mental que todo trader necesita.', delay: 160 },
    { icon: Sparkles, title: 'Temas Personalizables', description: 'Elige entre múltiples temas oscuros y claros. Dark mode, light mode, y paletas de colores para cada estilo.', delay: 0 },
    { icon: ImageIcon, title: 'Vision Board (Premium)', description: 'Sube imágenes motivacionales, gráficos y referencias. Slideshow automático para mantener el foco en tus metas.', delay: 80 },
    { icon: Trophy, title: 'Challenge Mode (Premium)', description: 'Simula evaluaciones de firmas prop trading. Sigue tus fases, límites de pérdida diaria y targets de rentabilidad.', delay: 160 },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans overflow-x-hidden">

      {/* ── Fixed Nav ─────────────────────────────────────────────── */}
      <nav className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled ? 'bg-slate-950/90 backdrop-blur-md border-b border-slate-800/60 shadow-lg' : 'bg-transparent'
      )}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <img src="/icon.png" alt="DollarOPS" className="w-8 h-8 rounded-xl object-cover shadow-md" />
            <div className="flex flex-col leading-none">
              <span className="font-extrabold text-slate-100 text-sm tracking-tight">{APP_NAME}</span>
              <span className="text-[10px] text-slate-500 font-medium tracking-wider uppercase">{APP_SUBTITLE}</span>
            </div>
          </div>

          {/* Nav actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Login button for existing users */}
            <button
              onClick={goToApp}
              className="hidden sm:flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-800/60"
            >
              <LogIn size={14} />
              Iniciar sesión
            </button>
            <button
              onClick={goToDemo}
              className="hidden sm:block text-sm text-slate-400 hover:text-slate-200 transition-colors"
            >
              Demo
            </button>
            <button
              onClick={goToPremium}
              className="flex items-center gap-1.5 bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-400 hover:to-yellow-300 text-slate-900 font-bold text-sm px-4 py-1.5 rounded-lg transition-all shadow-lg shadow-yellow-500/20"
            >
              <Mail size={13} />
              <span className="hidden sm:inline">Acceso Premium</span>
              <span className="sm:hidden">Premium</span>
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative pt-28 pb-20 sm:pt-36 sm:pb-28 px-4 sm:px-6 overflow-hidden">
        {/* Background glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-blue-900/20 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute top-20 right-0 w-[400px] h-[400px] bg-yellow-500/5 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-500/5 blur-3xl rounded-full pointer-events-none" />

        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text */}
            <div>
              {/* Logo + brand for mobile */}
              <div className="flex items-center gap-3 mb-8 lg:hidden">
                <img src="/icon.png" alt="DollarOPS" className="w-12 h-12 rounded-2xl object-cover shadow-lg shadow-blue-900/40" />
                <div>
                  <div className="font-extrabold text-slate-100 text-lg tracking-tight">{APP_NAME}</div>
                  <div className="text-xs text-slate-500 font-medium tracking-wider uppercase">{APP_SUBTITLE}</div>
                </div>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6 tracking-tight">
                Registra.{' '}
                <span className="bg-gradient-to-r from-yellow-400 to-yellow-300 bg-clip-text text-transparent">
                  Analiza.
                </span>{' '}
                Mejora.
              </h1>
              <p className="text-lg text-slate-400 leading-relaxed mb-8 max-w-lg">
                El journal de trading que combina seguimiento visual de operaciones, métricas automáticas y gestión de mentalidad — todo en un solo lugar.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-8">
                <button
                  onClick={goToDemo}
                  className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold px-6 py-3 rounded-xl border border-slate-700 hover:border-slate-600 transition-all text-sm"
                >
                  <CloudOff size={16} className="text-slate-400" />
                  Probar Demo Gratis
                </button>
                <button
                  onClick={goToPremium}
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-400 hover:to-yellow-300 text-slate-900 font-bold px-6 py-3 rounded-xl transition-all text-sm shadow-xl shadow-yellow-500/20 hover:shadow-yellow-500/30"
                >
                  <Sparkles size={16} />
                  Solicitar Acceso Premium
                  <ArrowRight size={14} />
                </button>
              </div>

              {/* Already have account CTA */}
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <button
                  onClick={goToApp}
                  className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 transition-colors font-medium"
                >
                  <LogIn size={14} />
                  Ya tengo cuenta — Iniciar sesión
                </button>
                <span className="text-slate-700 hidden sm:block">|</span>
                <div className="flex items-center gap-1.5 text-slate-500">
                  <Shield size={13} className="text-slate-600" />
                  <span>Sin tarjeta requerida para el demo</span>
                </div>
              </div>
            </div>

            {/* Right: App Preview */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-yellow-900/5 blur-2xl rounded-3xl" />
              <div className="relative space-y-4">
                {/* Brand preview card */}
                <div className="flex items-center gap-3 bg-slate-900/60 border border-slate-700/50 rounded-2xl px-4 py-3 backdrop-blur-sm mb-2">
                  <img src="/icon.png" alt="DollarOPS" className="w-10 h-10 rounded-xl object-cover" />
                  <div>
                    <div className="font-bold text-slate-100 text-sm">{APP_NAME}</div>
                    <div className="text-xs text-slate-500">{APP_SUBTITLE}</div>
                  </div>
                </div>
                <MiniCalendarPreview />
                <MetricsPreview />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────────────────── */}
      <section className="py-12 px-4 sm:px-6 border-y border-slate-800/50">
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 text-center">
          {[
            { to: 142, suffix: '+', label: 'Trades registrados' },
            { to: 68, suffix: '%', label: 'Win rate promedio' },
            { to: 4830, suffix: '$', label: 'P&L tracked' },
            { to: 12, suffix: '', label: 'Temas disponibles' },
          ].map(({ to, suffix, label }) => (
            <div key={label} className="flex flex-col gap-1">
              <span className="text-2xl sm:text-3xl font-bold font-mono text-yellow-400">
                <Counter to={to} suffix={suffix} />
              </span>
              <span className="text-xs text-slate-500 font-medium">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-slate-800/60 border border-slate-700/50 rounded-full px-3 py-1 text-xs font-semibold text-slate-400 mb-4">
              Funcionalidades
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-100 mb-4">
              Todo lo que necesitas para{' '}
              <span className="text-yellow-400">mejorar consistentemente</span>
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Diseñado por y para traders. Cada funcionalidad está pensada para reducir el ruido y enfocarte en lo que importa.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f) => (
              <FeatureCard key={f.title} {...f} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Plans ────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 bg-slate-900/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-slate-800/60 border border-slate-700/50 rounded-full px-3 py-1 text-xs font-semibold text-slate-400 mb-4">
              Planes
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-100 mb-4">
              Empieza gratis, escala cuando estés listo
            </h2>
            <p className="text-slate-400">
              La versión demo tiene todo lo esencial. Cuando quieras más, solicita acceso premium.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <PlanCard
              icon={CloudOff}
              title="Demo"
              badge="Local"
              price="Gratis"
              features={[
                'Registro ilimitado de trades',
                'Calendario visual mensual',
                'Métricas automáticas (Win Rate, P&L)',
                'Registro de pensamientos',
                'Day Off markers',
                'Múltiples temas (dark/light)',
                'Pares personalizables',
              ]}
              excluded={[
                'Sincronización en la nube',
                'Vision Board con imágenes',
                'Challenge Mode (prop firms)',
                'Acceso multi-dispositivo',
                'Soporte prioritario',
              ]}
              ctaLabel="Probar ahora"
              ctaAction={goToDemo}
              highlighted={false}
            />
            <PlanCard
              icon={Cloud}
              title="Premium"
              badge="Cloud"
              price="Acceso por invitación"
              priceNote="Contacta para obtener acceso"
              features={[
                'Todo lo del plan Demo',
                'Sincronización en la nube',
                'Vision Board con imágenes',
                'Challenge Mode (prop firms)',
                'Acceso multi-dispositivo',
                'Backup automático',
                'Soporte prioritario',
                'Actualizaciones anticipadas',
              ]}
              ctaLabel="Solicitar acceso"
              ctaAction={goToPremium}
              ctaSecondary="Ya tengo cuenta — Iniciar sesión"
              ctaSecondaryAction={goToApp}
              highlighted
            />
          </div>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-yellow-500/20 blur-2xl rounded-full" />
            <img src="/icon.png" alt="DollarOPS" className="relative w-20 h-20 rounded-3xl object-cover mx-auto shadow-2xl shadow-yellow-900/40" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-2 text-slate-100">
            Comienza tu{' '}
            <span className="text-yellow-400">diario hoy</span>
          </h2>
          <p className="text-slate-500 text-sm mb-2">{APP_NAME} — {APP_SUBTITLE}</p>
          <p className="text-slate-400 mb-8">
            Sin registro. Sin tarjeta. Los datos se guardan en tu dispositivo. Prueba el demo y descubre cómo un journal transforma tu trading.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={goToDemo}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-400 hover:to-yellow-300 text-slate-900 font-bold px-8 py-3.5 rounded-xl transition-all text-sm shadow-xl shadow-yellow-500/20 hover:scale-105"
            >
              <Zap size={16} className="fill-slate-900" />
              Abrir Demo Gratis
            </button>
            <button
              onClick={goToApp}
              className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold px-8 py-3.5 rounded-xl border border-slate-700 transition-all text-sm"
            >
              <LogIn size={14} />
              Iniciar sesión
            </button>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-800/60 py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <img src="/icon.png" alt="DollarOPS" className="w-7 h-7 rounded-lg object-cover" />
            <div className="flex flex-col leading-none">
              <span className="font-bold text-slate-400 text-xs">{APP_NAME}</span>
              <span className="text-[9px] text-slate-600 uppercase tracking-wider">{APP_SUBTITLE}</span>
            </div>
          </div>
          <p className="text-xs text-slate-600">
            © {new Date().getFullYear()} {APP_NAME}. El diario de trading que mereces.
          </p>
          <div className="flex items-center gap-4 text-xs text-slate-600">
            <button onClick={goToDemo} className="hover:text-slate-400 transition-colors">Demo</button>
            <button onClick={goToApp} className="hover:text-slate-400 transition-colors flex items-center gap-1"><LogIn size={11} />Login</button>
            <button onClick={goToPremium} className="hover:text-slate-400 transition-colors">Premium</button>
            <span className="text-slate-800">|</span>
            <a
              href="https://github.com/williamfloress"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-slate-600 hover:text-slate-300 transition-colors"
            >
              <Github size={12} />
              williamfloress
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
