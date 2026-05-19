// utils/storage.ts
import { storage } from "#imports";

export interface FavoriteSkill {
	id: string; // e.g., "owner/repo/name"
	name: string; // e.g., "find-skills"
	ownerRepo: string; // e.g., "vercel-labs/skills"
	installs: number; // raw integer, e.g. 13618
	href: string; // e.g., "/vercel-labs/skills/find-skills"
	addedAt: number; // Unix timestamp
	tags?: string[]; // Optional user tags
}

export type PackageManager = "npx" | "bunx" | "pnpm dlx";
export type SortOrder = "added" | "name" | "installs";

/**
 * Abstract storage seam to decouple WXT sync primitives from business and layout logic.
 */
export interface StorageClient {
	getFavorites(): Promise<FavoriteSkill[]>;
	setFavorites(items: FavoriteSkill[]): Promise<void>;
	watchFavorites(callback: (items: FavoriteSkill[] | undefined) => void): () => void;

	getPinnedSkills(): Promise<string[]>;
	setPinnedSkills(items: string[]): Promise<void>;

	getSortOrder(): Promise<SortOrder>;
	setSortOrder(order: SortOrder): Promise<void>;

	getPackageManager(): Promise<PackageManager>;
	setPackageManager(pm: PackageManager): Promise<void>;
}

/**
 * Concrete storage adapter interacting with standard WXT sync storage items.
 */
class WxtStorageAdapter implements StorageClient {
	private packageManagerPref = storage.defineItem<PackageManager>("sync:packageManager", {
		fallback: "npx",
		version: 1,
	});

	private sortOrderPref = storage.defineItem<SortOrder>("sync:sortOrder", {
		fallback: "added",
		version: 1,
	});

	private pinnedSkillsPref = storage.defineItem<string[]>("sync:pinnedSkills", {
		fallback: [],
		version: 1,
	});

	private favoritesPref = storage.defineItem<FavoriteSkill[]>("sync:favorites", {
		fallback: [],
		version: 1,
	});

	async getFavorites(): Promise<FavoriteSkill[]> {
		return (await this.favoritesPref.getValue()) ?? [];
	}

	async setFavorites(items: FavoriteSkill[]): Promise<void> {
		await this.favoritesPref.setValue(items);
	}

	watchFavorites(callback: (items: FavoriteSkill[] | undefined) => void): () => void {
		return this.favoritesPref.watch(callback);
	}

	async getPinnedSkills(): Promise<string[]> {
		return (await this.pinnedSkillsPref.getValue()) ?? [];
	}

	async setPinnedSkills(items: string[]): Promise<void> {
		await this.pinnedSkillsPref.setValue(items);
	}

	async getSortOrder(): Promise<SortOrder> {
		return (await this.sortOrderPref.getValue()) ?? "added";
	}

	async setSortOrder(order: SortOrder): Promise<void> {
		await this.sortOrderPref.setValue(order);
	}

	async getPackageManager(): Promise<PackageManager> {
		return (await this.packageManagerPref.getValue()) ?? "npx";
	}

	async setPackageManager(pm: PackageManager): Promise<void> {
		await this.packageManagerPref.setValue(pm);
	}
}

/**
 * Domain-specific store service wrapping the decoupled StorageClient seam.
 */
export class SkillStorageService {
	constructor(private client: StorageClient) {}

	async getFavorites(): Promise<FavoriteSkill[]> {
		return this.client.getFavorites();
	}

	async setFavorites(items: FavoriteSkill[]): Promise<void> {
		await this.client.setFavorites(items);
	}

	watchFavorites(callback: (items: FavoriteSkill[] | undefined) => void): () => void {
		return this.client.watchFavorites(callback);
	}

	async getPinnedSkills(): Promise<string[]> {
		return this.client.getPinnedSkills();
	}

	async getSortOrder(): Promise<SortOrder> {
		return this.client.getSortOrder();
	}

	async setSortOrder(order: SortOrder): Promise<void> {
		await this.client.setSortOrder(order);
	}

	async getPackageManager(): Promise<PackageManager> {
		return this.client.getPackageManager();
	}

	async setPackageManager(pm: PackageManager): Promise<void> {
		await this.client.setPackageManager(pm);
	}

	async isFavorite(id: string): Promise<boolean> {
		const current = await this.client.getFavorites();
		return current.some((s: FavoriteSkill) => s.id === id);
	}

	async isPinned(id: string): Promise<boolean> {
		const pins = await this.client.getPinnedSkills();
		return pins.includes(id);
	}

	async togglePin(id: string): Promise<void> {
		const pins = await this.client.getPinnedSkills();
		if (pins.includes(id)) {
			await this.client.setPinnedSkills(pins.filter((p) => p !== id));
		} else {
			// why: cap at 5 pins to prevent the pinned section from dominating the list
			const capped = pins.slice(-4);
			await this.client.setPinnedSkills([...capped, id]);
		}
	}

	async addFavorite(skill: Omit<FavoriteSkill, "addedAt">): Promise<void> {
		const current = await this.client.getFavorites();
		if (current.some((s: FavoriteSkill) => s.id === skill.id)) return;
		await this.client.setFavorites([
			...current,
			{ ...skill, addedAt: Date.now(), tags: [] },
		]);
	}

	async removeFavorite(id: string): Promise<void> {
		const current = await this.client.getFavorites();
		await this.client.setFavorites(current.filter((s: FavoriteSkill) => s.id !== id));
		// Clean up pin state when skill is removed
		const pins = await this.client.getPinnedSkills();
		if (pins.includes(id)) {
			await this.client.setPinnedSkills(pins.filter((p) => p !== id));
		}
	}

	async addSkillTag(id: string, tag: string): Promise<void> {
		const current = await this.client.getFavorites();
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
		await this.client.setFavorites(updated);
	}

	async removeSkillTag(id: string, tag: string): Promise<void> {
		const current = await this.client.getFavorites();
		const updated = current.map((s: FavoriteSkill) => {
			if (s.id === id) {
				const existing = s.tags || [];
				return { ...s, tags: existing.filter((t) => t !== tag) };
			}
			return s;
		});
		await this.client.setFavorites(updated);
	}

	/**
	 * Validates and merges an imported favorites JSON array into the current favorites collection.
	 * Returns the count of newly added skills and the new total count.
	 * Throws an Error if the import fails validation.
	 */
	async mergeBackup(imported: unknown): Promise<{ added: number; total: number }> {
		if (!Array.isArray(imported)) {
			throw new Error("Backup file must contain a JSON array of skills.");
		}

		// 1. Structure validation
		imported.forEach((item: Partial<FavoriteSkill>, idx: number) => {
			if (!item.id || !item.name || !item.ownerRepo) {
				throw new Error(
					`Item at index ${idx} is missing required fields (id, name, ownerRepo).`,
				);
			}
		});

		const currentList = await this.getFavorites();
		const currentMap = new Map<string, FavoriteSkill>(
			currentList.map((s) => [s.id, s]),
		);

		let addedCount = 0;
		for (const item of imported as FavoriteSkill[]) {
			const existing = currentMap.get(item.id);
			if (existing) {
				currentMap.set(item.id, {
					...existing,
					...item,
					tags: Array.from(
						new Set([...(existing.tags || []), ...(item.tags || [])]),
					),
				});
			} else {
				currentMap.set(item.id, {
					id: item.id,
					name: item.name,
					ownerRepo: item.ownerRepo,
					installs: item.installs ?? 0,
					href: item.href || "",
					addedAt: item.addedAt || Date.now(),
					tags: item.tags || [],
				});
				addedCount++;
			}
		}

		const mergedList = Array.from(currentMap.values());
		await this.setFavorites(mergedList);

		return {
			added: addedCount,
			total: mergedList.length,
		};
	}
}

// Global active store instance using WxtStorageAdapter
export const storageService = new SkillStorageService(new WxtStorageAdapter());
