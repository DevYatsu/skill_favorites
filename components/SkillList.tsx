// components/SkillList.tsx
import { For, Show } from "solid-js";
import { SkillCard } from "./SkillCard";
import type { FavoriteSkill } from "@/utils/storage";

interface SkillListProps {
	pinnedItems: FavoriteSkill[];
	unpinnedItems: FavoriteSkill[];
	onRemove: (id: string, e: MouseEvent) => void;
	onTogglePin: (id: string) => Promise<void>;
	onSaveTag: (id: string, tag: string) => Promise<void>;
	onRemoveTag: (id: string, tag: string) => Promise<void>;
	openLink: (href: string) => void;
}

export function SkillList(props: SkillListProps) {
	const allVisible = () => [...props.pinnedItems, ...props.unpinnedItems];

	return (
		<div class="skills-list">
			<Show when={allVisible().length === 0}>
				<p class="no-results-text">No matches found.</p>
			</Show>
			<For each={props.pinnedItems}>
				{(skill) => (
					<SkillCard
						skill={skill}
						pinned={true}
						onRemove={props.onRemove}
						onTogglePin={props.onTogglePin}
						onSaveTag={props.onSaveTag}
						onRemoveTag={props.onRemoveTag}
						openLink={props.openLink}
					/>
				)}
			</For>
			<For each={props.unpinnedItems}>
				{(skill) => (
					<SkillCard
						skill={skill}
						pinned={false}
						onRemove={props.onRemove}
						onTogglePin={props.onTogglePin}
						onSaveTag={props.onSaveTag}
						onRemoveTag={props.onRemoveTag}
						openLink={props.openLink}
					/>
				)}
			</For>
		</div>
	);
}
