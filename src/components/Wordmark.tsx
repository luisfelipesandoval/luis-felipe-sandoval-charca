import { getWordmarkColoredChars } from '../utils/serpUtils';

interface WordmarkProps {
  onClick?: () => void;
}

export function Wordmark({ onClick }: WordmarkProps) {
  const coloredChars = getWordmarkColoredChars('Luis Felipe');

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Inicio de búsqueda de Luis Felipe Sandoval Charca"
      className="inline-flex items-baseline select-none font-bold tracking-tight text-2xl sm:text-[28px] leading-none cursor-pointer transition-opacity duration-150 hover:opacity-90 whitespace-nowrap shrink-0"
    >
      {coloredChars.map((item, idx) =>
        item.char === ' ' ? (
          <span key={idx} className="inline-block w-1.5 sm:w-2">
            &nbsp;
          </span>
        ) : (
          <span key={idx} style={{ color: item.color }}>
            {item.char}
          </span>
        )
      )}
    </button>
  );
}
