import type { RoleDef } from '../types';
import { wolvesWin } from '../utils/winConditions';
import { componentFactory } from "../utils/roleUtils";
import { RoleAPI } from "../utils/roleAPI";

const lupo: RoleDef = {
    id: 'lupo',
    name: 'roleNames.lupo',
    team: 'lupi',
    icon: 'LupoIcon',
    score: 10,
    visibleAsTeam: 'lupi',
    countAs: 'lupi',
    description: 'roleDescriptions.lupo',
    longDescription: 'roleDescriptions.lupoLong',
    color: '#4c1d95',
    phaseOrder: 1,
    actsAtNight: "alive",
    effectType: 'required',
    numberOfUsage: 'unlimited',
    revealAlliesWithinRole: true,
    knownTo: ['muccamannara'],
    revealToAllies: "role",
    minCount: 1,
    maxCount: (state: any) => Math.max(1, Math.floor(((state?.setup?.numPlayers || 0) - 1) / 2)),
    getPromptComponent: componentFactory('Lupo', "prompt"),
    getResolveDetailsComponent: componentFactory('Lupo', "details"),
    
    resolve(gameState: any, action: any) {
        const targetIds = action?.data?.targetIds || action?.result?.targetIds || [];
        
        if (Array.isArray(targetIds) && targetIds.length > 0) {
            for (const targetId of targetIds) {
                const id = Number(targetId);
                if (Number.isFinite(id) && id > 0) {
                    RoleAPI.addKill(id, 'lupo');
                }
            }
        }
        
        return {
            type: 'lupo_action',
            nightNumber: gameState.nightNumber,
            roleId: 'lupo',
            playerIds: action.playerIds || [],
            targetIds: targetIds,
            data: action.data
        };
    },
    
    checkWin(gameState: any) {
        return wolvesWin(gameState);
    },
};

export default lupo;




