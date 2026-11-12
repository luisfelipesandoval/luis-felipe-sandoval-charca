import { Users, ArrowLeft } from 'lucide-react';
import { FRIENDS_LIST } from '../data/friends';
import { TabId } from '../utils/serpUtils';

interface FriendsResultsProps {
  onBackToAll: (tab: TabId) => void;
}

export function FriendsResults({ onBackToAll }: FriendsResultsProps) {
  return (
    <section
      id="panel-amigos"
      role="tabpanel"
      aria-labelledby="tab-amigos"
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#ebebeb] dark:border-[#3c4043]">
        <div>
          <h2 className="text-lg sm:text-xl font-normal text-[#202124] dark:text-[#e8eaed]">
            Amigos y compañeros de universidad
          </h2>
          <p className="text-xs text-[#5f6368] dark:text-[#9aa0a6] mt-0.5">
            Compañeros de estudios en la Universidad Católica San Pablo (UCSP)
          </p>
        </div>

        <button
          type="button"
          onClick={() => onBackToAll('todo')}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#1a73e8] dark:text-[#8ab4f8] hover:underline self-start sm:self-auto whitespace-nowrap shrink-0 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>Volver a Todo</span>
        </button>
      </div>

      {/* Results list: one Google-formatted result per friend */}
      <div className="space-y-7">
        {FRIENDS_LIST.map((friend) => {
          const isPlaceholderLink = friend.url === '#';
          return (
            <article
              key={friend.id}
              className="group rounded-xl p-2 -mx-2 transition-colors duration-150 hover:bg-[#f8f9fa]/80 dark:hover:bg-[#303134]/40"
            >
              <div className="flex items-center gap-2.5 mb-1">
                <div
                  className="w-7 h-7 rounded-full bg-[#e8f0fe] dark:bg-[#303134] flex items-center justify-center text-[#1a73e8] dark:text-[#8ab4f8] shrink-0"
                  aria-hidden="true"
                >
                  <Users className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0 leading-tight">
                  <div className="text-sm text-[#202124] dark:text-[#dadce0] truncate">
                    Red de Estudiantes UCSP
                  </div>
                  <cite className="not-italic text-xs text-[#5f6368] dark:text-[#9aa0a6] block truncate">
                    {friend.displayUrl || 'https://ucsp.edu.pe › estudiantes'}
                  </cite>
                </div>
              </div>

              <h2 className="text-xl leading-snug font-normal mt-1">
                <a
                  href={friend.url}
                  target={isPlaceholderLink ? undefined : '_blank'}
                  rel={isPlaceholderLink ? undefined : 'noopener noreferrer'}
                  onClick={
                    isPlaceholderLink
                      ? (e) => {
                          e.preventDefault();
                        }
                      : undefined
                  }
                  className="text-[#1a0dab] dark:text-[#8ab4f8] visited:text-[#681da8] dark:visited:text-[#c58af9] group-hover:underline"
                >
                  {friend.name}
                </a>
              </h2>

              <p className="mt-1.5 text-sm leading-relaxed text-[#4d5156] dark:text-[#bdc1c6] max-w-[600px]">
                {friend.description}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
