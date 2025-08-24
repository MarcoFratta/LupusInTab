import type { RoleDef } from '../types';
import {useWinConditions} from "../utils/winConditions";
import {componentFactory} from "../utils/roleUtils";

const boia: RoleDef = {
    id: 'boia',
    name: 'Boia',
    team: 'lupi',
    score: 4,
    visibleAsTeam: 'lupi',
    countAs: 'villaggio',
    description: 'Di notte impicca un giocatore se ne indovina il ruolo. Se sbaglia muore',
    color: '#7c3aed',
    phaseOrder: 2,
    actsAtNight: "alive",
    effectType: 'optional',
    numberOfUsage: 1,
    knownTo: ['lupo'],
    revealToAllies: "role",
    getPromptComponent: componentFactory('Boia', "prompt"),
    getResolveDetailsComponent: componentFactory('Boia', "details"),
    resolve(gameState: any, action: any) {
        const id = Number(action?.data?.targetId);
        const declaredRoleId = action?.data?.roleId ? String(action.data.roleId) : '';
        if (!Number.isFinite(id)) return;
        
        const targetPlayer = gameState.players.find((p: any) => p.id === id);
        if (!targetPlayer) return;
        
        const isCorrect = targetPlayer.roleId === declaredRoleId;
        
        const pk = gameState.night.context.pendingKills as Record<number, Array<{ role: string; notSavable: boolean }>>;
        
        if (isCorrect) {
            if (!pk[id]) pk[id] = [];
            pk[id].push({ role: 'boia', notSavable: true });
        } else {
            const boiaId = action.playerId || 0;
            if (!pk[boiaId]) pk[boiaId] = [];
            pk[boiaId].push({ role: 'boia', notSavable: true });
        }

        return {
            type: 'boia_action',
            nightNumber: gameState.nightNumber,
            roleId: 'boia',
            playerIds: action.playerIds || [],
            targetId: id,
            declaredRoleId: declaredRoleId,
            correct: isCorrect,
            data: action.data
        };
    },
    checkWin(gameState: any) {
        const { villageWin } = useWinConditions();
        return villageWin(gameState);
    },
};

export default boia;



