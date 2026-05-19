// entrypoints/content.ts
import { createFavoriteButton } from "@/components/FavoriteButton";

export default defineContentScript({
	matches: ["*://*.skills.sh/*"],
	cssInjectionMode: "ui",
	main(ctx) {
		let observer: MutationObserver | null = null;

		// Injects star toggle next to h1 in detail view
		function injectStarToDetail() {
			const h1 = document.querySelector("h1");
			if (!h1 || h1.querySelector(".skills-star-container")) return;

			const pathParts = window.location.pathname.split("/").filter(Boolean);
			if (pathParts.length !== 3) return;

			const ownerRepo = `${pathParts[0]}/${pathParts[1]}`;
			const name = pathParts[2];
			const id = `${ownerRepo}/${name}`;

			// Scrape install count from the Next.js RSC payload embedded in <script> tags.
			// skills.sh serialises skill data as JSON inside self.__next_f.push([1, "..."])
			// with installs as a raw integer alongside the skillId field.
			let installs = 0;
			try {
				const scripts = document.querySelectorAll<HTMLScriptElement>("script");
				for (const script of scripts) {
					const text = script.textContent ?? "";
					if (!text.includes("installs") || !text.includes(name)) continue;
					// Two possible orderings of the fields in the JSON fragment
					const match =
						text.match(
							new RegExp(`"skillId":"${name}"[^}]*"installs":(\\d+)`),
						) ??
						text.match(new RegExp(`"installs":(\\d+)[^}]*"skillId":"${name}"`));
					if (match) {
						installs = Number.parseInt(match[1], 10);
						break;
					}
				}
			} catch {
				// Non-fatal: installs stays 0 if scraping fails
			}

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

			createFavoriteButton(
				{ id, name, ownerRepo, installs, href: window.location.pathname },
				buttonWrapper,
			);
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
