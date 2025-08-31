import type { RoleDef } from '../types';
import { wolvesWin } from '../utils/winConditions';
import { componentFactory } from "../utils/roleUtils";

export const lupoCieco: RoleDef = {
    id: 'lupoCieco',
    name: 'Lupo Cieco',
    team: 'lupi',
    visibleAsTeam: 'lupi',
    score: 8,
    countAs: 'lupi',
    color: '#7c2d12',
    description: 'Può investigare 3 giocatori contigui per scoprire se tra loro c\'è almeno un lupo. Se tutti i lupi sono morti, può anche uccidere.',
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
            const directLupi = gameState.players.filter((p: any) => p.roleId === 'lupo');
            const groupedLupi = [];
            
            if (gameState.groupings) {
                for (const grouping of gameState.groupings) {
                    if (grouping.fromRole === 'lupo') {
                        const groupedRolePlayers = gameState.players.filter((p: any) => p.roleId === grouping.toRole);
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
                const player = gameState.players.find((p: any) => p.id === targetId);
                return player && (player.roleState?.visibleAsTeam === 'lupi' || player.roleState?.team === 'lupi');
            });
            investigationResult = hasLupiAmongTargets;
        }
        
        if (killTargetId && !hasLupiAlive) {
            const pk = gameState.night.context.pendingKills as Record<number, Array<{ role: string }>>;
            if (!pk[killTargetId]) pk[killTargetId] = [];
            const hasLupoCiecoKill = pk[killTargetId].some(kill => kill.role === 'lupo');
            if (!hasLupoCiecoKill) {
                pk[killTargetId].push({ role: 'lupo' });
            }
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
