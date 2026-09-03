import { SCORE_THRESHOLDS } from '../types';

// UI color mappings for a match score, tiered off the same SCORE_THRESHOLDS
// used to compute the verdict text -- so a badge, a progress ring, and an
// icon can never disagree about which tier a given score falls into.
type ScoreTier = 'strong' | 'potential' | 'moderate' | 'low';

function tierForScore(score: number): ScoreTier {
  if (score >= SCORE_THRESHOLDS.strong) return 'strong';
  if (score >= SCORE_THRESHOLDS.potential) return 'potential';
  if (score >= SCORE_THRESHOLDS.moderate) return 'moderate';
  return 'low';
}

const BADGE_CLASSES: Record<ScoreTier, string> = {
  strong: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  potential: 'bg-blue-50 text-blue-700 border-blue-200',
  moderate: 'bg-amber-50 text-amber-700 border-amber-200',
  low: 'bg-red-50 text-red-700 border-red-200',
};

const RING_HEX: Record<ScoreTier, string> = {
  strong: '#10b981',
  potential: '#3b82f6',
  moderate: '#f59e0b',
  low: '#ef4444',
};

const ICON_CLASSES: Record<ScoreTier, string> = {
  strong: 'text-emerald-600',
  potential: 'text-blue-600',
  moderate: 'text-amber-600',
  low: 'text-amber-600',
};

export function getScoreBadgeClasses(score: number): string {
  return BADGE_CLASSES[tierForScore(score)];
}

export function getScoreRingColor(score: number): string {
  return RING_HEX[tierForScore(score)];
}

export function getScoreIconClasses(score: number): string {
  return ICON_CLASSES[tierForScore(score)];
}
