import { PROFILE_DATA } from '../data/profile';

export function Footer() {
  return (
    <footer className="mt-16 bg-[#f2f2f2] dark:bg-[#171717] border-t border-[#dadce0] dark:border-[#3c4043] text-sm text-[#5f6368] dark:text-[#9aa0a6] transition-colors">
      {/* Upper Footer Row: Location & Institution context */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 sm:pl-[178px] py-3 border-b border-[#dadce0] dark:border-[#3c4043] flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="font-medium text-[#202124] dark:text-[#e8eaed]">Perú</span>
        <span aria-hidden="true">·</span>
        <span>Arequipa, Universidad Católica San Pablo (UCSP)</span>
      </div>

      {/* Lower Footer Row: Descriptive External Links to UCSP & LinkedIn */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 sm:pl-[178px] py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <nav
          aria-label="Enlaces institucionales y de contacto de Luis Felipe Sandoval Charca"
          className="flex flex-wrap items-center gap-x-6 gap-y-2"
        >
          <a
            href={PROFILE_DATA.university.url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#202124] dark:hover:text-[#e8eaed] hover:underline transition-colors"
          >
            Universidad Católica San Pablo (UCSP)
          </a>

          <a
            href={PROFILE_DATA.career.url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#202124] dark:hover:text-[#e8eaed] hover:underline transition-colors"
          >
            Administración de Negocios – UCSP
          </a>

          <a
            href={PROFILE_DATA.linkedin.url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#202124] dark:hover:text-[#e8eaed] hover:underline transition-colors"
          >
            LinkedIn de Luis Felipe Sandoval Charca
          </a>

          <a
            href={PROFILE_DATA.professor.url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#202124] dark:hover:text-[#e8eaed] hover:underline transition-colors"
          >
            Profesor Ernesto Cuadros Vargas
          </a>
        </nav>

        <p className="text-xs text-[#70757a] dark:text-[#9aa0a6]">
          © {new Date().getFullYear()} {PROFILE_DATA.fullName}
        </p>
      </div>
    </footer>
  );
}
