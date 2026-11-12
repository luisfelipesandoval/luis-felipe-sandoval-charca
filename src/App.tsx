/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import { Header } from './components/Header';
import { KnowledgePanel } from './components/KnowledgePanel';
import { SearchResults } from './components/SearchResults';
import { FriendsResults } from './components/FriendsResults';
import { EasterEggArena } from './components/EasterEggArena';
import { Footer } from './components/Footer';
import {
  formatSearchStatsText,
  generateRandomSearchSeconds,
  SEARCH_TABS,
  TabId,
} from './utils/serpUtils';
import {
  EASTER_EGG_SUGGESTIONS,
  EasterEggGameId,
  matchEasterEggQuery,
} from './utils/easterEggs';

export default function App() {
  const [searchQuery, setSearchQuery] = useState('Luis Felipe Sandoval Charca');
  const [activeTab, setActiveTab] = useState<TabId>('todo');
  const [decorativeToast, setDecorativeToast] = useState<string | null>(null);
  const [activeEasterEgg, setActiveEasterEgg] = useState<EasterEggGameId | null>(() => {
    if (typeof window !== 'undefined' && window.location.search.includes('autostart=1')) {
      return 'stardash';
    }
    return null;
  });

  // Random seconds generated once on each load (e.g. "0,42")
  const randomSeconds = useMemo(() => generateRandomSearchSeconds(), []);

  const handleTabChange = (tabId: TabId) => {
    const tabConfig = SEARCH_TABS.find((t) => t.id === tabId);
    if (!tabConfig) return;

    if (tabConfig.isFunctional) {
      setActiveTab(tabId);
      setDecorativeToast(null);
    } else {
      setDecorativeToast(
        `La pestaña "${tabConfig.label}" es decorativa en esta presentación personal. Mostrando los resultados de "${
          activeTab === 'amigos' ? 'Amigos' : 'Todo'
        }".`
      );
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDecorativeToast(null);
    const matchedGame = matchEasterEggQuery(searchQuery);
    if (matchedGame) {
      setActiveEasterEgg(matchedGame);
      setActiveTab('todo');
    }
  };

  const handleSelectSuggestion = (phrase: string, gameId: EasterEggGameId) => {
    setSearchQuery(phrase);
    setActiveEasterEgg(gameId);
    setActiveTab('todo');
    setDecorativeToast(null);
  };

  const handleFeelingLucky = () => {
    // Opens Star Dash directly when not already open, or cycles to another game if desired
    setSearchQuery('jugar');
    setActiveEasterEgg('stardash');
    setActiveTab('todo');
    setDecorativeToast(null);
  };

  const handleOpenStarDash = () => {
    setSearchQuery('jugar');
    setActiveEasterEgg('stardash');
    setActiveTab('todo');
    setDecorativeToast(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectGameInsideArena = (gameId: EasterEggGameId) => {
    const meta = EASTER_EGG_SUGGESTIONS.find((item) => item.id === gameId);
    if (meta) {
      setSearchQuery(meta.phrase);
    }
    setActiveEasterEgg(gameId);
  };

  const handleCloseEasterEgg = () => {
    setActiveEasterEgg(null);
    setSearchQuery('Luis Felipe Sandoval Charca');
  };

  const handleResetSearch = () => {
    setSearchQuery('Luis Felipe Sandoval Charca');
    setActiveEasterEgg(null);
    setActiveTab('todo');
    setDecorativeToast(null);
  };

  const statsText = formatSearchStatsText(randomSeconds, 1);

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#202124] text-[#202124] dark:text-[#e8eaed]">
      {/* Single visually hidden H1 for semantic SEO hierarchy */}
      <h1 className="sr-only">
        Luis Felipe Sandoval Charca – Estudiante de Administración de Negocios en la Universidad Católica San Pablo (UCSP)
      </h1>

      {/* 1 & 2. Top bar (Wordmark + Search Bar + "Voy a tener suerte") and Tabs */}
      <Header
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        onSearchSubmit={handleSearchSubmit}
        onSelectSuggestion={handleSelectSuggestion}
        onFeelingLucky={handleFeelingLucky}
        onResetSearch={handleResetSearch}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        decorativeToast={decorativeToast}
      />

      {/* Main Content Container */}
      <main className="flex-1 w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 sm:pl-[178px] pt-3">
        {/* 3. Small grey search stats text with random seconds on each load */}
        <p
          aria-live="polite"
          className="text-xs sm:text-sm text-[#70757a] dark:text-[#9aa0a6] mb-5"
        >
          {statsText}
        </p>

        {activeTab === 'todo' ? (
          <div
            id="panel-todo"
            role="tabpanel"
            aria-labelledby="tab-todo"
            className="flex flex-col lg:flex-row items-start gap-8 lg:gap-14"
          >
            {/* 4. Knowledge Panel: Top on mobile (order-1), Right on desktop (lg:order-2) */}
            <div className="w-full lg:w-[368px] shrink-0 order-1 lg:order-2">
              <KnowledgePanel />
            </div>

            {/* 5 & 6. Easter Egg / Star Dash Panel + Main Search Results + Top 10 Global + Libro de Visitas */}
            <div className="w-full flex-1 max-w-[652px] order-2 lg:order-1">
              {activeEasterEgg && (
                <EasterEggArena
                  activeGame={activeEasterEgg}
                  onSelectGame={handleSelectGameInsideArena}
                  onClose={handleCloseEasterEgg}
                />
              )}

              <SearchResults
                searchQuery={searchQuery}
                onSelectFriendsTab={handleTabChange}
                onPlayStarDash={handleOpenStarDash}
              />
            </div>
          </div>
        ) : (
          /* 7. "Amigos" Tab View */
          <div className="max-w-[652px]">
            <FriendsResults onBackToAll={handleTabChange} />
          </div>
        )}
      </main>

      {/* 8. Footer with links to UCSP and LinkedIn */}
      <Footer />
    </div>
  );
}
