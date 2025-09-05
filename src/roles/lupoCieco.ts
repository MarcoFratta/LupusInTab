import type { RoleDef } from '../types';
import { wolvesWin } from '../utils/winConditions';
import { componentFactory } from "../utils/roleUtils";
import { RoleAPI } from '../utils/roleAPI';

export const lupoCieco: RoleDef = {
    id: 'lupoCieco',
    name: 'Lupo Cieco',
    team: 'lupi',
    visibleAsTeam: 'lupi',
    score: 14,
    countAs: 'lupi',
    color: '#7c2d12',
    description: 'Investiga 3 giocatori contigui per trovare lupi',
    longDescription: `Il Lupo Cieco può investigare gruppi di giocatori per trovare lupi.

COME FUNZIONA:
• Può investigare 3 giocatori contigui per scoprire se c'è almeno un lupo
• Se tutti i lupi sono morti, può anche uccidere un giocatore
• L'azione è obbligatoria: deve investigare ogni notte
• Può iniziare ad agire dalla 2ª notte`,
    phaseOrder: 2,
    actsAtNight: "alive",
    effectType: 'required',
    numberOfUsage: 'unlimited',
    startNight: 2,
    getPromptComponent: componentFactory('LupoCieco', "prompt"),
    getResolveDetailsComponent: componentFactory('LupoCieco', "details"),
    
    resolve(gameState: any, action: any) {
        const investigationTargets = action?.data?.investigationTargets || [];
        const killTargetId = action?.data?.killTargetId;
        
        // Helper function to get all lupi players (including grouped roles)
        function getLupiPlayers() {
            const directLupi = RoleAPI.getAlivePlayersWithRole('lupo');
            const groupedLupi = [];
            
            if (gameState.groupings) {
                for (const grouping of gameState.groupings) {
                    if (grouping.fromRole === 'lupo') {
                        const groupedRolePlayers = RoleAPI.getAlivePlayersWithRole(grouping.toRole);
                        groupedLupi.push(...groupedRolePlayers);
                    }
                }
            }
            
            return [...directLupi, ...groupedLupi];
        }
        
        // Check if all lupi-related roles are dead (including grouped roles)
        const hasLupiAlive = getLupiPlayers().some((p: any) => p.alive);
        
        let investigationResult = null;
        if (investigationTargets && investigationTargets.length === 3) {
            const hasLupiAmongTargets = investigationTargets.some((targetId: number) => {
                const player = RoleAPI.getPlayer(targetId);
                return player && (player.roleState?.visibleAsTeam === 'lupi' || player.roleState?.team === 'lupi');
            });
            investigationResult = hasLupiAmongTargets;
        }
        
        if (killTargetId && !hasLupiAlive) {
            RoleAPI.addKill(killTargetId, 'lupo');
        }
        
        return {
            type: 'lupoCieco_action',
            nightNumber: gameState.nightNumber,
            roleId: 'lupoCieco',
            playerIds: action.playerIds || [],
            investigationTargets: investigationTargets,
            investigationResult: investigationResult,
            killTargetId: killTargetId,
            canKill: !hasLupiAlive,
            data: action.data
        };
    },
    
    checkWin(gameState: any) {
        return wolvesWin(gameState);
    },
};
