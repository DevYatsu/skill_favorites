// components/TagFilterRow.tsx
import { For } from "solid-js";

interface TagFilterRowProps {
	tags: string[];
	selected: string;
	onSelect: (tag: string) => void;
}

export function TagFilterRow(props: TagFilterRowProps) {
	return (
		<div class="tag-filters-row">
			<button
				onClick={() => props.onSelect("")}
				class="tag-filter-pill"
				classList={{ active: props.selected === "" }}
				type="button"
			>
				All
			</button>
			<For each={props.tags}>
				{(tag) => (
					<button
						onClick={() => props.onSelect(props.selected === tag ? "" : tag)}
						class="tag-filter-pill"
						classList={{ active: props.selected === tag }}
						type="button"
					>
						{tag}
					</button>
				)}
			</For>
		</div>
	);
}
