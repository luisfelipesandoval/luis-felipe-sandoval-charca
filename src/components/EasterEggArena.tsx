import { useState } from 'react';
import { X, RotateCcw, Sparkles, Dices, Coins, Hand, Gamepad2, Disc } from 'lucide-react';
import {
  EasterEggGameId,
  EASTER_EGG_SUGGESTIONS,
  RpsMove,
  RpsOutcome,
  evaluateRpsRound,
  flipCoinOutcome,
  rollDiceOutcome,
  ROULETTE_PHRASES,
} from '../utils/easterEggs';
import { DinoMiniGame } from './DinoMiniGame';
import { StarDashGame } from './StarDashGame';

interface EasterEggArenaProps {
  activeGame: EasterEggGameId;
  onSelectGame: (gameId: EasterEggGameId) => void;
  onClose: () => void;
}

const RPS_OPTIONS: Array<{ move: RpsMove; emoji: string; label: string }> = [
  { move: 'piedra', emoji: '🪨', label: 'Piedra' },
  { move: 'papel', emoji: '📄', label: 'Papel' },
  { move: 'tijera', emoji: '✂️', label: 'Tijera' },
];

const DICE_PIPS: Record<number, number[]> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

export function EasterEggArena({ activeGame, onSelectGame, onClose }: EasterEggArenaProps) {
  // 1. Rock Paper Scissors state
  const [rpsStats, setRpsStats] = useState({ wins: 0, losses: 0, ties: 0 });
  const [rpsRound, setRpsRound] = useState<{
    player: RpsMove;
    cpu: RpsMove;
    outcome: RpsOutcome;
  } | null>(null);
  const [rpsAnimating, setRpsAnimating] = useState(false);

  // 2. Coin Flip state
  const [coinSide, setCoinSide] = useState<'cara' | 'sello'>('cara');
  const [coinSpins, setCoinSpins] = useState(0);
  const [isFlippingCoin, setIsFlippingCoin] = useState(false);
  const [coinHistory, setCoinHistory] = useState({ cara: 1, sello: 0 });

  // 3. Dice Roll state
  const [diceValue, setDiceValue] = useState<1 | 2 | 3 | 4 | 5 | 6>(6);
  const [isRollingDice, setIsRollingDice] = useState(false);
  const [diceRollCount, setDiceRollCount] = useState(0);

  // 5. Roulette state
  const [rouletteRotation, setRouletteRotation] = useState(0);
  const [isSpinningRoulette, setIsSpinningRoulette] = useState(false);
  const [selectedPhrase, setSelectedPhrase] = useState<string>(ROULETTE_PHRASES[0].label);

  const handlePlayRps = (playerMove: RpsMove) => {
    if (rpsAnimating) return;
    setRpsAnimating(true);
    const moves: RpsMove[] = ['piedra', 'papel', 'tijera'];
    const cpuMove = moves[Math.floor(Math.random() * moves.length)];
    const outcome = evaluateRpsRound(playerMove, cpuMove);

    setTimeout(() => {
      setRpsRound({ player: playerMove, cpu: cpuMove, outcome });
      setRpsStats((prev) => ({
        wins: prev.wins + (outcome === 'win' ? 1 : 0),
        losses: prev.losses + (outcome === 'loss' ? 1 : 0),
        ties: prev.ties + (outcome === 'tie' ? 1 : 0),
      }));
      setRpsAnimating(false);
    }, 160);
  };

  const handleFlipCoin = () => {
    if (isFlippingCoin) return;
    setIsFlippingCoin(true);
    const nextOutcome = flipCoinOutcome();
    setCoinSpins((prev) => prev + 1);

    setTimeout(() => {
      setCoinSide(nextOutcome);
      setCoinHistory((prev) => ({
        ...prev,
        [nextOutcome]: prev[nextOutcome] + 1,
      }));
      setIsFlippingCoin(false);
    }, 550);
  };

  const handleRollDice = () => {
    if (isRollingDice) return;
    setIsRollingDice(true);
    const nextVal = rollDiceOutcome();
    setDiceRollCount((prev) => prev + 1);

    setTimeout(() => {
      setDiceValue(nextVal);
      setIsRollingDice(false);
    }, 380);
  };

  const handleSpinRoulette = () => {
    if (isSpinningRoulette) return;
    setIsSpinningRoulette(true);
    const sliceCount = ROULETTE_PHRASES.length;
    const sliceAngle = 360 / sliceCount;
    const chosenIndex = Math.floor(Math.random() * sliceCount);
    // Align pointer at top (0 deg) with the center of chosenIndex slice
    const targetMod = (360 - (chosenIndex * sliceAngle + sliceAngle / 2)) % 360;
    const currentMod = ((rouletteRotation % 360) + 360) % 360;
    const delta = (targetMod - currentMod + 360) % 360;
    const nextRotation = rouletteRotation + 360 * 4 + delta;

    setRouletteRotation(nextRotation);
    setTimeout(() => {
      setSelectedPhrase(ROULETTE_PHRASES[chosenIndex].label);
      setIsSpinningRoulette(false);
    }, 900);
  };

  const activeMeta =
    EASTER_EGG_SUGGESTIONS.find((item) => item.id === activeGame) || EASTER_EGG_SUGGESTIONS[0];

  return (
    <section
      aria-labelledby="easter-egg-panel-heading"
      data-testid="easter-egg-panel"
      className="mb-7 rounded-2xl border border-[#dadce0] dark:border-[#3c4043] bg-white dark:bg-[#202124] shadow-[0_1px_6px_rgba(32,33,36,0.1)] dark:shadow-none overflow-hidden transition-all"
    >
      {/* Top Header Bar of Easter Egg Widget */}
      <div className="px-4 sm:px-6 py-3.5 bg-[#f8f9fa] dark:bg-[#303134] border-b border-[#ebebeb] dark:border-[#3c4043] flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <Sparkles className="w-4 h-4 text-[#1a73e8] dark:text-[#8ab4f8] shrink-0" aria-hidden="true" />
          <h2
            id="easter-egg-panel-heading"
            className="text-base sm:text-lg font-medium text-[#202124] dark:text-[#e8eaed] truncate"
          >
            {activeMeta.title}
          </h2>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar minijuego"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium text-[#5f6368] dark:text-[#9aa0a6] hover:bg-[#e8eaed] dark:hover:bg-[#3c4043] hover:text-[#202124] dark:hover:text-[#e8eaed] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <span>Cerrar</span>
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>

      {/* Quick Switcher Bar between the 5 Easter Egg games */}
      <div className="px-4 sm:px-6 py-2 border-b border-[#ebebeb] dark:border-[#3c4043] flex items-center gap-1.5 overflow-x-auto no-scrollbar bg-white dark:bg-[#202124]">
        {EASTER_EGG_SUGGESTIONS.map((item) => {
          const isCurrent = item.id === activeGame;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectGame(item.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                isCurrent
                  ? 'bg-[#e8f0fe] text-[#1a73e8] dark:bg-[#8ab4f8]/20 dark:text-[#8ab4f8]'
                  : 'text-[#5f6368] dark:text-[#9aa0a6] hover:bg-[#f1f3f4] dark:hover:bg-[#303134]'
              }`}
            >
              {item.phrase}
            </button>
          );
        })}
      </div>

      {/* Game Body */}
      <div className="p-4 sm:p-6">
        {/* 0. STAR DASH 2D ARCADE */}
        {activeGame === 'stardash' && <StarDashGame />}

        {/* 1. PIEDRA PAPEL O TIJERA */}
        {activeGame === 'rps' && (
          <div className="space-y-5">
            <div className="grid grid-cols-3 gap-3 max-w-md mx-auto text-center">
              <div className="p-2.5 rounded-xl bg-[#f8f9fa] dark:bg-[#303134]">
                <div className="text-xs text-[#5f6368] dark:text-[#9aa0a6]">Ganadas</div>
                <div
                  className="text-xl font-bold text-[#34A853] tabular-nums"
                  data-testid="rps-wins"
                >
                  {rpsStats.wins}
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-[#f8f9fa] dark:bg-[#303134]">
                <div className="text-xs text-[#5f6368] dark:text-[#9aa0a6]">Empates</div>
                <div
                  className="text-xl font-bold text-[#FBBC05] tabular-nums"
                  data-testid="rps-ties"
                >
                  {rpsStats.ties}
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-[#f8f9fa] dark:bg-[#303134]">
                <div className="text-xs text-[#5f6368] dark:text-[#9aa0a6]">Perdidas</div>
                <div
                  className="text-xl font-bold text-[#EA4335] tabular-nums"
                  data-testid="rps-losses"
                >
                  {rpsStats.losses}
                </div>
              </div>
            </div>

            {/* Choice Emoji Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              {RPS_OPTIONS.map((opt) => (
                <button
                  key={opt.move}
                  type="button"
                  onClick={() => handlePlayRps(opt.move)}
                  className="flex items-center gap-2.5 px-5 py-3 rounded-xl border border-[#dadce0] dark:border-[#3c4043] bg-white dark:bg-[#303134] hover:border-[#1a73e8] dark:hover:border-[#8ab4f8] hover:bg-[#f8f9fa] dark:hover:bg-[#3c4043] active:scale-95 transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <span className="text-2xl" role="img" aria-label={opt.label}>
                    {opt.emoji}
                  </span>
                  <span className="text-sm font-medium text-[#202124] dark:text-[#e8eaed]">
                    {opt.label}
                  </span>
                </button>
              ))}
            </div>

            {/* Round Result Display */}
            <div className="min-h-[68px] flex flex-col items-center justify-center text-center p-3 rounded-xl bg-[#f8f9fa] dark:bg-[#303134]">
              {rpsRound ? (
                <div className="space-y-1">
                  <div className="text-sm text-[#4d5156] dark:text-[#bdc1c6]">
                    Tú elegiste{' '}
                    <strong className="capitalize text-[#202124] dark:text-[#e8eaed]">
                      {rpsRound.player}
                    </strong>{' '}
                    · Computadora eligió{' '}
                    <strong className="capitalize text-[#202124] dark:text-[#e8eaed]">
                      {rpsRound.cpu}
                    </strong>
                  </div>
                  <div
                    data-testid="rps-outcome"
                    className={`text-base font-bold ${
                      rpsRound.outcome === 'win'
                        ? 'text-[#34A853]'
                        : rpsRound.outcome === 'loss'
                        ? 'text-[#EA4335]'
                        : 'text-[#FBBC05]'
                    }`}
                  >
                    {rpsRound.outcome === 'win'
                      ? '¡Ganaste esta ronda!'
                      : rpsRound.outcome === 'loss'
                      ? 'La computadora ganó esta ronda'
                      : '¡Empate!'}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-[#5f6368] dark:text-[#9aa0a6] flex items-center gap-2">
                  <Hand className="w-4 h-4 text-[#1a73e8] dark:text-[#8ab4f8]" aria-hidden="true" />
                  <span>Elige piedra, papel o tijera para jugar contra la computadora</span>
                </p>
              )}
            </div>
          </div>
        )}

        {/* 2. LANZAR MONEDA (3D Flip) */}
        {activeGame === 'coin' && (
          <div className="flex flex-col items-center text-center space-y-5">
            <div className="relative flex items-center justify-center h-32">
              <div
                style={{
                  transform: `rotateY(${coinSpins * 720 + (coinSide === 'sello' ? 180 : 0)}deg)`,
                }}
                className="w-28 h-28 rounded-full border-4 border-[#FBBC05] bg-gradient-to-br from-[#fef7e0] via-[#FBBC05] to-[#f29900] text-[#202124] flex flex-col items-center justify-center shadow-md transition-transform duration-500 select-none"
              >
                <Coins className="w-8 h-8 mb-1 text-[#202124]" aria-hidden="true" />
                <span className="text-sm font-bold tracking-wide uppercase">
                  {isFlippingCoin ? '...' : coinSide}
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <p
                data-testid="coin-result"
                className="text-lg font-medium text-[#202124] dark:text-[#e8eaed]"
              >
                Resultado:{' '}
                <strong className="uppercase text-[#1a73e8] dark:text-[#8ab4f8]">
                  {isFlippingCoin ? 'Girando...' : coinSide}
                </strong>
              </p>
              <p className="text-xs text-[#5f6368] dark:text-[#9aa0a6] tabular-nums">
                Cara: {coinHistory.cara} · Sello: {coinHistory.sello}
              </p>
            </div>

            <button
              type="button"
              onClick={handleFlipCoin}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1a73e8] hover:bg-[#1557b0] dark:bg-[#8ab4f8] dark:hover:bg-[#aecbfa] text-white dark:text-[#202124] text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" aria-hidden="true" />
              <span>Volver a lanzar</span>
            </button>
          </div>
        )}

        {/* 3. TIRAR DADO (1-6) */}
        {activeGame === 'dice' && (
          <div className="flex flex-col items-center text-center space-y-5">
            <div
              style={{
                transform: `rotate(${diceRollCount * 360}deg) scale(${isRollingDice ? 0.9 : 1})`,
              }}
              className="w-24 h-24 rounded-2xl border-2 border-[#dadce0] dark:border-[#5f6368] bg-white dark:bg-[#303134] p-3 grid grid-cols-3 grid-rows-3 gap-1.5 shadow-md transition-transform duration-300"
              aria-label={`Dado mostrando el número ${diceValue}`}
            >
              {Array.from({ length: 9 }).map((_, idx) => {
                const hasPip = DICE_PIPS[diceValue].includes(idx);
                return (
                  <div key={idx} className="flex items-center justify-center">
                    {hasPip && (
                      <span
                        className={`w-3.5 h-3.5 rounded-full ${
                          diceValue === 1 || diceValue === 4
                            ? 'bg-[#EA4335]'
                            : 'bg-[#1a73e8] dark:bg-[#8ab4f8]'
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            <p
              data-testid="dice-result"
              className="text-lg font-medium text-[#202124] dark:text-[#e8eaed] tabular-nums"
            >
              Número obtenido:{' '}
              <strong className="text-[#1a73e8] dark:text-[#8ab4f8]">{diceValue}</strong>
            </p>

            <button
              type="button"
              onClick={handleRollCoinOrDice(handleRollDice)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1a73e8] hover:bg-[#1557b0] dark:bg-[#8ab4f8] dark:hover:bg-[#aecbfa] text-white dark:text-[#202124] text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Dices className="w-4 h-4" aria-hidden="true" />
              <span>Tirar dado otra vez</span>
            </button>
          </div>
        )}

        {/* 4. DINO CHROME RUNNER */}
        {activeGame === 'dino' && <DinoMiniGame />}

        {/* 5. RULETA DE LUIS FELIPE */}
        {activeGame === 'roulette' && (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10">
            <div className="relative flex items-center justify-center">
              {/* Top Pointer Arrow */}
              <div
                className="absolute -top-2.5 z-10 w-0 h-0 border-l-[9px] border-l-transparent border-r-[9px] border-r-transparent border-t-[14px] border-t-[#202124] dark:border-t-[#e8eaed]"
                aria-hidden="true"
              />
              <div
                style={{
                  transform: `rotate(${rouletteRotation}deg)`,
                  background:
                    'conic-gradient(#4285F4 0deg 60deg, #EA4335 60deg 120deg, #FBBC05 120deg 180deg, #34A853 180deg 240deg, #4285F4 240deg 300deg, #EA4335 300deg 360deg)',
                }}
                className="w-40 h-40 sm:w-44 sm:h-44 rounded-full border-4 border-white dark:border-[#3c4043] shadow-md transition-transform duration-700 ease-out flex items-center justify-center"
              >
                <div className="w-12 h-12 rounded-full bg-white dark:bg-[#202124] border-2 border-[#dadce0] dark:border-[#5f6368] flex items-center justify-center font-bold text-xs text-[#1a73e8] dark:text-[#8ab4f8]">
                  LF
                </div>
              </div>
            </div>

            <div className="flex-1 max-w-md text-center sm:text-left space-y-3">
              <div className="text-xs font-medium text-[#5f6368] dark:text-[#9aa0a6] flex items-center justify-center sm:justify-start gap-1.5">
                <Disc className="w-4 h-4 text-[#1a73e8] dark:text-[#8ab4f8]" aria-hidden="true" />
                <span>¿Qué toca hacer hoy según la ruleta?</span>
              </div>

              <div
                data-testid="roulette-result"
                className="p-3.5 rounded-xl bg-[#f8f9fa] dark:bg-[#303134] border border-[#ebebeb] dark:border-[#3c4043] text-base sm:text-lg font-semibold text-[#202124] dark:text-[#e8eaed]"
              >
                {isSpinningRoulette ? 'Girando la ruleta...' : selectedPhrase}
              </div>

              <button
                type="button"
                onClick={handleSpinRoulette}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1a73e8] hover:bg-[#1557b0] dark:bg-[#8ab4f8] dark:hover:bg-[#aecbfa] text-white dark:text-[#202124] text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Gamepad2 className="w-4 h-4" aria-hidden="true" />
                <span>Girar la ruleta</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function handleRollCoinOrDice(fn: () => void) {
  return () => fn();
}
