// components/BackupSection.tsx
import { createSignal, Show } from "solid-js";
import { type FavoriteSkill, storageService } from "@/utils/storage";

type StatusMessage = { type: "success" | "error"; text: string };

export function BackupSection() {
	const [message, setMessage] = createSignal<StatusMessage | null>(null);

	function flash(msg: StatusMessage, duration = 3000) {
		setMessage(msg);
		setTimeout(() => setMessage(null), duration);
	}

	const handleExport = async () => {
		try {
			const list = await storageService.getFavorites();
			const blob = new Blob([JSON.stringify(list, null, 2)], {
				type: "application/json",
			});
			const url = URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			link.download = `skills-favorites-backup-${new Date().toISOString().split("T")[0]}.json`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			URL.revokeObjectURL(url);
			flash({ type: "success", text: "Favorites exported successfully!" });
		} catch (err) {
			flash({
				type: "error",
				text: `Export failed: ${err instanceof Error ? err.message : "Unknown error"}`,
			});
		}
	};

	const processFile = (file: File) => {
		const reader = new FileReader();
		reader.onload = async (event) => {
			try {
				const imported = JSON.parse(event.target?.result as string);

				if (!Array.isArray(imported)) {
					throw new Error("Backup file must contain a JSON array of skills.");
				}

				imported.forEach((item: Partial<FavoriteSkill>, idx: number) => {
					if (!item.id || !item.name || !item.ownerRepo) {
						throw new Error(
							`Item at index ${idx} is missing required fields (id, name, ownerRepo).`,
						);
					}
				});

				const currentList = await storageService.getFavorites();
				const currentMap = new Map<string, FavoriteSkill>(
					currentList.map((s) => [s.id, s]),
				);

				let newCount = 0;
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
						newCount++;
					}
				}

				const mergedList = Array.from(currentMap.values());
				await storageService.setFavorites(mergedList);
				flash(
					{
						type: "success",
						text: `Imported! Merged ${mergedList.length} skills (added ${newCount} new).`,
					},
					4000,
				);
			} catch (err) {
				flash(
					{
						type: "error",
						text: `Import failed: ${err instanceof Error ? err.message : "Invalid JSON format"}`,
					},
					4000,
				);
			}
		};
		reader.readAsText(file);
	};

	const handleFileInput = (e: Event) => {
		const target = e.target as HTMLInputElement;
		const file = target.files?.[0];
		if (file) {
			processFile(file);
			target.value = "";
		}
	};

	const handleDrop = (e: DragEvent) => {
		e.preventDefault();
		const file = e.dataTransfer?.files?.[0];
		if (file) processFile(file);
	};

	return (
		<div class="settings-section">
			<div class="settings-section-title">JSON Configuration Backup</div>
			<div class="settings-actions">
				<button
					onClick={handleExport}
					class="settings-action-btn export-btn"
					title="Export current favorites to JSON file"
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
						class="action-icon"
					>
						<title>Export JSON icon</title>
						<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
						<polyline points="7 10 12 15 17 10" />
						<line x1="12" x2="12" y1="15" y2="3" />
					</svg>
					Export JSON
				</button>

				<label
					class="settings-action-btn import-btn"
					title="Import and merge configuration JSON file"
					onDragOver={(e) => e.preventDefault()}
					onDrop={handleDrop}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						class="action-icon"
					>
						<title>Import JSON icon</title>
						<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
						<polyline points="17 8 12 3 7 8" />
						<line x1="12" x2="12" y1="3" y2="15" />
					</svg>
					Import JSON
					<input
						type="file"
						accept=".json"
						onChange={handleFileInput}
						class="sr-only"
					/>
				</label>
			</div>

			<Show when={message()}>
				<div
					class="settings-status"
					classList={{
						error: message()?.type === "error",
						success: message()?.type === "success",
					}}
				>
					{message()?.text}
				</div>
			</Show>
		</div>
	);
}
