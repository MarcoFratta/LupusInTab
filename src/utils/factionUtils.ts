import { getFactionConfig } from '../factions';
import type { FactionConfig } from '../types';

/**
 * Get a translated faction display name
 * @param team - The team/faction ID
 * @param t - Translation function from useI18n
 * @returns Translated faction name or fallback
 */
export function getFactionDisplayName(team: string | undefined, t: (key: string) => string): string {
  if (!team) return '';
  
  const factionConfig = getFactionConfig(team);
  if (!factionConfig?.displayName) return team;
  
  // If displayName is a localization key, translate it
  if (factionConfig.displayName.startsWith('factions.')) {
    return t(factionConfig.displayName);
  }
  
  // If it's already a translated string, return as is
  return factionConfig.displayName;
}

/**
 * Get faction config with translated display name
 * @param team - The team/faction ID
 * @param t - Translation function from useI18n
 * @returns Faction config with translated display name
 */
export function getLocalizedFactionConfig(team: string | undefined, t: (key: string) => string): FactionConfig & { translatedDisplayName: string } | undefined {
  if (!team) return undefined;
  
  const factionConfig = getFactionConfig(team);
  if (!factionConfig) return undefined;
  
  return {
    ...factionConfig,
    translatedDisplayName: getFactionDisplayName(team, t)
  };
}
