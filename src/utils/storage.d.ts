declare module './utils/storage' {
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


