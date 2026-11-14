import { useCallback, useState } from 'react';
import { RotateCcw, Plus, Hand, Coins, Sparkles } from 'lucide-react';
import {
  BlackjackOutcome,
  calculateHandValue,
  createShuffledDeck,
  evaluateBlackjackOutcome,
  PlayingCard,
} from '../utils/blackjackRules';

function CardView({ card, hidden = false }: { card: PlayingCard; hidden?: boolean }) {
  if (hidden) {
    return (
      <div
        aria-label="Carta oculta del crupier"
        className="w-16 h-24 sm:w-20 sm:h-28 rounded-xl border-2 border-white/80 bg-gradient-to-br from-[#1a73e8] to-[#0d47a1] shadow-md flex items-center justify-center select-none shrink-0"
      >
        <div className="w-11 h-18 sm:w-14 sm:h-22 rounded-lg border border-white/30 flex items-center justify-center text-white font-bold text-sm">
          LF
        </div>
      </div>
    );
  }

  const isRed = card.suit === '♥' || card.suit === '♦';

  return (
    <div
      aria-label={`Carta ${card.rank} de ${card.suit}`}
      className="w-16 h-24 sm:w-20 sm:h-28 rounded-xl border border-[#dadce0] bg-white text-[#202124] shadow-md p-2 flex flex-col justify-between select-none shrink-0 transition-transform duration-150 hover:-translate-y-0.5"
    >
      <div
        className={`text-xs sm:text-sm font-bold leading-none ${
          isRed ? 'text-[#DC2626]' : 'text-[#202124]'
        }`}
      >
        <div>{card.rank}</div>
        <div>{card.suit}</div>
      </div>

      <div
        className={`text-2xl sm:text-3xl text-center leading-none ${
          isRed ? 'text-[#DC2626]' : 'text-[#202124]'
        }`}
      >
        {card.suit}
      </div>

      <div
        className={`text-xs sm:text-sm font-bold leading-none self-end rotate-180 ${
          isRed ? 'text-[#DC2626]' : 'text-[#202124]'
        }`}
      >
        <div>{card.rank}</div>
        <div>{card.suit}</div>
      </div>
    </div>
  );
}

const OUTCOME_MESSAGES: Record<
  BlackjackOutcome,
  { text: string; badgeClass: string }
> = {
  blackjack: {
    text: '¡BLACKJACK 21! Ganaste pago 3:2',
    badgeClass: 'bg-[#FBBC05]/25 text-[#FEF7E0] border-[#FBBC05]',
  },
  win: {
    text: '¡Ganaste la mano contra el crupier!',
    badgeClass: 'bg-[#34A853]/25 text-[#81c995] border-[#34A853]',
  },
  dealer_bust: {
    text: '¡El crupier se pasó de 21! Tú ganas',
    badgeClass: 'bg-[#34A853]/25 text-[#81c995] border-[#34A853]',
  },
  push: {
    text: 'Empate (Push) · Recuperas tu apuesta',
    badgeClass: 'bg-white/15 text-white border-white/30',
  },
  bust: {
    text: 'Te pasaste de 21 (Bust) · Gana el crupier',
    badgeClass: 'bg-[#EA4335]/25 text-[#f28b82] border-[#EA4335]',
  },
  loss: {
    text: 'El crupier gana esta mano',
    badgeClass: 'bg-[#EA4335]/25 text-[#f28b82] border-[#EA4335]',
  },
};

export function BlackjackMiniGame() {
  const [State, setState] = useState(() => {
    const initialDeck = createShuffledDeck();
    const playerHand = [initialDeck[0], initialDeck[2]];
    const dealerHand = [initialDeck[1], initialDeck[3]];
    const remainingDeck = initialDeck.slice(4);
    const pVal = calculateHandValue(playerHand);
    const dVal = calculateHandValue(dealerHand);

    let phase: 'playing' | 'finished' = 'playing';
    let outcome: BlackjackOutcome | null = null;
    let chips = 500;
    const bet = 50;
    const stats = { wins: 0, losses: 0, pushes: 0 };

    if (pVal.isBlackjack || dVal.isBlackjack) {
      phase = 'finished';
      outcome = evaluateBlackjackOutcome(playerHand, dealerHand);
      if (outcome === 'blackjack') {
        chips += Math.floor(bet * 1.5);
        stats.wins += 1;
      } else if (outcome === 'loss') {
        chips -= bet;
        stats.losses += 1;
      } else {
        stats.pushes += 1;
      }
    }

    return {
      deck: remainingDeck,
      playerHand,
      dealerHand,
      phase,
      outcome,
      chips,
      bet,
      stats,
    };
  });

  const settleRound = useCallback(
    (
      finalPlayerHand: PlayingCard[],
      currentDealerHand: PlayingCard[],
      currentDeck: PlayingCard[],
      currentBet: number,
      currentChips: number,
      currentStats: { wins: number; losses: number; pushes: number }
    ) => {
      const deckCopy = [...currentDeck];
      const dealerCopy = [...currentDealerHand];
      const pEval = calculateHandValue(finalPlayerHand);

      // Dealer draws until >= 17 if player didn't bust
      if (!pEval.isBust) {
        while (calculateHandValue(dealerCopy).total < 17 && deckCopy.length > 0) {
          dealerCopy.push(deckCopy.shift()!);
        }
      }

      const outcome = evaluateBlackjackOutcome(finalPlayerHand, dealerCopy);
      let nextChips = currentChips;
      const nextStats = { ...currentStats };

      if (outcome === 'blackjack') {
        nextChips += Math.floor(currentBet * 1.5);
        nextStats.wins += 1;
      } else if (outcome === 'win' || outcome === 'dealer_bust') {
        nextChips += currentBet;
        nextStats.wins += 1;
      } else if (outcome === 'loss' || outcome === 'bust') {
        nextChips = Math.max(50, currentChips - currentBet);
        nextStats.losses += 1;
      } else {
        nextStats.pushes += 1;
      }

      setState({
        deck: deckCopy,
        playerHand: finalPlayerHand,
        dealerHand: dealerCopy,
        phase: 'finished',
        outcome,
        chips: nextChips,
        bet: 50,
        stats: nextStats,
      });
    },
    []
  );

  const handleDealNewHand = () => {
    const freshDeck = createShuffledDeck();
    const playerHand = [freshDeck[0], freshDeck[2]];
    const dealerHand = [freshDeck[1], freshDeck[3]];
    const remaining = freshDeck.slice(4);

    const pVal = calculateHandValue(playerHand);
    const dVal = calculateHandValue(dealerHand);

    if (pVal.isBlackjack || dVal.isBlackjack) {
      settleRound(playerHand, dealerHand, remaining, 50, State.chips, State.stats);
      return;
    }

    setState((prev) => ({
      ...prev,
      deck: remaining,
      playerHand,
      dealerHand,
      phase: 'playing',
      outcome: null,
      bet: 50,
    }));
  };

  const handleHit = () => {
    if (State.phase !== 'playing' || State.deck.length === 0) return;
    const nextCard = State.deck[0];
    const nextDeck = State.deck.slice(1);
    const nextPlayerHand = [...State.playerHand, nextCard];
    const pEval = calculateHandValue(nextPlayerHand);

    if (pEval.total >= 21) {
      settleRound(
        nextPlayerHand,
        State.dealerHand,
        nextDeck,
        State.bet,
        State.chips,
        State.stats
      );
    } else {
      setState((prev) => ({
        ...prev,
        deck: nextDeck,
        playerHand: nextPlayerHand,
      }));
    }
  };

  const handleStand = () => {
    if (State.phase !== 'playing') return;
    settleRound(
      State.playerHand,
      State.dealerHand,
      State.deck,
      State.bet,
      State.chips,
      State.stats
    );
  };

  const handleDoubleDown = () => {
    if (State.phase !== 'playing' || State.playerHand.length !== 2 || State.deck.length === 0) {
      return;
    }
    const nextCard = State.deck[0];
    const nextDeck = State.deck.slice(1);
    const nextPlayerHand = [...State.playerHand, nextCard];
    const doubledBet = State.bet * 2;
    settleRound(
      nextPlayerHand,
      State.dealerHand,
      nextDeck,
      doubledBet,
      State.chips,
      State.stats
    );
  };

  const playerEval = calculateHandValue(State.playerHand);
  const dealerFullEval = calculateHandValue(State.dealerHand);
  const dealerVisibleEval = calculateHandValue([State.dealerHand[0]]);

  return (
    <div
      data-testid="blackjack-game"
      className="rounded-2xl border border-[#2d3548] bg-[#0F5132] text-white p-4 sm:p-5 shadow-inner space-y-5"
    >
      {/* Top HUD Bar: Chips & Win/Loss/Push Counters */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/15 text-xs sm:text-sm">
        <div className="flex items-center gap-3 font-mono tabular-nums">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/30 text-[#FBBC05] font-bold">
            <Coins className="w-4 h-4" aria-hidden="true" />
            <span>Fichas: {State.chips}</span>
          </span>
          <span className="text-white/80">Apuesta: {State.bet}</span>
        </div>

        <div className="flex items-center gap-3 font-mono tabular-nums text-xs">
          <span className="text-[#81c995]">Ganadas: {State.stats.wins}</span>
          <span>·</span>
          <span className="text-[#FEF7E0]">Empates: {State.stats.pushes}</span>
          <span>·</span>
          <span className="text-[#f28b82]">Perdidas: {State.stats.losses}</span>
        </div>
      </div>

      {/* Dealer Zone */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs uppercase tracking-wider text-white/80 font-semibold">
          <span>Mano del Crupier</span>
          <span className="font-mono tabular-nums px-2.5 py-0.5 rounded bg-black/25">
            Total: {State.phase === 'playing' ? `${dealerVisibleEval.total} + ?` : dealerFullEval.total}
          </span>
        </div>
        <div className="flex items-center gap-2.5 overflow-x-auto py-1">
          {State.dealerHand.map((card, idx) => (
            <CardView
              key={`${card.id}-${idx}`}
              card={card}
              hidden={State.phase === 'playing' && idx === 1}
            />
          ))}
        </div>
      </div>

      {/* Outcome Banner when hand finishes */}
      {State.phase === 'finished' && State.outcome && (
        <div
          data-testid="blackjack-outcome"
          className={`p-3 rounded-xl border text-center text-sm font-bold flex items-center justify-center gap-2 ${
            OUTCOME_MESSAGES[State.outcome].badgeClass
          }`}
        >
          <Sparkles className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>{OUTCOME_MESSAGES[State.outcome].text}</span>
        </div>
      )}

      {/* Player Zone */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs uppercase tracking-wider text-white/90 font-semibold">
          <span>Tu Mano (Luis Felipe)</span>
          <span
            data-testid="blackjack-player-total"
            className="font-mono tabular-nums px-2.5 py-0.5 rounded bg-black/35 text-[#FBBC05]"
          >
            Total: {playerEval.total}
            {playerEval.isSoft ? ' (Suave)' : ''}
          </span>
        </div>
        <div className="flex items-center gap-2.5 overflow-x-auto py-1">
          {State.playerHand.map((card, idx) => (
            <CardView key={`${card.id}-${idx}`} card={card} />
          ))}
        </div>
      </div>

      {/* Action Controls */}
      <div className="pt-2 border-t border-white/15 flex flex-wrap items-center justify-center gap-3">
        {State.phase === 'playing' ? (
          <>
            <button
              type="button"
              onClick={handleHit}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#4285F4] hover:bg-[#1a73e8] text-white text-xs sm:text-sm font-semibold shadow transition-transform active:scale-95 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              <span>Pedir carta</span>
            </button>

            <button
              type="button"
              onClick={handleStand}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#FBBC05] hover:bg-[#f29900] text-[#202124] text-xs sm:text-sm font-semibold shadow transition-transform active:scale-95 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Hand className="w-4 h-4" aria-hidden="true" />
              <span>Plantarse</span>
            </button>

            {State.playerHand.length === 2 && (
              <button
                type="button"
                onClick={handleDoubleDown}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white/15 hover:bg-white/25 text-white text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Coins className="w-4 h-4 text-[#FBBC05]" aria-hidden="true" />
                <span>Doblar apuesta (x2)</span>
              </button>
            )}
          </>
        ) : (
          <button
            type="button"
            onClick={handleDealNewHand}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#FBBC05] hover:bg-[#f29900] text-[#202124] text-sm font-bold shadow-md transition-transform active:scale-95 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
            <span>Repartir nueva mano</span>
          </button>
        )}
      </div>
    </div>
  );
}
