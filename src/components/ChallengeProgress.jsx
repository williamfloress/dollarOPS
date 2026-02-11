import React from 'react';
import { Trophy, Check } from 'lucide-react';
import { clsx } from 'clsx';

/**
 * Challenge progress: profit bar (0 → Phase 1 → Phase 2) and drawdown labels.
 * Used when Challenge mode is enabled.
 */
export const ChallengeProgress = ({
  profitPercent = 0,
  phase1Target = 8,
  phase2Target = 12,
  dailyLossPercent = 0,
  totalLossPercent = 0,
  dailyLossLimit = 5,
  totalLossLimit = 5,
  phase1Passed = false,
  phase2Passed = false,
  dailyLimitExceeded = false,
  totalLimitExceeded = false,
  theme,
}) => {
  const t = theme || {};
  const limitExceeded = dailyLimitExceeded || totalLimitExceeded;
  const fillPercent = phase2Target > 0
    ? Math.min(100, Math.max(0, (profitPercent / phase2Target) * 100))
    : 0;
  const phase1PositionPercent = phase2Target > 0 ? (phase1Target / phase2Target) * 100 : 0;
  const isInProfit = profitPercent >= 0;

  return (
    <div className={clsx('rounded-lg border-2 p-3', limitExceeded ? 'border-rose-500 bg-rose-500/5' : t.border, t.bgCard)}>
      {limitExceeded && (
        <div className="flex items-center gap-2 mb-2 text-rose-400 text-xs font-bold uppercase tracking-wider">
          <span>Limit exceeded — challenge failed</span>
        </div>
      )}
      <div className="flex items-center gap-2 mb-2">
        <Trophy size={14} className={t.accentText} />
        <span className={clsx('text-xs font-semibold uppercase tracking-wider', t.textSec)}>
          Challenge progress
        </span>
      </div>

      {/* Profit bar: 0 → Phase 1 → Phase 2 */}
      <div className="mb-2">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className={t.textMuted}>
            Profit: {isInProfit ? '+' : ''}{profitPercent.toFixed(1)}%
          </span>
          <span className={t.textSec}>
            Phase 1: {phase1Target}% {phase1Passed && <Check size={12} className="inline text-emerald-400" />}
            {' · '}
            Phase 2: {phase2Target}% {phase2Passed && <Check size={12} className="inline text-emerald-400" />}
          </span>
        </div>
        <div className={clsx('relative h-2.5 rounded-full overflow-hidden border', t.border, t.bgInput)}>
          <div
            className={clsx('absolute inset-y-0 left-0 rounded-full transition-all duration-300', isInProfit ? 'bg-emerald-500' : 'bg-slate-600')}
            style={{ width: `${fillPercent}%` }}
          />
          {phase1Target < phase2Target && (
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-amber-500/80 z-10"
              style={{ left: `${phase1PositionPercent}%` }}
              title={`Phase 1: ${phase1Target}%`}
            />
          )}
        </div>
      </div>

      {/* Drawdown labels */}
      <div className={clsx('flex flex-wrap gap-x-4 gap-y-1 text-xs', t.textSec)}>
        <span>
          Daily loss: <span className={dailyLossPercent > 0 ? 'text-rose-400 font-medium underline' : t.textMuted}>{dailyLossPercent.toFixed(1)}%</span>
          {' / '}{dailyLossLimit}% {dailyLimitExceeded && <span className="text-rose-400 font-bold">(exceeded)</span>}
        </span>
        <span>
          Total drawdown: <span className={totalLossPercent > 0 ? 'text-rose-400 font-medium underline' : t.textMuted}>{totalLossPercent.toFixed(1)}%</span>
          {' / '}{totalLossLimit}% {totalLimitExceeded && <span className="text-rose-400 font-bold">(exceeded)</span>}
        </span>
      </div>
    </div>
  );
};
