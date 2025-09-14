import type { RoleDef } from '../types';
import { mannariWin, mannariBlocksOtherWins } from '../utils/winConditions';
import { componentFactory } from "../utils/roleUtils";
import { RoleAPI } from "../utils/roleAPI";
import { checkPlayerRole } from '../utils/roleChecking';

const lupomannaro: RoleDef = {
    id: 'lupomannaro',
    name: 'roleNames.lupomannaro',
    team: 'mannari',
    score: 45,
    revealAlliesWithinRole: false,
    visibleAsTeam: 'lupi',
    countAs: 'villaggio',
    description: 'roleDescriptions.lupomannaro',
    longDescription: 'roleDescriptions.lupomannaroLong',
    color: '#7c3aed',
    phaseOrder: "any",
    actsAtNight: "alive",
    effectType: 'required',
    numberOfUsage: 'unlimited',

    passiveEffect(gameState: any, player: any) {
        // Remove lupo kills from lupomannaro
        RoleAPI.removeKills(player.id, 'lupo');
    },
    
    resolve(gameState: any, action: any) {
        const targetId = Number(action?.data?.targetId);
        const roleId = String(action?.data?.roleId || '');
        const lupomannaroId = action.playerId || 0;
        
        if (!Number.isFinite(targetId) || targetId <= 0 || !roleId) return;
        const target = RoleAPI.getPlayer(targetId);
        if (!target) return;
        const isCorrect = checkPlayerRole(targetId, roleId, gameState);
        if (isCorrect) {
            RoleAPI.addKill(targetId, 'lupomannaro');
        }
        
        return {
            type: 'lupomannaro_action',
            nightNumber: gameState.nightNumber,
            roleId: 'lupomannaro',
            playerIds: action.playerIds || [],
            targetId: targetId,
            declaredRole: roleId,
            correct: isCorrect,
            data: action.data
        };
    },
    
    checkWin(gameState: any) {
        return mannariWin(gameState);
    },
    
    checkWinConstraint(gameState: any) {
        return mannariBlocksOtherWins(gameState);
    },
    
    getPromptComponent: componentFactory('Lupomannaro', "prompt"),
    getResolveDetailsComponent: componentFactory('Lupomannaro', "details"),
};

export default lupomannaro;




