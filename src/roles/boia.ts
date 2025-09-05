import type { RoleDef } from '../types';
import { villageWin } from '../utils/winConditions';
import { componentFactory } from "../utils/roleUtils";
import { RoleAPI } from '../utils/roleAPI';
import { checkPlayerRole } from '../utils/roleChecking';

const boia: RoleDef = {
    id: 'boia',
    name: 'Boia',
    team: 'lupi',
    score: 4,
    visibleAsTeam: 'lupi',
    countAs: 'villaggio',
    description: 'Uccide un giocatore se indovina il suo ruolo',
    longDescription: `Il Boia è un assassino preciso che deve indovinare il ruolo per colpire.

COME FUNZIONA:
• Ogni notte può scegliere un giocatore e dichiarare il suo ruolo
• Se indovina il ruolo, il giocatore muore immediatamente
• Se sbaglia, il Boia muore al suo posto
• L'azione è opzionale: può scegliere di non agire`,
    color: '#5b21b6',
    phaseOrder: "any",
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
        
        const targetPlayer = RoleAPI.getPlayer(id);
        if (!targetPlayer) return;
        
        const isCorrect = checkPlayerRole(id, declaredRoleId, gameState);
        
        if (isCorrect) {
            RoleAPI.addKill(id, 'boia', { notSavable: true });
        } else {
            const boiaId = action.playerId || 0;
            RoleAPI.addKill(boiaId, 'boia', { notSavable: true });
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
        return villageWin(gameState);
    },
};

export default boia;



