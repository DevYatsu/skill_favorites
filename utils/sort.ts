// utils/sort.ts
import type { FavoriteSkill, SortOrder } from "./storage";

/** Formats a raw install count integer into a short display string. */
export function formatInstalls(count: number): string {
	if (!count) return "";
	if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
	if (count >= 1_000) return `${(count / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
	return String(count);
}

export function applySort(items: FavoriteSkill[], order: SortOrder): FavoriteSkill[] {
	return [...items].sort((a, b) => {
		if (order === "name") return a.name.localeCompare(b.name);
		if (order === "installs") return (b.installs ?? 0) - (a.installs ?? 0);
		// "added" — newest first
		return b.addedAt - a.addedAt;
	});
}
