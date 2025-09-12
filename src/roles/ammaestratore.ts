import type { RoleDef } from '../types';
import { villageWin } from '../utils/winConditions';
import { componentFactory } from "../utils/roleUtils";
import { RoleAPI } from '../utils/roleAPI';
import { checkPlayerRole } from '../utils/roleChecking';

const ammaestratore: RoleDef = {
	id: 'ammaestratore',
	name: 'Ammaestratore',
	team: 'villaggio',
	icon: 'AmmaestratoreIcon',
	score: 6,
	visibleAsTeam: 'villaggio',
	countAs: 'villaggio',
	description: 'Ammaestra i lupi dalla 2ª notte, una volta per partita',
    longDescription: `L'Ammaestratore può controllare l'azione dei lupi per una notte.

COME FUNZIONA:
• Dalla 2ª notte in poi, una volta per partita può ammaestrare i lupi
• Sceglie lui stesso chi verrà ucciso quella notte
• Se sceglie un lupo, nessuno viene ucciso quella notte
• L'azione è opzionale: può scegliere di non usarla`,
	color: '#059669',
	phaseOrder: 2,
	actsAtNight: "alive",
	effectType: 'optional',
	numberOfUsage: 1,
	startNight: 2,
	affectedRoles: ['lupo'],
	getPromptComponent: componentFactory('Ammaestratore', "prompt"),
	getResolveDetailsComponent: componentFactory('Ammaestratore', "details"),
	
	resolve(gameState: any, action: any) {
		const targetId = action?.data?.targetId || action?.result?.targetId;
		
		const numericTargetId = Number(targetId);
		if (!Number.isFinite(numericTargetId)) return;

		const newTarget = RoleAPI.getPlayer(numericTargetId);
		if (!newTarget) return;

		// Find lupo kills to redirect
		const lupoKills: Array<{ role: string; originalTarget?: number }> = [];
		const pendingKills = gameState.night?.context?.pendingKills || {};
		
		// Find all lupo kills
		Object.keys(pendingKills).forEach(playerId => {
			const kills = pendingKills[Number(playerId)];
			if (kills) {
				const lupoKill = kills.find((kill: any) => kill.role === 'lupo');
				if (lupoKill) {
					lupoKills.push({
						...lupoKill,
						originalTarget: Number(playerId)
					});
				}
			}
		});
		
		// Always take only ONE lupo kill to redirect
		if (lupoKills.length > 0) {
			// Take the first kill found
			const killToRedirect = lupoKills[0];
			const originalTarget = killToRedirect.originalTarget;
			
			// Remove this kill from its original target
			if (originalTarget) {
				RoleAPI.removeKills(originalTarget, 'lupo');
			}
			
			// Only add the redirected kill if target is NOT a lupo
			if (!checkPlayerRole(numericTargetId, 'lupo', gameState)) {
				RoleAPI.addKill(numericTargetId, 'lupo');
			}
			
			// Keep only the first kill in the array for the redirect info
			lupoKills.splice(1);
		}

		return {
			type: 'ammaestratore_action',
			nightNumber: gameState.nightNumber,
			roleId: 'ammaestratore',
			playerIds: action.playerIds || [],
			targetId: numericTargetId,
			data: action.data,
			redirectInfo: {
				targetId: numericTargetId,
				originalKills: lupoKills,
				result: checkPlayerRole(numericTargetId, 'lupo', gameState) ? 'blocked' : 'redirected'
			}
		};
	},
	
	checkWin(gameState: any) {
		return villageWin(gameState);
	},
};

export default ammaestratore;
