// components/PopupHeader.tsx
import { Show } from "solid-js";
import type { SortOrder } from "@/utils/storage";
import { navigationService } from "@/utils/navigation";

interface PopupHeaderProps {
	hasSkills: boolean;
	sortOrder: SortOrder;
	onHome: () => void;
	onSortChange: (e: Event) => void;
	onClearAll: () => void;
}

export function PopupHeader(props: PopupHeaderProps) {
	return (
		<header class="popup-header">
			<button
				class="header-left"
				onClick={props.onHome}
				title="skills.sh home"
				type="button"
			>
				<span class="logo-accent">skills</span>
				<span class="logo-slash">/</span>
				<span class="logo-sub">favs</span>
			</button>
			<div class="header-right">
				<Show when={props.hasSkills}>
					<select
						class="sort-select"
						value={props.sortOrder}
						onChange={props.onSortChange}
						title="Sort order"
						aria-label="Sort order"
					>
						<option value="added">Recent</option>
						<option value="name">A-Z</option>
						<option value="installs">Installs</option>
					</select>
					<button
						onClick={props.onClearAll}
						class="clear-all-btn"
						type="button"
					>
						Clear All
					</button>
				</Show>
				<button
					onClick={() => navigationService.openOptionsPage()}
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
						<title>Settings</title>
						<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
						<circle cx="12" cy="12" r="3" />
					</svg>
				</button>
			</div>
		</header>
	);
}
