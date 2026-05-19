// components/SearchBar.tsx
import { Show } from "solid-js";

interface SearchBarProps {
	value: string;
	ref: HTMLInputElement | undefined;
	onInput: (val: string) => void;
	onClear: () => void;
}

export function SearchBar(props: SearchBarProps) {
	return (
		<div class="search-box">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				class="search-icon"
			>
				<title>Search</title>
				<circle cx="11" cy="11" r="8" />
				<path d="m21 21-4.3-4.3" />
			</svg>
			<input
				ref={props.ref}
				id="popup-search"
				type="text"
				placeholder="Search... (Cmd+F)"
				value={props.value}
				onInput={(e) => props.onInput(e.currentTarget.value)}
				class="search-input"
			/>
			<Show when={props.value}>
				<button
					onClick={props.onClear}
					class="clear-search-btn"
					title="Clear search"
					type="button"
				>
					&times;
				</button>
			</Show>
		</div>
	);
}
