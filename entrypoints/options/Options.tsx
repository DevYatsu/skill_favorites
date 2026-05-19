// entrypoints/options/Options.tsx
import { createSignal, onMount } from "solid-js";
import { packageManagerPref, type PackageManager } from "@/utils/storage";
import { BackupSection } from "@/components/BackupSection";

export default function Options() {
	const [pm, setPm] = createSignal<PackageManager>("npx");

	onMount(async () => {
		setPm(await packageManagerPref.getValue());
	});

	const handlePmChange = async (e: Event) => {
		const val = (e.target as HTMLSelectElement).value as PackageManager;
		setPm(val);
		await packageManagerPref.setValue(val);
	};

	return (
		<div class="options-page">
			<div class="options-container">
				<div class="options-header">
					<h1 class="options-title">skills-favorites Options</h1>
					<p class="options-subtitle">Manage your configuration and backups.</p>
				</div>

				<div class="settings-section">
					<div class="settings-section-title">Extension Preferences</div>
					<div>
						<label class="options-label" for="pm-select">
							Default Package Manager
						</label>
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

				<BackupSection />
			</div>
		</div>
	);
}
