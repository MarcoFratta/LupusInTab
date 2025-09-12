declare module '*.vue' {
	import { DefineComponent } from 'vue';
	const component: DefineComponent<{}, {}, any>;
	export default component;
}

declare module 'vue-router';

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


