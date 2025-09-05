import type { GameState } from '../types';

/**
 * Check if a player has a specific role, considering role groupings based on difficolta setting
 * @param playerId - The ID of the player to check
 * @param targetRole - The role to check for
 * @param gameState - The current game state
 * @returns true if the player has the target role (considering groupings if enabled), false otherwise
 */
export function checkPlayerRole(playerId: number, targetRole: string, gameState: GameState): boolean {
  const player = gameState.players.find(p => p.id === playerId);
  if (!player) return false;

  // Direct role match
  if (player.roleId === targetRole) return true;

  // Check groupings if difficolta is enabled
  if (gameState.settings.difficolta && gameState.groupings) {
    const grouping = gameState.groupings.find(g => g.fromRole === targetRole);
    if (grouping && player.roleId === grouping.toRole) {
      return true;
    }
  }

  return false;
}

/**
 * Get all players with a specific role, considering role groupings based on difficolta setting
 * @param targetRole - The role to search for
 * @param gameState - The current game state
 * @returns Array of player IDs that have the target role (considering groupings if enabled)
 */
export function getPlayersWithRole(targetRole: string, gameState: GameState): number[] {
  const result: number[] = [];

  for (const player of gameState.players) {
    // Direct role match
    if (player.roleId === targetRole) {
      result.push(player.id);
      continue;
    }

    // Check groupings if difficolta is enabled
    if (gameState.settings.difficolta && gameState.groupings) {
      const grouping = gameState.groupings.find(g => g.fromRole === targetRole);
      if (grouping && player.roleId === grouping.toRole) {
        result.push(player.id);
      }
    }
  }

  return result;
}

/**
 * Check if any player has a specific role, considering role groupings based on difficolta setting
 * @param targetRole - The role to check for
 * @param gameState - The current game state
 * @returns true if any player has the target role (considering groupings if enabled), false otherwise
 */
export function hasAnyPlayerWithRole(targetRole: string, gameState: GameState): boolean {
  return getPlayersWithRole(targetRole, gameState).length > 0;
}
