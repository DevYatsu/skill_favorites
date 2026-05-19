// utils/sort.ts
import type { FavoriteSkill, SortOrder } from "./storage";

/** Formats a raw install count integer into a short display string. */
export function formatInstalls(count: number): string {
	if (!count) return "";
	if (count >= 1_000_000)
		return `${(count / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
	if (count >= 1_000)
		return `${(count / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
	return String(count);
}

export function applySort(
	items: FavoriteSkill[],
	order: SortOrder,
): FavoriteSkill[] {
	return [...items].sort((a, b) => {
		if (order === "name") return a.name.localeCompare(b.name);
		if (order === "installs") return (b.installs ?? 0) - (a.installs ?? 0);
		// "added" — newest first
		return b.addedAt - a.addedAt;
	});
}

export interface QueryOptions {
	searchQuery: string;
	selectedTag: string;
	pinnedIds: string[];
	sortOrder: SortOrder;
}

export interface QueryResult {
	pinnedItems: FavoriteSkill[];
	unpinnedItems: FavoriteSkill[];
}

/**
 * Filters, splits (pinned vs unpinned), and sorts a collection of skills in a single pure step.
 */
export function queryFavorites(
	items: FavoriteSkill[],
	options: QueryOptions,
): QueryResult {
	let current = [...items];

	// 1. Search filter
	const query = options.searchQuery.trim().toLowerCase();
	if (query) {
		current = current.filter(
			(s) =>
				s.name.toLowerCase().includes(query) ||
				s.ownerRepo.toLowerCase().includes(query),
		);
	}

	// 2. Tag filter
	const tag = options.selectedTag;
	if (tag) {
		current = current.filter((s) => s.tags?.includes(tag));
	}

	// 3. Pinned vs Unpinned division
	const pins = options.pinnedIds;
	const pinnedItems = current.filter((s) => pins.includes(s.id));
	const unpinnedItems = current.filter((s) => !pins.includes(s.id));

	// 4. Sort unpinned items
	const sortedUnpinned = applySort(unpinnedItems, options.sortOrder);

	return {
		pinnedItems,
		unpinnedItems: sortedUnpinned,
	};
}

/**
 * Extracts, deduplicates, and alphabetically sorts all active tags across a collection of skills.
 */
export function extractUniqueTags(items: FavoriteSkill[]): string[] {
	const tagsSet = new Set<string>();
	for (const s of items) {
		if (s.tags) {
			for (const t of s.tags) {
				tagsSet.add(t);
			}
		}
	}
	return Array.from(tagsSet).sort();
}
