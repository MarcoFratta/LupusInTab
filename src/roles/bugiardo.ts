import type { RoleDef } from '../types';
import { wolvesWin } from '../utils/winConditions';
import { componentFactory } from "../utils/roleUtils";
import { RoleAPI } from '../utils/roleAPI';

const bugiardo: RoleDef = {
	id: 'bugiardo',
	name: 'roleNames.bugiardo',
	team: 'lupi',
	icon: 'BugiardoIcon',
    score: 8,
    visibleAsTeam: 'villaggio',
    countAs: 'villaggio',
    description: 'roleDescriptions.bugiardo',
    longDescription: 'roleDescriptions.bugiardoLong',
    color: '#dc2626',
    phaseOrder: "any",
    actsAtNight: "alive",
    effectType: 'optional',
    numberOfUsage: 1,
    startNight: 2,
    canTargetDead: true,
    getPromptComponent: componentFactory('Bugiardo', "prompt"),
    getResolveDetailsComponent: componentFactory('Bugiardo', "details"),
    
    resolve(gameState: any, action: any) {
        if (RoleAPI.getNightNumber() < this.startNight!) return;
        
        const targetId = Number(action?.data?.targetId || action?.result?.targetId);
        if (!Number.isFinite(targetId)) return;
        
        const target = RoleAPI.getPlayer(targetId);
        if (!target) return;
        
        return {
            type: 'bugiardo_action',
            nightNumber: gameState.nightNumber,
            roleId: 'bugiardo',
            playerIds: action.playerIds || [],
            targetId: targetId,
            discoveredRole: target.roleId,
            discoveredRealTeam: target.roleState?.realTeam,
            data: action.data
        };
    },
    
    checkWin(gameState: any) {
        return wolvesWin(gameState);
    },
};

export default bugiardo;
