// utils/sort.ts
import type { FavoriteSkill, SortOrder } from "./storage";

/** Parses display strings like "1.6M", "320K", "45" into sortable numbers. */
export function parseInstalls(raw: string): number {
	if (!raw) return 0;
	const cleaned = raw.trim().toUpperCase();
	if (cleaned.endsWith("M")) return Number.parseFloat(cleaned) * 1_000_000;
	if (cleaned.endsWith("K")) return Number.parseFloat(cleaned) * 1_000;
	return Number.parseFloat(cleaned) || 0;
}

export function applySort(items: FavoriteSkill[], order: SortOrder): FavoriteSkill[] {
	return [...items].sort((a, b) => {
		if (order === "name") return a.name.localeCompare(b.name);
		if (order === "installs") return parseInstalls(b.installs) - parseInstalls(a.installs);
		// "added" — newest first
		return b.addedAt - a.addedAt;
	});
}
