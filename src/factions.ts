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
		color: '#f87171',
		ringColor: 'ring-red-400/40',
		winConditionDescription: 'I lupi vincono quando raggiungono la parità numerica con i villici o li superano'
	},
	mannari: {
		id: 'mannari',
		name: 'mannari',
		displayName: 'Mannari',
		color: '#7c3aed',
		ringColor: 'ring-violet-600/40',
		winConditionDescription: 'Il lupo mannaro vince se restano solo in due (lui e un altro giocatore)'
	},
	matti: {
		id: 'matti',
		name: 'matti',
		displayName: 'Matti',
		color: '#f59e0b',
		ringColor: 'ring-amber-500/40',
		winConditionDescription: 'Il matto vince se viene eliminato durante il giorno (votazione)'
	},
	parassita: {
		id: 'parassita',
		name: 'parassita',
		displayName: 'Parassita',
		color: '#3b82f6',
		ringColor: 'ring-blue-500/40',
		winConditionDescription: 'Il parassita vince quando tutti i giocatori vivi sono infetti'
	},
	alieni: {
		id: 'alieni',
		name: 'alieni',
		displayName: 'Alieni',
		color: '#ec4899',
		ringColor: 'ring-pink-500/40',
		winConditionDescription: 'Gli alieni vincono quando rimangono vivi con lo stesso numero di giocatori per ogni squadra'
	}
};

export function getFactionConfig(team: string | undefined): FactionConfig | undefined {
	if (!team) return undefined;
	return FACTIONS[team];
}


