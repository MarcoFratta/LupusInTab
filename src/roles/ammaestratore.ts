import type { RoleDef } from '../types';
import { villageWin } from '../utils/winConditions';
import { componentFactory } from "../utils/roleUtils";

const ammaestratore: RoleDef = {
	id: 'ammaestratore',
	name: 'Ammaestratore',
	team: 'villaggio',
	icon: 'AmmaestratoreIcon',
	score: 6,
	visibleAsTeam: 'villaggio',
	countAs: 'villaggio',
	description: 'A partire dalla seconda notte, una volta per partita può scegliere di ammaestrare i lupi, ' +
    'scegliendo lui stesso chi verrà sbranato quella notte. ' +
        "Se il giocatore scelto dall'ammaestratore è un lupo, allora nessuno verrà sbranato",
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

		const pk = gameState.night.context.pendingKills as Record<number, Array<{ role: string }>>;
		if (!pk) return;

		const lupoKills: Array<{ role: string; originalTarget?: number }> = [];
		const newTarget = gameState.players.find((p: any) => p.id === numericTargetId);
		
		if (!newTarget) return;

		// Find lupo kills to redirect
		Object.keys(pk).forEach(playerId => {
			const kills = pk[Number(playerId)];
			if (kills) {
				const lupoKill = kills.find(kill => kill.role === 'lupo');
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
			if (originalTarget && pk[originalTarget]) {
				const kills = pk[originalTarget];
				const lupoKill = kills.find(kill => kill.role === 'lupo');
				if (lupoKill) {
					kills.splice(kills.indexOf(lupoKill), 1);
					if (kills.length === 0) {
						delete pk[originalTarget];
					}
				}
			}
			
			// Only add the redirected kill if target is NOT a lupo
			if (newTarget.roleId !== 'lupo') {
				if (!pk[numericTargetId]) pk[numericTargetId] = [];
				pk[numericTargetId].push({ role: 'lupo' });
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
				result: newTarget.roleId === 'lupo' ? 'blocked' : 'redirected'
			}
		};
	},
	checkWin(gameState: any) {
		return villageWin(gameState);
	},
};

export default ammaestratore;
