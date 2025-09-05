import type { GameState } from '../types';

/**
 * Check if two roles should know each other in the reveal phase
 * This considers both direct role matches and role groupings
 */
export function shouldRolesKnowEachOther(
  roleId1: string, 
  roleId2: string, 
  gameState: GameState
): boolean {
  // Direct match
  if (roleId1 === roleId2) {
    return true;
  }

  // Check groupings - if role1 groups with role2 or vice versa
  if (gameState.groupings) {
    for (const grouping of gameState.groupings) {
      // Check if role1 groups with role2 (lupo -> lupoCiccione)
      if (grouping.fromRole === roleId1 && grouping.toRole === roleId2) {
        return true;
      }
      // Check if role2 groups with role1 (lupoCiccione -> lupo)
      if (grouping.fromRole === roleId2 && grouping.toRole === roleId1) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Get the display label for a role in the reveal phase
 * This considers groupings to show the appropriate role name
 */
export function getRevealRoleLabel(
  roleId: string, 
  gameState: GameState
): string {
  // Check if this role groups with another role
  if (gameState.groupings) {
    for (const grouping of gameState.groupings) {
      if (grouping.toRole === roleId) {
        // This role groups with another role, show the grouped role name
        return grouping.fromRole;
      }
    }
  }

  // No grouping, return the role itself
  return roleId;
}