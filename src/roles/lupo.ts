import type { RoleDef } from '../types';
import { wolvesWin } from '../utils/winConditions';
import {componentFactory} from "../utils/roleUtils";

const lupo: RoleDef = {
    id: 'lupo',
    name: 'Lupo',
    team: 'lupi',
    icon: 'LupoIcon',
    score: 10,
    visibleAsTeam: 'lupi',
    countAs: 'lupi',
    description: 'Di notte sceglie una vittima da sbranare.',
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
            const pk = gameState.night.context.pendingKills as Record<number, Array<{ role: string }>>;
            
            for (const targetId of targetIds) {
                const id = Number(targetId);
                if (Number.isFinite(id) && id > 0) {
                    if (!pk[id]) pk[id] = [];
                    const hasLupoKill = pk[id].some(kill => kill.role === 'lupo');
                    if (!hasLupoKill) {
                        pk[id].push({ role: 'lupo' });
                    }
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




