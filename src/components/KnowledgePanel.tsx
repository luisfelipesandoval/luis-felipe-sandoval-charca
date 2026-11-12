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
              alt="Retrato de Luis Felipe Sandoval Charca, estudiante de Administración de Negocios en la UCSP"
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

      {/* Primary Action Button: LinkedIn */}
      <div className="pt-4">
        <a
          href={PROFILE_DATA.linkedin.url}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-full bg-[#1a73e8] hover:bg-[#1557b0] dark:bg-[#8ab4f8] dark:hover:bg-[#aecbfa] text-white dark:text-[#202124] font-medium text-sm transition-all duration-150 shadow-xs"
        >
          <span>LinkedIn</span>
          <ExternalLink className="w-4 h-4" aria-hidden="true" />
        </a>
      </div>
    </aside>
  );
}
