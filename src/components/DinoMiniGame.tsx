import { useCallback, useEffect, useRef, useState } from 'react';
import { Play, RotateCcw } from 'lucide-react';

export function DinoMiniGame() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [status, setStatus] = useState<'ready' | 'playing' | 'gameover'>('ready');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  const stateRef = useRef({
    status: 'ready' as 'ready' | 'playing' | 'gameover',
    dinoY: 0,
    dinoVy: 0,
    isJumping: false,
    obstacles: [] as Array<{ x: number; width: number; height: number }>,
    clouds: [
      { x: 110, y: 28 },
      { x: 310, y: 44 },
      { x: 490, y: 22 },
    ],
    groundOffset: 0,
    speed: 260,
    spawnTimer: 0.9,
    scoreFloat: 0,
    highScore: 0,
    legTick: 0,
  });

  const drawScene = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const isDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    const width = canvas.width;
    const height = canvas.height;
    const groundY = height - 28;
    const s = stateRef.current;

    ctx.clearRect(0, 0, width, height);

    // Background sky
    ctx.fillStyle = isDark ? '#202124' : '#f8f9fa';
    ctx.fillRect(0, 0, width, height);

    // Subtle clouds
    ctx.fillStyle = isDark ? '#3c4043' : '#dadce0';
    for (const cloud of s.clouds) {
      ctx.beginPath();
      ctx.roundRect(cloud.x, cloud.y, 46, 12, 6);
      ctx.fill();
    }

    // Ground line + pebbles
    ctx.strokeStyle = isDark ? '#5f6368' : '#bdc1c6';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(width, groundY);
    ctx.stroke();

    ctx.fillStyle = isDark ? '#5f6368' : '#9aa0a6';
    for (let i = 0; i < 16; i++) {
      const px = ((i * 48 - (s.groundOffset % 48) + width) % width);
      ctx.fillRect(px, groundY + 6 + (i % 3) * 4, 4, 2);
    }

    // Draw Chrome-style pixel Dino
    const dinoX = 48;
    const dinoHeight = 38;
    const dinoTop = groundY - dinoHeight - s.dinoY;
    ctx.fillStyle = isDark ? '#8ab4f8' : '#535353';

    // Head
    ctx.fillRect(dinoX + 12, dinoTop, 18, 13);
    // Eye
    ctx.fillStyle = isDark ? '#202124' : '#ffffff';
    ctx.fillRect(dinoX + 23, dinoTop + 3, 3, 3);
    ctx.fillStyle = isDark ? '#8ab4f8' : '#535353';
    // Body
    ctx.fillRect(dinoX + 4, dinoTop + 11, 18, 17);
    // Tail
    ctx.fillRect(dinoX, dinoTop + 15, 5, 9);
    // Arm
    ctx.fillRect(dinoX + 21, dinoTop + 16, 5, 4);

    // Legs (animated when running)
    const legStep = s.status === 'playing' && !s.isJumping ? Math.floor(s.legTick * 10) % 2 : 0;
    if (legStep === 0) {
      ctx.fillRect(dinoX + 6, dinoTop + 28, 5, 10);
      ctx.fillRect(dinoX + 15, dinoTop + 28, 5, 7);
    } else {
      ctx.fillRect(dinoX + 6, dinoTop + 28, 5, 7);
      ctx.fillRect(dinoX + 15, dinoTop + 28, 5, 10);
    }

    // Draw Cacti Obstacles
    for (const obs of s.obstacles) {
      const obsTop = groundY - obs.height;
      ctx.fillStyle = isDark ? '#81c995' : '#34A853';
      ctx.fillRect(obs.x + 4, obsTop, obs.width - 8, obs.height);
      // Cactus arms
      ctx.fillRect(obs.x, obsTop + 8, 4, 10);
      ctx.fillRect(obs.x + obs.width - 4, obsTop + 6, 4, 12);
    }
  }, []);

  const triggerJump = useCallback(() => {
    const s = stateRef.current;
    if (s.status === 'ready' || s.status === 'gameover') {
      // Start or restart game
      s.status = 'playing';
      s.dinoY = 0;
      s.dinoVy = 430;
      s.isJumping = true;
      s.obstacles = [{ x: 460, width: 18, height: 30 }];
      s.speed = 260;
      s.spawnTimer = 1.25;
      s.scoreFloat = 0;
      setScore(0);
      setStatus('playing');
      return;
    }

    if (s.status === 'playing' && !s.isJumping) {
      s.dinoVy = 430;
      s.isJumping = true;
    }
  }, []);

  useEffect(() => {
    drawScene();
  }, [drawScene]);

  useEffect(() => {
    if (status !== 'playing') {
      drawScene();
      return;
    }

    let rafId = 0;
    let lastTime = performance.now();

    const loop = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      const s = stateRef.current;

      if (s.status === 'playing') {
        s.legTick += dt;
        s.groundOffset += s.speed * dt;
        s.speed = Math.min(460, s.speed + dt * 6);

        // Clouds
        for (const cloud of s.clouds) {
          cloud.x -= 35 * dt;
          if (cloud.x < -50) cloud.x = 620;
        }

        // Dino jump physics
        if (s.isJumping || s.dinoY > 0) {
          s.dinoY += s.dinoVy * dt;
          s.dinoVy -= 1180 * dt;
          if (s.dinoY <= 0) {
            s.dinoY = 0;
            s.dinoVy = 0;
            s.isJumping = false;
          }
        }

        // Obstacles
        s.spawnTimer -= dt;
        if (s.spawnTimer <= 0) {
          const height = 24 + Math.floor(Math.random() * 14);
          const width = 16 + Math.floor(Math.random() * 8);
          s.obstacles.push({ x: 620, width, height });
          s.spawnTimer = 0.95 + Math.random() * 0.85;
        }

        for (const obs of s.obstacles) {
          obs.x -= s.speed * dt;
        }
        s.obstacles = s.obstacles.filter((obs) => obs.x + obs.width > -20);

        // Collision check
        const dinoBox = {
          x: 52,
          y: s.dinoY,
          w: 20,
          h: 34,
        };

        for (const obs of s.obstacles) {
          const overlapX = dinoBox.x + dinoBox.w > obs.x + 2 && dinoBox.x < obs.x + obs.width - 2;
          const overlapY = dinoBox.y < obs.height - 4;
          if (overlapX && overlapY) {
            s.status = 'gameover';
            const finalScore = Math.floor(s.scoreFloat);
            if (finalScore > s.highScore) {
              s.highScore = finalScore;
              setHighScore(finalScore);
            }
            setStatus('gameover');
            drawScene();
            return;
          }
        }

        s.scoreFloat += dt * 12;
        setScore(Math.floor(s.scoreFloat));
      }

      drawScene();
      if (s.status === 'playing') {
        rafId = requestAnimationFrame(loop);
      }
    };

    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [status, drawScene]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea') return;

      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        triggerJump();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [triggerJump]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm">
        <span className="text-[#5f6368] dark:text-[#9aa0a6]">
          Presiona <strong>Espacio</strong> o toca la pista para saltar obstáculos
        </span>
        <div className="flex items-center gap-4 font-mono tabular-nums font-bold text-sm">
          <span className="text-[#5f6368] dark:text-[#9aa0a6]">
            HI {highScore.toString().padStart(4, '0')}
          </span>
          <span className="text-[#1a73e8] dark:text-[#8ab4f8]" data-testid="dino-score">
            {score.toString().padStart(4, '0')}
          </span>
        </div>
      </div>

      <div
        role="button"
        tabIndex={0}
        aria-label="Pista del juego Dino Runner: presiona Espacio o haz clic para saltar"
        onClick={triggerJump}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            triggerJump();
          }
        }}
        className="relative w-full overflow-hidden rounded-xl border border-[#dadce0] dark:border-[#3c4043] bg-[#f8f9fa] dark:bg-[#202124] cursor-pointer select-none"
      >
        <canvas
          ref={canvasRef}
          width={600}
          height={160}
          className="w-full h-[140px] sm:h-[160px] block"
        />

        {status !== 'playing' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/75 dark:bg-[#202124]/80 px-4 text-center">
            <p className="text-sm font-semibold text-[#202124] dark:text-[#e8eaed] mb-2">
              {status === 'gameover'
                ? `¡Fin del juego! Puntaje: ${score}`
                : 'Dino Chrome UCSP · Listo para correr'}
            </p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                triggerJump();
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#1a73e8] hover:bg-[#1557b0] dark:bg-[#8ab4f8] dark:hover:bg-[#aecbfa] text-white dark:text-[#202124] text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {status === 'gameover' ? (
                <>
                  <RotateCcw className="w-4 h-4" aria-hidden="true" />
                  <span>Jugar de nuevo</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" aria-hidden="true" />
                  <span>Saltar / Iniciar</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
