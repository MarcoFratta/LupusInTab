const KEY = 'lupus_gm_state_v1';
const PLAYERS_KEY = 'lupus_players_v1';
const SETTINGS_KEY = 'lupus_settings_v1';

// Role ID migration map for old saved games
const ROLE_ID_MIGRATIONS: Record<string, string> = {
	'giustiziere': 'giustiziere',
};

function migrateRoleIds(data: any): any {
	if (!data) return data;
	
	// Migrate rolesEnabled
	if (data.rolesEnabled) {
		const migrated: Record<string, boolean> = {};
		for (const [oldId, enabled] of Object.entries(data.rolesEnabled)) {
			const newId = ROLE_ID_MIGRATIONS[oldId] || oldId;
			migrated[newId] = enabled as boolean;
		}
		data.rolesEnabled = migrated;
	}
	
	// Migrate rolesCounts
	if (data.rolesCounts) {
		const migrated: Record<string, number> = {};
		for (const [oldId, count] of Object.entries(data.rolesCounts)) {
			const newId = ROLE_ID_MIGRATIONS[oldId] || oldId;
			migrated[newId] = count as number;
		}
		data.rolesCounts = migrated;
	}
	
	return data;
}

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
		if (!raw) return null;
		
		const data = JSON.parse(raw);
		return migrateRoleIds(data);
	} catch {
		return null;
	}
}

export function clearPlayersSetup(): void {
	try { localStorage.removeItem(PLAYERS_KEY); } catch {}
}

export function saveSettings(payload: { skipFirstNightActions: boolean; enableSindaco: boolean; discussionTimerEnabled?: boolean }): void {
	try {
		localStorage.setItem(SETTINGS_KEY, JSON.stringify(payload));
	} catch {}
}

export function loadSettings(): { skipFirstNightActions: boolean; enableSindaco: boolean; discussionTimerEnabled?: boolean } | null {
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

const SEEN_ROLES_KEY = 'lupus_seen_roles_v1';

export function saveSeenRoles(roles: string[]): void {
	try {
		localStorage.setItem(SEEN_ROLES_KEY, JSON.stringify(roles));
	} catch {}
}

export function loadSeenRoles(): string[] {
	try {
		const raw = localStorage.getItem(SEEN_ROLES_KEY);
		return raw ? JSON.parse(raw) : [];
	} catch {
		return [];
	}
}

export function clearSeenRoles(): void {
	try { localStorage.removeItem(SEEN_ROLES_KEY); } catch {}
}

export function clearAllSavedData(): void {
	try { 
		localStorage.removeItem(KEY); 
		localStorage.removeItem(PLAYERS_KEY); 
		localStorage.removeItem(SETTINGS_KEY); 
	} catch {}
}

// Make it available globally for debugging
if (typeof window !== 'undefined') {
	(window as any).clearLupusData = clearAllSavedData;
}


