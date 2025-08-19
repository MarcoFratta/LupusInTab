import type { RoleDef } from '../types';
import { useWinConditions } from '../utils/winConditions';
import { addToHistory } from '../utils/roleUtils';

const illusionista: RoleDef = {
    id: 'illusionista',
    name: 'Illusionista',
    team: 'lupi',
    visibleAsTeam: 'villaggio',
    countAs: 'villaggio',
    description: 'Di notte scegli un giocatore da bloccare. Non potrà usare la sua abilità notturna.',
    color: '#06b6d4',
    phaseOrder: -1, // Acts first to block others
    group: false,
    actsAtNight: "alive",
    usage: 'unlimited',
    getPromptComponent() {
        return () => import('../components/roles/Illusionista/IllusionistaPrompt.vue');
    },
    getResolveDetailsComponent() {
        return () => import('../components/resolve-details/IllusionistaResolveDetails.vue');
    },
    	resolve(gameState: any, action: any) {
		const targetId = Number(action?.data?.targetId);
		if (!Number.isFinite(targetId) || targetId <= 0) return;
		
		// Find the target player and modify their runtime state
		const targetPlayer = gameState.players.find(p => p.id === targetId);
		if (targetPlayer) {
			const originalActsAtNight = targetPlayer.roleState.actsAtNight;
			
			// Only change actsAtNight to "blocked" if the target can actually act at night
			// If they have "never", leave them unchanged
			if (originalActsAtNight !== 'never') {
				// Store the original actsAtNight value for restoration
				if (!gameState.illusionistaStore) gameState.illusionistaStore = {};
				gameState.illusionistaStore[targetId] = {
					originalActsAtNight: originalActsAtNight
				};
				
				// Change their actsAtNight to "blocked" for this night
				targetPlayer.roleState.actsAtNight = 'blocked';
			}
		}
		
		// Log to history
		addToHistory(gameState, action.playerId || 0, gameState.nightNumber, 'illusionista_block', {
			target: targetId
		});
	},
    	checkWin(gameState: any) {
		const { wolvesWin } = useWinConditions();
		return wolvesWin(gameState);
	},
	
	restoreFunction(gameState: any) {
		// Restore all blocked players to their original actsAtNight values
		if (gameState.illusionistaStore) {
			Object.entries(gameState.illusionistaStore).forEach(([targetIdStr, data]: [string, any]) => {
				const targetId = Number(targetIdStr);
				const targetPlayer = gameState.players.find(p => p.id === targetId);
				if (targetPlayer && data.originalActsAtNight !== undefined) {
					targetPlayer.roleState.actsAtNight = data.originalActsAtNight;
				}
			});
			
			// Clear the store after restoration
			delete gameState.illusionistaStore;
		}
	},
};

export default illusionista;
