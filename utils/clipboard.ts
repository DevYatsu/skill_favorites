// utils/clipboard.ts
import type { PackageManager } from "@/utils/storage";

export interface CommandInput {
	ownerRepo: string;
	name: string;
}

/**
 * Generates the installation command for a skill based on a chosen package manager.
 */
export function generateInstallCommand(
	skill: CommandInput,
	packageManager: PackageManager,
): string {
	return `${packageManager} skills add https://github.com/${skill.ownerRepo} --skill ${skill.name}`;
}

/**
 * Copies the installation command for a skill to the clipboard.
 * Returns a promise resolving to true if successful, false otherwise.
 */
export async function copyInstallCommand(
	skill: CommandInput,
	packageManager: PackageManager,
): Promise<boolean> {
	const command = generateInstallCommand(skill, packageManager);
	try {
		await navigator.clipboard.writeText(command);
		return true;
	} catch {
		return false;
	}
}
