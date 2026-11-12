import { useEffect, useState } from 'react';
import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
} from 'firebase/firestore';
import { Trophy, Gamepad2 } from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { getOrCreateVisitorId } from '../utils/guestbookUtils';

export interface LeaderboardEntry {
  id: string;
  playerName: string;
  score: number;
  visitorId: string;
  createdAt: Timestamp | null;
}

interface LeaderboardTableProps {
  compact?: boolean;
  highlightScoreId?: string | null;
  onPlayStarDash?: () => void;
}

function formatScoreDate(ts: Timestamp | null): string {
  if (!ts || typeof ts.toDate !== 'function') return 'Hoy';
  return new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: 'short',
  }).format(ts.toDate());
}

export function LeaderboardTable({
  compact = false,
  highlightScoreId,
  onPlayStarDash,
}: LeaderboardTableProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const currentVisitorId = getOrCreateVisitorId();

  useEffect(() => {
    const path = 'leaderboard';
    const q = query(collection(db, path), orderBy('score', 'desc'), limit(10));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: LeaderboardEntry[] = snapshot.docs.map((docSnap) => {
          const d = docSnap.data();
          return {
            id: docSnap.id,
            playerName: typeof d.playerName === 'string' ? d.playerName : 'Piloto LF',
            score: typeof d.score === 'number' ? d.score : 0,
            visitorId: typeof d.visitorId === 'string' ? d.visitorId : '',
            createdAt: d.createdAt ?? null,
          };
        });
        setEntries(list);
        setLoading(false);
      },
      (err) => {
        setLoading(false);
        handleFirestoreError(err, OperationType.LIST, path);
      }
    );

    return () => unsubscribe();
  }, []);

  return (
    <div
      data-testid={compact ? 'leaderboard-compact' : 'leaderboard-page-section'}
      className={
        compact
          ? 'rounded-xl border border-[#3c4043] bg-[#161b26] p-3.5 text-[#e8eaed]'
          : 'pt-6 border-t border-[#ebebeb] dark:border-[#3c4043] space-y-4'
      }
    >
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2">
          <Trophy
            className="w-5 h-5 text-[#FBBC05] shrink-0"
            aria-hidden="true"
          />
          <div>
            {compact ? (
              <h3 className="text-sm font-semibold text-white">
                Top 10 global · Star Dash
              </h3>
            ) : (
              <h2 className="text-lg sm:text-xl font-normal text-[#202124] dark:text-[#e8eaed]">
                Top 10 global · Ranking Star Dash
              </h2>
            )}
            {!compact && (
              <p className="text-xs text-[#5f6368] dark:text-[#9aa0a6]">
                Clasificación en tiempo real guardada en Firebase (Firestore)
              </p>
            )}
          </div>
        </div>

        {!compact && onPlayStarDash && (
          <button
            type="button"
            onClick={onPlayStarDash}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#1a73e8] hover:bg-[#1557b0] dark:bg-[#8ab4f8] dark:hover:bg-[#aecbfa] text-white dark:text-[#202124] text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Gamepad2 className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Jugar Star Dash</span>
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-xs text-[#70757a] dark:text-[#9aa0a6] py-3">
          Cargando clasificación global en tiempo real...
        </p>
      ) : entries.length === 0 ? (
        <div
          className={`p-4 rounded-xl border text-xs ${
            compact
              ? 'border-[#3c4043] bg-[#0B0F19] text-[#9aa0a6]'
              : 'border-[#ebebeb] dark:border-[#3c4043] text-[#5f6368] dark:text-[#9aa0a6]'
          }`}
        >
          Aún no hay récords registrados en el Top 10. ¡Juega una partida de Star Dash e inaugura el marcador!
        </div>
      ) : (
        <div
          className={`overflow-hidden rounded-xl border ${
            compact
              ? 'border-[#2d3548] bg-[#0B0F19]'
              : 'border-[#dadce0] dark:border-[#3c4043] bg-white dark:bg-[#202124]'
          }`}
        >
          <div className="divide-y divide-[#ebebeb] dark:divide-[#3c4043]">
            {entries.map((entry, idx) => {
              const rank = idx + 1;
              const isCurrentPlayer =
                (highlightScoreId && entry.id === highlightScoreId) ||
                entry.visitorId === currentVisitorId;

              const medalBadge =
                rank === 1 ? (
                  <span
                    title="Medalla de Oro - 1.° puesto"
                    className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#FBBC05]/20 text-[#FBBC05] font-bold text-xs"
                  >
                    🥇
                  </span>
                ) : rank === 2 ? (
                  <span
                    title="Medalla de Plata - 2.° puesto"
                    className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#9AA0A6]/25 text-[#9AA0A6] font-bold text-xs"
                  >
                    🥈
                  </span>
                ) : rank === 3 ? (
                  <span
                    title="Medalla de Bronce - 3.° puesto"
                    className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#D97706]/20 text-[#D97706] font-bold text-xs"
                  >
                    🥉
                  </span>
                ) : (
                  <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-mono tabular-nums text-[#70757a] dark:text-[#9aa0a6]">
                    {rank}
                  </span>
                );

              return (
                <div
                  key={entry.id}
                  className={`flex items-center justify-between gap-3 px-3.5 py-2.5 text-xs sm:text-sm transition-colors ${
                    isCurrentPlayer
                      ? compact
                        ? 'bg-[#4285F4]/20 text-white font-semibold'
                        : 'bg-[#e8f0fe]/70 dark:bg-[#8ab4f8]/15 font-semibold'
                      : ''
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {medalBadge}
                    <span
                      className={`truncate ${
                        compact
                          ? 'text-[#e8eaed]'
                          : 'text-[#202124] dark:text-[#e8eaed]'
                      }`}
                    >
                      {entry.playerName}
                    </span>
                    {isCurrentPlayer && (
                      <span className="text-[11px] font-medium text-[#1a73e8] dark:text-[#8ab4f8]">
                        · Tú
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 shrink-0 font-mono tabular-nums">
                    <span className="text-[11px] text-[#70757a] dark:text-[#9aa0a6]">
                      {formatScoreDate(entry.createdAt)}
                    </span>
                    <span
                      className={`font-bold ${
                        rank === 1
                          ? 'text-[#FBBC05]'
                          : compact
                          ? 'text-[#8ab4f8]'
                          : 'text-[#1a73e8] dark:text-[#8ab4f8]'
                      }`}
                    >
                      {entry.score.toLocaleString('es-PE')} pts
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
