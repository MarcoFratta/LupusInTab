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

        if (!gameState.custom) {
            gameState.custom = {};
        }
        if (!gameState.custom.parassita) {
            gameState.custom.parassita = { infetti: [], usageCount: 0 };
        }

        const infetti = gameState.custom.parassita.infetti;
        const usageCount = gameState.custom.parassita.usageCount;

        const alivePlayers = gameState.players.filter((p: any) => p.alive);
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
            if (targetId && !infetti.includes(targetId) && gameState.players.find((p: any) => p.id === targetId)?.alive) {
                infetti.push(targetId);
                newInfections++;
            }
        }

        if (newInfections > 0) {
            gameState.custom.parassita.usageCount = usageCount + 1;
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
