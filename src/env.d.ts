declare module '*.vue' {
	import { DefineComponent, Ref } from 'vue';
	const component: DefineComponent<{}, {}, any>;
	export default component;
}

declare module 'vue-router';

// VitePWA types
declare module 'virtual:pwa-register/vue' {
	export interface RegisterSWOptions {
		immediate?: boolean;
		onNeedRefresh?: () => void;
		onOfflineReady?: () => void;
		onRegistered?: (registration: ServiceWorkerRegistration | undefined) => void;
		onRegisterError?: (error: any) => void;
	}
	export function useRegisterSW(options?: RegisterSWOptions): {
		needRefresh: Ref<boolean>;
		offlineReady: Ref<boolean>;
		updateServiceWorker: (reloadPage?: boolean) => Promise<void>;
	};
}

// Typings for utility modules are provided in their own .d.ts files under `src/utils/`
declare module '@/utils/storage' {
	export function saveGameState(state: unknown): void;
	export function loadGameState<T = any>(): T | null;
	export function clearSavedGame(): void;
	export function savePlayersSetup(payload: { numPlayers: number; players: Array<{ name: string }> }): void;
	export function loadPlayersSetup(): { numPlayers: number; players: Array<{ name: string }> } | null;
	export function clearPlayersSetup(): void;
	export function saveSettings(payload: { skipFirstNightActions: boolean; enableSindaco: boolean }): void;
	export function loadSettings(): { skipFirstNightActions: boolean; enableSindaco: boolean } | null;
	export function clearSettings(): void;
}

declare module '@/utils/random' {
	export function shuffleInPlace<T>(array: T[]): T[];
	export function shuffled<T>(array: T[]): T[];
}


