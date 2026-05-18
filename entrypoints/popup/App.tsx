// entrypoints/popup/App.tsx
import { createSignal, For, Show, onMount } from 'solid-js';
import { favorites, removeFavorite, FavoriteSkill } from '@/utils/storage';
import './App.css';

function App() {
  const [list, setList] = createSignal<FavoriteSkill[]>([]);
  const [search, setSearch] = createSignal('');

  // Read favorites reactively
  favorites.watch((newFavs) => {
    setList(newFavs || []);
  });

  // Initial load
  onMount(async () => {
    const initial = await favorites.getValue();
    setList(initial || []);
  });

  const filteredList = () => {
    const query = search().toLowerCase().trim();
    if (!query) return list();
    return list().filter(
      (s) =>
        s.name.toLowerCase().includes(query) ||
        s.ownerRepo.toLowerCase().includes(query)
    );
  };

  const handleRemove = async (id: string, e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await removeFavorite(id);
  };

  const handleClearAll = async () => {
    if (confirm('Are you sure you want to remove all favorited skills?')) {
      await favorites.setValue([]);
    }
  };

  const openLink = (href: string) => {
    const url = href.startsWith('http') ? href : `https://www.skills.sh${href}`;
    browser.tabs.create({ url });
  };

  const openHome = () => {
    browser.tabs.create({ url: 'https://www.skills.sh/' });
  };

  return (
    <div class="popup-container">
      {/* Header */}
      <header class="popup-header">
        <div class="header-left" onClick={openHome}>
          <span class="logo-accent">skills</span>
          <span class="logo-slash">/</span>
          <span class="logo-sub">favs</span>
        </div>
        <Show when={list().length > 0}>
          <button onClick={handleClearAll} class="clear-all-btn">
            Clear All
          </button>
        </Show>
      </header>

      {/* Search Input */}
      <Show when={list().length > 0}>
        <div class="search-box">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="search-icon"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="text"
            placeholder="Search starred skills..."
            value={search()}
            onInput={(e) => setSearch(e.currentTarget.value)}
            class="search-input"
          />
          <Show when={search().length > 0}>
            <button onClick={() => setSearch('')} class="clear-search-btn" title="Clear search">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="close-icon">
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          </Show>
        </div>
      </Show>

      {/* Main Content Area */}
      <div class="popup-body">
        <Show
          when={filteredList().length > 0}
          fallback={
            <div class="empty-state">
              <div class="empty-icon-wrapper">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="star-icon"
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </div>
              <p class="empty-title">
                {list().length === 0 ? 'No starred skills yet' : 'No matches found'}
              </p>
              <p class="empty-desc">
                {list().length === 0 
                  ? 'Star skills in the directory to quickly access them here in your extensions panel.'
                  : 'Try typing a different search query to locate your starred skill.'
                }
              </p>
              <Show when={list().length === 0}>
                <button onClick={openHome} class="browse-btn">
                  Explore Registry
                </button>
              </Show>
            </div>
          }
        >
          <div class="skills-list">
            <For each={filteredList()}>
              {(skill) => (
                <div class="skill-card" onClick={() => openLink(skill.href)}>
                  <div class="skill-main">
                    <div class="skill-avatar">
                      {skill.name.charAt(0).toUpperCase()}
                    </div>
                    <div class="skill-info">
                      <div class="skill-name">{skill.name}</div>
                      <div class="skill-repo">{skill.ownerRepo}</div>
                    </div>
                  </div>
                  <div class="skill-side" onClick={(e) => e.stopPropagation()}>
                    <Show when={skill.installs}>
                      <span class="installs-tag">{skill.installs}</span>
                    </Show>
                    <button
                      onClick={(e) => handleRemove(skill.id, e)}
                      class="remove-btn"
                      aria-label="Remove skill"
                      type="button"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        class="trash-icon"
                      >
                        <path d="M3 6h18" />
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </For>
          </div>
        </Show>
      </div>

      {/* Footer Dashboard Link */}
      <footer class="popup-footer">
        <button onClick={openHome} class="dashboard-btn" type="button">
          <span>Explore More Skills</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="arrow-right-icon"
          >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </button>
      </footer>
    </div>
  );
}

export default App;
