import type { RoleDef } from '../types';
import { componentFactory } from "../utils/roleUtils";
import { RoleAPI } from "../utils/roleAPI";

export const parassita: RoleDef = {
    id: 'parassita',
    name: 'Parassita',
    team: 'parassita',
    score: 25,
    description: 'Infetta i giocatori ogni notte',
    longDescription: `Il Parassita infetta i giocatori per vincere la partita.

COME FUNZIONA:
• Ogni notte può infettare altri giocatori
• I giocatori infetti rimangono infetti per il resto della partita
• Vince se tutti i giocatori vivi sono infetti
• L'azione è opzionale: può scegliere di non infettare`,
    color: '#ec4899',
    phaseOrder: "any",
    actsAtNight: "alive",
    effectType: 'optional',
    visibleAsTeam: 'villaggio',
    countAs: 'villaggio',
    numberOfUsage: 'unlimited',
    minCount: 1,
    maxCount: 1,
    getPromptComponent: componentFactory('Parassita', "prompt"),
    getResolveDetailsComponent: componentFactory('Parassita', "details"),
    
    resolve(gameState: any, action: any) {
        const targetIds = action?.data?.targetIds;
        console.log("infecting " + targetIds)
        if (!targetIds || targetIds.length === 0) {
            return null;
        }

        const customData = RoleAPI.getCustomData('parassita');
        if (!customData.infetti) {
            customData.infetti = [];
        }
        if (!customData.usageCount) {
            customData.usageCount = 0;
        }

        const infetti = customData.infetti;
        const usageCount = customData.usageCount;

        const alivePlayers = RoleAPI.getAlivePlayers();
        const parassitaPlayers = alivePlayers.filter((p: any) => p.roleId === 'parassita');
        const otherAlivePlayers = alivePlayers.filter((p: any) => !parassitaPlayers.some((parassita: any) => parassita.id === p.id));
        
        if (otherAlivePlayers.length === 0) {
            return {
                type: 'parassita_action',
                nightNumber: gameState.nightNumber,
                roleId: 'parassita',
                playerIds: action.playerIds || [],
                data: { ...action.data, skipped: true, reason: 'No other players to infect' }
            };
        }

        const uninfectedPlayers = otherAlivePlayers.filter((p: any) => !infetti.includes(p.id));
        if (uninfectedPlayers.length === 0) {
            return {
                type: 'parassita_action',
                nightNumber: gameState.nightNumber,
                roleId: 'parassita',
                playerIds: action.playerIds || [],
                data: { ...action.data, skipped: true, reason: 'All other players already infected' }
            };
        }

        let newInfections = 0;
        for (const targetId of targetIds) {
            if (targetId && !infetti.includes(targetId) && RoleAPI.getPlayer(targetId)?.alive) {
                infetti.push(targetId);
                newInfections++;
            }
        }

        if (newInfections > 0) {
            customData.usageCount = usageCount + 1;
            RoleAPI.setCustomData('parassita', customData);
        }

        return {
            type: 'parassita_action',
            nightNumber: gameState.nightNumber,
            roleId: 'parassita',
            playerIds: action.playerIds || [],
            targetIds: targetIds,
            data: { ...action.data, infetti: [...infetti] }
        };
    },
    
    checkWin(gameState: any) {
        const customData = RoleAPI.getCustomData('parassita');
        if (!customData.infetti) {
            return false;
        }

        const alivePlayers = RoleAPI.getAlivePlayers();
        if (alivePlayers.length === 0) {
            return false;
        }

        const parassitaPlayer = alivePlayers.find((p: any) => p.roleId === 'parassita');
        if (!parassitaPlayer) {
            return false;
        }

        if (alivePlayers.length === 1) {
            return parassitaPlayer.alive;
        }

        const otherAlivePlayers = alivePlayers.filter((p: any) => p.id !== parassitaPlayer.id);
        if (otherAlivePlayers.length === 0) {
            return false;
        }

        const infetti = customData.infetti;
        const allInfected = otherAlivePlayers.every((p: any) => infetti.includes(p.id));

        return allInfected;
    }
};
