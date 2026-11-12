export type TabId = 'todo' | 'imagenes' | 'videos' | 'amigos' | 'noticias';

export interface TabDefinition {
  id: TabId;
  label: string;
  isFunctional: boolean;
}

export const SEARCH_TABS: TabDefinition[] = [
  { id: 'todo', label: 'Todo', isFunctional: true },
  { id: 'imagenes', label: 'Imágenes', isFunctional: false },
  { id: 'videos', label: 'Videos', isFunctional: false },
  { id: 'amigos', label: 'Amigos', isFunctional: true },
  { id: 'noticias', label: 'Noticias', isFunctional: false },
];

export const GOOGLE_COLORS = ['#4285F4', '#EA4335', '#FBBC05', '#34A853'] as const;

/**
 * Generates a realistic random search time in seconds between 0.18 and 0.68,
 * formatted with a Spanish decimal comma (e.g. "0,42").
 */
export function generateRandomSearchSeconds(randomValue: number = Math.random()): string {
  const clamped = Math.max(0, Math.min(0.9999, randomValue));
  const hundredths = Math.floor(18 + clamped * 51); // 18..68
  return `0,${hundredths.toString().padStart(2, '0')}`;
}

/**
 * Formats the complete Google search stats line.
 */
export function formatSearchStatsText(secondsFormatted: string, resultCount: number = 1): string {
  if (resultCount === 1) {
    return `Aproximadamente 1 resultado (${secondsFormatted} segundos)`;
  }
  return `Aproximadamente ${resultCount} resultados (${secondsFormatted} segundos)`;
}

/**
 * Assigns one of the 4 iconic colors (blue, red, yellow, green) to each character
 * in the wordmark, skipping spaces when advancing the color index.
 */
export function getWordmarkColoredChars(text: string): Array<{ char: string; color: string }> {
  let colorIndex = 0;
  return Array.from(text).map((char) => {
    if (char === ' ') {
      return { char, color: 'transparent' };
    }
    const color = GOOGLE_COLORS[colorIndex % GOOGLE_COLORS.length];
    colorIndex += 1;
    return { char, color };
  });
}

/**
 * Checks that the meta description satisfies the strict 150-160 character SEO rule.
 */
export function isValidMetaDescriptionLength(description: string): boolean {
  const len = description.trim().length;
  return len >= 150 && len <= 160;
}

/**
 * Ensures link anchor text is descriptive and never uses generic "haz clic aquí".
 */
export function isDescriptiveLinkText(text: string): boolean {
  const normalized = text.trim().toLowerCase();
  if (!normalized || normalized.length < 4) return false;
  const bannedPhrases = ['haz clic aquí', 'haz click aquí', 'clic aquí', 'click here', 'aquí'];
  return !bannedPhrases.includes(normalized);
}
