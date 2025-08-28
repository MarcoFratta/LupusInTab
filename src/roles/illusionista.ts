import type { RoleDef } from '../types';
import { useWinConditions } from '../utils/winConditions';
import {componentFactory} from "../utils/roleUtils";

const illusionista: RoleDef = {
    id: 'illusionista',
    name: 'Illusionista',
    team: 'lupi',
	score: 6,
    visibleAsTeam: 'villaggio',
    countAs: 'villaggio',
    description: 'Di notte blocca le abilità notturne di un giocatore.',
    color: '#a78bfa',
    phaseOrder: -3,
    actsAtNight: "alive",
    effectType: 'optional',
    getPromptComponent: componentFactory('Illusionista', "prompt"),
    getResolveDetailsComponent: componentFactory('Illusionista', "details"),
    resolve(gameState: any, action: any) {
		const targetId = Number(action?.data?.targetId);
		if (!Number.isFinite(targetId) || targetId <= 0) return;
		
		const targetPlayer = gameState.players.find(p => p.id === targetId);
		if (targetPlayer) {
			const originalActsAtNight = targetPlayer.roleState.actsAtNight;
			
			if (originalActsAtNight !== 'never') {
				if (!gameState.custom) gameState.custom = {};
				if (!gameState.custom['illusionista']) gameState.custom['illusionista'] = {};
				gameState.custom['illusionista'][targetId] = {
					originalActsAtNight: originalActsAtNight
				};
				
				targetPlayer.roleState.actsAtNight = 'blocked';
			}
		}
		
		return {
			type: 'illusionista_action',
			nightNumber: gameState.nightNumber,
			roleId: 'illusionista',
			playerIds: action.playerIds || [],
			targetId: targetId,
			data: action.data
		};
	},
    checkWin(gameState: any) {
		const { wolvesWin } = useWinConditions();
		return wolvesWin(gameState);
	},
	
	restoreFunction(gameState: any) {
		// Always restore blocked players, regardless of whether illusionista is alive or dead
		if (gameState.custom && gameState.custom['illusionista']) {
			Object.entries(gameState.custom['illusionista']).forEach(([targetIdStr, data]: [string, any]) => {
				const targetId = Number(targetIdStr);
				const targetPlayer = gameState.players.find(p => p.id === targetId);
				if (targetPlayer && data.originalActsAtNight !== undefined) {
					// Restore the original actsAtNight value
					targetPlayer.roleState.actsAtNight = data.originalActsAtNight;
					console.log(`🔓 [Illusionista] Restored player ${targetPlayer.name} actsAtNight from 'blocked' to '${data.originalActsAtNight}'`);
				}
			});
			
			// Clean up the custom data
			delete gameState.custom['illusionista'];
		}
	},
};

export default illusionista;
