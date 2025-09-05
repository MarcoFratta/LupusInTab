import { defineStore } from 'pinia';
import { reactive } from 'vue';
import type { 
	GameState, 
	Player, 
	NightContext, 
	NightTurn, 
	NightSummary, 
	DaySummary,
	Phase 
} from '../types';
import { DEFAULT_ROLES_CONFIG } from '../config/defaultRoles';

export interface RoleMeta { 
	id: string; 
	name: string; 
	team: string; 
	visibleAsTeam?: string; 
	phaseOrder: number | string; 
	usage?: 'unlimited' | 'once' | 'requiredEveryNight'; 
	canTargetDead?: boolean 
}

export interface NightTurnSingle { kind: 'single'; roleId: string; playerId: number }
export interface NightTurnGroup { kind: 'group'; roleId: string; playerIds: number[] }
export type NightTurn = NightTurnSingle | NightTurnGroup;

// Extended GameState interface for the store with additional properties
export interface StoreGameState extends GameState {
	night: { 
		turns: NightTurn[]; 
		currentIndex: number; 
		results: unknown[]; 
		context: NightContext | null; 
		summary: NightSummary | null 
	};
	showRoleResee?: boolean;
	revealPhaseState?: {
		showIntro: boolean;
		showPreNightInfo: boolean;
		showRoleReveal: boolean;
		roleRevealed: boolean;
	};
}

export const useGameStore = defineStore('game', () => {
	const state = reactive<StoreGameState>({
		phase: 'setup',
		nightNumber: 0,
		dayNumber: 0,
		players: [],
		setup: { numPlayers: DEFAULT_ROLES_CONFIG.defaultPlayerCount, players: [], rolesCounts: {}, rolesEnabled: { ...DEFAULT_ROLES_CONFIG.rolesEnabled } },
		revealIndex: 0,
		night: { turns: [], currentIndex: 0, results: [], context: null, summary: null },
		settings: { skipFirstNightActions: true, enableSindaco: false, discussionTimerEnabled: false, difficolta: false },
        sindacoId: null,
		winner: null,
		lynchedHistory: [],
		usedPowers: {},
        showRoleResee: false,
        groupings: [],
        revealPhaseState: {
            showIntro: true,
            showPreNightInfo: false,
            showRoleReveal: false,
            roleRevealed: false
        },

		nightDeathsByNight: {},
		lynchedHistoryByDay: {},
	});

	return { state };
});


