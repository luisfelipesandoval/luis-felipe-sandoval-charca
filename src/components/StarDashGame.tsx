import React, { useCallback, useEffect, useRef, useState } from 'react';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import {
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
  Music,
  Shield,
  Magnet,
  Clock,
  Sparkles,
  Trophy,
  Send,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { getOrCreateVisitorId } from '../utils/guestbookUtils';
import {
  calculateCatchPoints,
  computeDifficultyParams,
  MAX_PLAYER_NAME_LENGTH,
  SCORE_SUBMIT_COOLDOWN_SECONDS,
  validateLeaderboardSubmission,
} from '../utils/starDashRules';
import { starDashAudio } from '../utils/starDashAudio';
import { LeaderboardTable } from './LeaderboardTable';

type PowerUpType = 'magnet' | 'shield' | 'slowmo' | 'starrain';
type EntityKind = 'star' | 'coin' | 'boss_core' | 'asteroid' | 'meteor' | PowerUpType;

interface FallingEntity {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  kind: EntityKind;
  rot: number;
  vRot: number;
}

interface Particle {
  active: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

interface FloatingText {
  active: boolean;
  x: number;
  y: number;
  vy: number;
  life: number;
  text: string;
  color: string;
}

const LAST_NAME_STORAGE_KEY = 'lf_stardash_player_name';
const BEST_SCORE_STORAGE_KEY = 'lf_stardash_best_score';
const LAST_SCORE_SUBMIT_MS_KEY = 'lf_stardash_last_submit_ms';

export function StarDashGame() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [gameState, setGameState] = useState<'title' | 'playing' | 'gameover'>('title');
  const [hudScore, setHudScore] = useState(0);
  const [hudLives, setHudLives] = useState(3);
  const [hudMultiplier, setHudMultiplier] = useState(1);
  const [bestScore, setBestScore] = useState<number>(() => {
    try {
      return Number(localStorage.getItem(BEST_SCORE_STORAGE_KEY) || '0') || 0;
    } catch {
      return 0;
    }
  });
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [activePowers, setActivePowers] = useState({
    magnet: 0,
    shield: 0,
    slowmo: 0,
    starrain: 0,
  });
  const [bossHud, setBossHud] = useState<{ active: boolean; hpPct: number }>({
    active: false,
    hpPct: 0,
  });

  // Audio controls
  const [isMuted, setIsMuted] = useState(() => starDashAudio.getMuted());
  const [isMusicOn, setIsMusicOn] = useState(() => starDashAudio.getMusicEnabled());

  // Leaderboard submission state on Game Over
  const [playerName, setPlayerName] = useState<string>(() => {
    try {
      return localStorage.getItem(LAST_NAME_STORAGE_KEY) || '';
    } catch {
      return '';
    }
  });
  const [submittingScore, setSubmittingScore] = useState(false);
  const [scoreSavedId, setScoreSavedId] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Pre-allocated simulation state & zero-GC object pools
  const simRef = useRef({
    status: 'title' as 'title' | 'playing' | 'gameover',
    elapsed: 0,
    score: 0,
    lives: 3,
    streak: 0,
    multiplier: 1,
    shipX: 320,
    targetShipX: 320,
    usingPointer: false,
    keys: new Set<string>(),
    hitstop: 0,
    trauma: 0,
    invulnTimer: 0,
    spawnTimer: 0.4,
    powerUpSpawnTimer: 6.5,
    starRainSpawnTimer: 0.12,
    powers: {
      magnet: 0,
      shield: 0,
      slowmo: 0,
      starrain: 0,
    },
    boss: {
      active: false,
      x: 320,
      y: -60,
      vx: 115,
      hp: 0,
      maxHp: 12,
      attackTimer: 0.7,
      nextBossTime: 18,
    },
    entities: [] as FallingEntity[],
    particles: Array.from({ length: 120 }, () => ({
      active: false,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      life: 0,
      maxLife: 0.5,
      color: '#4285F4',
      size: 3,
    })) as Particle[],
    particleCursor: 0,
    floats: Array.from({ length: 24 }, () => ({
      active: false,
      x: 0,
      y: 0,
      vy: -40,
      life: 0,
      text: '',
      color: '#FBBC05',
    })) as FloatingText[],
    floatCursor: 0,
    starsFar: Array.from({ length: 40 }, (_, i) => ({
      x: (i * 97) % 640,
      y: (i * 53) % 380,
      r: (i % 2) + 1,
    })),
    starsNear: Array.from({ length: 24 }, (_, i) => ({
      x: (i * 131) % 640,
      y: (i * 71) % 380,
      r: (i % 2) + 1.5,
    })),
  });

  const spawnBurst = useCallback((x: number, y: number, color: string, count: number) => {
    const s = simRef.current;
    for (let i = 0; i < count; i++) {
      const p = s.particles[s.particleCursor];
      s.particleCursor = (s.particleCursor + 1) % s.particles.length;
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4;
      const speed = 45 + Math.random() * 140;
      p.active = true;
      p.x = x;
      p.y = y;
      p.vx = Math.cos(angle) * speed;
      p.vy = Math.sin(angle) * speed;
      p.maxLife = 0.35 + Math.random() * 0.25;
      p.life = p.maxLife;
      p.color = color;
      p.size = 2 + Math.random() * 2.5;
    }
  }, []);

  const spawnFloatingText = useCallback((x: number, y: number, text: string, color: string) => {
    const s = simRef.current;
    const f = s.floats[s.floatCursor];
    s.floatCursor = (s.floatCursor + 1) % s.floats.length;
    f.active = true;
    f.x = Math.max(48, Math.min(592, x));
    f.y = y;
    f.vy = -48;
    f.life = 0.75;
    f.text = text;
    f.color = color;
  }, []);

  const startNewGame = useCallback(() => {
    const s = simRef.current;
    s.status = 'playing';
    s.elapsed = 0;
    s.score = 0;
    s.lives = 3;
    s.streak = 0;
    s.multiplier = 1;
    s.shipX = 320;
    s.targetShipX = 320;
    s.usingPointer = false;
    s.keys.clear();
    s.hitstop = 0;
    s.trauma = 0;
    s.invulnTimer = 0;
    s.spawnTimer = 0.3;
    s.powerUpSpawnTimer = 6.0;
    s.powers = { magnet: 0, shield: 0, slowmo: 0, starrain: 0 };
    s.boss = {
      active: false,
      x: 320,
      y: -60,
      vx: 120,
      hp: 0,
      maxHp: 12,
      attackTimer: 0.7,
      nextBossTime: 18,
    };
    s.entities = [];
    for (const p of s.particles) p.active = false;
    for (const f of s.floats) f.active = false;

    setHudScore(0);
    setHudLives(3);
    setHudMultiplier(1);
    setIsNewRecord(false);
    setScoreSavedId(null);
    setSubmitError(null);
    setActivePowers({ magnet: 0, shield: 0, slowmo: 0, starrain: 0 });
    setBossHud({ active: false, hpPct: 0 });
    setGameState('playing');
    document.body.dataset.state = 'playing';
  }, []);

  // Main 60 FPS Simulation & Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rafId = 0;
    let lastTime = performance.now();
    let hudSyncAccum = 0;

    const renderAndStep = (now: number) => {
      const rawDt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      const s = simRef.current;
      const W = canvas.width;
      const H = canvas.height;
      const shipY = H - 38;

      // Update parallax starfield even in title/gameover for living space feel
      for (const st of s.starsFar) {
        st.y += 22 * rawDt;
        if (st.y > H) {
          st.y = 0;
          st.x = (st.x + 73) % W;
        }
      }
      for (const st of s.starsNear) {
        st.y += 58 * rawDt;
        if (st.y > H) {
          st.y = 0;
          st.x = (st.x + 113) % W;
        }
      }

      if (s.status === 'playing') {
        if (s.hitstop > 0) {
          s.hitstop = Math.max(0, s.hitstop - rawDt);
        } else {
          const dt = rawDt;
          s.elapsed += dt;
          if (s.invulnTimer > 0) s.invulnTimer = Math.max(0, s.invulnTimer - dt);

          // Power-up timers
          s.powers.magnet = Math.max(0, s.powers.magnet - dt);
          s.powers.shield = Math.max(0, s.powers.shield - dt);
          s.powers.slowmo = Math.max(0, s.powers.slowmo - dt);
          s.powers.starrain = Math.max(0, s.powers.starrain - dt);

          // Ship horizontal movement (keyboard or pointer interpolation)
          const moveSpeed = 410;
          if (s.keys.has('ArrowLeft') || s.keys.has('KeyA')) {
            s.usingPointer = false;
            s.shipX -= moveSpeed * dt;
          }
          if (s.keys.has('ArrowRight') || s.keys.has('KeyD')) {
            s.usingPointer = false;
            s.shipX += moveSpeed * dt;
          }
          if (s.usingPointer) {
            s.shipX += (s.targetShipX - s.shipX) * Math.min(1, dt * 18);
          }
          s.shipX = Math.max(28, Math.min(W - 28, s.shipX));

          // Difficulty progression
          const diff = computeDifficultyParams(s.elapsed);
          const hazardSpeedScale = s.powers.slowmo > 0 ? 0.5 : 1.0;

          // Boss encounter logic ("Coloso Meteoro")
          if (!s.boss.active && s.elapsed >= s.boss.nextBossTime) {
            s.boss.active = true;
            s.boss.maxHp = 10;
            s.boss.hp = 10;
            s.boss.x = W / 2;
            s.boss.y = -40;
            s.boss.attackTimer = 0.65;
            starDashAudio.playBossAlert();
            spawnFloatingText(W / 2, 72, '¡JEFE: COLOSO METEORO!', '#EA4335');
          }

          if (s.boss.active) {
            if (s.boss.y < 54) {
              s.boss.y += 90 * dt;
            } else {
              s.boss.x += s.boss.vx * dt;
              if (s.boss.x < 70) {
                s.boss.x = 70;
                s.boss.vx = Math.abs(s.boss.vx);
              } else if (s.boss.x > W - 70) {
                s.boss.x = W - 70;
                s.boss.vx = -Math.abs(s.boss.vx);
              }

              s.boss.attackTimer -= dt;
              if (s.boss.attackTimer <= 0) {
                s.boss.attackTimer = 0.72;
                // Boss launches a meteor fragment + a glowing boss star core
                s.entities.push({
                  x: s.boss.x + (Math.random() - 0.5) * 36,
                  y: s.boss.y + 26,
                  vx: (Math.random() - 0.5) * 90,
                  vy: 195 * diff.fallSpeedMultiplier * hazardSpeedScale,
                  radius: 13,
                  kind: 'meteor',
                  rot: 0,
                  vRot: 4,
                });

                s.entities.push({
                  x: Math.max(40, Math.min(W - 40, s.boss.x + (Math.random() - 0.5) * 160)),
                  y: s.boss.y + 20,
                  vx: 0,
                  vy: 165 * diff.fallSpeedMultiplier,
                  radius: 12,
                  kind: 'boss_core',
                  rot: 0,
                  vRot: 3,
                });

                s.boss.hp -= 1;
                if (s.boss.hp <= 0) {
                  s.boss.active = false;
                  s.boss.nextBossTime = s.elapsed + 24;
                  const bonus = 300 * s.multiplier;
                  s.score += bonus;
                  setHudScore(s.score);
                  spawnBurst(s.boss.x, s.boss.y, '#FBBC05', 26);
                  spawnFloatingText(s.boss.x, s.boss.y, `¡JEFE DERROTADO +${bonus}!`, '#34A853');
                  starDashAudio.playPowerUp();
                }
              }
            }
          }

          // Regular spawning of stars, coins, asteroids, and meteorites
          s.spawnTimer -= dt;
          if (s.spawnTimer <= 0) {
            s.spawnTimer = diff.spawnIntervalSeconds;
            const x = 32 + Math.random() * (W - 64);
            const roll = Math.random();

            if (roll < diff.hazardProbability) {
              const isMeteor = Math.random() < 0.38;
              s.entities.push({
                x,
                y: -20,
                vx: isMeteor ? (Math.random() - 0.5) * 70 : (Math.random() - 0.5) * 25,
                vy: (isMeteor ? 210 : 165) * diff.fallSpeedMultiplier * hazardSpeedScale,
                radius: isMeteor ? 13 : 15,
                kind: isMeteor ? 'meteor' : 'asteroid',
                rot: Math.random() * Math.PI,
                vRot: (Math.random() - 0.5) * 5,
              });
            } else {
              const isCoin = Math.random() < 0.35;
              s.entities.push({
                x,
                y: -18,
                vx: 0,
                vy: (isCoin ? 175 : 155) * diff.fallSpeedMultiplier,
                radius: isCoin ? 12 : 11,
                kind: isCoin ? 'coin' : 'star',
                rot: 0,
                vRot: 2.8,
              });
            }
          }

          // Star Rain bonus shower
          if (s.powers.starrain > 0) {
            s.starRainSpawnTimer -= dt;
            if (s.starRainSpawnTimer <= 0) {
              s.starRainSpawnTimer = 0.14;
              s.entities.push({
                x: 28 + Math.random() * (W - 56),
                y: -15,
                vx: 0,
                vy: 230,
                radius: 11,
                kind: Math.random() < 0.4 ? 'coin' : 'star',
                rot: 0,
                vRot: 4,
              });
            }
          }

          // Occasional Power-up spawns
          s.powerUpSpawnTimer -= dt;
          if (s.powerUpSpawnTimer <= 0) {
            s.powerUpSpawnTimer = 7.5 + Math.random() * 4.0;
            const powerTypes: PowerUpType[] = ['magnet', 'shield', 'slowmo', 'starrain'];
            const chosenPower = powerTypes[Math.floor(Math.random() * powerTypes.length)];
            s.entities.push({
              x: 44 + Math.random() * (W - 88),
              y: -20,
              vx: 0,
              vy: 145,
              radius: 14,
              kind: chosenPower,
              rot: 0,
              vRot: 2,
            });
          }

          // Update falling entities & check collisions
          const remaining: FallingEntity[] = [];
          for (const ent of s.entities) {
            const isCollectible =
              ent.kind === 'star' || ent.kind === 'coin' || ent.kind === 'boss_core';
            const isHazard = ent.kind === 'asteroid' || ent.kind === 'meteor';

            // Magnet attraction on stars and coins
            if (isCollectible && s.powers.magnet > 0) {
              const dx = s.shipX - ent.x;
              const dy = shipY - ent.y;
              const dist = Math.hypot(dx, dy);
              if (dist < 210 && dist > 1) {
                ent.x += (dx / dist) * 290 * dt;
                ent.y += (dy / dist) * 190 * dt;
              }
            }

            const speedMod = isHazard && s.powers.slowmo > 0 ? 0.55 : 1;
            ent.x += ent.vx * speedMod * dt;
            ent.y += ent.vy * speedMod * dt;
            ent.rot += ent.vRot * dt;

            // Bounce inside arena walls
            if (ent.x < 18 || ent.x > W - 18) {
              ent.vx = -ent.vx;
              ent.x = Math.max(18, Math.min(W - 18, ent.x));
            }

            // Distance to player ship
            const distToShip = Math.hypot(ent.x - s.shipX, ent.y - shipY);
            const hitRadius = ent.radius + 19;

            if (distToShip <= hitRadius) {
              if (isCollectible) {
                const prevMult = s.multiplier;
                const res = calculateCatchPoints(
                  ent.kind as 'star' | 'coin' | 'boss_core',
                  s.streak,
                  s.powers.starrain > 0
                );
                s.streak = res.nextStreak;
                s.multiplier = res.multiplier;
                s.score += res.points;
                setHudScore(s.score);
                setHudMultiplier(s.multiplier);

                if (s.multiplier > prevMult) {
                  starDashAudio.playComboUp();
                  spawnFloatingText(ent.x, ent.y - 12, `¡COMBO x${s.multiplier}!`, '#34A853');
                } else {
                  starDashAudio.playCatch(ent.kind === 'coin', s.multiplier);
                  spawnFloatingText(
                    ent.x,
                    ent.y,
                    `+${res.points}${s.multiplier > 1 ? ` x${s.multiplier}` : ''}`,
                    ent.kind === 'coin' ? '#FBBC05' : '#8ab4f8'
                  );
                }

                spawnBurst(
                  ent.x,
                  ent.y,
                  ent.kind === 'coin' ? '#FBBC05' : '#4285F4',
                  10
                );
                continue;
              } else if (isHazard) {
                if (s.powers.shield > 0) {
                  // Shield absorbs the impact and shatters the hazard!
                  s.score += 25;
                  setHudScore(s.score);
                  spawnBurst(ent.x, ent.y, '#34A853', 14);
                  spawnFloatingText(ent.x, ent.y, '¡ESCUDO +25!', '#34A853');
                  starDashAudio.playCatch(false, 2);
                  continue;
                }

                if (s.invulnTimer <= 0) {
                  s.lives -= 1;
                  s.streak = 0;
                  s.multiplier = 1;
                  s.invulnTimer = 1.1;
                  s.hitstop = 0.055;
                  s.trauma = 0.65;
                  setHudLives(s.lives);
                  setHudMultiplier(1);
                  spawnBurst(s.shipX, shipY, '#EA4335', 22);
                  spawnFloatingText(s.shipX, shipY - 16, '-1 VIDA', '#EA4335');
                  starDashAudio.playDamage();

                  if (s.lives <= 0) {
                    s.status = 'gameover';
                    document.body.dataset.state = 'gameover';
                    starDashAudio.playGameOver();
                    if (s.score > bestScore) {
                      setBestScore(s.score);
                      setIsNewRecord(true);
                      try {
                        localStorage.setItem(BEST_SCORE_STORAGE_KEY, String(s.score));
                      } catch {
                        // ignore
                      }
                    }
                    setGameState('gameover');
                  }
                }
                continue;
              } else {
                // Power-up collected!
                const pKind = ent.kind as PowerUpType;
                s.powers[pKind] = pKind === 'magnet' || pKind === 'shield' ? 7.5 : 6.0;
                s.score += 40;
                setHudScore(s.score);
                starDashAudio.playPowerUp();
                const labels: Record<PowerUpType, string> = {
                  magnet: '¡IMÁN ACTIVADO!',
                  shield: '¡ESCUDO TEMPORAL!',
                  slowmo: '¡CÁMARA LENTA!',
                  starrain: '¡LLUVIA DE ESTRELLAS x2!',
                };
                spawnBurst(ent.x, ent.y, '#34A853', 16);
                spawnFloatingText(ent.x, ent.y, labels[pKind], '#34A853');
                continue;
              }
            }

            // Check if entity fell below bottom
            if (ent.y > H + 24) {
              if (isCollectible && s.streak > 0) {
                // Missing a star/coin resets the combo multiplier
                s.streak = 0;
                s.multiplier = 1;
                setHudMultiplier(1);
              }
              continue;
            }

            remaining.push(ent);
          }
          s.entities = remaining;
        }
      }

      // Update particles & floating texts in real dt
      s.trauma = Math.max(0, s.trauma - rawDt * 1.8);
      for (const p of s.particles) {
        if (!p.active) continue;
        p.x += p.vx * rawDt;
        p.y += p.vy * rawDt;
        p.life -= rawDt;
        if (p.life <= 0) p.active = false;
      }
      for (const f of s.floats) {
        if (!f.active) continue;
        f.y += f.vy * rawDt;
        f.life -= rawDt;
        if (f.life <= 0) f.active = false;
      }

      // Throttle HUD timer state updates to ~5 Hz
      hudSyncAccum += rawDt;
      if (hudSyncAccum >= 0.18 && s.status === 'playing') {
        hudSyncAccum = 0;
        setActivePowers({
          magnet: Math.ceil(s.powers.magnet),
          shield: Math.ceil(s.powers.shield),
          slowmo: Math.ceil(s.powers.slowmo),
          starrain: Math.ceil(s.powers.starrain),
        });
        setBossHud({
          active: s.boss.active,
          hpPct: s.boss.active ? Math.round((s.boss.hp / s.boss.maxHp) * 100) : 0,
        });
      }

      // ==================== RENDERING ====================
      ctx.save();
      if (s.trauma > 0) {
        const shake = s.trauma * s.trauma * 10;
        ctx.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);
      }

      // Deep space background with subtle radial nebula
      const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
      bgGrad.addColorStop(0, '#070B14');
      bgGrad.addColorStop(1, '#111827');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);

      // Far & Near Parallax Stars
      ctx.fillStyle = 'rgba(255, 255, 255, 0.38)';
      for (const st of s.starsFar) {
        ctx.fillRect(st.x, st.y, st.r, st.r);
      }
      ctx.fillStyle = 'rgba(138, 180, 248, 0.78)';
      for (const st of s.starsNear) {
        ctx.beginPath();
        ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw Boss ("Coloso Meteoro") if active
      if (s.boss.active) {
        ctx.save();
        ctx.translate(s.boss.x, s.boss.y);
        ctx.fillStyle = '#EA4335';
        ctx.beginPath();
        ctx.arc(0, 0, 28, 0, Math.PI * 2);
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#FBBC05';
        ctx.stroke();

        // Glowing core eyes
        ctx.fillStyle = '#FFF';
        ctx.fillRect(-10, -4, 6, 6);
        ctx.fillRect(4, -4, 6, 6);
        ctx.restore();
      }

      // Draw Falling Entities
      for (const ent of s.entities) {
        ctx.save();
        ctx.translate(ent.x, ent.y);
        ctx.rotate(ent.rot);

        if (ent.kind === 'star' || ent.kind === 'boss_core') {
          ctx.fillStyle = ent.kind === 'boss_core' ? '#34A853' : '#8ab4f8';
          ctx.beginPath();
          for (let i = 0; i < 5; i++) {
            const outerA = (i * Math.PI * 2) / 5 - Math.PI / 2;
            const innerA = outerA + Math.PI / 5;
            const rOut = ent.radius;
            const rIn = ent.radius * 0.45;
            if (i === 0) ctx.moveTo(Math.cos(outerA) * rOut, Math.sin(outerA) * rOut);
            else ctx.lineTo(Math.cos(outerA) * rOut, Math.sin(outerA) * rOut);
            ctx.lineTo(Math.cos(innerA) * rIn, Math.sin(innerA) * rIn);
          }
          ctx.closePath();
          ctx.fill();
        } else if (ent.kind === 'coin') {
          ctx.fillStyle = '#FBBC05';
          ctx.beginPath();
          ctx.arc(0, 0, ent.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#FEF7E0';
          ctx.lineWidth = 2;
          ctx.stroke();
        } else if (ent.kind === 'asteroid' || ent.kind === 'meteor') {
          ctx.fillStyle = ent.kind === 'meteor' ? '#EA4335' : '#9AA0A6';
          ctx.beginPath();
          ctx.arc(0, 0, ent.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = 'rgba(0,0,0,0.28)';
          ctx.beginPath();
          ctx.arc(-4, -3, 3.5, 0, Math.PI * 2);
          ctx.arc(4, 4, 2.5, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Power-up capsule
          ctx.fillStyle = '#34A853';
          ctx.beginPath();
          ctx.arc(0, 0, ent.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
        ctx.restore();
      }

      // Draw Player Spaceship
      ctx.save();
      ctx.translate(s.shipX, shipY);

      // Magnet aura ring
      if (s.powers.magnet > 0) {
        ctx.strokeStyle = 'rgba(66, 133, 244, 0.45)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, 32 + Math.sin(now * 0.01) * 4, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Shield energy bubble
      if (s.powers.shield > 0) {
        ctx.fillStyle = 'rgba(52, 168, 83, 0.22)';
        ctx.strokeStyle = '#34A853';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(0, 0, 26, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }

      // Blink slightly during post-hit invulnerability
      if (s.invulnTimer <= 0 || Math.floor(now / 70) % 2 === 0) {
        // Thruster flame
        ctx.fillStyle = '#FBBC05';
        ctx.beginPath();
        ctx.moveTo(-6, 14);
        ctx.lineTo(0, 24 + Math.random() * 6);
        ctx.lineTo(6, 14);
        ctx.closePath();
        ctx.fill();

        // Wings
        ctx.fillStyle = '#4285F4';
        ctx.beginPath();
        ctx.moveTo(0, -18);
        ctx.lineTo(-20, 14);
        ctx.lineTo(20, 14);
        ctx.closePath();
        ctx.fill();

        // Cockpit canopy
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(0, -1, 5.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // Draw Pooled Particles
      for (const p of s.particles) {
        if (!p.active) continue;
        ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Draw Floating Score Texts
      ctx.font = 'bold 13px Arial, sans-serif';
      ctx.textAlign = 'center';
      for (const f of s.floats) {
        if (!f.active) continue;
        ctx.globalAlpha = Math.max(0, Math.min(1, f.life * 1.5));
        ctx.fillStyle = f.color;
        ctx.fillText(f.text, f.x, f.y);
      }
      ctx.globalAlpha = 1;

      ctx.restore();
      rafId = requestAnimationFrame(renderAndStep);
    };

    rafId = requestAnimationFrame(renderAndStep);
    return () => cancelAnimationFrame(rafId);
  }, [bestScore, spawnBurst, spawnFloatingText]);

  // Keyboard controls (Arrows / A-D / Space or Enter on Title)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea') return;

      const s = simRef.current;
      if (e.code === 'ArrowLeft' || e.code === 'KeyA' || e.code === 'ArrowRight' || e.code === 'KeyD') {
        s.keys.add(e.code);
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      simRef.current.keys.delete(e.code);
    };

    const onBlur = () => {
      simRef.current.keys.clear();
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
    };
  }, []);

  const updateShipFromClientX = (clientX: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    if (rect.width <= 0) return;
    const normX = (clientX - rect.left) / rect.width;
    const worldX = normX * canvas.width;
    simRef.current.usingPointer = true;
    simRef.current.targetShipX = Math.max(28, Math.min(canvas.width - 28, worldX));
  };

  const handleSaveScore = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (scoreSavedId) return;

    // Rate limit check
    try {
      const lastMs = Number(localStorage.getItem(LAST_SCORE_SUBMIT_MS_KEY) || '0');
      const elapsedSec = Math.floor((Date.now() - lastMs) / 1000);
      if (lastMs > 0 && elapsedSec < SCORE_SUBMIT_COOLDOWN_SECONDS) {
        setSubmitError(
          `Espera ${SCORE_SUBMIT_COOLDOWN_SECONDS - elapsedSec}s antes de guardar otra puntuación.`
        );
        return;
      }
    } catch {
      // ignore
    }

    const validation = validateLeaderboardSubmission(playerName, hudScore);
    if (!validation.valid) {
      setSubmitError(validation.error || 'Datos inválidos.');
      return;
    }

    setSubmittingScore(true);
    const path = 'leaderboard';
    const scoreId = `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

    try {
      try {
        localStorage.setItem(LAST_NAME_STORAGE_KEY, validation.playerName);
      } catch {
        // ignore
      }

      await setDoc(doc(db, path, scoreId), {
        playerName: validation.playerName,
        score: validation.score,
        visitorId: getOrCreateVisitorId(),
        createdAt: serverTimestamp(),
      });

      try {
        localStorage.setItem(LAST_SCORE_SUBMIT_MS_KEY, String(Date.now()));
      } catch {
        // ignore
      }
      setScoreSavedId(scoreId);
    } catch (err) {
      setSubmitError('No se pudo guardar el puntaje. Revisa que el nombre sea válido.');
      handleFirestoreError(err, OperationType.CREATE, path);
    } finally {
      setSubmittingScore(false);
    }
  };

  return (
    <div className="space-y-4" data-testid="star-dash-game">
      {/* Top World-Matched Space HUD Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-[#0B0F19] border border-[#2d3548] text-white">
        {/* Left: 3 Vitality Heart Pips */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5" aria-label={`Vidas restantes: ${hudLives} de 3`}>
            {[1, 2, 3].map((pip) => {
              const alive = pip <= hudLives;
              return (
                <svg
                  key={pip}
                  viewBox="0 0 24 24"
                  className={`w-5 h-5 transition-transform ${
                    alive ? 'text-[#EA4335] scale-100' : 'text-[#3c4043] scale-90'
                  }`}
                  fill={alive ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              );
            })}
          </div>

          {/* Combo Multiplier Readout */}
          <div
            className={`px-2.5 py-0.5 rounded-md font-mono tabular-nums text-xs font-bold transition-colors ${
              hudMultiplier > 1
                ? 'bg-[#FBBC05]/20 text-[#FBBC05] border border-[#FBBC05]/40'
                : 'bg-white/5 text-[#9aa0a6]'
            }`}
          >
            COMBO x{hudMultiplier}
          </div>
        </div>

        {/* Center: Score & Best Score */}
        <div className="flex items-center gap-4 font-mono tabular-nums">
          <div className="text-right">
            <span className="text-[10px] uppercase tracking-wider text-[#9aa0a6] block leading-none">
              Puntos
            </span>
            <span
              data-testid="stardash-score"
              className="text-lg sm:text-xl font-bold text-[#8ab4f8]"
            >
              {hudScore.toLocaleString('es-PE')}
            </span>
          </div>
          <div className="text-right hidden sm:block">
            <span className="text-[10px] uppercase tracking-wider text-[#9aa0a6] block leading-none">
              Récord
            </span>
            <span className="text-sm font-bold text-[#FBBC05]">
              {Math.max(bestScore, hudScore).toLocaleString('es-PE')}
            </span>
          </div>
        </div>

        {/* Right: Audio Controls (Mute & Music) */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            tabIndex={-1}
            onClick={(e) => {
              e.currentTarget.blur();
              setIsMusicOn(starDashAudio.toggleMusic());
            }}
            aria-label={isMusicOn ? 'Desactivar música espacial' : 'Activar música espacial'}
            title={isMusicOn ? 'Música activada' : 'Activar música de fondo'}
            className={`p-2 rounded-lg border text-xs transition-colors cursor-pointer ${
              isMusicOn
                ? 'border-[#4285F4] bg-[#4285F4]/20 text-[#8ab4f8]'
                : 'border-[#3c4043] bg-white/5 text-[#9aa0a6] hover:text-white'
            }`}
          >
            <Music className="w-4 h-4" aria-hidden="true" />
          </button>

          <button
            type="button"
            tabIndex={-1}
            onClick={(e) => {
              e.currentTarget.blur();
              setIsMuted(starDashAudio.toggleMute());
            }}
            aria-label={isMuted ? 'Activar efectos de sonido' : 'Silenciar sonido'}
            title={isMuted ? 'Sonido silenciado' : 'Silenciar'}
            className={`p-2 rounded-lg border text-xs transition-colors cursor-pointer ${
              !isMuted
                ? 'border-[#3c4043] bg-white/5 text-white hover:bg-white/10'
                : 'border-[#EA4335]/50 bg-[#EA4335]/20 text-[#f28b82]'
            }`}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4" aria-hidden="true" />
            ) : (
              <Volume2 className="w-4 h-4" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Active Power-ups & Boss Bar Status Strip */}
      {(activePowers.magnet > 0 ||
        activePowers.shield > 0 ||
        activePowers.slowmo > 0 ||
        activePowers.starrain > 0 ||
        bossHud.active) && (
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-1.5 rounded-lg bg-[#111827] border border-[#2d3548] text-xs font-mono tabular-nums text-white">
          <div className="flex flex-wrap items-center gap-3">
            {activePowers.magnet > 0 && (
              <span className="inline-flex items-center gap-1 text-[#8ab4f8]">
                <Magnet className="w-3.5 h-3.5" aria-hidden="true" />
                Imán {activePowers.magnet}s
              </span>
            )}
            {activePowers.shield > 0 && (
              <span className="inline-flex items-center gap-1 text-[#34A853]">
                <Shield className="w-3.5 h-3.5" aria-hidden="true" />
                Escudo {activePowers.shield}s
              </span>
            )}
            {activePowers.slowmo > 0 && (
              <span className="inline-flex items-center gap-1 text-[#FBBC05]">
                <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                Lento {activePowers.slowmo}s
              </span>
            )}
            {activePowers.starrain > 0 && (
              <span className="inline-flex items-center gap-1 text-[#f28b82]">
                <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                Lluvia x2 {activePowers.starrain}s
              </span>
            )}
          </div>

          {bossHud.active && (
            <div className="flex items-center gap-2 text-[#EA4335] font-bold">
              <span>JEFE COLOSO</span>
              <div className="w-24 h-2 rounded-full bg-white/15 overflow-hidden">
                <div
                  style={{ width: `${bossHud.hpPct}%` }}
                  className="h-full bg-[#EA4335] transition-all duration-150"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Interactive Space Canvas Stage */}
      <div
        onMouseMove={(e) => {
          if (gameState === 'playing') {
            updateShipFromClientX(e.clientX);
          }
        }}
        onTouchStart={(e) => {
          if (gameState === 'playing' && e.touches[0]) {
            updateShipFromClientX(e.touches[0].clientX);
          }
        }}
        onTouchMove={(e) => {
          if (gameState === 'playing' && e.touches[0]) {
            updateShipFromClientX(e.touches[0].clientX);
          }
        }}
        className="relative w-full overflow-hidden rounded-2xl border border-[#2d3548] bg-[#070B14] shadow-lg select-none touch-none"
      >
        <canvas
          ref={canvasRef}
          width={640}
          height={360}
          className="w-full h-[290px] sm:h-[360px] block cursor-crosshair"
        />

        {/* 1. TITLE SCREEN OVERLAY */}
        {gameState === 'title' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-5 text-center bg-[#070B14]/88 text-white">
            {/* Custom SVG Star Dash Emblem */}
            <svg
              viewBox="0 0 280 56"
              className="w-56 sm:w-64 h-12 mb-2"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="stardashGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#4285F4" />
                  <stop offset="50%" stopColor="#FBBC05" />
                  <stop offset="100%" stopColor="#34A853" />
                </linearGradient>
              </defs>
              <text
                x="140"
                y="40"
                textAnchor="middle"
                fill="url(#stardashGrad)"
                fontFamily="Arial, Roboto, sans-serif"
                fontWeight="900"
                fontSize="36"
                letterSpacing="2"
              >
                STAR DASH
              </text>
            </svg>

            <p className="text-xs sm:text-sm text-[#bdc1c6] max-w-md mb-4 leading-relaxed">
              Mueve tu nave con el <strong>mouse</strong>, las <strong>flechas del teclado</strong> o{' '}
              <strong>deslizando el dedo</strong>. Atrapa estrellas y monedas doradas para subir tu{' '}
              <span className="text-[#FBBC05] font-semibold">Combo (x2..x8)</span>, activa power-ups y
              esquiva los asteroides y al Jefe Coloso.
            </p>

            <button
              type="button"
              data-start="true"
              onClick={startNewGame}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#4285F4] hover:bg-[#1a73e8] text-white font-semibold text-sm shadow-md transition-transform active:scale-95 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" aria-hidden="true" />
              <span>Jugar Star Dash</span>
            </button>

            <div className="mt-4 text-[11px] text-[#9aa0a6]">
              Flechas / Mouse / Táctil · 3 Vidas · Imán · Escudo · Cámara Lenta · Lluvia x2
            </div>
          </div>
        )}

        {/* 2. GAME OVER MODAL OVERLAY WITH SCORE SUBMISSION & RETRY */}
        {gameState === 'gameover' && (
          <div className="absolute inset-0 overflow-y-auto p-4 sm:p-5 bg-[#070B14]/92 text-white flex flex-col items-center justify-center">
            <div className="w-full max-w-md space-y-3 text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold">
                <Trophy className="w-3.5 h-3.5 text-[#FBBC05]" aria-hidden="true" />
                <span>{isNewRecord ? '¡NUEVO RÉCORD PERSONAL!' : 'Partida finalizada'}</span>
              </div>

              <div className="font-mono tabular-nums">
                <div className="text-3xl sm:text-4xl font-black text-[#FBBC05]">
                  {hudScore.toLocaleString('es-PE')} pts
                </div>
                <div className="text-xs text-[#9aa0a6] mt-0.5">
                  Mejor marca personal: {Math.max(bestScore, hudScore).toLocaleString('es-PE')} pts
                </div>
              </div>

              {/* Save to Firestore Top 10 Global Form */}
              {hudScore > 0 && !scoreSavedId ? (
                <form
                  onSubmit={handleSaveScore}
                  className="p-3 rounded-xl bg-[#161b26] border border-[#2d3548] space-y-2 text-left"
                >
                  <label
                    htmlFor="stardash-player-name"
                    className="block text-xs font-medium text-[#bdc1c6]"
                  >
                    Tu nombre para el Top 10 global (máx. 15 caracteres):
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      id="stardash-player-name"
                      type="text"
                      maxLength={MAX_PLAYER_NAME_LENGTH}
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      placeholder="Piloto LF"
                      className="flex-1 h-9 px-3 rounded-lg bg-[#0B0F19] border border-[#3c4043] text-sm text-white placeholder-[#70757a] focus:border-[#4285F4] focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={submittingScore}
                      className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-[#34A853] hover:bg-[#2d9248] disabled:opacity-50 text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>{submittingScore ? 'Guardando...' : 'Guardar récord'}</span>
                    </button>
                  </div>
                  {submitError && (
                    <p className="text-xs text-[#f28b82] flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                      <span>{submitError}</span>
                    </p>
                  )}
                </form>
              ) : scoreSavedId ? (
                <div className="p-2.5 rounded-xl bg-[#34A853]/20 border border-[#34A853]/40 text-xs text-[#81c995] flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>¡Puntuación registrada en el Top 10 global!</span>
                </div>
              ) : null}

              <div className="pt-1">
                <button
                  type="button"
                  data-start="true"
                  onClick={startNewGame}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#4285F4] hover:bg-[#1a73e8] text-white font-semibold text-sm shadow-md transition-transform active:scale-95 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" aria-hidden="true" />
                  <span>Reintentar de inmediato</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Inline Real-Time Top 10 Global Leaderboard inside the game panel */}
      <LeaderboardTable compact highlightScoreId={scoreSavedId} />
    </div>
  );
}
