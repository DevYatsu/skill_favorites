// entrypoints/background.ts
import { storageService } from "@/utils/storage";

function updateBadge(count: number) {
	const text = count > 0 ? String(count) : "";
	// why: MV2 uses browserAction, MV3 uses action — browser.action is the unified WXT alias
	browser.action.setBadgeText({ text });
	browser.action.setBadgeBackgroundColor({ color: "#eab308" });
}

export default defineBackground(() => {
	// Set badge on startup from persisted state
	storageService.getFavorites().then((list) => updateBadge(list.length));

	// Keep badge in sync with every write
	storageService.watchFavorites((newList) => {
		updateBadge((newList ?? []).length);
	});
});
