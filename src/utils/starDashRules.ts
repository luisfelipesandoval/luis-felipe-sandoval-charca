import { containsSpamLinks } from './guestbookUtils';

export const MAX_PLAYER_NAME_LENGTH = 15;
export const MAX_REASONABLE_SCORE = 150000;
export const SCORE_SUBMIT_COOLDOWN_SECONDS = 15;

const PROFANITY_REGEX =
  /(mierda|puta|puto|pendej|carajo|conchatumadre|huevon|imbecil|idiota|estupid|fuck|shit|bitch|asshole|cunt)/i;

/**
 * Checks whether a string contains basic Spanish/English offensive terms.
 */
export function containsProfanity(text: string): boolean {
  return PROFANITY_REGEX.test(text.trim());
}

export interface LeaderboardValidationResult {
  valid: boolean;
  playerName: string;
  score: number;
  error?: string;
}

/**
 * Validates player name (max 15 chars, no profanity, no links) and score bounds
 * before creating a record in Firestore `/leaderboard/{scoreId}`.
 */
export function validateLeaderboardSubmission(
  rawName: string,
  rawScore: number
): LeaderboardValidationResult {
  const trimmed = rawName.trim();
  const playerName = trimmed.length > 0 ? trimmed : 'Piloto LF';
  const score = Math.round(rawScore);

  if (playerName.length > MAX_PLAYER_NAME_LENGTH) {
    return {
      valid: false,
      playerName,
      score,
      error: `El nombre no puede tener más de ${MAX_PLAYER_NAME_LENGTH} caracteres.`,
    };
  }

  if (containsProfanity(playerName)) {
    return {
      valid: false,
      playerName,
      score,
      error: 'Por favor elige un nombre respetuoso sin palabras ofensivas.',
    };
  }

  if (containsSpamLinks(playerName)) {
    return {
      valid: false,
      playerName,
      score,
      error: 'No se permiten enlaces en el nombre de jugador.',
    };
  }

  if (!Number.isFinite(score) || score < 1 || score > MAX_REASONABLE_SCORE) {
    return {
      valid: false,
      playerName,
      score,
      error: 'La puntuación debe ser mayor a 0 y dentro de un rango válido.',
    };
  }

  return {
    valid: true,
    playerName,
    score,
  };
}

/**
 * Computes the combo multiplier (x1 to x8) based on consecutive catches.
 * Every 3 consecutive catches increases the multiplier by +1 (up to x8).
 */
export function getComboMultiplier(streakCount: number): number {
  if (streakCount <= 0) return 1;
  return Math.min(8, 1 + Math.floor(streakCount / 3));
}

/**
 * Calculates points awarded when catching a star, golden coin, or boss star core.
 */
export function calculateCatchPoints(
  itemType: 'star' | 'coin' | 'boss_core',
  currentStreak: number,
  starRainActive: boolean
): { points: number; nextStreak: number; multiplier: number } {
  const nextStreak = currentStreak + 1;
  const multiplier = getComboMultiplier(nextStreak);
  const basePoints = itemType === 'coin' ? 35 : itemType === 'boss_core' ? 60 : 20;
  const rainFactor = starRainActive ? 2 : 1;
  const points = basePoints * multiplier * rainFactor;

  return {
    points,
    nextStreak,
    multiplier,
  };
}

/**
 * Multi-knob difficulty ramp designed for intense 45 to 90 second runs.
 */
export function computeDifficultyParams(elapsedSeconds: number): {
  fallSpeedMultiplier: number;
  spawnIntervalSeconds: number;
  hazardProbability: number;
} {
  const t = Math.max(0, Math.min(120, elapsedSeconds));
  const fallSpeedMultiplier = 1 + (t / 60) * 0.95; // ~1.0x at 0s -> ~1.95x at 60s -> ~2.4x at 90s
  const spawnIntervalSeconds = Math.max(0.22, 0.58 - (t / 75) * 0.32);
  const hazardProbability = Math.min(0.48, 0.25 + (t / 90) * 0.2);

  return {
    fallSpeedMultiplier,
    spawnIntervalSeconds,
    hazardProbability,
  };
}
