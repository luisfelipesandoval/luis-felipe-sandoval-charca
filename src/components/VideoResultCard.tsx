import { useEffect, useState } from 'react';
import { Play, RotateCcw, Film, Sparkles } from 'lucide-react';
import { getWordmarkColoredChars } from '../utils/serpUtils';

export function VideoResultCard() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [sceneStep, setSceneStep] = useState(0);

  const coloredName = getWordmarkColoredChars('Luis Felipe Sandoval Charca');

  useEffect(() => {
    if (!isPlaying) return;
    setProgress(0);
    setSceneStep(0);

    const start = performance.now();
    const durationMs = 4500;

    const timer = setInterval(() => {
      const elapsed = performance.now() - start;
      const pct = Math.min(100, Math.round((elapsed / durationMs) * 100));
      setProgress(pct);

      if (elapsed < 1500) {
        setSceneStep(0);
      } else if (elapsed < 3000) {
        setSceneStep(1);
      } else {
        setSceneStep(2);
      }

      if (elapsed >= durationMs) {
        clearInterval(timer);
      }
    }, 80);

    return () => clearInterval(timer);
  }, [isPlaying]);

  return (
    <article className="group rounded-xl p-2 -mx-2 transition-colors duration-150 hover:bg-[#f8f9fa]/80 dark:hover:bg-[#303134]/40">
      {/* Attribution Row */}
      <div className="flex items-center gap-2.5 mb-1">
        <div
          className="w-7 h-7 rounded-full bg-[#fce8e6] dark:bg-[#303134] flex items-center justify-center text-[#EA4335] shrink-0"
          aria-hidden="true"
        >
          <Film className="w-3.5 h-3.5" />
        </div>
        <div className="min-w-0 leading-tight">
          <div className="text-sm text-[#202124] dark:text-[#dadce0] truncate">
            Reel Audiovisual · Luis Felipe
          </div>
          <cite className="not-italic text-xs text-[#5f6368] dark:text-[#9aa0a6] block truncate">
            https://luis-felipe-sandoval.vercel.app › reel-animado
          </cite>
        </div>
      </div>

      {/* Video Title Heading */}
      <h2 className="text-xl leading-snug font-normal mt-1">
        <button
          type="button"
          onClick={() => setIsPlaying(true)}
          className="text-left text-[#1a0dab] dark:text-[#8ab4f8] group-hover:underline cursor-pointer"
        >
          Reel Creativo: Animación de Luis Felipe Sandoval Charca – Diseño y Edición
        </button>
      </h2>

      {/* Google Video Result Split: Thumbnail / Inline Animated Player + Description */}
      <div className="mt-2.5 flex flex-col sm:flex-row items-start gap-4">
        {!isPlaying ? (
          <button
            type="button"
            onClick={() => setIsPlaying(true)}
            aria-label="Reproducir animación corta con el nombre de Luis Felipe Sandoval Charca"
            className="relative w-full sm:w-44 h-28 rounded-xl overflow-hidden border border-[#dadce0] dark:border-[#3c4043] bg-gradient-to-br from-[#202124] via-[#303134] to-[#1a73e8]/40 flex flex-col items-center justify-center shrink-0 group/thumb cursor-pointer"
          >
            <div className="text-xs font-bold tracking-tight text-white/90 mb-1.5 px-2 truncate max-w-full">
              Luis Felipe Sandoval
            </div>
            <div className="w-10 h-10 rounded-full bg-black/65 group-hover/thumb:bg-[#EA4335] text-white flex items-center justify-center transition-colors shadow-md">
              <Play className="w-5 h-5 fill-current ml-0.5" aria-hidden="true" />
            </div>
            <span className="absolute bottom-1.5 left-2 px-1.5 py-0.5 rounded bg-black/75 text-[11px] font-mono tabular-nums text-white">
              0:05
            </span>
          </button>
        ) : (
          <div
            data-testid="video-animation-player"
            className="w-full rounded-xl overflow-hidden border border-[#dadce0] dark:border-[#3c4043] bg-[#171717] text-white p-4 sm:p-5 space-y-3"
          >
            <div className="min-h-[96px] flex flex-col items-center justify-center text-center">
              <div className="inline-flex items-center gap-1.5 text-xs text-[#8ab4f8] mb-1">
                <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                <span>
                  {sceneStep === 0
                    ? 'Presentación Audiovisual · UCSP'
                    : sceneStep === 1
                    ? 'Administración de Negocios · Diseño Gráfico & Video'
                    : '¡Conectemos en proyectos creativos!'}
                </span>
              </div>

              <div className="text-xl sm:text-2xl font-bold tracking-tight leading-snug">
                {coloredName.map((item, idx) =>
                  item.char === ' ' ? (
                    <span key={idx} className="inline-block w-1.5">
                      &nbsp;
                    </span>
                  ) : (
                    <span
                      key={idx}
                      style={{ color: item.color }}
                      className="inline-block transition-transform duration-300 hover:scale-110"
                    >
                      {item.char}
                    </span>
                  )
                )}
              </div>
            </div>

            {/* Progress bar and controls */}
            <div className="space-y-2">
              <div className="w-full h-1.5 rounded-full bg-white/15 overflow-hidden">
                <div
                  style={{ width: `${progress}%` }}
                  className="h-full bg-gradient-to-r from-[#4285F4] via-[#EA4335] to-[#34A853] transition-all duration-100"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-[#bdc1c6]">
                <span className="font-mono tabular-nums">
                  {progress < 100 ? 'Reproduciendo animación...' : 'Animación completada'}
                </span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsPlaying(false);
                      setTimeout(() => setIsPlaying(true), 20);
                    }}
                    className="inline-flex items-center gap-1 text-[#8ab4f8] hover:underline cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Repetir</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsPlaying(false)}
                    className="text-[#9aa0a6] hover:text-white cursor-pointer"
                  >
                    Minimizar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {!isPlaying && (
          <p className="text-sm leading-relaxed text-[#4d5156] dark:text-[#bdc1c6] max-w-[440px]">
            Haz clic en el botón de reproducción para ver una animación corta interactiva con mi nombre,{' '}
            <strong>Luis Felipe Sandoval Charca</strong>, inspirada en mi pasión por el diseño audiovisual,
            el diseño gráfico y la edición de videos en la UCSP.
          </p>
        )}
      </div>
    </article>
  );
}
