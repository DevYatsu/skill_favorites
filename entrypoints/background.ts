// entrypoints/background.ts
import { favorites } from "@/utils/storage";

function updateBadge(count: number) {
	const text = count > 0 ? String(count) : "";
	// why: MV2 uses browserAction, MV3 uses action — browser.action is the unified WXT alias
	browser.action.setBadgeText({ text });
	browser.action.setBadgeBackgroundColor({ color: "#eab308" });
}

export default defineBackground(() => {
	// Set badge on startup from persisted state
	favorites.getValue().then((list) => updateBadge(list.length));

	// Keep badge in sync with every write
	favorites.watch((newList) => {
		updateBadge((newList ?? []).length);
	});
});
