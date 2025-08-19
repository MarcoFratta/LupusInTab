declare module './utils/storage' {
  export function saveGameState(state: unknown): void;
  export function loadGameState<T = any>(): T | null;
  export function clearSavedGame(): void;

  export function savePlayersSetup(payload: { 
    numPlayers: number; 
    players: Array<{ name: string }>; 
    rolesCounts: Record<string, number>;
    rolesEnabled: Record<string, boolean>;
  }): void;
  export function loadPlayersSetup(): { 
    numPlayers: number; 
    players: Array<{ name: string }>; 
    rolesCounts?: Record<string, number>;
    rolesEnabled?: Record<string, boolean>;
  } | null;
  export function clearPlayersSetup(): void;

  export function saveSettings(payload: { skipFirstNightActions: boolean; enableSindaco: boolean; discussionTimerEnabled?: boolean }): void;
  export function loadSettings(): { skipFirstNightActions: boolean; enableSindaco: boolean; discussionTimerEnabled?: boolean } | null;
  export function clearSettings(): void;
}


