import type { RoleDef } from '../types';
import { getRoleCustomData, setRoleCustomData, clearRoleCustomData, componentFactory } from '../utils/roleUtils';

export const insinuo: RoleDef = {
	id: 'insinuo',
	name: 'Insinuo',
	team: 'lupi',
	visibleAsTeam: 'villaggio',
	score: 3,
	countAs: 'villaggio',
	color: '#a855f7',
	description: 'Di notte cambia la fazione di un giocatore agli occhi di chi lo indaga.',
	phaseOrder: 5,
	actsAtNight: "alive",
	effectType: 'required',
	numberOfUsage: 'unlimited',
	resolve: (gameState: any, action: any) => {
		const targetId = action.data?.targetId;
		if (!targetId) return;

		const target = gameState.players.find((p: any) => p.id === targetId);
		if (!target) return;

		const insinuoData = getRoleCustomData(gameState, 'insinuo');
		
		if (!insinuoData.targets) insinuoData.targets = [];
		
		if (target.alive) {
			const existingTarget = insinuoData.targets.find((t: any) => t.playerId === targetId);
			if (!existingTarget) {
				insinuoData.targets.push({
					playerId: targetId,
					originalVisibleAsTeam: target.roleState.visibleAsTeam,
					originalTeam: target.roleState.realTeam
				});
			}

			const currentVisible = target.roleState.visibleAsTeam || target.roleState.realTeam;
			let nextVisible: string;

			if (currentVisible === 'lupi') {
				nextVisible = 'villaggio';
			} else {
				nextVisible = 'lupi';
			}

			target.roleState.visibleAsTeam = nextVisible;
			
			const targetDataRef = insinuoData.targets.find((t: any) => t.playerId === targetId);
			if (targetDataRef) {
				targetDataRef.newFaction = nextVisible;
			}

			return {
				type: 'insinuo_action',
				nightNumber: gameState.nightNumber,
				roleId: 'insinuo',
				playerIds: action.playerIds || [],
				targetId: targetId,
				previousFaction: currentVisible,
				newFaction: nextVisible,
				data: action.data
			};
		}
	},
	restoreFunction: (gameState: any) => {
		const insinuoData = getRoleCustomData(gameState, 'insinuo');
		if (!insinuoData.targets) return;

		for (const targetData of insinuoData.targets) {
			const player = gameState.players.find((p: any) => p.id === targetData.playerId);
			if (player && targetData.originalVisibleAsTeam !== undefined) {
				player.roleState.visibleAsTeam = targetData.originalVisibleAsTeam;
			}
		}

		clearRoleCustomData(gameState, 'insinuo');
	},
	getPromptComponent: componentFactory('Insinuo', "prompt"),
	getResolveDetailsComponent: componentFactory('Insinuo', "details"),
};
