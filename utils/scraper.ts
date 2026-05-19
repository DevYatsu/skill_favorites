// utils/scraper.ts

export interface ScrapedSkill {
	id: string; // e.g. "owner/repo/name"
	name: string; // e.g. "find-skills"
	ownerRepo: string; // e.g. "vercel-labs/skills"
	installs: number; // raw integer
	href: string; // e.g. "/vercel-labs/skills/find-skills"
}

/**
 * Parses and extracts skill details from a skills.sh page.
 * Returns a ScrapedSkill object or null if the page is not a skill detail view.
 */
export function scrapeSkillPage(
	doc: Document,
	pathname: string,
): ScrapedSkill | null {
	const pathParts = pathname.split("/").filter(Boolean);
	if (pathParts.length !== 3) return null;

	const ownerRepo = `${pathParts[0]}/${pathParts[1]}`;
	const name = pathParts[2];
	const id = `${ownerRepo}/${name}`;

	let installs = 0;
	try {
		const scripts = doc.querySelectorAll<HTMLScriptElement>("script");
		for (const script of scripts) {
			const text = script.textContent ?? "";
			if (!text.includes("installs") || !text.includes(name)) continue;

			const match =
				text.match(new RegExp(`"skillId":"${name}"[^}]*"installs":(\\d+)`)) ??
				text.match(new RegExp(`"installs":(\\d+)[^}]*"skillId":"${name}"`));
			if (match) {
				installs = Number.parseInt(match[1], 10);
				break;
			}
		}
	} catch {
		// Installs default to 0 if parsing fails
	}

	return {
		id,
		name,
		ownerRepo,
		installs,
		href: pathname,
	};
}
