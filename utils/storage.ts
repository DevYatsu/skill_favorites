// utils/storage.ts
import { storage } from "#imports";

export interface FavoriteSkill {
	id: string; // e.g., "owner/repo/name"
	name: string; // e.g., "find-skills"
	ownerRepo: string; // e.g., "vercel-labs/skills"
	installs: string; // e.g., "1.6M"
	href: string; // e.g., "/vercel-labs/skills/find-skills"
	addedAt: number; // Unix timestamp
	tags?: string[]; // Optional user tags
}

export type PackageManager = "npx" | "bunx" | "pnpm dlx";
export type StorageMode = "local" | "sync";

export const storageModePref = storage.defineItem<StorageMode>("local:storageMode", {
	fallback: "local",
	version: 1,
});

const localFavorites = storage.defineItem<FavoriteSkill[]>("local:favorites", { fallback: [], version: 1 });
const syncFavorites = storage.defineItem<FavoriteSkill[]>("sync:favorites", { fallback: [], version: 1 });

export const favorites = {
	async getValue(): Promise<FavoriteSkill[]> {
		const mode = await storageModePref.getValue();
		return mode === "sync" ? syncFavorites.getValue() : localFavorites.getValue();
	},
	async setValue(val: FavoriteSkill[]): Promise<void> {
		const mode = await storageModePref.getValue();
		if (mode === "sync") await syncFavorites.setValue(val);
		else await localFavorites.setValue(val);
	},
	watch(cb: (newVal: FavoriteSkill[] | null) => void) {
		const unwatchLocal = localFavorites.watch(async (val) => {
			if (await storageModePref.getValue() === "local") cb(val);
		});
		const unwatchSync = syncFavorites.watch(async (val) => {
			if (await storageModePref.getValue() === "sync") cb(val);
		});
		const unwatchMode = storageModePref.watch(async (mode) => {
			const val = mode === "sync" ? await syncFavorites.getValue() : await localFavorites.getValue();
			cb(val);
		});
		return () => {
			unwatchLocal();
			unwatchSync();
			unwatchMode();
		};
	}
};

const localPm = storage.defineItem<PackageManager>("local:packageManager", { fallback: "npx", version: 1 });
const syncPm = storage.defineItem<PackageManager>("sync:packageManager", { fallback: "npx", version: 1 });

export const packageManagerPref = {
	async getValue(): Promise<PackageManager> {
		const mode = await storageModePref.getValue();
		return mode === "sync" ? syncPm.getValue() : localPm.getValue();
	},
	async setValue(val: PackageManager): Promise<void> {
		const mode = await storageModePref.getValue();
		if (mode === "sync") await syncPm.setValue(val);
		else await localPm.setValue(val);
	}
};

export async function isFavorite(id: string): Promise<boolean> {
	const current = await favorites.getValue();
	return current.some((s: FavoriteSkill) => s.id === id);
}

export async function addFavorite(
	skill: Omit<FavoriteSkill, "addedAt">,
): Promise<void> {
	const current = await favorites.getValue();
	if (current.some((s: FavoriteSkill) => s.id === skill.id)) return;
	await favorites.setValue([
		...current,
		{ ...skill, addedAt: Date.now(), tags: [] },
	]);
}

export async function removeFavorite(id: string): Promise<void> {
	const current = await favorites.getValue();
	await favorites.setValue(current.filter((s: FavoriteSkill) => s.id !== id));
}

export async function addSkillTag(id: string, tag: string): Promise<void> {
	const current = await favorites.getValue();
	const normalized = tag.trim().toLowerCase();
	if (!normalized) return;

	const updated = current.map((s: FavoriteSkill) => {
		if (s.id === id) {
			const existing = s.tags || [];
			if (existing.includes(normalized)) return s;
			return { ...s, tags: [...existing, normalized] };
		}
		return s;
	});
	await favorites.setValue(updated);
}

export async function removeSkillTag(id: string, tag: string): Promise<void> {
	const current = await favorites.getValue();
	const updated = current.map((s: FavoriteSkill) => {
		if (s.id === id) {
			const existing = s.tags || [];
			return { ...s, tags: existing.filter((t) => t !== tag) };
		}
		return s;
	});
	await favorites.setValue(updated);
}
