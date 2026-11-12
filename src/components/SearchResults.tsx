import { ExternalLink, Globe } from 'lucide-react';
import { MAIN_SEARCH_RESULTS, PEOPLE_ALSO_SEARCH, SearchResultItem } from '../data/profile';
import { TabId } from '../utils/serpUtils';

interface SearchResultsProps {
  searchQuery: string;
  onSelectFriendsTab: (tab: TabId) => void;
}

export function SearchResults({ searchQuery, onSelectFriendsTab }: SearchResultsProps) {
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const isDefaultQuery =
    !normalizedQuery ||
    normalizedQuery === 'luis felipe sandoval charca' ||
    normalizedQuery === 'luis felipe';

  const filteredResults: SearchResultItem[] = isDefaultQuery
    ? MAIN_SEARCH_RESULTS
    : MAIN_SEARCH_RESULTS.filter(
        (item) =>
          item.title.toLowerCase().includes(normalizedQuery) ||
          item.description.toLowerCase().includes(normalizedQuery) ||
          item.siteName.toLowerCase().includes(normalizedQuery)
      );

  const resultsToDisplay = filteredResults.length > 0 ? filteredResults : MAIN_SEARCH_RESULTS;

  return (
    <div className="space-y-8">
      {/* Main Organic Search Results Section */}
      <section aria-labelledby="main-results-heading" className="space-y-7">
        <h2 id="main-results-heading" className="sr-only">
          Resultados principales sobre Luis Felipe Sandoval Charca
        </h2>

        {resultsToDisplay.map((result) => (
          <article
            key={result.id}
            className="group rounded-xl p-2 -mx-2 transition-colors duration-150 hover:bg-[#f8f9fa]/80 dark:hover:bg-[#303134]/40"
          >
            {/* Google-style Site Attribution & Breadcrumb URL in grey/green */}
            <div className="flex items-center gap-2.5 mb-1">
              <div
                className="w-7 h-7 rounded-full bg-[#f1f3f4] dark:bg-[#303134] flex items-center justify-center text-[#5f6368] dark:text-[#9aa0a6] shrink-0"
                aria-hidden="true"
              >
                <Globe className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0 leading-tight">
                <div className="text-sm text-[#202124] dark:text-[#dadce0] truncate">
                  {result.siteName}
                </div>
                <cite className="not-italic text-xs text-[#5f6368] dark:text-[#9aa0a6] block truncate">
                  {result.displayUrl}
                </cite>
              </div>
            </div>

            {/* Blue Result Title Link (H2 as required by SEO structure) */}
            <h2 className="text-xl leading-snug font-normal mt-1">
              <a
                href={result.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#1a0dab] dark:text-[#8ab4f8] visited:text-[#681da8] dark:visited:text-[#c58af9] group-hover:underline inline-flex items-center gap-1.5"
              >
                <span>{result.title}</span>
              </a>
            </h2>

            {/* Snippet Description */}
            <p className="mt-1.5 text-sm leading-relaxed text-[#4d5156] dark:text-[#bdc1c6] max-w-[600px]">
              {result.description}
            </p>

            {/* Optional Sitelink / Secondary descriptive external link */}
            {result.secondaryLink && (
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
                <a
                  href={result.secondaryLink.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#1a0dab] dark:text-[#8ab4f8] hover:underline inline-flex items-center gap-1 font-medium"
                >
                  <span>{result.secondaryLink.label}</span>
                  <ExternalLink className="w-3 h-3" aria-hidden="true" />
                </a>
              </div>
            )}
          </article>
        ))}
      </section>

      {/* "Las personas también buscan" Section */}
      <section
        aria-labelledby="people-also-search-heading"
        className="pt-4 border-t border-[#ebebeb] dark:border-[#3c4043]"
      >
        <div className="flex items-center justify-between mb-4">
          <h2
            id="people-also-search-heading"
            className="text-lg sm:text-xl font-normal text-[#202124] dark:text-[#e8eaed]"
          >
            Las personas también buscan
          </h2>
          <button
            type="button"
            onClick={() => onSelectFriendsTab('amigos')}
            className="text-xs font-medium text-[#1a73e8] dark:text-[#8ab4f8] hover:underline cursor-pointer"
          >
            Ver pestaña Amigos →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {PEOPLE_ALSO_SEARCH.map((card) => (
            <a
              key={card.id}
              href={card.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3.5 p-3 rounded-xl border border-[#dadce0] dark:border-[#3c4043] bg-white dark:bg-[#202124] hover:bg-[#f8f9fa] dark:hover:bg-[#303134] hover:border-[#bdc1c6] dark:hover:border-[#5f6368] transition-all duration-150"
            >
              <div
                style={{ backgroundColor: `${card.accentColor}18`, color: card.accentColor }}
                className="w-11 h-11 rounded-lg flex items-center justify-center font-bold text-sm shrink-0"
                aria-hidden="true"
              >
                {card.initials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-[#1a0dab] dark:text-[#8ab4f8] group-hover:underline truncate">
                  {card.title}
                </div>
                <div className="text-xs text-[#5f6368] dark:text-[#9aa0a6] truncate mt-0.5">
                  {card.subtitle}
                </div>
              </div>
              <ExternalLink
                className="w-4 h-4 text-[#70757a] dark:text-[#9aa0a6] opacity-70 group-hover:opacity-100 shrink-0"
                aria-hidden="true"
              />
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
