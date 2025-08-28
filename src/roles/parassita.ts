import type { RoleDef } from '../types';
import {componentFactory} from "../utils/roleUtils";

export const parassita: RoleDef = {
    id: 'parassita',
    name: 'Parassita',
    team: 'parassita',
    score: 25,
    description: 'Di notte infetta gli altri giocatori. Vince se tutti i giocatori vivi sono infetti.',
    color: '#ec4899',
    phaseOrder: "any",
    actsAtNight: "alive",
    effectType: 'required',
    countAs: 'villaggio',
    numberOfUsage: 'unlimited',
    minCount: 1,
    maxCount: 1,
    getPromptComponent: componentFactory('Parassita', "prompt"),
    getResolveDetailsComponent: componentFactory('Parassita', "details"),
    resolve(gameState: any, action: any) {
        const targetIds = action?.data?.targetIds;
        
        if (!targetIds || !Array.isArray(targetIds) || targetIds.length === 0) {
            return null;
        }

        if (!gameState.custom) {
            gameState.custom = {};
        }
        if (!gameState.custom.parassita) {
            gameState.custom.parassita = { infetti: [], usageCount: 0 };
        }

        const infetti = gameState.custom.parassita.infetti;
        const usageCount = gameState.custom.parassita.usageCount;

        if (infetti.length >= gameState.players.filter((p: any) => p.alive).length - 1) {
            return {
                type: 'parassita_action',
                nightNumber: gameState.nightNumber,
                roleId: 'parassita',
                playerIds: action.playerIds || [],
                data: { ...action.data, skipped: true, reason: 'All players already infected' }
            };
        }

        for (const targetId of targetIds) {
            if (targetId && !infetti.includes(targetId) && gameState.players.find((p: any) => p.id === targetId)?.alive) {
                infetti.push(targetId);
                gameState.custom.parassita.usageCount = usageCount + 1;
            }
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
        if (!gameState.custom || !gameState.custom.parassita || !gameState.custom.parassita.infetti) {
            return false;
        }

        const alivePlayers = gameState.players.filter((p: any) => p.alive);
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

        const infetti = gameState.custom.parassita.infetti;
        const allInfected = otherAlivePlayers.every((p: any) => infetti.includes(p.id));

        return allInfected;
    }
};
