import { ROLES } from '../roles';
import type { RoleDef } from '../types';

export interface LocalizedRoleDef extends Omit<RoleDef, 'name' | 'description' | 'longDescription'> {
  name: string;
  description: string;
  longDescription: string;
}

export function getLocalizedRole(roleId: string, t: (key: string) => string): LocalizedRoleDef | null {
  const role = ROLES[roleId];
  if (!role) return null;

  return {
    ...role,
    name: t(role.name),
    description: t(role.description),
    longDescription: t(role.longDescription)
  };
}

export function getLocalizedRoles(t: (key: string) => string): LocalizedRoleDef[] {
  return Object.keys(ROLES).map(roleId => getLocalizedRole(roleId, t)).filter(Boolean) as LocalizedRoleDef[];
}
