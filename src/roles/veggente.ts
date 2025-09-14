import type { RoleDef } from '../types';
import { villageWin } from '../utils/winConditions';
import { componentFactory } from "../utils/roleUtils";
import { RoleAPI } from "../utils/roleAPI";
import { checkPlayerRole } from '../utils/roleChecking';
import { GameStateManager } from '../core/managers/GameStateManager';

const veggente: RoleDef = {
	id: 'veggente',
	name: 'roleNames.veggente',
	team: 'villaggio',
	icon: 'VeggenteIcon',
    score: 7,
    visibleAsTeam: 'villaggio',
    countAs: 'villaggio',
    description: 'roleDescriptions.veggente',
    longDescription: 'roleDescriptions.veggenteLong',
    color: '#8b5cf6',
    phaseOrder: "any",
    actsAtNight: "alive",
    effectType: 'required',
    numberOfUsage: 'unlimited',
    affectedRoles: ['lupomannaro', 'muccamannara'],
    getPromptComponent: componentFactory('Veggente', "prompt"),
    getResolveDetailsComponent: componentFactory('Veggente', "details"),
    
    resolve(gameState: any, action: any) {
        const targetId = Number(action?.data?.targetId || action?.result?.targetId);
        if (!Number.isFinite(targetId)) return;
        
        const target = RoleAPI.getPlayer(targetId);
        
        // If target is lupomannaro or muccamannara, add pending kill
        if (target && (checkPlayerRole(targetId, 'lupomannaro', gameState) || checkPlayerRole(targetId, 'muccamannara', gameState))) {
            RoleAPI.addKill(targetId, 'veggente', { reason: 'Investigated by veggente' });
        }
        
        // Add investigation check - Veggente sees what the player appears as
        const discoveredTeam = target ? GameStateManager.getPlayerRealTimeVisibleTeam(gameState, targetId) : undefined;
        if (discoveredTeam) {
            RoleAPI.addCheck(action.playerId, targetId, discoveredTeam);
        }
        
        return {
            type: 'veggente_action',
            nightNumber: gameState.nightNumber,
            roleId: 'veggente',
            playerIds: action.playerIds || [],
            targetId: targetId,
            discoveredFaction: discoveredTeam,
            data: action.data
        };
    },
    
    checkWin(gameState: any) {
        return villageWin(gameState);
    },
};

export default veggente;


