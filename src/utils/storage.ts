const KEY = 'lupus_gm_state_v1';
const PLAYERS_KEY = 'lupus_players_v1';
const SETTINGS_KEY = 'lupus_settings_v1';

export function saveGameState(state: unknown): void {
	try {
		localStorage.setItem(KEY, JSON.stringify(state));
	} catch {}
}

export function loadGameState<T = any>(): T | null {
	try {
		const raw = localStorage.getItem(KEY);
		return raw ? (JSON.parse(raw) as T) : null;
	} catch {
		return null;
	}
}

export function clearSavedGame(): void {
	try { localStorage.removeItem(KEY); } catch {}
}

export function savePlayersSetup(payload: { 
	numPlayers: number; 
	players: Array<{ name: string }>; 
	rolesCounts: Record<string, number>;
	rolesEnabled: Record<string, boolean>;
}): void {
	try {
		localStorage.setItem(PLAYERS_KEY, JSON.stringify(payload));
	} catch {}
}

export function loadPlayersSetup(): { 
	numPlayers: number; 
	players: Array<{ name: string }>; 
	rolesCounts?: Record<string, number>;
	rolesEnabled?: Record<string, boolean>;
} | null {
	try {
		const raw = localStorage.getItem(PLAYERS_KEY);
		return raw ? JSON.parse(raw) : null;
	} catch {
		return null;
	}
}

export function clearPlayersSetup(): void {
	try { localStorage.removeItem(PLAYERS_KEY); } catch {}
}

export function saveSettings(payload: { skipFirstNightActions: boolean; enableSindaco: boolean }): void {
	try {
		localStorage.setItem(SETTINGS_KEY, JSON.stringify(payload));
	} catch {}
}

export function loadSettings(): { skipFirstNightActions: boolean; enableSindaco: boolean } | null {
	try {
		const raw = localStorage.getItem(SETTINGS_KEY);
		return raw ? JSON.parse(raw) : null;
	} catch {
		return null;
	}
}

export function clearSettings(): void {
	try { localStorage.removeItem(SETTINGS_KEY); } catch {}
}


