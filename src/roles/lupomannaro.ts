import type { RoleDef } from '../types';
import { mannariWin } from '../utils/winConditions';
import {componentFactory} from "../utils/roleUtils";

const lupomannaro: RoleDef = {
    id: 'lupomannaro',
    name: 'Lupo Mannaro',
    team: 'mannari',
    score: 33,
    revealAlliesWithinRole: false,
    visibleAsTeam: 'lupi',
    countAs: 'villaggio',
    description: 'Vince solo se rimane in vita con un altro giocatore. Di notte dichiara un giocatore e un ruolo: se indovina, la vittima muore. I lupi non possono ucciderlo. Muore se il veggente lo indaga.',
    color: '#6366f1',
    phaseOrder: "any",
    actsAtNight: "alive",
    effectType: 'required',
    numberOfUsage: 'unlimited',

    passiveEffect(gameState: any, player: any) {
        const pk = gameState.night.context.pendingKills as Record<number, Array<{ role: string }>>;
        if (pk[player.id]) {
            pk[player.id] = pk[player.id].filter(kill => kill.role !== 'lupo');
            
            if (pk[player.id].length === 0) {
                delete pk[player.id];
            }
        }
    },
    resolve(gameState: any, action: any) {
        const targetId = Number(action?.data?.targetId);
        const roleId = String(action?.data?.roleId || '');
        const lupomannaroId = action.playerId || 0;
        
        if (!Number.isFinite(targetId) || targetId <= 0 || !roleId) return;
        const target = gameState.players.find((p: any) => p.id === targetId);
        if (!target) return;
        const isCorrect = target.roleId === roleId;
        if (isCorrect) {
            const pk = gameState.night.context.pendingKills as Record<number, Array<{ role: string }>>;
            if (!pk[targetId]) pk[targetId] = [];
            pk[targetId].push({ role: 'lupomannaro' });
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
    getPromptComponent: componentFactory('Lupomannaro', "prompt"),
    getResolveDetailsComponent: componentFactory('Lupomannaro', "details"),
};

export default lupomannaro;




