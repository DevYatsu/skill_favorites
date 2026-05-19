// entrypoints/content.ts
import { createFavoriteButton } from "@/components/FavoriteButton";
import { scrapeSkillPage } from "@/utils/scraper";

export default defineContentScript({
	matches: ["*://*.skills.sh/*"],
	cssInjectionMode: "ui",
	main(ctx) {
		let observer: MutationObserver | null = null;

		// Injects star toggle next to h1 in detail view
		function injectStarToDetail() {
			const h1 = document.querySelector("h1");
			if (!h1 || h1.querySelector(".skills-star-container")) return;

			// Delegate scraping to PageScraper module
			const scraped = scrapeSkillPage(document, window.location.pathname);
			if (!scraped) return;

			const buttonWrapper = document.createElement("span");
			buttonWrapper.className = "skills-star-container";
			buttonWrapper.style.position = "absolute";
			buttonWrapper.style.display = "inline-flex";
			buttonWrapper.style.alignItems = "center";
			buttonWrapper.style.marginLeft = "12px";

			buttonWrapper.addEventListener("click", (e) => {
				if (!(e.target as HTMLElement).closest("button")) {
					e.preventDefault();
					e.stopPropagation();
				}
			});

			h1.appendChild(buttonWrapper);

			createFavoriteButton(scraped, buttonWrapper);
		}

		// Core injection coordinator
		function runPageInjection() {
			const pathParts = window.location.pathname.split("/").filter(Boolean);
			if (pathParts.length === 3) {
				injectStarToDetail();
			}
		}

		// Run core injector on load
		runPageInjection();

		// Listen to Next.js Client-Side SPA Transitions
		ctx.addEventListener(window, "wxt:locationchange", () => {
			runPageInjection();
		});

		// Listen to standard history back/forward operations
		ctx.addEventListener(window, "popstate", () => {
			runPageInjection();
		});

		// Listen to hash changes specifically
		ctx.addEventListener(window, "hashchange", () => {
			runPageInjection();
		});

		// Use MutationObserver to capture dynamically rendered content or search changes
		observer = new MutationObserver(() => {
			runPageInjection();
		});
		observer.observe(document.body, { childList: true, subtree: true });

		// Cleanup on context invalidation
		ctx.onInvalidated(() => {
			observer?.disconnect();
			const injectedStar = document.querySelector(".skills-star-container");
			injectedStar?.remove();
		});
	},
});
