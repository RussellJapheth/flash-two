import { pushState } from '$app/navigation';
import { page } from '$app/state';

export function openModal(state: App.PageState): void {
	pushState('', { ...page.state, ...state });
}

export function closeModal(): void {
	history.back();
}
