export type EasterEggGameId = 'rps' | 'coin' | 'dice' | 'dino' | 'roulette';

export interface EasterEggSuggestion {
  id: EasterEggGameId;
  phrase: string;
  title: string;
  badge: string;
}

export const EASTER_EGG_SUGGESTIONS: EasterEggSuggestion[] = [
  {
    id: 'rps',
    phrase: 'piedra papel o tijera',
    title: 'Piedra, papel o tijera',
    badge: 'Juego interactivo',
  },
  {
    id: 'coin',
    phrase: 'lanzar moneda',
    title: 'Lanzar una moneda (Cara o Sello)',
    badge: 'Animación 3D',
  },
  {
    id: 'dice',
    phrase: 'tirar dado',
    title: 'Tirar un dado de 6 caras',
    badge: 'Azar 1–6',
  },
  {
    id: 'dino',
    phrase: 'dino',
    title: 'Dino Runner – Salta los obstáculos',
    badge: 'Arcade Chrome',
  },
  {
    id: 'roulette',
    phrase: 'ruleta',
    title: 'Ruleta del día de Luis Felipe',
    badge: 'Ruleta sorpresa',
  },
];

export interface RouletteSlice {
  id: string;
  label: string;
  shortLabel: string;
  color: string;
}

export const ROULETTE_PHRASES: RouletteSlice[] = [
  {
    id: 'disenador',
    label: '¡Hoy soy diseñador gráfico!',
    shortLabel: 'Diseñador gráfico',
    color: '#4285F4',
  },
  {
    id: 'videos',
    label: '¡Hoy edito videos!',
    shortLabel: 'Edito videos',
    color: '#EA4335',
  },
  {
    id: 'computacion',
    label: '¡Hoy hago tareas de Computación!',
    shortLabel: 'Tareas Computación',
    color: '#FBBC05',
  },
  {
    id: 'negocios',
    label: '¡Hoy dirijo un plan de Administración de Negocios!',
    shortLabel: 'Plan de Negocios',
    color: '#34A853',
  },
  {
    id: 'audiovisual',
    label: '¡Hoy produzco un proyecto de diseño audiovisual!',
    shortLabel: 'Diseño audiovisual',
    color: '#4285F4',
  },
  {
    id: 'ucsp',
    label: '¡Hoy estudio en la UCSP con un buen café!',
    shortLabel: 'Día en la UCSP',
    color: '#EA4335',
  },
];

/**
 * Normalizes a search string and checks if it triggers one of the 5 Easter-egg games.
 */
export function matchEasterEggQuery(rawQuery: string): EasterEggGameId | null {
  const normalized = rawQuery
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[.,!?¿¡]/g, '')
    .replace(/\s+/g, ' ');

  if (!normalized) return null;

  if (
    normalized === 'piedra papel o tijera' ||
    normalized === 'piedra papel tijera' ||
    normalized.includes('piedra papel')
  ) {
    return 'rps';
  }
  if (normalized === 'lanzar moneda' || normalized === 'moneda' || normalized === 'cara o sello') {
    return 'coin';
  }
  if (normalized === 'tirar dado' || normalized === 'lanzar dado' || normalized === 'dado') {
    return 'dice';
  }
  if (normalized === 'dino' || normalized === 'dinosaurio' || normalized === 'chrome dino') {
    return 'dino';
  }
  if (normalized === 'ruleta' || normalized === 'girar ruleta') {
    return 'roulette';
  }

  return null;
}

/**
 * Picks one of the 5 Easter-egg games at random for the "Voy a tener suerte" button.
 */
export function pickRandomEasterEgg(
  randomVal: number = Math.random(),
  excludeId?: EasterEggGameId | null
): EasterEggGameId {
  const pool = excludeId
    ? EASTER_EGG_SUGGESTIONS.filter((item) => item.id !== excludeId)
    : EASTER_EGG_SUGGESTIONS;
  const clamped = Math.max(0, Math.min(0.9999, randomVal));
  const idx = Math.floor(clamped * pool.length);
  return pool[idx].id;
}

export type RpsMove = 'piedra' | 'papel' | 'tijera';
export type RpsOutcome = 'win' | 'loss' | 'tie';

export function evaluateRpsRound(player: RpsMove, cpu: RpsMove): RpsOutcome {
  if (player === cpu) return 'tie';
  if (
    (player === 'piedra' && cpu === 'tijera') ||
    (player === 'papel' && cpu === 'piedra') ||
    (player === 'tijera' && cpu === 'papel')
  ) {
    return 'win';
  }
  return 'loss';
}

export function flipCoinOutcome(randomVal: number = Math.random()): 'cara' | 'sello' {
  return randomVal < 0.5 ? 'cara' : 'sello';
}

export function rollDiceOutcome(randomVal: number = Math.random()): 1 | 2 | 3 | 4 | 5 | 6 {
  const clamped = Math.max(0, Math.min(0.9999, randomVal));
  return (Math.floor(clamped * 6) + 1) as 1 | 2 | 3 | 4 | 5 | 6;
}
