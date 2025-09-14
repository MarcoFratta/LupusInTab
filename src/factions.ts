import type { FactionConfig } from './types';

export const FACTIONS: Record<string, FactionConfig> = {
	villaggio: {
		id: 'villaggio',
		name: 'villaggio',
		displayName: 'factions.villaggio',
		color: '#10b981',
		ringColor: 'ring-emerald-500/40',
		winConditionDescription: 'factionWinConditions.villaggio'
	},
	lupi: {
		id: 'lupi',
		name: 'lupi',
		displayName: 'factions.lupi',
		color: '#f87171',
		ringColor: 'ring-red-400/40',
		winConditionDescription: 'factionWinConditions.lupi'
	},
	mannari: {
		id: 'mannari',
		name: 'mannari',
		displayName: 'factions.mannari',
		color: '#7c3aed',
		ringColor: 'ring-violet-600/40',
		winConditionDescription: 'factionWinConditions.mannari'
	},
	matti: {
		id: 'matti',
		name: 'matti',
		displayName: 'factions.matti',
		color: '#f59e0b',
		ringColor: 'ring-amber-500/40',
		winConditionDescription: 'factionWinConditions.matti'
	},
	parassita: {
		id: 'parassita',
		name: 'parassita',
		displayName: 'factions.parassita',
		color: '#3b82f6',
		ringColor: 'ring-blue-500/40',
		winConditionDescription: 'factionWinConditions.parassita'
	},
	alieni: {
		id: 'alieni',
		name: 'alieni',
		displayName: 'factions.alieni',
		color: '#ec4899',
		ringColor: 'ring-pink-500/40',
		winConditionDescription: 'factionWinConditions.alieni'
	}
};

export function getFactionConfig(team: string | undefined): FactionConfig | undefined {
	if (!team) return undefined;
	return FACTIONS[team];
}


