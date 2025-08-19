import type { FactionConfig } from './types';

export const FACTIONS: Record<string, FactionConfig> = {
	villaggio: {
		id: 'villaggio',
		name: 'villaggio',
		displayName: 'Villaggio',
		color: '#34d399',
		ringColor: 'ring-emerald-500/40',
		winConditionDescription: 'I villici vincono quando tutti i lupi sono stati eliminati'
	},
	lupi: {
		id: 'lupi',
		name: 'lupi',
		displayName: 'Lupi',
		color: '#f87171',
		ringColor: 'ring-red-500/40',
		winConditionDescription: 'I lupi vincono quando raggiungono la parità numerica con i villici o li superano'
	},
	mannari: {
		id: 'mannari',
		name: 'mannari',
		displayName: 'Mannari',
		color: '#818cf8',
		ringColor: 'ring-indigo-500/40',
		winConditionDescription: 'Il lupo mannaro vince se restano solo in due (lui e un altro giocatore)'
	},
	matti: {
		id: 'matti',
		name: 'matti',
		displayName: 'Matti',
		color: '#a78bfa',
		ringColor: 'ring-violet-500/40',
		winConditionDescription: 'Il matto vince se viene eliminato durante il giorno (votazione)'
	}
};

export function getFactionConfig(team: string): FactionConfig | undefined {
	return FACTIONS[team];
}


