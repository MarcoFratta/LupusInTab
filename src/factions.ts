import type { FactionConfig } from './types';

export const FACTIONS: Record<string, FactionConfig> = {
	villaggio: {
		id: 'villaggio',
		name: 'villaggio',
		displayName: 'Villaggio',
		color: '#10b981',
		ringColor: 'ring-emerald-500/40',
		winConditionDescription: 'I villici vincono quando tutti i lupi sono stati eliminati'
	},
	lupi: {
		id: 'lupi',
		name: 'lupi',
		displayName: 'Lupi',
		color: '#ef4444',
		ringColor: 'ring-red-500/40',
		winConditionDescription: 'I lupi vincono quando raggiungono la parità numerica con i villici o li superano'
	},
	mannari: {
		id: 'mannari',
		name: 'mannari',
		displayName: 'Mannari',
		color: '#8b5cf6',
		ringColor: 'ring-violet-500/40',
		winConditionDescription: 'Il lupo mannaro vince se restano solo in due (lui e un altro giocatore)'
	},
	matti: {
		id: 'matti',
		name: 'matti',
		displayName: 'Matti',
		color: '#f59e0b',
		ringColor: 'ring-amber-500/40',
		winConditionDescription: 'Il matto vince se viene eliminato durante il giorno (votazione)'
	}
};

export function getFactionConfig(team: string | undefined): FactionConfig | undefined {
	if (!team) return undefined;
	return FACTIONS[team];
}


