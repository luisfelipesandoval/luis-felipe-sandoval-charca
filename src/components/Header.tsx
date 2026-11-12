import React from 'react';
import { Search, X, Sparkles, Image, Video, Users, Newspaper } from 'lucide-react';
import { Wordmark } from './Wordmark';
import { SEARCH_TABS, TabId } from '../utils/serpUtils';

interface HeaderProps {
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
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
  onResetSearch,
  activeTab,
  onTabChange,
  decorativeToast,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-[#202124]/95 backdrop-blur-sm border-b border-[#ebebeb] dark:border-[#3c4043] transition-colors">
      {/* Top Bar: Wordmark + Search Bar */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-3 sm:pt-5 pb-2 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-7">
        <div className="flex items-center justify-between">
          <Wordmark onClick={onResetSearch} />
          <span className="sm:hidden text-xs text-[#5f6368] dark:text-[#9aa0a6]">
            UCSP · Arequipa
          </span>
        </div>

        <form
          role="search"
          aria-label="Buscar información sobre Luis Felipe Sandoval Charca"
          onSubmit={onSearchSubmit}
          className="flex-1 max-w-[692px]"
        >
          <label htmlFor="google-search-input" className="sr-only">
            Buscar en la página personal de Luis Felipe Sandoval Charca
          </label>
          <div className="group flex items-center w-full h-11 sm:h-[46px] px-4 rounded-full bg-white dark:bg-[#303134] border border-[#dfe1e5] dark:border-[#5f6368] shadow-[0_1px_6px_rgba(32,33,36,0.08)] hover:shadow-[0_1px_6px_rgba(32,33,36,0.2)] focus-within:shadow-[0_1px_6px_rgba(32,33,36,0.24)] dark:shadow-none dark:hover:bg-[#38393d] transition-all duration-150">
            <input
              id="google-search-input"
              type="search"
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              placeholder="Luis Felipe Sandoval Charca"
              aria-label="Término de búsqueda"
              className="w-full bg-transparent text-[15px] sm:text-base text-[#202124] dark:text-[#e8eaed] placeholder-[#5f6368] dark:placeholder-[#9aa0a6] focus:outline-none"
            />

            {searchQuery.length > 0 && (
              <button
                type="button"
                onClick={() => onSearchQueryChange('Luis Felipe Sandoval Charca')}
                aria-label="Restaurar búsqueda predeterminada Luis Felipe Sandoval Charca"
                title="Restaurar nombre completo"
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
