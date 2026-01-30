'use client';

import { useEffect, useState } from 'react';

/**
 * Liste des mantras stoïques quotidiens
 */
const MANTRAS = [
  'Discipline avant motivation.',
  'Un jour sobre. Un jour gagné.',
  'Fais simple. Fais juste.',
  'La constance bat l\'intensité.',
  'Aujourd\'hui compte.',
  'Agir, pas réfléchir.',
  'Moins de bruit, plus d\'action.',
  'Ce qui est fait ne doit plus se refaire.',
  'Commence. Le reste suivra.',
  'Pas de performance, juste de la présence.',
] as const;

/**
 * Get today's date key in YYYY-MM-DD format (UTC)
 */
function getTodayKeyUTC(): string {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const day = String(now.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
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
 * Get or generate today's mantra index
 */
function getTodayMantraIndex(): number {
  const dayKey = getTodayKeyUTC();
  const storageKey = `become:mantra:${dayKey}`;

  if (canUseLocalStorage()) {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored !== null) {
        const index = parseInt(stored, 10);
        if (!isNaN(index) && index >= 0 && index < MANTRAS.length) {
          return index;
        }
      }

      // Generate new random index for today
      const newIndex = Math.floor(Math.random() * MANTRAS.length);
      localStorage.setItem(storageKey, String(newIndex));
      return newIndex;
    } catch (error) {
      console.error('[DailyMantra] localStorage error:', error);
    }
  }

  // Fallback: deterministic based on date (no localStorage)
  const hash = dayKey.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return hash % MANTRAS.length;
}

/**
 * Daily Mantra - displays a different stoic principle each day
 */
export default function DailyMantra() {
  const [mantra, setMantra] = useState<string>('');

  useEffect(() => {
    const index = getTodayMantraIndex();
    setMantra(MANTRAS[index]);
  }, []);

  // SSR fallback
  if (!mantra) {
    return (
      <p className="text-gray-400 text-lg">
        Aujourd'hui compte.
      </p>
    );
  }

  return (
    <p className="text-gray-400 text-lg transition-opacity duration-300">
      {mantra}
    </p>
  );
}
