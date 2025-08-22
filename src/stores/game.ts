import { defineStore } from 'pinia';
import { reactive } from 'vue';
import type { GameHistory, Player } from '../types';

export type Phase = 'setup' | 'revealRoles' | 'preNight' | 'night' | 'resolve' | 'day' | 'end';

export interface RoleMeta { id: string; name: string; team: string; visibleAsTeam?: string; phaseOrder: number | string; usage?: 'unlimited' | 'once' | 'requiredEveryNight'; canTargetDead?: boolean }

export interface NightTurnSingle { kind: 'single'; roleId: string; playerId: number }
export interface NightTurnGroup { kind: 'group'; roleId: string; playerIds: number[] }
export type NightTurn = NightTurnSingle | NightTurnGroup;

export interface NightSummary { targeted: number[]; saved: number[]; died: number[]; resurrected: number[]; checks: Array<{by:number; target:number; team:string}> }

export interface DaySummary { lynched: number | null; day: number; }



export interface GameState {
	phase: Phase;
	nightNumber: number;
	dayNumber: number;
	players: Player[];
	setup: { numPlayers: number; players: Array<{ name: string }>; rolesCounts: Record<string, number>; rolesEnabled: Record<string, boolean> };
	revealIndex: number;
	night: { turns: NightTurn[]; currentIndex: number; results: any[]; context: any; summary: NightSummary | null };
	settings: { skipFirstNightActions: boolean; enableSindaco: boolean; discussionTimerEnabled?: boolean };
    sindacoId: number | null;
	winner: string | null;
    lynchedHistory?: number[];
    usedPowers?: Record<string, number[]>;

    custom?: Record<string, any>;
    history?: GameHistory;
    nightDeathsByNight?: Record<number, number[]>;
    lynchedHistoryByDay?: Record<number, number[]>;
}

export const useGameStore = defineStore('game', () => {
	const state = reactive<GameState>({
		phase: 'setup',
		nightNumber: 0,
		dayNumber: 0,
		players: [],
		setup: { numPlayers: 6, players: [], rolesCounts: {}, rolesEnabled: { lupo: true, villico: true, guardia: true, veggente: true, massone: false, matto: false, giustiziere: false, boia: false, medium: false, lupomannaro: false, indemoniato: false, insinuo: false } },
		revealIndex: 0,
		night: { turns: [], currentIndex: 0, results: [], context: null, summary: null },
		settings: { skipFirstNightActions: true, enableSindaco: false, discussionTimerEnabled: false },
        sindacoId: null,
		winner: null,
		lynchedHistory: [],
		usedPowers: {},

		nightDeathsByNight: {},
		lynchedHistoryByDay: {},
	});

	return { state };
});


