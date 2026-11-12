export const MAX_COMMENT_LENGTH = 200;
export const MAX_AUTHOR_LENGTH = 60;
export const RATE_LIMIT_SECONDS = 30;

const LINK_SPAM_REGEX =
  /(https?:\/\/|www\.|[a-z0-9\-]+\.(com|net|org|pe|io|app|xyz|info|biz|me)(\/|$|\s))/i;

/**
 * Detects URLs or domain links in text to block link spam.
 */
export function containsSpamLinks(text: string): boolean {
  return LINK_SPAM_REGEX.test(text.trim());
}

export interface GuestbookValidationResult {
  valid: boolean;
  authorName: string;
  message: string;
  error?: string;
}

/**
 * Validates and sanitizes visitor guestbook input before sending to Firestore.
 * Mirrors the exact constraints in `firebase-blueprint.json` and `firestore.rules`.
 */
export function validateGuestbookInput(
  rawAuthor: string,
  rawMessage: string
): GuestbookValidationResult {
  const trimmedAuthor = rawAuthor.trim();
  const authorName = trimmedAuthor.length > 0 ? trimmedAuthor : 'Anónimo';
  const message = rawMessage.trim();

  if (authorName.length > MAX_AUTHOR_LENGTH) {
    return {
      valid: false,
      authorName,
      message,
      error: `El nombre no puede superar los ${MAX_AUTHOR_LENGTH} caracteres.`,
    };
  }

  if (containsSpamLinks(authorName)) {
    return {
      valid: false,
      authorName,
      message,
      error: 'No se permiten enlaces ni direcciones web en el nombre.',
    };
  }

  if (message.length === 0) {
    return {
      valid: false,
      authorName,
      message,
      error: 'Por favor escribe un mensaje antes de publicar.',
    };
  }

  if (message.length > MAX_COMMENT_LENGTH) {
    return {
      valid: false,
      authorName,
      message,
      error: `El mensaje no puede superar los ${MAX_COMMENT_LENGTH} caracteres (actual: ${message.length}).`,
    };
  }

  if (containsSpamLinks(message)) {
    return {
      valid: false,
      authorName,
      message,
      error: 'Por protección contra spam, no se permiten enlaces en los comentarios.',
    };
  }

  return {
    valid: true,
    authorName,
    message,
  };
}

/**
 * Calculates how many seconds remain in the 30-second per-visitor cooldown.
 */
export function getRemainingCooldownSeconds(
  lastSubmittedMs: number | null,
  nowMs: number = Date.now()
): number {
  if (!lastSubmittedMs || lastSubmittedMs <= 0) return 0;
  const elapsedSeconds = Math.floor((nowMs - lastSubmittedMs) / 1000);
  const remaining = RATE_LIMIT_SECONDS - elapsedSeconds;
  return remaining > 0 ? remaining : 0;
}

/**
 * Retrieves or generates a persistent anonymous visitor ID matching `^[a-zA-Z0-9_\-]+$`.
 */
export function getOrCreateVisitorId(): string {
  const storageKey = 'lf_guestbook_visitor_id';
  try {
    const existing = localStorage.getItem(storageKey);
    if (existing && /^[a-zA-Z0-9_-]{4,128}$/.test(existing)) {
      return existing;
    }
    const generated = `v_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(storageKey, generated);
    return generated;
  } catch {
    return `v_${Date.now().toString(36)}`;
  }
}
