import type { RoleDef } from '../types';
import { wolvesWin } from '../utils/winConditions';
import { componentFactory } from "../utils/roleUtils";
import { RoleAPI } from "../utils/roleAPI";

const lupo: RoleDef = {
    id: 'lupo',
    name: 'Lupo',
    team: 'lupi',
    icon: 'LupoIcon',
    score: 10,
    visibleAsTeam: 'lupi',
    countAs: 'lupi',
    description: 'Uccide un giocatore ogni notte',
    longDescription: `Il Lupo è il ruolo più temuto del gioco, il cuore dell'alleanza dei lupi.

COME FUNZIONA:
• Ogni notte deve scegliere una vittima da uccidere
• L'azione è obbligatoria: non può saltare una notte
• Può uccidere qualsiasi giocatore vivo, inclusi altri lupi se necessario
• La vittima muore all'alba e non può più partecipare al gioco`,
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




