import React, { useEffect, useRef, useState } from 'react';
import { Search, X, Sparkles, Image, Video, Users, Newspaper, Gamepad2 } from 'lucide-react';
import { Wordmark } from './Wordmark';
import { SEARCH_TABS, TabId } from '../utils/serpUtils';
import { EASTER_EGG_SUGGESTIONS, EasterEggGameId } from '../utils/easterEggs';

interface HeaderProps {
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
  onSelectSuggestion: (phrase: string, gameId: EasterEggGameId) => void;
  onFeelingLucky: () => void;
  onResetSearch: () => void;
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  decorativeToast: string | null;
}

const TAB_ICONS: Record<TabId, React.ReactNode> = {
  todo: <Search className="w-4 h-4" aria-hidden="true" />,
  imagenes: <Image className="w-4 h-4" aria-hidden="true" />,
  videos: <Video className="w-4 h-4" aria-hidden="true" />,
  amigos: <Users className="w-4 h-4" aria-hidden="true" />,
  noticias: <Newspaper className="w-4 h-4" aria-hidden="true" />,
};

export function Header({
  searchQuery,
  onSearchQueryChange,
  onSearchSubmit,
  onSelectSuggestion,
  onFeelingLucky,
  onResetSearch,
  activeTab,
  onTabChange,
  decorativeToast,
}: HeaderProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-[#202124]/95 backdrop-blur-sm border-b border-[#ebebeb] dark:border-[#3c4043] transition-colors">
      {/* Top Bar: Wordmark + Search Bar + "Voy a tener suerte" button */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-3 sm:pt-5 pb-2 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
        <div className="flex items-center justify-between">
          <Wordmark onClick={onResetSearch} />
          <button
            type="button"
            onClick={onFeelingLucky}
            className="sm:hidden inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f8f9fa] dark:bg-[#303134] border border-[#dadce0] dark:border-[#5f6368] text-xs font-medium text-[#3c4043] dark:text-[#e8eaed] hover:border-[#1a73e8] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#1a73e8] dark:text-[#8ab4f8]" aria-hidden="true" />
            <span>Voy a tener suerte</span>
          </button>
        </div>

        <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-2.5 max-w-[860px]">
          <div ref={searchContainerRef} className="relative flex-1 max-w-[640px]">
            <form
              role="search"
              aria-label="Buscar información o minijuegos de Luis Felipe Sandoval Charca"
              onSubmit={(e) => {
                setShowSuggestions(false);
                onSearchSubmit(e);
              }}
            >
              <label htmlFor="google-search-input" className="sr-only">
                Buscar en la página personal de Luis Felipe Sandoval Charca
              </label>
              <div
                className={`group flex items-center w-full h-11 sm:h-[46px] px-4 bg-white dark:bg-[#303134] border border-[#dfe1e5] dark:border-[#5f6368] shadow-[0_1px_6px_rgba(32,33,36,0.08)] hover:shadow-[0_1px_6px_rgba(32,33,36,0.2)] focus-within:shadow-[0_1px_6px_rgba(32,33,36,0.24)] dark:shadow-none dark:hover:bg-[#38393d] transition-all duration-150 ${
                  showSuggestions ? 'rounded-t-3xl rounded-b-none border-b-transparent' : 'rounded-full'
                }`}
              >
                <input
                  id="google-search-input"
                  type="text"
                  value={searchQuery}
                  onFocus={() => setShowSuggestions(true)}
                  onClick={() => setShowSuggestions(true)}
                  onChange={(e) => {
                    onSearchQueryChange(e.target.value);
                    setShowSuggestions(true);
                  }}
                  placeholder="Busca o escribe: piedra papel o tijera, dino, ruleta..."
                  aria-label="Término de búsqueda"
                  aria-expanded={showSuggestions}
                  aria-controls="easter-egg-suggestions-listbox"
                  autoComplete="off"
                  className="w-full bg-transparent text-[15px] sm:text-base text-[#202124] dark:text-[#e8eaed] placeholder-[#5f6368] dark:placeholder-[#9aa0a6] focus:outline-none focus-visible:outline-none"
                />

                {searchQuery.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      onSearchQueryChange('');
                      setShowSuggestions(true);
                    }}
                    aria-label="Limpiar barra de búsqueda"
                    title="Limpiar búsqueda"
                    className="p-1.5 text-[#70757a] dark:text-[#9aa0a6] hover:text-[#202124] dark:hover:text-[#e8eaed] transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" aria-hidden="true" />
                  </button>
                )}

                <span
                  className="h-5 w-[1px] bg-[#dfe1e5] dark:bg-[#5f6368] mx-2"
                  aria-hidden="true"
                />

                <button
                  type="submit"
                  aria-label="Buscar"
                  className="p-1.5 text-[#4285F4] dark:text-[#8ab4f8] hover:opacity-80 transition-opacity cursor-pointer"
                >
                  <Search className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>
            </form>

            {/* Search Autocomplete Dropdown with Easter Egg Suggestions */}
            {showSuggestions && (
              <div
                id="easter-egg-suggestions-listbox"
                role="listbox"
                aria-label="Sugerencias de minijuegos ocultos"
                className="absolute left-0 right-0 top-full z-40 rounded-b-3xl bg-white dark:bg-[#303134] border border-t-0 border-[#dfe1e5] dark:border-[#5f6368] shadow-[0_4px_12px_rgba(32,33,36,0.18)] pb-3 pt-1 overflow-hidden"
              >
                <div className="mx-4 mb-1.5 border-t border-[#ebebeb] dark:border-[#3c4043] pt-2 flex items-center justify-between text-[11px] font-medium text-[#70757a] dark:text-[#9aa0a6]">
                  <span className="inline-flex items-center gap-1.5">
                    <Gamepad2 className="w-3.5 h-3.5 text-[#1a73e8] dark:text-[#8ab4f8]" aria-hidden="true" />
                    <span>Minijuegos escondidos (Easter Eggs)</span>
                  </span>
                  <span>Presiona Enter o haz clic</span>
                </div>

                {EASTER_EGG_SUGGESTIONS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    role="option"
                    aria-selected={searchQuery.toLowerCase() === item.phrase}
                    onClick={() => {
                      setShowSuggestions(false);
                      onSelectSuggestion(item.phrase, item.id);
                    }}
                    className="w-full px-4 py-2 flex items-center justify-between gap-3 text-left text-sm text-[#202124] dark:text-[#e8eaed] hover:bg-[#f1f3f4] dark:hover:bg-[#3c4043] transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-3 min-w-0">
                      <Search className="w-4 h-4 text-[#70757a] dark:text-[#9aa0a6] shrink-0" aria-hidden="true" />
                      <span className="font-medium truncate">{item.phrase}</span>
                    </span>
                    <span className="text-xs text-[#5f6368] dark:text-[#9aa0a6] whitespace-nowrap shrink-0">
                      {item.badge}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Desktop "Voy a tener suerte" button next to search bar */}
          <button
            type="button"
            onClick={onFeelingLucky}
            className="hidden sm:inline-flex items-center gap-2 h-[42px] px-4 rounded-full bg-[#f8f9fa] dark:bg-[#303134] hover:bg-[#f1f3f4] dark:hover:bg-[#3c4043] border border-[#dadce0] dark:border-[#5f6368] hover:border-[#1a73e8] dark:hover:border-[#8ab4f8] text-sm font-medium text-[#3c4043] dark:text-[#e8eaed] transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#1a73e8] dark:text-[#8ab4f8]" aria-hidden="true" />
            <span>Voy a tener suerte</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 sm:pl-[178px]">
        <div
          role="tablist"
          aria-label="Categorías de resultados de búsqueda"
          className="flex items-center justify-between sm:justify-start gap-1 sm:gap-2 overflow-x-auto no-scrollbar"
        >
          {SEARCH_TABS.map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                role="tab"
                type="button"
                aria-selected={isSelected}
                aria-controls={tab.isFunctional ? `panel-${tab.id}` : 'panel-todo'}
                onClick={() => onTabChange(tab.id)}
                className={`relative flex items-center gap-1.5 px-2.5 sm:px-3 py-2.5 text-[13px] sm:text-sm font-medium whitespace-nowrap shrink-0 transition-colors duration-150 cursor-pointer ${
                  isSelected
                    ? 'text-[#1a73e8] dark:text-[#8ab4f8]'
                    : 'text-[#5f6368] dark:text-[#9aa0a6] hover:text-[#202124] dark:hover:text-[#e8eaed]'
                }`}
              >
                <span className="hidden sm:inline-flex" aria-hidden="true">
                  {TAB_ICONS[tab.id]}
                </span>
                <span>{tab.label}</span>
                {isSelected && (
                  <span
                    className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#1a73e8] dark:bg-[#8ab4f8] rounded-t-full"
                    aria-hidden="true"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Subtle feedback banner when user clicks a decorative tab */}
      {decorativeToast && (
        <div
          role="status"
          aria-live="polite"
          className="bg-[#f8f9fa] dark:bg-[#303134] border-t border-[#ebebeb] dark:border-[#3c4043] px-4 py-1.5 text-xs text-[#5f6368] dark:text-[#9aa0a6]"
        >
          <div className="max-w-[1280px] mx-auto sm:pl-[154px] flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#1a73e8] dark:text-[#8ab4f8] shrink-0" aria-hidden="true" />
            <span>{decorativeToast}</span>
          </div>
        </div>
      )}
    </header>
  );
}
