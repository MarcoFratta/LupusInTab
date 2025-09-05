import type { RoleDef } from '../types';
import { wolvesWin } from '../utils/winConditions';
import { componentFactory } from "../utils/roleUtils";
import { RoleAPI } from "../utils/roleAPI";

const illusionista: RoleDef = {
    id: 'illusionista',
    name: 'Illusionista',
    team: 'lupi',
	score: 6,
    visibleAsTeam: 'villaggio',
    countAs: 'villaggio',
    description: 'Blocca le abilità notturne di un giocatore',
    longDescription: `L'Illusionista può impedire a un giocatore di usare le sue abilità notturne.

COME FUNZIONA:
• Di notte può scegliere un giocatore da bloccare
• Il giocatore bloccato non può usare le sue abilità notturne
• Il blocco dura per quella notte
• L'azione è opzionale: può scegliere di non usarla`,
    color: '#a78bfa',
    phaseOrder: -3,
    actsAtNight: "alive",
    effectType: 'optional',
    getPromptComponent: componentFactory('Illusionista', "prompt"),
    getResolveDetailsComponent: componentFactory('Illusionista', "details"),
    
    resolve(gameState: any, action: any) {
		const targetId = Number(action?.data?.targetId);
		if (!Number.isFinite(targetId) || targetId <= 0) return;
		
		const targetPlayer = RoleAPI.getPlayer(targetId);
		if (targetPlayer) {
			const originalActsAtNight = targetPlayer.roleState.actsAtNight;
			
			if (originalActsAtNight !== 'never') {
				const customData = RoleAPI.getCustomData('illusionista');
				customData[targetId] = {
					originalActsAtNight: originalActsAtNight
				};
				RoleAPI.setCustomData('illusionista', customData);
				
				RoleAPI.blockPlayer(targetId);
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
		return wolvesWin(gameState);
	},
	
	restoreFunction(gameState: any) {
		// Always restore blocked players, regardless of whether illusionista is alive or dead
		const customData = RoleAPI.getCustomData('illusionista');
		Object.entries(customData).forEach(([targetIdStr, data]: [string, any]) => {
			const targetId = Number(targetIdStr);
			const targetPlayer = RoleAPI.getPlayer(targetId);
			if (targetPlayer && data.originalActsAtNight !== undefined) {
				// Restore the original actsAtNight value
				RoleAPI.unblockPlayer(targetId, data.originalActsAtNight);
				console.log(`🔓 [Illusionista] Restored player ${targetPlayer.name} actsAtNight from 'blocked' to '${data.originalActsAtNight}'`);
			}
		});
		
		// Clean up the custom data
		RoleAPI.clearCustomData('illusionista');
	},
};

export default illusionista;
