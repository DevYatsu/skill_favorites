// components/SkillCard.tsx
import { createSignal, Show, For } from "solid-js";
import { FavoriteSkill } from "@/utils/storage";

interface SkillCardProps {
	skill: FavoriteSkill;
	onRemove: (id: string, e: MouseEvent) => void;
	onSaveTag: (id: string, tag: string) => Promise<void>;
	onRemoveTag: (id: string, tag: string) => Promise<void>;
	openLink: (href: string) => void;
}

export function SkillCard(props: SkillCardProps) {
	const [isEditing, setIsEditing] = createSignal(false);
	const [newTagText, setNewTagText] = createSignal("");
	const [isCopied, setIsCopied] = createSignal(false);

	const handleCopy = async (e: MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		const command = `npx skills add https://github.com/${props.skill.ownerRepo} --skill ${props.skill.name}`;
		try {
			await navigator.clipboard.writeText(command);
			setIsCopied(true);
			setTimeout(() => setIsCopied(false), 1500);
		} catch (err) {
			console.error("Failed to copy command: ", err);
		}
	};

	const handleSave = async (e?: Event) => {
		if (e) {
			e.preventDefault();
			e.stopPropagation();
		}
		const tagText = newTagText().trim().toLowerCase();
		setIsEditing(false);
		setNewTagText("");
		if (tagText) {
			await props.onSaveTag(props.skill.id, tagText);
		}
	};

	return (
		<div
			class="skill-card"
			onClick={() => props.openLink(props.skill.href)}
			onKeyDown={(e) => {
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					props.openLink(props.skill.href);
				}
			}}
			role="button"
			tabIndex={0}
		>
			<div class="skill-card-top">
				<div class="skill-main">
					<div class="skill-avatar">{props.skill.name.charAt(0).toUpperCase()}</div>
					<div class="skill-info">
						<div class="skill-name">{props.skill.name}</div>
						<div class="skill-repo">{props.skill.ownerRepo}</div>
					</div>
				</div>
				<div
					class="skill-side"
					onClick={(e) => e.stopPropagation()}
					onKeyDown={(e) => e.stopPropagation()}
					role="presentation"
				>
					<Show when={props.skill.installs}>
						<span class="installs-tag">{props.skill.installs}</span>
					</Show>
					<button
						onClick={handleCopy}
						class="copy-btn"
						classList={{ copied: isCopied() }}
						title={isCopied() ? "Copied!" : "Copy installation command"}
						aria-label="Copy installation command"
						type="button"
					>
						<Show
							when={isCopied()}
							fallback={
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
									class="copy-icon"
								>
									<title>Copy command</title>
									<rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
									<path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
								</svg>
							}
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="none"
								stroke="#10b981"
								stroke-width="2.5"
								stroke-linecap="round"
								stroke-linejoin="round"
								class="copy-icon check-icon"
							>
								<title>Copied</title>
								<path d="M20 6 9 17l-5-5" />
							</svg>
						</Show>
					</button>

					<button
						onClick={(e) => props.onRemove(props.skill.id, e)}
						class="remove-btn"
						title="Remove from favorites"
						aria-label="Remove skill"
						type="button"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							class="trash-icon"
						>
							<title>Delete</title>
							<path d="M3 6h18" />
							<path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
							<path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
						</svg>
					</button>
				</div>
			</div>

			{/* Bottom tagging block */}
			<div
				class="skill-card-bottom"
				onClick={(e) => e.stopPropagation()}
				onKeyDown={(e) => e.stopPropagation()}
				role="presentation"
			>
				<div class="skill-tags-list">
					<For each={props.skill.tags || []}>
						{(tag) => (
							<span class="skill-tag-pill">
								{tag}
								<button
									class="delete-tag-btn"
									onClick={() => props.onRemoveTag(props.skill.id, tag)}
									title="Remove tag"
									type="button"
								>
									&times;
								</button>
							</span>
						)}
					</For>

					{/* Inline Tag Adder Form */}
					<Show
						when={isEditing()}
						fallback={
							<button
								class="add-tag-trigger"
								onClick={() => setIsEditing(true)}
								title="Add tag"
								type="button"
							>
								+ Tag
							</button>
						}
					>
						<form
							class="inline-tag-form"
							onSubmit={(e) => {
								e.preventDefault();
								handleSave();
							}}
						>
							<input
								ref={(el) => setTimeout(() => el?.focus(), 50)}
								type="text"
								class="inline-tag-input"
								placeholder="tag..."
								value={newTagText()}
								onInput={(e) => setNewTagText(e.currentTarget.value)}
								onKeyDown={(e) => {
									if (e.key === "Escape") {
										setIsEditing(false);
										setNewTagText("");
									}
								}}
								onBlur={() => {
									setTimeout(() => {
										if (isEditing()) {
											handleSave();
										}
									}, 180);
								}}
							/>
						</form>
					</Show>
				</div>
			</div>
		</div>
	);
}
