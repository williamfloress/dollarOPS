import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

// ─── Read URL params FIRST (synchronously) ────────────────────────────────
const urlParams = new URLSearchParams(window.location.search);
const mode = urlParams.get('mode');

// ─── Set Demo Mode flag BEFORE any component imports ─────────────────────
// This ensures storage.js reads window.__DEMO_MODE__ === true when it
// evaluates its isDemoMode() helper.
if (mode === 'demo') {
  window.__DEMO_MODE__ = true;
}

// ─── Apply body class for scroll control ─────────────────────────────────
// Landing page needs normal scroll; journal app manages its own scroll.
if (mode === 'demo' || mode === 'app') {
  document.body.classList.add('app-mode');
} else {
  document.body.classList.add('landing-mode');
}

// ─── Static imports (Vite bundles all, renders only one) ─────────────────
import LandingPage from './LandingPage.jsx';
import AppDemo from './AppDemo.jsx';
import App from './App.jsx';

// ─── Route to the right component ────────────────────────────────────────
// Routes:
//   /              → Landing Page (default)
//   /?mode=demo    → Demo Mode (LocalStorage only, no auth required)
//   /?mode=app     → Full App (Supabase + Auth)
//   /?mode=landing → Landing Page (explicit, used by demo badge back-link)

let AppComponent;

if (mode === 'demo') {
  AppComponent = AppDemo;
} else if (mode === 'app') {
  AppComponent = App;
} else {
  AppComponent = LandingPage;
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppComponent />
  </StrictMode>,
)
