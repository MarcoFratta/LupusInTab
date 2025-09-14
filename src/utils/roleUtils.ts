import { ROLES } from '../roles';
import { RoleConstraintManager } from '../core/managers/RoleConstraintManager';

export function componentFactory(roleName: string, type: "prompt" | "details") {
  return () => import(`../components/roles/${roleName}/${roleName}${type === 'prompt' ? 'Prompt' : 'ResolveDetails'}.vue`);
}

export function getRoleById(roleId: string) {
  return ROLES[roleId];
}

export function canPlayerActAtNight(player: any, gameState: any): boolean {
  return RoleConstraintManager.canPlayerActAtNight(player);
}

export function hasPlayerExceededUsageLimit(player: any, gameState: any): boolean {
  return RoleConstraintManager.hasPlayerExceededUsageLimit(gameState, player);
}

export function getRoleDisplayName(roleId: string | undefined, t: (key: string) => string): string {
  if (!roleId) return t('common.unknown'); // Fallback for unknown role
  
  const roleDef = ROLES[roleId];
  if (!roleDef?.name) return roleId; // Fallback to role ID if no name

  // If name is a localization key, translate it
  if (roleDef.name.startsWith('roleNames.')) {
    return t(roleDef.name);
  }
  return roleDef.name; // Otherwise, return as is (should not happen after refactor)
}

export function getRoleDescription(roleId: string | undefined, t: (key: string) => string): string {
  if (!roleId) return t('common.unknown');
  
  const roleDef = ROLES[roleId];
  if (!roleDef?.description) return '';

  // If description is a localization key, translate it
  if (roleDef.description.startsWith('roleDescriptions.')) {
    return t(roleDef.description);
  }
  return roleDef.description;
}

export function getRoleLongDescription(roleId: string | undefined, t: (key: string) => string): string {
  if (!roleId) return t('common.unknown');
  
  const roleDef = ROLES[roleId];
  if (!roleDef?.longDescription) return '';

  // If longDescription is a localization key, translate it
  if (roleDef.longDescription.startsWith('roleDescriptions.')) {
    return t(roleDef.longDescription);
  }
  return roleDef.longDescription;
}