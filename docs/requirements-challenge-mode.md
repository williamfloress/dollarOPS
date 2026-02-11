# Challenge Mode — Requirements & Implementation Guide

A mode that lets users simulate a **prop firm challenge**: track profit/loss against configurable targets, see progress, and get alerts when they pass phases or approach loss limits.

---

## 1. Overview

### 1.1 Purpose

- Let the user **track profit/loss** as if in a prop firm challenge.
- Show a **progress bar** (and optional metrics) toward phase targets.
- **Notify** when:
  - Phase 1 target is reached (e.g. 8% profit).
  - Phase 2 / “funded” target is reached (e.g. +4% more, or 12% total).
  - User is **near** daily or total loss limit (e.g. 5% drawdown) — “about to fail” warning.

### 1.2 Name

- Feature name: **Challenge mode** (or “Prop challenge mode” in UI if desired).

---

## 2. User Stories

| # | As a… | I want to… | So that… |
|---|--------|-------------|----------|
| 1 | User | Enable “Challenge mode” with my own targets | I can simulate my prop firm rules |
| 2 | User | See a progress bar for profit vs phase targets | I know how close I am to passing Phase 1 / Phase 2 |
| 3 | User | Get an alert when I pass Phase 1 (e.g. 8%) | I get clear feedback that I’ve cleared the first gate |
| 4 | User | Get a “congrats” modal when I pass Phase 2 (e.g. funded) | I feel I “passed the challenge” |
| 5 | User | Get a warning when I’m near the loss limit (e.g. 5%) | I can avoid blowing the challenge |
| 6 | User | Set my own % for Phase 1, Phase 2, daily loss, total loss | The challenge matches my prop firm or custom rules |

---

## 3. Customizable Parameters (Challenge Mode Settings)

All of these should be **configurable** (e.g. in a “Challenge settings” or “Challenge mode” section):

| Parameter | Description | Example default | Notes |
|-----------|-------------|-----------------|--------|
| **Phase 1 profit target (%)** | Profit % needed to “pass” Phase 1 | 8% | e.g. 8% of starting balance |
| **Phase 2 profit target (%)** | Additional or total profit % for “funded” | 4% (on top of Phase 1) or 12% total | Clarify in UI: “extra 4%” vs “12% total” |
| **Daily loss limit (%)** | Max allowed loss in a single day | 5% | Breach = challenge failed (or warning first) |
| **Total loss limit (%)** | Max allowed drawdown from start/high water mark | 5% or 10% | Breach = challenge failed (or warning first) |
| **Starting balance** (optional) | Reference balance for % calculations | e.g. account balance when mode is enabled | If not set, use balance at activation |

Optional extras (can be added later):

- **Challenge start date** (for “day 1” and daily reset).
- **High water mark** for total loss (drawdown from peak balance).

---

## 4. Progress Bar & Display

### 4.1 What to show

- **Progress bar** for profit:
  - 0% → Phase 1 target (e.g. 8%).
  - Phase 1 → Phase 2 target (e.g. 8% → 12% or “+4%”).
- Optional: **separate indicator** for loss (e.g. “Drawdown: 2% / 5%” or a second bar).
- **Labels**: e.g. “Phase 1: 8%”, “Phase 2: 12%”, “Daily loss max: 5%”, “Total loss max: 5%”.

### 4.2 States

- **In progress**: Between start and Phase 1.
- **Phase 1 passed**: Reached Phase 1 target; show checkmark/badge; continue to Phase 2.
- **Phase 2 passed (funded)**: Reached Phase 2; show “Funded” state and congrats modal (once).
- **Near loss limit**: Within X% of daily or total loss limit (e.g. 80% of limit) → show warning.
- **Challenge failed** (optional): Breach of daily or total loss limit → optional “Challenge failed” state/modal.

---

## 5. Alerts & Modals

### 5.1 Phase 1 passed (e.g. 8% profit)

- **Trigger**: Current profit % ≥ Phase 1 target.
- **Action**: Show an **alert** or **toast** (and optionally a small modal):  
  *“Phase 1 passed — you’ve reached the first target.”*
- **Once per challenge**: Only show once per “challenge run” (track in state/settings).

### 5.2 Phase 2 passed — “Funded trader”

- **Trigger**: Current profit % ≥ Phase 2 target (e.g. 12% total or +4% after Phase 1).
- **Action**: Show a **congrats modal**:  
  *“Congratulations — you’re a funded trader!”*  
  (and optionally “Challenge passed” or “Phase 2 complete”.)
- **Once per challenge**: Only show once per run.

### 5.3 Near loss limit (e.g. ~5% drawdown)

- **Trigger**: Daily loss or total loss is within a **warning threshold** of the limit (e.g. ≥ 80% of daily/total loss limit, or within 1% of limit).
- **Action**: Show an **alert/toast** (and optionally a modal):  
  *“Warning — you’re close to the daily/total loss limit. You may fail the challenge if you lose more.”*
- **Throttle**: Don’t spam (e.g. once per session or once per X% move).

### 5.4 Optional: Challenge failed

- **Trigger**: Daily loss or total loss **exceeds** the configured limit.
- **Action**: Show a **modal**: “Challenge failed — daily/total loss limit exceeded.” Option to “Reset challenge” or “Exit challenge mode.”

---

## 6. Step-by-Step Implementation Guide

### Step 1: Data model & storage ✅

- [x] Define **Challenge mode settings** (e.g. in `storage.js` or Supabase):
  - `phase1TargetPercent`, `phase2TargetPercent`
  - `dailyLossLimitPercent`, `totalLossLimitPercent`
  - `startingBalance` (or “use current balance at start”)
  - `challengeStartDate` (optional)
- [x] Define **Challenge state** (per run):
  - `phase1PassedAt` (timestamp or boolean)
  - `phase2PassedAt` (timestamp or boolean)
  - `highWaterMark` (optional, for total drawdown)
  - Last **daily** balance (or daily PnL) for daily loss.
- [x] Persist settings and state so they survive refresh.

**Implementation (Step 1):** Challenge settings and state live in `user_preferences`. New columns were added via `docs/supabase-migration-challenge-mode.sql` (run in Supabase SQL Editor for existing DBs). App uses camelCase: `challengeSettings` (enabled, phase1TargetPercent, phase2TargetPercent, dailyLossLimitPercent, totalLossLimitPercent, startingBalance, challengeStartDate) and `challengeState` (phase1PassedAt, phase2PassedAt, highWaterMark, dayStartBalance, dayStartDate). `src/utils/supabase.js` loads/saves these in `loadJournalDataFromSupabase` and `saveJournalDataToSupabase`; `src/utils/storage.js` provides defaults in `loadJournalData` and in the empty-data shape for clear/export.

### Step 2: Challenge mode toggle & settings UI ✅

- [x] Add a **“Challenge mode”** toggle (e.g. in settings or dashboard).
- [x] When enabled, show a **“Challenge settings”** panel/screen where user can set:
  - Phase 1 target (%)
  - Phase 2 target (%)
  - Daily loss limit (%)
  - Total loss limit (%)
  - Optionally: starting balance or “Use current balance”.
- [x] Save these to the data model from Step 1.

**Implementation (Step 2):** In the main **Settings** modal (Configuración), a “Challenge mode” section was added with a toggle and a collapsible panel. The panel includes: Phase 1 target (%), Phase 2 target (%), Daily loss limit (%), Total loss limit (%), a “Use current balance when starting” checkbox, and an optional starting balance input when that checkbox is unchecked. Settings are kept in local state (`settingsChallenge`) while the modal is open and are persisted via `saveAllJournalData({ challengeSettings })` on “Guardar Cambios” or “Guardar y Cerrar”. Unsaved-changes detection and the close-confirmation modal include challenge settings. App state holds `challengeSettings` and `challengeState`; both are loaded from `loadJournalData`, included in the debounced auto-save, and passed through `saveAllJournalData`.

### Step 3: Compute current profit/loss % ✅

- [x] Get **reference balance**: starting balance (or balance when challenge started).
- [x] Get **current balance** (from your existing balance source).
- [x] **Profit %** = `(currentBalance - referenceBalance) / referenceBalance * 100`.
- [x] **Daily loss %**: same formula using “balance at start of day” vs current (need daily reference).
- [x] **Total loss %** (drawdown): e.g. `(highWaterMark - currentBalance) / highWaterMark * 100`, or from start balance if no HWM.

**Implementation (Step 3):** Added `challenge_reference_balance` to the DB migration and to `challengeState` so “use current balance at start” is persisted. When challenge is enabled with no fixed starting balance, a `useEffect` snapshots `metrics.currentBalance` into `challengeState.referenceBalance` once. Another `useEffect` updates `challengeState.highWaterMark` whenever current balance exceeds it. A `challengeMetrics` `useMemo` (after `metrics`) computes: **referenceBalance** (settings.startingBalance ?? state.referenceBalance, or current balance as fallback when enabled); **currentBalance** from `metrics.currentBalance` (initial + annual PnL); **profitPercent** = (current − reference) / reference × 100; **dailyLossPercent** = (dayStartBalance − current) / dayStartBalance × 100 when `dayStartDate` is today and current &lt; day start (otherwise 0); **totalLossPercent** = (highWaterMark − current) / highWaterMark × 100 when current &lt; HWM. All percentages are only computed when challenge is enabled. Daily reference (`dayStartBalance` / `dayStartDate`) is used when set; daily reset (setting them at start of day) is left for Step 8.

### Step 4: Progress bar component ✅

- [x] Create a **ChallengeProgress** (or similar) component.
- [x] Inputs: `profitPercent`, `phase1Target`, `phase2Target`, `dailyLossPercent`, `totalLossPercent`, `dailyLossLimit`, `totalLossLimit`.
- [x] Render:
  - A bar from 0 → Phase 1 → Phase 2 (e.g. green when in profit).
  - Optional second bar or label for drawdown (e.g. “Loss: 2% / 5%”).
- [x] Show labels for Phase 1 and Phase 2.

**Implementation (Step 4):** Added `src/components/ChallengeProgress.jsx`: a compact card with a “Challenge progress” heading, a **profit bar** from 0 to Phase 2 target (fill = profit %; green when in profit, with a Phase 1 marker), labels “Phase 1: X%” and “Phase 2: X%” plus checkmarks when passed, and **drawdown labels** “Daily loss: X% / Y%” and “Total drawdown: X% / Y%”. The component receives `theme` and optional `phase1Passed` / `phase2Passed`. It is rendered in `App.jsx` directly under the header (only when `challengeSettings.enabled`), with props from `challengeMetrics`, `challengeSettings`, and `challengeState`.

### Step 5: Alert logic (Phase 1 / Phase 2 / Near loss) ✅

- [x] **Phase 1**: If `profitPercent >= phase1TargetPercent` and `!phase1PassedAt`, show alert, set `phase1PassedAt = now`.
- [x] **Phase 2**: If `profitPercent >= phase2TargetPercent` and `!phase2PassedAt`, show congrats modal, set `phase2PassedAt = now`.
- [x] **Near loss**: If `dailyLossPercent >= warningThreshold` (e.g. 80% of limit) or `totalLossPercent >= warningThreshold`, show warning (throttled).
- [x] Run this logic whenever balance or PnL updates (e.g. after trade or periodic sync).

**Implementation (Step 5):** A `useEffect` in `App.jsx` runs when challenge is enabled and depends on `challengeMetrics` (profit/daily/total loss %) and `challengeState.phase1PassedAt` / `phase2PassedAt`. **Phase 2** is checked first: if `profitPercent >= phase2Target` and Phase 2 not yet passed, it sets both `phase1PassedAt` and `phase2PassedAt`, persists via `saveAllJournalData({ challengeState })`, and opens the congrats modal. **Phase 1** is checked next: if `profitPercent >= phase1Target` and Phase 1 not passed, it sets `phase1PassedAt`, persists, and shows a dismissible toast. **Near loss:** if `dailyLossPercent >= 80%` of daily limit or `totalLossPercent >= 80%` of total limit, a dismissible warning toast is shown, throttled to once every 2 minutes via a `useRef`. UI: Phase 1 toast (bottom center, “Phase 1 passed — you’ve reached your first profit target.”), Phase 2 modal (centered, “Congratulations — you’re a funded trader! You’ve passed the challenge.”), Near loss toast (“Warning — you’re close to the loss limit…”).

### Step 6: Modals & toasts

- [ ] **Phase 1 passed**: Toast or small modal; dismissible.
- [ ] **Phase 2 passed**: Full congrats modal (“You’re a funded trader!”); dismissible.
- [ ] **Near loss**: Toast or small modal; dismissible.
- [ ] **Challenge failed** (optional): Modal with “Reset challenge” / “Exit challenge mode”.

### Step 7: Integrate into app

- [ ] Show **Challenge mode** toggle and **Challenge progress** only when Challenge mode is ON.
- [ ] Wire balance (and daily balance if applicable) from your existing app state or API into the progress and alert logic.
- [ ] Ensure settings are loaded on app init and state is persisted when user passes phases or resets.

### Step 8: Edge cases & polish

- [ ] **Reset challenge**: Button to reset Phase 1/Phase 2 passed flags and optionally set new starting balance / high water mark.
- [ ] **Daily reset**: If using daily loss, reset “day start balance” at start of each trading day (timezone/config).
- [ ] **Multiple runs**: Consider “Challenge history” (e.g. list of past runs with pass/fail) in a later iteration.

---

## 7. UI Copy (suggested)

- **Feature name**: “Challenge mode”
- **Phase 1 alert**: “Phase 1 passed — you’ve reached your first profit target.”
- **Phase 2 modal**: “Congratulations — you’re a funded trader! You’ve passed the challenge.”
- **Near loss**: “Warning — you’re close to the loss limit. Further losses may fail the challenge.”
- **Challenge failed**: “Challenge failed — you’ve exceeded the allowed loss limit.”

---

## 8. Summary Checklist

| Area | Items |
|------|--------|
| **Settings** | Phase 1 %, Phase 2 %, daily loss %, total loss %, starting balance (optional) |
| **UI** | Challenge mode toggle, settings form, progress bar, drawdown indicator |
| **Alerts** | Phase 1 passed, Phase 2 passed (congrats modal), near loss warning, optional fail modal |
| **Persistence** | Save settings and “phase passed” state per challenge run |
| **Logic** | Profit % and loss % from balance (and daily/total), thresholds, one-time alerts |

Use this doc as the single source of truth for **Challenge mode**: implement step-by-step from Section 6 and refer to Sections 3–5 for exact behavior and customization.
