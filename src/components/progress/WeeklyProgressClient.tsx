/**
 * PASS 9.1 – FEATURE FREEZE
 * No new messages, toasts, or behavioral triggers.
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import type { DayProgress } from '@/lib/actions/progress';
import { getTodayISO, getDayRelation } from '@/lib/date';
import { computeReEntryFlag } from '@/lib/progress';

// Debug flag for toast system
const DEBUG_TOASTS = false;

interface WeeklyProgressClientProps {
  days: DayProgress[];
  currentStreak: number;
  disciplinedDays7: number;
}

/**
 * Toast specification
 */
type ToastSpec = {
  id: string;
  message: string;
  storageKey: string;
};

/**
 * Get emotional feedback based on score (FR, stoic tone)
 */
function getScoreFeedback(score: number): string {
  if (score < 50) {
    return 'Journée faible, mais tu es encore dans le jeu.';
  }
  if (score < 70) {
    return 'Tu avances. Rends demain plus discipliné.';
  }
  return 'Discipline respectée. Continue.';
}

/**
 * Get emotional progression label based on score
 */
function getProgressionLabel(score: number): string {
  if (score === 0) return 'Commence maintenant';
  if (score < 40) return 'Journée entamée';
  if (score < 70) return 'En construction';
  if (score < 100) return 'Discipline respectée';
  return 'Journée pleine';
}

/**
 * Get today's date in YYYY-MM-DD format (UTC) - consistent with DB logic
 */
function getDayKeyUTC(): string {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const day = String(now.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get yesterday's date in YYYY-MM-DD format (UTC)
 */
function getYesterdayKeyUTC(): string {
  const now = new Date();
  const yesterday = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() - 1
  ));
  const year = yesterday.getUTCFullYear();
  const month = String(yesterday.getUTCMonth() + 1).padStart(2, '0');
  const day = String(yesterday.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get validated message variant (A or B) based on day key hash
 * Stable per day, deterministic
 */
function getValidatedMessageVariant(dayKey: string): string {
  // Simple hash: sum of char codes
  const hash = dayKey.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const variant = hash % 2;

  return variant === 0
    ? 'Journée validée. Discipline respectée.'
    : 'Discipline en place. Tu avances.';
}

/**
 * PASS 3.3 - Closing ritual message
 * Returns a stoic closing message for completed days
 * Selection is stable (deterministic hash based on dayISO)
 */
function getClosingMessage(dayISO: string): string {
  const messages = [
    'La journée est posée. À demain.',
    'Ce qui devait être fait l\'a été.',
    'Repos. La suite demain.',
    'La journée peut se refermer.',
  ] as const;

  // Simple hash: sum of char codes
  const hash = dayISO.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const index = hash % messages.length;

  return messages[index];
}

/**
 * Check if localStorage is available (SSR safe)
 */
function canUseLocalStorage(): boolean {
  try {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  } catch {
    return false;
  }
}

/**
 * Check if a toast has been seen (try/catch for safety)
 */
function hasSeen(key: string): boolean {
  if (!canUseLocalStorage()) return false;
  try {
    return localStorage.getItem(key) === 'true';
  } catch (error) {
    if (DEBUG_TOASTS) console.error('[ToastManager] hasSeen error:', error);
    return false;
  }
}

/**
 * Mark a toast as seen (try/catch for safety)
 */
function markSeen(key: string): void {
  if (!canUseLocalStorage()) return;
  try {
    localStorage.setItem(key, 'true');
  } catch (error) {
    if (DEBUG_TOASTS) console.error('[ToastManager] markSeen error:', error);
  }
}

/**
 * Clear all toast localStorage (development only)
 * Call from browser console: window.clearToastsForDebug()
 */
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).clearToastsForDebug = () => {
    const keys = Object.keys(localStorage).filter((key) => key.startsWith('become:toast:'));
    keys.forEach((key) => localStorage.removeItem(key));
    console.log(`[Debug] Cleared ${keys.length} toast keys:`, keys);
  };
}

/**
 * ToastManager - handles display, queue, auto-dismiss, and persistence
 */
function ToastManager({ toasts }: { toasts: ToastSpec[] }) {
  const [activeToast, setActiveToast] = useState<ToastSpec | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Find first unseen toast
    const unseenToast = toasts.find((toast) => !hasSeen(toast.storageKey));

    if (DEBUG_TOASTS) {
      console.debug('[ToastManager] useEffect', {
        toastsCount: toasts.length,
        toastsList: toasts.map((t) => ({
          id: t.id,
          seen: hasSeen(t.storageKey),
          storageKey: t.storageKey,
        })),
        unseenToast: unseenToast ? unseenToast.id : null,
      });
    }

    if (unseenToast && !activeToast) {
      // Mark as seen immediately to prevent duplicate renders
      markSeen(unseenToast.storageKey);
      setActiveToast(unseenToast);
      setVisible(true);

      // Auto-hide after 5 seconds
      const timer = setTimeout(() => {
        setVisible(false);
        // Clear active toast after animation completes
        setTimeout(() => {
          setActiveToast(null);
        }, 300);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [toasts, activeToast]);

  if (!activeToast || !visible) return null;

  return (
    <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="be-card p-4 text-center">
        <p className="text-white font-medium">{activeToast.message}</p>
      </div>
    </div>
  );
}

export default function WeeklyProgressClient({
  days,
  currentStreak,
  disciplinedDays7,
}: WeeklyProgressClientProps) {
  const [selectedDay, setSelectedDay] = useState<DayProgress | null>(null);

  // Ref to store previous snapshot for edge detection (transition-based toasts)
  const prevRef = useRef<{
    dayKey: string;
    morningCount: number;
    eveningCount: number;
    beginnerCount: number;
    journalValidated: boolean;
    disciplined: boolean;
  } | null>(null);

  // Calculate toast conditions
  const dayKey = getDayKeyUTC();
  const yesterdayKey = getYesterdayKeyUTC();
  const todayISO = getTodayISO(); // PASS 4.1: Use centralized today calculation
  const today = days.find((d) => d.dayISO === dayKey);
  const yesterday = days.find((d) => d.dayISO === yesterdayKey);

  // PASS 3.2: Micro-momentum toasts - EDGE DETECTION (transition-based)
  // Get previous snapshot (reset if day changed)
  const prev = prevRef.current;
  const prevIsSameDay = prev && prev.dayKey === dayKey;

  const prevMorning = prevIsSameDay ? prev.morningCount : 0;
  const prevEvening = prevIsSameDay ? prev.eveningCount : 0;
  const prevJournal = prevIsSameDay ? prev.journalValidated : false;
  const prevAllDone = prevIsSameDay
    ? (prev.morningCount === 6 && prev.eveningCount === 6 && prev.beginnerCount === 7)
    : false;
  const prevDisciplined = prevIsSameDay ? prev.disciplined : false;

  // Detect transitions (edge detection)
  const morningJustDone = today && prevMorning < 6 && today.morningCount === 6;
  const eveningJustDone = today && prevEvening < 6 && today.eveningCount === 6;
  const journalJustDone = today && !prevJournal && today.journalValidated === true;
  const allJustDone = today && !prevAllDone &&
    (today.morningCount === 6 && today.eveningCount === 6 && today.beginnerCount === 7);
  const disciplinedJustReached = today && !prevDisciplined && today.disciplined;

  // Condition 3: Comeback - user returns after absence
  const hasActivityToday = today
    ? today.morningCount + today.eveningCount + today.beginnerCount > 0
    : false;
  const hadNoActivityYesterday = yesterday
    ? yesterday.morningCount + yesterday.eveningCount + yesterday.beginnerCount === 0
    : true; // If no data for yesterday, consider as no activity
  const isComeback = hasActivityToday && hadNoActivityYesterday;

  // PASS 6.1: Re-entry detection (stricter than isComeback)
  // isReEntry = hasActivityToday && hadNoActivityYesterday && consecutiveZeroDaysBeforeToday >= 2
  const { isReEntry, consecutiveZeroDaysBeforeToday } = computeReEntryFlag(days, todayISO);
  // Available for PASS 6.2 usage - currently just computed, not displayed
  void isReEntry;
  void consecutiveZeroDaysBeforeToday;

  // Condition 4: Not done - past day with no validation
  // Find first past day (< today) that is not disciplined or has zero activity
  const pastNotDoneDay = days.find((day) => {
    const isPast = day.dayISO < dayKey;
    const isNotValidated = !day.disciplined || (day.morningCount + day.eveningCount + day.beginnerCount === 0);
    return isPast && isNotValidated;
  });

  // Build toasts list with strict priority order based on TRANSITIONS
  // Push ALL applicable toast candidates when transitions are detected
  // ToastManager will display them sequentially (first unseen, then next, etc.)
  // Priority order: morningDone -> eveningDone -> journalDone -> allDone -> validated -> comeback -> notDone
  const toastsToShow: ToastSpec[] = [];

  // Priority 1: Morning routine just completed (transition)
  if (morningJustDone) {
    toastsToShow.push({
      id: 'morningDone',
      message: 'Routine matinale complétée.',
      storageKey: `become:toast:morningDone:${dayKey}`,
    });
  }

  // Priority 2: Evening routine just completed (transition)
  if (eveningJustDone) {
    toastsToShow.push({
      id: 'eveningDone',
      message: 'Routine du soir complétée.',
      storageKey: `become:toast:eveningDone:${dayKey}`,
    });
  }

  // Priority 3: Journal just validated (transition)
  if (journalJustDone) {
    toastsToShow.push({
      id: 'journalDone',
      message: 'Carnet de bord enregistré.',
      storageKey: `become:toast:journalDone:${dayKey}`,
    });
  }

  // Priority 4: All routines just completed (transition)
  if (allJustDone) {
    toastsToShow.push({
      id: 'allDone',
      message: 'Toutes les routines complétées. Repos mérité.',
      storageKey: `become:toast:allDone:${dayKey}`,
    });
  }

  // Priority 5: Day just became disciplined (transition)
  if (disciplinedJustReached) {
    const validatedMessage = getValidatedMessageVariant(dayKey);
    toastsToShow.push({
      id: 'validated',
      message: validatedMessage,
      storageKey: `become:toast:validated:${dayKey}`,
    });
  }

  // Priority 6: Comeback after absence
  if (isComeback) {
    toastsToShow.push({
      id: 'comeback',
      message: 'Tu reviens. C\'est ce qui compte.',
      storageKey: `become:toast:comeback:${dayKey}`,
    });
  }

  // Priority 7: Past day not done
  if (pastNotDoneDay) {
    toastsToShow.push({
      id: 'notDone',
      message: 'Journée non réalisée. Rien n\'est perdu.',
      storageKey: `become:toast:notDone:${pastNotDoneDay.dayISO}`,
    });
  }

  // Update snapshot ref after render (for next render to detect transitions)
  useEffect(() => {
    prevRef.current = {
      dayKey,
      morningCount: today?.morningCount ?? 0,
      eveningCount: today?.eveningCount ?? 0,
      beginnerCount: today?.beginnerCount ?? 0,
      journalValidated: today?.journalValidated ?? false,
      disciplined: today?.disciplined ?? false,
    };
  }, [dayKey, today]);

  if (DEBUG_TOASTS) {
    console.debug('[WeeklyProgressClient] Toast conditions', {
      dayKey,
      yesterdayKey,
      today: today
        ? {
            dayISO: today.dayISO,
            score: today.score,
            disciplined: today.disciplined,
            morningCount: today.morningCount,
            eveningCount: today.eveningCount,
            beginnerCount: today.beginnerCount,
            journalValidated: today.journalValidated,
          }
        : null,
      yesterday: yesterday
        ? {
            dayISO: yesterday.dayISO,
            morningCount: yesterday.morningCount,
            eveningCount: yesterday.eveningCount,
            beginnerCount: yesterday.beginnerCount,
          }
        : null,
      prevSnapshot: prev,
      transitions: {
        morningJustDone,
        eveningJustDone,
        journalJustDone,
        allJustDone,
        disciplinedJustReached,
        isComeback,
        pastNotDoneDay: pastNotDoneDay ? pastNotDoneDay.dayISO : null,
      },
      toastsToShow: toastsToShow.map((t) => ({ id: t.id, message: t.message })),
    });
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-black px-4 py-8 sm:py-12">
      <div className="be-container be-card-spacing">
        {/* Header */}
        <div className="text-center be-section-spacing">
          <h1 className="be-heading-1 mb-3">
            Ton avancée
          </h1>
          <p className="be-subtitle">
            Les 7 derniers jours
          </p>
        </div>

        {/* Toast Manager */}
        <ToastManager toasts={toastsToShow} />

        {/* Micro-streak badge */}
        {currentStreak >= 2 && (
          <div className="mb-6 text-center">
            <span className="be-chip text-white/80">
              🔥 {currentStreak} jours consécutifs
            </span>
          </div>
        )}

        {/* Stats Cards - subtle glow on streak */}
        <div className="grid grid-cols-2 gap-4">
          <div
            className={`be-card be-glass be-card-interactive p-6 text-center transition-all duration-300 ${
              currentStreak > 0 ? 'ring-1 ring-white/10 shadow-lg shadow-white/5' : ''
            }`}
          >
            <div className="text-3xl font-bold text-white mb-2 be-num">
              {currentStreak}
            </div>
            <div className="be-subtitle text-xs be-label">
              Série actuelle (jours)
            </div>
          </div>
          <div className="be-card be-glass be-card-interactive p-6 text-center">
            <div className="text-3xl font-bold text-white mb-2 be-num">
              {disciplinedDays7}/7
            </div>
            <div className="be-subtitle text-xs be-label">
              Jours disciplinés
            </div>
          </div>
        </div>

        {/* Daily Progress Bars - Clickable */}
        <div className="be-card be-glass p-6 sm:p-8">
          <h2 className="be-heading-3 mb-6">
            Score quotidien
          </h2>
          <div className="space-y-4">
            {days.map((day) => {
              const isSelected = selectedDay?.dayISO === day.dayISO;
              const dayRelation = getDayRelation(day.dayISO, todayISO); // PASS 4.1
              const isLocked = dayRelation !== 'today';

              return (
                <div key={day.dayISO}>
                  <button
                    onClick={() => !isLocked && setSelectedDay(day)}
                    disabled={isLocked}
                    aria-disabled={isLocked}
                    tabIndex={isLocked ? -1 : 0}
                    className={`w-full text-left space-y-3 rounded-lg p-3 -m-3 border border-transparent transition-all duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-0 motion-reduce:transition-none motion-reduce:transform-none ${
                      isLocked
                        ? 'opacity-60 cursor-not-allowed'
                        : 'hover:-translate-y-0.5 hover:bg-white/5 hover:border-white/15 hover:shadow-lg hover:shadow-black/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="be-day-label">
                        {day.label}
                      </span>
                      <div className="flex items-center gap-2">
                        <span
                          className={day.disciplined ? 'be-score be-num' : 'be-score be-score--inactive be-num'}
                        >
                          {day.score}%
                        </span>
                        {day.disciplined && (
                          <span className="text-xs px-2 py-0.5 rounded-full text-white" style={{ background: 'var(--surface-2)', border: '1px solid var(--border-2)' }}>
                            ✓
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="be-progress-bar">
                      <div
                        className={day.disciplined ? 'be-progress-fill' : 'be-progress-fill be-progress-fill--incomplete'}
                        style={{ width: `${day.score}%` }}
                      />
                    </div>
                  </button>

                  {/* Day Detail Drilldown - shown when selected */}
                  {isSelected && (
                    <div className="mt-4 p-4 be-card-2 be-glass space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="be-heading-3 text-base">
                            Détail du {day.label}
                          </h3>
                          {/* PASS 4.1 - Status badge for locked days */}
                          {isLocked && (
                            <p className="be-subtitle text-xs mt-1">
                              {dayRelation === 'future'
                                ? 'À venir'
                                : day.disciplined || day.score > 0
                                ? 'Réalisé'
                                : 'Non réalisé'}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDay(null);
                          }}
                          className="be-nav-link text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20 rounded"
                        >
                          ✕
                        </button>
                      </div>

                      {/* Breakdown */}
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="be-subtitle text-sm">Routine matinale</span>
                          <span className="be-score text-sm be-num">
                            {day.morningCount}/6 tâches
                            <span className="text-white/40 ml-2">
                              ({Math.round((Math.min(day.morningCount, 6) / 6) * 40)}pts)
                            </span>
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="be-subtitle text-sm">Routine du soir</span>
                          <span className="be-score text-sm be-num">
                            {day.eveningCount}/6 tâches
                            <span className="text-white/40 ml-2">
                              ({Math.round((Math.min(day.eveningCount, 6) / 6) * 30)}pts)
                            </span>
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="be-subtitle text-sm">Programme débutant</span>
                          <span className="be-score text-sm be-num">
                            {day.beginnerCount}/7 tâches
                            <span className="text-white/40 ml-2">
                              ({Math.round((Math.min(day.beginnerCount, 7) / 7) * 20)}pts)
                            </span>
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="be-subtitle text-sm">Carnet de bord</span>
                          <span className="be-score text-sm be-num">
                            {day.journalValidated ? 'Validé' : 'Non validé'}
                            <span className="text-white/40 ml-2">
                              ({day.journalValidated ? '10' : '0'}pts)
                            </span>
                          </span>
                        </div>
                      </div>

                      {/* Score Total + Feedback */}
                      <div className="pt-3 space-y-2" style={{ borderTop: '1px solid var(--border)' }}>
                        <div className="flex items-center justify-between">
                          <span className="be-heading-3 text-sm">Score total</span>
                          <span
                            className={`text-lg font-bold be-num ${
                              day.disciplined ? 'be-score' : 'be-score--inactive'
                            }`}
                          >
                            {day.score}/100
                          </span>
                        </div>
                        <p className="text-white/65 text-xs transition-colors duration-300">
                          {getProgressionLabel(day.score)}
                        </p>
                        <p className="be-subtitle text-xs italic">
                          {getScoreFeedback(day.score)}
                        </p>
                        {/* End-of-day completion message */}
                        {day.morningCount === 6 && day.eveningCount === 6 && day.beginnerCount === 7 && (
                          <p className="be-subtitle text-xs italic pt-1">
                            Toutes les routines complétées. Repos mérité.
                          </p>
                        )}
                        {/* PASS 3.3 - Closing ritual: show if journal validated OR both routines complete */}
                        {(day.journalValidated || (day.morningCount === 6 && day.eveningCount === 6)) && (
                          <p className="be-subtitle text-xs italic pt-2">
                            {getClosingMessage(day.dayISO)}
                          </p>
                        )}
                      </div>

                      {/* Link to day drilldown - PASS 4.1: disabled for locked days */}
                      <div className="pt-2">
                        {!isLocked ? (
                          <Link href={`/progress/${day.dayISO}`}>
                            <button className="w-full be-btn be-glass text-white text-sm font-medium">
                              Gérer les tâches →
                            </button>
                          </Link>
                        ) : (
                          <button
                            type="button"
                            disabled
                            className="w-full be-btn be-glass text-white text-sm font-medium opacity-60 cursor-not-allowed"
                          >
                            Jour verrouillé
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-8 pt-6" style={{ borderTop: '1px solid var(--border)' }}>
            <div className="text-sm be-subtitle">
              <div className="mb-3">
                <span className="be-heading-3 text-sm">Score sur 100 :</span>
              </div>
              <ul className="space-y-2 ml-4">
                <li>• Routine matinale : 40 points (6 tâches)</li>
                <li>• Routine du soir : 30 points (6 tâches)</li>
                <li>• Programme débutant : 20 points (7 tâches)</li>
                <li>• Carnet de bord : 10 points (validé)</li>
              </ul>
              <div className="mt-4">
                <span className="be-heading-3 text-sm">Discipliné :</span> ≥ 70%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
