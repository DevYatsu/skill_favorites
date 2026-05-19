// components/FavoriteButton.tsx
import { render } from "solid-js/web";
import { createSignal, onMount, onCleanup } from "solid-js";
import { storageService } from "@/utils/storage";

interface FavoriteButtonProps {
	id: string;
	name: string;
	ownerRepo: string;
	installs: number;
	href: string;
}

export function FavoriteButton(props: FavoriteButtonProps) {
	const [active, setActive] = createSignal(false);
	let btnRef: HTMLButtonElement | undefined;

	const handleToggle = async (e: MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();

		if (active()) {
			await storageService.removeFavorite(props.id);
			setActive(false);
		} else {
			await storageService.addFavorite({
				id: props.id,
				name: props.name,
				ownerRepo: props.ownerRepo,
				installs: props.installs,
				href: props.href,
			});
			setActive(true);
		}
	};

	onMount(async () => {
		setActive(await storageService.isFavorite(props.id));

		const unwatch = storageService.watchFavorites((newFavs) => {
			const isFav = (newFavs || []).some((s) => s.id === props.id);
			setActive(isFav);
		});

		btnRef?.addEventListener("click", handleToggle);

		onCleanup(() => {
			unwatch();
		});
	});

	return (
		<button
			ref={btnRef}
			class="p-1.5 rounded-md hover:bg-neutral-800 transition-colors group focus:outline-none"
			title={active() ? "Remove from favorites" : "Add to favorites"}
			aria-label={active() ? "Remove from favorites" : "Add to favorites"}
			type="button"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 24 24"
				fill={active() ? "#EAB308" : "none"}
				stroke={active() ? "#EAB308" : "currentColor"}
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				class="w-5 h-5 transition-transform duration-200 group-hover:scale-110"
			>
				<title>{active() ? "Remove from favorites" : "Add to favorites"}</title>
				<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
			</svg>
		</button>
	);
}

export function createFavoriteButton(
	props: FavoriteButtonProps,
	container: HTMLElement,
) {
	return render(() => <FavoriteButton {...props} />, container);
}
