// utils/navigation.ts

/**
 * Abstract navigation client seam to decouple layout/header views from browser extension globals.
 */
export interface NavigationClient {
	openOptionsPage(): Promise<void>;
	openUrl(url: string): Promise<void>;
	openHome(): Promise<void>;
}

/**
 * Concrete navigation adapter using WXT/extension browser APIs.
 */
class WxtNavigationAdapter implements NavigationClient {
	async openOptionsPage(): Promise<void> {
		// why: browser.runtime is the standard web extension API surface
		await browser.runtime.openOptionsPage();
	}

	async openUrl(url: string): Promise<void> {
		// why: browser.tabs is the standard web extension API surface
		await browser.tabs.create({ url });
	}

	async openHome(): Promise<void> {
		await this.openUrl("https://www.skills.sh/");
	}
}

// Global active navigation service instance
export const navigationService: NavigationClient = new WxtNavigationAdapter();
