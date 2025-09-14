import type { RoleDef } from '../types';
import { componentFactory } from '../utils/roleUtils';
import { RoleAPI } from '../utils/roleAPI';

export const insinuo: RoleDef = {
	id: 'insinuo',
	name: 'roleNames.insinuo',
	team: 'lupi',
	visibleAsTeam: 'villaggio',
	score: 3,
	countAs: 'villaggio',
	color: '#8b5cf6',
	description: 'roleDescriptions.insinuo',
    longDescription: 'roleDescriptions.insinuoLong',
	phaseOrder: 1,
	actsAtNight: "alive",
	effectType: 'required',
	numberOfUsage: 'unlimited',
	
	resolve: (gameState: any, action: any) => {
		const targetId = action.data?.targetId;
		if (!targetId) return;

		const target = RoleAPI.getPlayer(targetId);
		if (!target) return;

		const insinuoData = RoleAPI.getCustomData('insinuo');
		
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

			RoleAPI.setPlayerVisibleTeam(targetId, nextVisible);
			
			const targetDataRef = insinuoData.targets.find((t: any) => t.playerId === targetId);
			if (targetDataRef) {
				targetDataRef.newFaction = nextVisible;
			}

			RoleAPI.setCustomData('insinuo', insinuoData);

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
		const insinuoData = RoleAPI.getCustomData('insinuo');
		if (!insinuoData.targets) return;

		for (const targetData of insinuoData.targets) {
			const player = RoleAPI.getPlayer(targetData.playerId);
			if (player && targetData.originalVisibleAsTeam !== undefined) {
				RoleAPI.setPlayerVisibleTeam(targetData.playerId, targetData.originalVisibleAsTeam);
			}
		}

		RoleAPI.clearCustomData('insinuo');
	},
	
	getPromptComponent: componentFactory('Insinuo', "prompt"),
	getResolveDetailsComponent: componentFactory('Insinuo', "details"),
};
