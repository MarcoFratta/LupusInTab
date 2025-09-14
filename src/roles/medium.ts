import type { RoleDef } from '../types';
import { villageWin } from '../utils/winConditions';
import { componentFactory } from "../utils/roleUtils";
import { RoleAPI } from '../utils/roleAPI';
import { checkPlayerRole } from '../utils/roleChecking';
import { GameStateManager } from '../core/managers/GameStateManager';

const medium: RoleDef = {
    id: 'medium',
    name: 'roleNames.medium',
    team: 'villaggio',
    visibleAsTeam: 'villaggio',
    score: 5,
    countAs: 'villaggio',
    description: 'roleDescriptions.medium',
    longDescription: 'roleDescriptions.mediumLong',
    color: '#f3e8ff',
    phaseOrder: "any",
    actsAtNight: "alive",
    effectType: 'required',
    numberOfUsage: 'unlimited',
    getPromptComponent: componentFactory('Medium', "prompt"),
    getResolveDetailsComponent: componentFactory('Medium', "details"),
    
    resolve(gameState: any, action: any) {
        const id = Number(action?.data?.targetId || action?.result?.targetId);
        if (!Number.isFinite(id) || id <= 0) return;
        const target = RoleAPI.getPlayer(id);
        if (!target) return;
        const seenTeam = GameStateManager.getPlayerRealTimeVisibleTeam(gameState, id);
        
        // Record the check action in context
        if (seenTeam) {
            RoleAPI.addCheck(action.playerId, id, seenTeam);
        }
        
        return {
            type: 'medium_action',
            nightNumber: gameState.nightNumber,
            roleId: 'medium',
            playerIds: action.playerIds || [],
            targetId: id,
            discoveredFaction: seenTeam,
            data: action.data
        };
    },
    
    checkWin(gameState: any) {
        return villageWin(gameState);
    },
};

export default medium;



