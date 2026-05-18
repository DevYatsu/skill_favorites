// entrypoints/popup/App.tsx
import { createSignal, For, Show, onMount } from "solid-js";
import {
	favorites,
	removeFavorite,
	addSkillTag,
	removeSkillTag,
	type FavoriteSkill,
} from "@/utils/storage";
import { SkillCard } from "@/components/SkillCard";
import { ConfirmModal } from "@/components/ConfirmModal";
import "./App.css";

function App() {
	const [list, setList] = createSignal<FavoriteSkill[]>([]);
	const [search, setSearch] = createSignal("");
	const [selectedTag, setSelectedTag] = createSignal("");
	const [showClearConfirm, setShowClearConfirm] = createSignal(false);

	const refreshList = async () => {
		try {
			const initial = await favorites.getValue();
			if (Array.isArray(initial)) {
				setList([...initial]);
			} else {
				setList([]);
			}
		} catch (err) {
			console.error("Failed to load favorites in popup:", err);
		}
	};

	// Initial load
	onMount(() => {
		refreshList();
	});

	// Calculate unique tags present across all starred skills
	const allTags = () => {
		const tagsSet = new Set<string>();
		list().forEach((s) => {
			if (s.tags) {
				s.tags.forEach((t) => tagsSet.add(t));
			}
		});
		return Array.from(tagsSet).sort();
	};

	// Multi-criteria filter: search query match AND category tag pill match
	const filteredList = () => {
		let current = list();
		const query = search().trim().toLowerCase();

		if (query) {
			current = current.filter(
				(s) =>
					s.name.toLowerCase().includes(query) ||
					s.ownerRepo.toLowerCase().includes(query),
			);
		}

		const tag = selectedTag();
		if (tag) {
			current = current.filter((s) => s.tags?.includes(tag));
		}

		return current;
	};

	const handleRemove = async (id: string, e: MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		await removeFavorite(id);
		await refreshList();
	};

	const handleSaveTag = async (id: string, tag: string) => {
		await addSkillTag(id, tag);
		await refreshList();
	};

	const handleRemoveTag = async (id: string, tag: string) => {
		await removeSkillTag(id, tag);
		await refreshList();
	};

	const handleClearAll = () => {
		setShowClearConfirm(true);
	};

	const confirmClearAll = async () => {
		await favorites.setValue([]);
		setShowClearConfirm(false);
		await refreshList();
	};

	const cancelClearAll = () => {
		setShowClearConfirm(false);
	};

	const openLink = (href: string) => {
		const url = href.startsWith("http") ? href : `https://www.skills.sh${href}`;
		browser.tabs.create({ url });
	};

	const openHome = () => {
		browser.tabs.create({ url: "https://www.skills.sh/" });
	};

	return (
		<div class="popup-container">
			{/* Header */}
			<header class="popup-header">
				<button
					class="header-left"
					onClick={openHome}
					title="skills.sh home"
					type="button"
				>
					<span class="logo-accent">skills</span>
					<span class="logo-slash">/</span>
					<span class="logo-sub">favs</span>
				</button>
				<div class="header-right">
					<Show when={list().length > 0}>
						<button
							onClick={handleClearAll}
							class="clear-all-btn"
							type="button"
						>
							Clear All
						</button>
					</Show>
					<button
						onClick={() => browser.runtime.openOptionsPage()}
						class="settings-btn"
						title="Settings"
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
							class="settings-icon"
						>
							<title>Backup Settings</title>
							<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
							<circle cx="12" cy="12" r="3" />
						</svg>
					</button>
				</div>
			</header>



			{/* Search Box */}
			<div class="search-box">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					class="search-icon"
				>
					<title>Search</title>
					<circle cx="11" cy="11" r="8" />
					<path d="m21 21-4.3-4.3" />
				</svg>
				<input
					type="text"
					placeholder="Search favorites..."
					value={search()}
					onInput={(e) => setSearch(e.currentTarget.value)}
					class="search-input"
				/>
				<Show when={search()}>
					<button
						onClick={() => setSearch("")}
						class="clear-search-btn"
						title="Clear search"
						type="button"
					>
						&times;
					</button>
				</Show>
			</div>

			{/* Horizontal Tag Filters Pill Row */}
			<div class="tag-filters-row">
				<button
					onClick={() => setSelectedTag("")}
					class="tag-filter-pill"
					classList={{ active: selectedTag() === "" }}
					type="button"
				>
					All
				</button>
				<For each={allTags()}>
					{(tag) => (
						<button
							onClick={() => setSelectedTag(selectedTag() === tag ? "" : tag)}
							class="tag-filter-pill"
							classList={{ active: selectedTag() === tag }}
							type="button"
						>
							{tag}
						</button>
					)}
				</For>
			</div>

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
									<title>Star icon</title>
									<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
								</svg>
							</div>
							<p class="empty-title">
								{list().length === 0
									? "No starred skills yet"
									: "No matches found"}
							</p>
							<p class="empty-desc">
								{list().length === 0
									? "Star skills in the directory to quickly access them here in your extensions panel."
									: "Try typing a different search query to locate your starred skill."}
							</p>
							<Show when={list().length === 0}>
								<button onClick={openHome} class="browse-btn" type="button">
									Explore Registry
								</button>
							</Show>
						</div>
					}
				>
					<div class="skills-list">
						<For each={filteredList()}>
							{(skill) => (
								<SkillCard
									skill={skill}
									onRemove={handleRemove}
									onSaveTag={handleSaveTag}
									onRemoveTag={handleRemoveTag}
									openLink={openLink}
								/>
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
						<title>Arrow Right</title>
						<path d="M5 12h14" />
						<path d="m12 5 7 7-7 7" />
					</svg>
				</button>
			</footer>

			{/* Clear All Confirmation Modal Overlay */}
			<ConfirmModal
				show={showClearConfirm()}
				title="Clear Favorites"
				message="Are you sure you want to permanently remove all favorited skills? This action cannot be undone."
				onConfirm={confirmClearAll}
				onCancel={cancelClearAll}
			/>
		</div>
	);
}

export default App;
