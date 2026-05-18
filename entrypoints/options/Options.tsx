import { createSignal, Show, onMount } from "solid-js";
import { type FavoriteSkill, favorites, packageManagerPref, type PackageManager } from "@/utils/storage";

export default function Options() {
	const [settingsMessage, setSettingsMessage] = createSignal<{
		type: "success" | "error";
		text: string;
	} | null>(null);

	const [pm, setPm] = createSignal<PackageManager>("npx");

	onMount(async () => {
		setPm(await packageManagerPref.getValue());
	});

	const handlePmChange = async (e: Event) => {
		const target = e.target as HTMLSelectElement;
		const val = target.value as PackageManager;
		setPm(val);
		await packageManagerPref.setValue(val);
	};

	const handleExportJSON = async () => {
		try {
			const list = await favorites.getValue();
			const dataStr = JSON.stringify(list, null, 2);
			const dataBlob = new Blob([dataStr], { type: "application/json" });
			const url = URL.createObjectURL(dataBlob);

			const link = document.createElement("a");
			link.href = url;
			link.download = `skills-favorites-backup-${new Date().toISOString().split("T")[0]}.json`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			URL.revokeObjectURL(url);

			setSettingsMessage({
				type: "success",
				text: "Favorites exported successfully!",
			});
			setTimeout(() => setSettingsMessage(null), 3000);
		} catch (err) {
			setSettingsMessage({
				type: "error",
				text: `Export failed: ${err instanceof Error ? err.message : "Unknown error"}`,
			});
			setTimeout(() => setSettingsMessage(null), 3000);
		}
	};

	const processFile = (file: File) => {
		const reader = new FileReader();
		reader.onload = async (event) => {
			try {
				const content = event.target?.result as string;
				const imported = JSON.parse(content);

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

				const currentList = await favorites.getValue();
				const currentMap = new Map<string, FavoriteSkill>(
					currentList.map((s) => [s.id, s]),
				);

				let newCount = 0;
				imported.forEach((item: FavoriteSkill) => {
					const existing = currentMap.get(item.id);
					if (existing) {
						const mergedTags = Array.from(
							new Set([...(existing.tags || []), ...(item.tags || [])]),
						);
						currentMap.set(item.id, {
							...existing,
							...item,
							tags: mergedTags,
						});
					} else {
						currentMap.set(item.id, {
							id: item.id,
							name: item.name,
							ownerRepo: item.ownerRepo,
							installs: item.installs || "0",
							href: item.href || "",
							addedAt: item.addedAt || Date.now(),
							tags: item.tags || [],
						});
						newCount++;
					}
				});

				const mergedList = Array.from(currentMap.values());
				await favorites.setValue(mergedList);

				setSettingsMessage({
					type: "success",
					text: `Successfully imported backup! Merged ${mergedList.length} skills (added ${newCount} new).`,
				});
				setTimeout(() => setSettingsMessage(null), 4000);
			} catch (err) {
				setSettingsMessage({
					type: "error",
					text: `Import failed: ${err instanceof Error ? err.message : "Invalid JSON format"}`,
				});
				setTimeout(() => setSettingsMessage(null), 4000);
			}
		};
		reader.readAsText(file);
	};

	const handleImportJSON = (e: Event) => {
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
		if (file) {
			processFile(file);
		}
	};

	return (
		<div class="options-page">
			<div class="options-container">
				<div class="options-header">
					<h1 class="options-title">skills-favorites Options</h1>
					<p class="options-subtitle">Manage your configuration and backups.</p>
				</div>

				<div class="settings-section">
					<div class="settings-section-title">
						Extension Preferences
					</div>
					<div>
						<label class="options-label" for="pm-select">Default Package Manager</label>
						<select
							id="pm-select"
							value={pm()}
							onChange={handlePmChange}
							class="options-select"
						>
							<option value="npx">npx (npm)</option>
							<option value="bunx">bunx (bun)</option>
							<option value="pnpm dlx">pnpm dlx (pnpm)</option>
						</select>
					</div>
				</div>

				<div class="settings-section">
					<div class="settings-section-title">
						JSON Configuration Backup
					</div>
					<div class="settings-actions">
						<button
							onClick={handleExportJSON}
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
								onChange={handleImportJSON}
								class="sr-only"
							/>
						</label>
					</div>

					<Show when={settingsMessage()}>
						<div
							class="settings-status"
							classList={{
								error: settingsMessage()?.type === "error",
								success: settingsMessage()?.type === "success",
							}}
						>
							{settingsMessage()?.text}
						</div>
					</Show>
				</div>
			</div>
		</div>
	);
}
