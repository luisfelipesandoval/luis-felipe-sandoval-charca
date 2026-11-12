import React, { useEffect, useState } from 'react';
import {
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
} from 'firebase/firestore';
import { MessageSquarePlus, Send, Clock, AlertCircle, CheckCircle2, User } from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import {
  getOrCreateVisitorId,
  getRemainingCooldownSeconds,
  MAX_AUTHOR_LENGTH,
  MAX_COMMENT_LENGTH,
  validateGuestbookInput,
} from '../utils/guestbookUtils';

interface GuestbookEntry {
  id: string;
  authorName: string;
  message: string;
  createdAt: Timestamp | null;
}

const LAST_SUBMIT_STORAGE_KEY = 'lf_guestbook_last_submit_ms';

function formatRelativeDate(ts: Timestamp | null): string {
  if (!ts || typeof ts.toDate !== 'function') {
    return 'Hace unos segundos';
  }
  const date = ts.toDate();
  return new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function GuestbookSection() {
  const [comments, setComments] = useState<GuestbookEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [authorInput, setAuthorInput] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [cooldownSeconds, setCooldownSeconds] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(LAST_SUBMIT_STORAGE_KEY);
      return getRemainingCooldownSeconds(saved ? Number(saved) : null);
    } catch {
      return 0;
    }
  });

  // Subscribe to Firestore /guestbook ordered from newest to oldest
  useEffect(() => {
    const path = 'guestbook';
    const q = query(collection(db, path), orderBy('createdAt', 'desc'), limit(50));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items: GuestbookEntry[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            authorName: typeof data.authorName === 'string' ? data.authorName : 'Anónimo',
            message: typeof data.message === 'string' ? data.message : '',
            createdAt: data.createdAt ?? null,
          };
        });
        setComments(items);
        setLoading(false);
      },
      (err) => {
        setLoading(false);
        handleFirestoreError(err, OperationType.LIST, path);
      }
    );

    return () => unsubscribe();
  }, []);

  // Tick down the 30-second rate-limit timer
  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const timer = setInterval(() => {
      try {
        const saved = localStorage.getItem(LAST_SUBMIT_STORAGE_KEY);
        const rem = getRemainingCooldownSeconds(saved ? Number(saved) : null);
        setCooldownSeconds(rem);
      } catch {
        setCooldownSeconds((prev) => Math.max(0, prev - 1));
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldownSeconds]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // Check 30-second per-visitor rate limit
    try {
      const saved = localStorage.getItem(LAST_SUBMIT_STORAGE_KEY);
      const rem = getRemainingCooldownSeconds(saved ? Number(saved) : null);
      if (rem > 0) {
        setCooldownSeconds(rem);
        setErrorMsg(`Por favor espera ${rem} segundos antes de enviar otro comentario.`);
        return;
      }
    } catch {
      // ignore storage errors
    }

    const validation = validateGuestbookInput(authorInput, messageInput);
    if (!validation.valid) {
      setErrorMsg(validation.error || 'Datos inválidos.');
      return;
    }

    setSubmitting(true);
    const path = 'guestbook';
    const commentId = `c_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

    try {
      await setDoc(doc(db, path, commentId), {
        authorName: validation.authorName,
        message: validation.message,
        visitorId: getOrCreateVisitorId(),
        createdAt: serverTimestamp(),
      });

      const nowMs = Date.now();
      try {
        localStorage.setItem(LAST_SUBMIT_STORAGE_KEY, String(nowMs));
      } catch {
        // ignore storage errors
      }
      setCooldownSeconds(30);
      setMessageInput('');
      setSuccessMsg('¡Gracias! Tu comentario ha quedado guardado en el libro de visitas.');
    } catch (error) {
      setErrorMsg('No se pudo guardar el comentario. Verifica que no incluya enlaces.');
      handleFirestoreError(error, OperationType.CREATE, path);
    } finally {
      setSubmitting(false);
    }
  };

  const remainingChars = MAX_COMMENT_LENGTH - messageInput.length;

  return (
    <section
      id="libro-de-visitas"
      aria-labelledby="guestbook-heading"
      data-testid="guestbook-section"
      className="pt-6 border-t border-[#ebebeb] dark:border-[#3c4043] space-y-5"
    >
      {/* Section Header */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2
            id="guestbook-heading"
            className="text-lg sm:text-xl font-normal text-[#202124] dark:text-[#e8eaed] flex items-center gap-2"
          >
            <MessageSquarePlus
              className="w-5 h-5 text-[#1a73e8] dark:text-[#8ab4f8] shrink-0"
              aria-hidden="true"
            />
            <span>Libro de visitas</span>
          </h2>
          <p className="text-xs text-[#5f6368] dark:text-[#9aa0a6] mt-0.5">
            Deja un saludo o mensaje corto (máximo 200 caracteres, sin enlaces). Los comentarios se guardan permanentemente.
          </p>
        </div>
        <span className="text-xs text-[#70757a] dark:text-[#9aa0a6] font-mono tabular-nums whitespace-nowrap shrink-0">
          {comments.length} {comments.length === 1 ? 'comentario' : 'comentarios'}
        </span>
      </div>

      {/* Google-styled Comment Form Card */}
      <form
        onSubmit={handleSubmit}
        noValidate
        className="p-4 sm:p-5 rounded-2xl border border-[#dadce0] dark:border-[#3c4043] bg-[#f8f9fa]/70 dark:bg-[#303134]/50 space-y-3.5"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="guestbook-author"
              className="block text-xs font-medium text-[#5f6368] dark:text-[#9aa0a6] mb-1"
            >
              Tu nombre (opcional, por defecto &quot;Anónimo&quot;)
            </label>
            <input
              id="guestbook-author"
              type="text"
              maxLength={MAX_AUTHOR_LENGTH}
              value={authorInput}
              onChange={(e) => setAuthorInput(e.target.value)}
              placeholder="Anónimo"
              className="w-full h-10 px-3.5 rounded-xl bg-white dark:bg-[#202124] border border-[#dadce0] dark:border-[#5f6368] text-sm text-[#202124] dark:text-[#e8eaed] placeholder-[#70757a] dark:placeholder-[#9aa0a6] focus:border-[#1a73e8] dark:focus:border-[#8ab4f8] focus:outline-none transition-colors"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label
              htmlFor="guestbook-message"
              className="block text-xs font-medium text-[#5f6368] dark:text-[#9aa0a6]"
            >
              Mensaje corto
            </label>
            <span
              className={`text-xs font-mono tabular-nums ${
                remainingChars < 0
                  ? 'text-[#EA4335] font-bold'
                  : remainingChars <= 25
                  ? 'text-[#FBBC05]'
                  : 'text-[#70757a] dark:text-[#9aa0a6]'
              }`}
            >
              {messageInput.length}/{MAX_COMMENT_LENGTH}
            </span>
          </div>

          <textarea
            id="guestbook-message"
            rows={2}
            value={messageInput}
            onChange={(e) => {
              setMessageInput(e.target.value);
              if (errorMsg) setErrorMsg(null);
            }}
            placeholder="Escribe tu comentario para Luis Felipe..."
            className="w-full p-3.5 rounded-xl bg-white dark:bg-[#202124] border border-[#dadce0] dark:border-[#5f6368] text-sm text-[#202124] dark:text-[#e8eaed] placeholder-[#70757a] dark:placeholder-[#9aa0a6] focus:border-[#1a73e8] dark:focus:border-[#8ab4f8] focus:outline-none transition-colors resize-none"
          />
        </div>

        {errorMsg && (
          <div
            role="alert"
            data-testid="guestbook-error"
            className="flex items-center gap-2 text-xs text-[#EA4335] dark:text-[#f28b82]"
          >
            <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div
            role="status"
            data-testid="guestbook-success"
            className="flex items-center gap-2 text-xs text-[#34A853] dark:text-[#81c995]"
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>{successMsg}</span>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <span className="text-[11px] text-[#70757a] dark:text-[#9aa0a6] flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>
              {cooldownSeconds > 0
                ? `Podrás enviar otro mensaje en ${cooldownSeconds} s`
                : 'Límite anti-spam: 1 comentario cada 30 segundos · Sin enlaces'}
            </span>
          </span>

          <button
            type="submit"
            disabled={submitting || cooldownSeconds > 0}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#1a73e8] hover:bg-[#1557b0] disabled:opacity-50 dark:bg-[#8ab4f8] dark:hover:bg-[#aecbfa] text-white dark:text-[#202124] text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:cursor-not-allowed"
          >
            <Send className="w-3.5 h-3.5" aria-hidden="true" />
            <span>
              {submitting
                ? 'Publicando...'
                : cooldownSeconds > 0
                ? `Espera ${cooldownSeconds}s`
                : 'Publicar comentario'}
            </span>
          </button>
        </div>
      </form>

      {/* Comments List (Newest to Oldest) */}
      <div className="space-y-3" data-testid="guestbook-list">
        {loading ? (
          <p className="text-xs text-[#70757a] dark:text-[#9aa0a6] py-2">
            Cargando comentarios del libro de visitas...
          </p>
        ) : comments.length === 0 ? (
          <div className="p-4 rounded-xl border border-[#ebebeb] dark:border-[#3c4043] text-xs text-[#5f6368] dark:text-[#9aa0a6]">
            Aún no hay comentarios publicados. ¡Sé la primera persona en dejar un saludo!
          </div>
        ) : (
          comments.map((item) => (
            <article
              key={item.id}
              className="p-3.5 sm:p-4 rounded-xl border border-[#dadce0] dark:border-[#3c4043] bg-white dark:bg-[#202124] hover:border-[#bdc1c6] dark:hover:border-[#5f6368] transition-colors"
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className="w-6 h-6 rounded-full bg-[#e8f0fe] dark:bg-[#303134] text-[#1a73e8] dark:text-[#8ab4f8] flex items-center justify-center text-xs font-bold shrink-0"
                    aria-hidden="true"
                  >
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-sm font-medium text-[#1a0dab] dark:text-[#8ab4f8] truncate">
                    {item.authorName}
                  </span>
                </div>
                <time className="text-[11px] text-[#70757a] dark:text-[#9aa0a6] whitespace-nowrap shrink-0">
                  {formatRelativeDate(item.createdAt)}
                </time>
              </div>
              <p className="text-sm text-[#4d5156] dark:text-[#bdc1c6] leading-relaxed break-words">
                {item.message}
              </p>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
