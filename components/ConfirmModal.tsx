// components/ConfirmModal.tsx
import { Show } from "solid-js";

interface ConfirmModalProps {
	show: boolean;
	title: string;
	message: string;
	onConfirm: () => void;
	onCancel: () => void;
}

export function ConfirmModal(props: ConfirmModalProps) {
	return (
		<Show when={props.show}>
			<div class="modal-overlay-container">
				{/* Backdrop Button Overlay */}
				<button
					class="modal-overlay"
					onClick={props.onCancel}
					type="button"
					aria-label="Close confirmation modal"
				/>

				{/* Modal Dialog Card */}
				<div class="modal-card">
					<div class="modal-header">
						<span class="modal-title">{props.title}</span>
					</div>
					<div class="modal-body">{props.message}</div>
					<div class="modal-actions">
						<button
							onClick={props.onCancel}
							class="modal-btn cancel-btn"
							type="button"
						>
							Cancel
						</button>
						<button
							onClick={props.onConfirm}
							class="modal-btn confirm-btn"
							type="button"
						>
							Clear All
						</button>
					</div>
				</div>
			</div>
		</Show>
	);
}
