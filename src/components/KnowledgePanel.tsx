import { useState } from 'react';
import { ExternalLink, Share2, Check, User } from 'lucide-react';
import { PROFILE_DATA, PROFILE_PHOTO_URL } from '../data/profile';

export function KnowledgePanel() {
  const [copied, setCopied] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleShare = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      setCopied(false);
    }
  };

  const showCustomPhoto = Boolean(PROFILE_PHOTO_URL) && !imageError;

  return (
    <aside
      aria-labelledby="knowledge-panel-heading"
      className="w-full rounded-2xl border border-[#dadce0] dark:border-[#3c4043] bg-white dark:bg-[#202124] p-5 sm:p-6 shadow-[0_1px_3px_rgba(32,33,36,0.06)] dark:shadow-none transition-colors"
    >
      {/* Header row: Profile photo circular placeholder + Name & Subtitle */}
      <div className="flex items-center gap-4 pb-5 border-b border-[#ebebeb] dark:border-[#3c4043]">
        {/*
          ======================================================================
          PLACEHOLDER CIRCULAR DE FOTO DE PERFIL
          Para cambiar por tu foto real, edita `PROFILE_PHOTO_URL` en
          `src/data/profile.ts` o reemplaza el atributo `src` de la imagen aquí.
          ======================================================================
        */}
        <div
          className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden shrink-0 border-2 border-[#e8f0fe] dark:border-[#3c4043] bg-gradient-to-br from-[#e8f0fe] via-[#fef7e0] to-[#e6f4ea] dark:from-[#303134] dark:via-[#28292c] dark:to-[#3c4043] flex items-center justify-center shadow-inner"
          title="Foto de perfil de Luis Felipe Sandoval Charca (reemplazable en src/data/profile.ts)"
        >
          {showCustomPhoto ? (
            <img
              src={PROFILE_PHOTO_URL}
              alt="Luis Felipe Sandoval Charca"
              referrerPolicy="no-referrer"
              onError={() => setImageError(true)}
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              role="img"
              aria-label="Placeholder circular de foto de perfil de Luis Felipe Sandoval Charca"
              className="flex flex-col items-center justify-center text-center select-none"
            >
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1a73e8] dark:text-[#8ab4f8]">
                {PROFILE_DATA.initials}
              </span>
              <span className="text-[10px] font-medium text-[#5f6368] dark:text-[#9aa0a6] flex items-center gap-0.5 mt-0.5">
                <User className="w-2.5 h-2.5" aria-hidden="true" />
                Foto
              </span>
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h2
              id="knowledge-panel-heading"
              className="text-xl sm:text-2xl font-normal text-[#202124] dark:text-[#e8eaed] leading-snug"
            >
              {PROFILE_DATA.fullName}
            </h2>
            <button
              type="button"
              onClick={handleShare}
              aria-label={copied ? 'Enlace copiado al portapapeles' : 'Compartir perfil de Luis Felipe Sandoval Charca'}
              title={copied ? 'Enlace copiado' : 'Copiar enlace del perfil'}
              className="p-2 rounded-full text-[#5f6368] dark:text-[#9aa0a6] hover:bg-[#f1f3f4] dark:hover:bg-[#303134] transition-colors shrink-0 cursor-pointer"
            >
              {copied ? (
                <Check className="w-4 h-4 text-[#34A853]" aria-hidden="true" />
              ) : (
                <Share2 className="w-4 h-4" aria-hidden="true" />
              )}
            </button>
          </div>
          <p className="text-sm text-[#5f6368] dark:text-[#9aa0a6] mt-0.5">
            {PROFILE_DATA.subtitle}
          </p>
        </div>
      </div>

      {/* Summary Bio inside Knowledge Panel */}
      <p className="text-sm text-[#4d5156] dark:text-[#bdc1c6] leading-relaxed py-4 border-b border-[#ebebeb] dark:border-[#3c4043]">
        Estudiante universitario de <strong>Administración de Negocios</strong> en la{' '}
        <strong>Universidad Católica San Pablo (UCSP)</strong>, enfocado en la gestión empresarial y la
        comunicación visual a través del diseño audiovisual, gráfico y la edición de video.
      </p>

      {/* Structured Attributes List */}
      <dl className="py-4 space-y-2.5 text-sm border-b border-[#ebebeb] dark:border-[#3c4043]">
        <div className="leading-snug">
          <dt className="inline font-bold text-[#202124] dark:text-[#e8eaed]">Nombre: </dt>
          <dd className="inline text-[#4d5156] dark:text-[#bdc1c6]">{PROFILE_DATA.fullName}</dd>
        </div>

        <div className="leading-snug">
          <dt className="inline font-bold text-[#202124] dark:text-[#e8eaed]">Edad: </dt>
          <dd className="inline text-[#4d5156] dark:text-[#bdc1c6]">{PROFILE_DATA.age}</dd>
        </div>

        <div className="leading-snug">
          <dt className="inline font-bold text-[#202124] dark:text-[#e8eaed]">Carrera: </dt>
          <dd className="inline">
            <a
              href={PROFILE_DATA.career.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#1a0dab] dark:text-[#8ab4f8] hover:underline font-medium"
            >
              {PROFILE_DATA.career.name}
            </a>
          </dd>
        </div>

        <div className="leading-snug">
          <dt className="inline font-bold text-[#202124] dark:text-[#e8eaed]">Universidad: </dt>
          <dd className="inline">
            <a
              href={PROFILE_DATA.university.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#1a0dab] dark:text-[#8ab4f8] hover:underline font-medium"
            >
              {PROFILE_DATA.university.name}
            </a>
          </dd>
        </div>

        <div className="leading-snug">
          <dt className="inline font-bold text-[#202124] dark:text-[#e8eaed]">Curso: </dt>
          <dd className="inline text-[#4d5156] dark:text-[#bdc1c6]">{PROFILE_DATA.course.name}</dd>
        </div>

        <div className="leading-snug">
          <dt className="inline font-bold text-[#202124] dark:text-[#e8eaed]">Profesor: </dt>
          <dd className="inline">
            <a
              href={PROFILE_DATA.professor.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#1a0dab] dark:text-[#8ab4f8] hover:underline font-medium"
            >
              {PROFILE_DATA.professor.name} (Perfil en LinkedIn)
            </a>
          </dd>
        </div>

        <div className="leading-snug">
          <dt className="inline font-bold text-[#202124] dark:text-[#e8eaed]">Intereses: </dt>
          <dd className="inline text-[#4d5156] dark:text-[#bdc1c6]">
            {PROFILE_DATA.interests.join(', ')}
          </dd>
        </div>
      </dl>

      {/* Primary Action Buttons: LinkedIn, Instagram & TikTok */}
      <div className="pt-4 flex flex-wrap items-center gap-2">
        <a
          href={PROFILE_DATA.linkedin.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 min-w-fit inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-full bg-[#1a73e8] hover:bg-[#1557b0] dark:bg-[#8ab4f8] dark:hover:bg-[#aecbfa] text-white dark:text-[#202124] font-medium text-xs sm:text-sm transition-all duration-150 shadow-xs whitespace-nowrap"
        >
          <span>LinkedIn</span>
          <ExternalLink className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        </a>

        <a
          href={PROFILE_DATA.instagram.url}
          target="_blank"
          rel="noopener noreferrer me"
          className="flex-1 min-w-fit inline-flex items-center justify-center gap-1.5 py-2.5 px-3.5 rounded-full border border-[#dadce0] dark:border-[#5f6368] bg-[#f8f9fa] hover:bg-[#f1f3f4] dark:bg-[#303134] dark:hover:bg-[#3c4043] text-[#202124] dark:text-[#e8eaed] hover:border-[#1a73e8] dark:hover:border-[#8ab4f8] font-medium text-xs transition-all duration-150 shadow-xs whitespace-nowrap"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-4 h-4 text-[#E1306C] shrink-0"
            aria-hidden="true"
          >
            <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
            <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
          </svg>
          <span>Instagram</span>
          <span className="text-[#5f6368] dark:text-[#9aa0a6] font-normal">
            {PROFILE_DATA.instagram.handle}
          </span>
        </a>

        <a
          href={PROFILE_DATA.tiktok.url}
          target="_blank"
          rel="noopener noreferrer me"
          className="flex-1 min-w-fit inline-flex items-center justify-center gap-1.5 py-2.5 px-3.5 rounded-full border border-[#dadce0] dark:border-[#5f6368] bg-[#f8f9fa] hover:bg-[#f1f3f4] dark:bg-[#303134] dark:hover:bg-[#3c4043] text-[#202124] dark:text-[#e8eaed] hover:border-[#1a73e8] dark:hover:border-[#8ab4f8] font-medium text-xs transition-all duration-150 shadow-xs whitespace-nowrap"
        >
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-4 h-4 text-[#202124] dark:text-[#e8eaed] shrink-0"
            aria-hidden="true"
          >
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
          </svg>
          <span>TikTok</span>
          <span className="text-[#5f6368] dark:text-[#9aa0a6] font-normal">
            {PROFILE_DATA.tiktok.handle}
          </span>
        </a>
      </div>
    </aside>
  );
}
