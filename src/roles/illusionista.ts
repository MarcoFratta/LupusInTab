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
    description: 'Di notte blocca le abilità notturne di un giocatore. Viene visto come lupo se indagato di notte',
    color: '#06b6d4',
    phaseOrder: 0,
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
				if (!gameState.illusionistaStore) gameState.illusionistaStore = {};
				gameState.illusionistaStore[targetId] = {
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
		if (gameState.illusionistaStore) {
			Object.entries(gameState.illusionistaStore).forEach(([targetIdStr, data]: [string, any]) => {
				const targetId = Number(targetIdStr);
				const targetPlayer = gameState.players.find(p => p.id === targetId);
				if (targetPlayer && data.originalActsAtNight !== undefined) {
					targetPlayer.roleState.actsAtNight = data.originalActsAtNight;
				}
			});
			
			delete gameState.illusionistaStore;
		}
	},
};

export default illusionista;
