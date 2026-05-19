// entrypoints/popup/App.tsx
import { createSignal, Show, onMount, onCleanup } from "solid-js";
import {
	storageService,
	type FavoriteSkill,
	type SortOrder,
} from "@/utils/storage";
import { queryFavorites } from "@/utils/sort";
import { PopupHeader } from "@/components/PopupHeader";
import { SearchBar } from "@/components/SearchBar";
import { TagFilterRow } from "@/components/TagFilterRow";
import { EmptyState } from "@/components/EmptyState";
import { SkillList } from "@/components/SkillList";
import { ConfirmModal } from "@/components/ConfirmModal";
import "./App.css";

function App() {
	const [list, setList] = createSignal<FavoriteSkill[]>([]);
	const [pinned, setPinned] = createSignal<string[]>([]);
	const [sortOrder, setSortOrder] = createSignal<SortOrder>("added");
	const [search, setSearch] = createSignal("");
	const [selectedTag, setSelectedTag] = createSignal("");
	const [showClearConfirm, setShowClearConfirm] = createSignal(false);
	let searchInputRef: HTMLInputElement | undefined;
	let focusedIndex = -1;

	const refreshList = async () => {
		try {
			const [data, pins, order] = await Promise.all([
				storageService.getFavorites(),
				storageService.getPinnedSkills(),
				storageService.getSortOrder(),
			]);
			setList(Array.isArray(data) ? [...data] : []);
			setPinned(Array.isArray(pins) ? [...pins] : []);
			setSortOrder(order ?? "added");
		} catch (err) {
			console.error("Failed to load favorites in popup:", err);
		}
	};

	onMount(() => {
		refreshList();

		const onKey = (e: KeyboardEvent) => {
			if ((e.metaKey || e.ctrlKey) && e.key === "f") {
				e.preventDefault();
				searchInputRef?.focus();
				return;
			}
			if (e.key === "Escape") {
				if (search()) setSearch("");
				else searchInputRef?.blur();
				return;
			}
			if (document.activeElement === searchInputRef) return;

			const cards = document.querySelectorAll<HTMLElement>(".skill-card");
			if (!cards.length) return;
			if (e.key === "ArrowDown") {
				e.preventDefault();
				focusedIndex = Math.min(focusedIndex + 1, cards.length - 1);
				(
					cards[focusedIndex].querySelector(".skill-main") as HTMLElement
				)?.focus();
			} else if (e.key === "ArrowUp") {
				e.preventDefault();
				focusedIndex = Math.max(focusedIndex - 1, 0);
				(
					cards[focusedIndex].querySelector(".skill-main") as HTMLElement
				)?.focus();
			}
		};

		document.addEventListener("keydown", onKey);
		onCleanup(() => document.removeEventListener("keydown", onKey));
	});

	const allTags = () => {
		const tagsSet = new Set<string>();
		for (const s of list()) {
			if (s.tags) for (const t of s.tags) tagsSet.add(t);
		}
		return Array.from(tagsSet).sort();
	};


	const handleRemove = async (id: string, e: MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		await storageService.removeFavorite(id);
		await refreshList();
	};

	const handleTogglePin = async (id: string) => {
		await storageService.togglePin(id);
		await refreshList();
	};

	const handleSaveTag = async (id: string, tag: string) => {
		await storageService.addSkillTag(id, tag);
		await refreshList();
	};

	const handleRemoveTag = async (id: string, tag: string) => {
		await storageService.removeSkillTag(id, tag);
		await refreshList();
	};

	const handleSortChange = async (e: Event) => {
		const val = (e.target as HTMLSelectElement).value as SortOrder;
		setSortOrder(val);
		await storageService.setSortOrder(val);
	};

	const openLink = (href: string) => {
		const url = href.startsWith("http") ? href : `https://www.skills.sh${href}`;
		browser.tabs.create({ url });
	};

	const openHome = () => browser.tabs.create({ url: "https://www.skills.sh/" });

	return (
		<div class="popup-container">
			<PopupHeader
				hasSkills={list().length > 0}
				sortOrder={sortOrder()}
				onHome={openHome}
				onSortChange={handleSortChange}
				onClearAll={() => setShowClearConfirm(true)}
			/>

			<SearchBar
				ref={searchInputRef}
				value={search()}
				onInput={setSearch}
				onClear={() => setSearch("")}
			/>

			<TagFilterRow
				tags={allTags()}
				selected={selectedTag()}
				onSelect={setSelectedTag}
			/>

			<div class="popup-body">
				<Show
					when={list().length > 0}
					fallback={<EmptyState onBrowse={openHome} />}
				>
					{(() => {
						const { pinnedItems, unpinnedItems } = queryFavorites(list(), {
							searchQuery: search(),
							selectedTag: selectedTag(),
							pinnedIds: pinned(),
							sortOrder: sortOrder(),
						});
						return (
							<SkillList
								pinnedItems={pinnedItems}
								unpinnedItems={unpinnedItems}
								onRemove={handleRemove}
								onTogglePin={handleTogglePin}
								onSaveTag={handleSaveTag}
								onRemoveTag={handleRemoveTag}
								openLink={openLink}
							/>
						);
					})()}
				</Show>
			</div>

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

			<ConfirmModal
				show={showClearConfirm()}
				title="Clear Favorites"
				message="Are you sure you want to permanently remove all favorited skills? This action cannot be undone."
				onConfirm={async () => {
					await storageService.setFavorites([]);
					setShowClearConfirm(false);
					await refreshList();
				}}
				onCancel={() => setShowClearConfirm(false)}
			/>
		</div>
	);
}

export default App;
