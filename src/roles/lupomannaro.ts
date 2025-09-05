import type { RoleDef } from '../types';
import { mannariWin, mannariBlocksOtherWins } from '../utils/winConditions';
import { componentFactory } from "../utils/roleUtils";
import { RoleAPI } from "../utils/roleAPI";
import { checkPlayerRole } from '../utils/roleChecking';

const lupomannaro: RoleDef = {
    id: 'lupomannaro',
    name: 'Lupo Mannaro',
    team: 'mannari',
    score: 45,
    revealAlliesWithinRole: false,
    visibleAsTeam: 'lupi',
    countAs: 'villaggio',
    description: 'Vince solo se rimane vivo con un altro giocatore',
    longDescription: `Il Lupo Mannaro è un ruolo solitario con poteri speciali.

COME FUNZIONA:
• Vince solo se rimane in vita con esattamente un altro giocatore
• Di notte può dichiarare un giocatore e un ruolo: se indovina, la vittima muore
• Se rimane in vita, nessun altro può vincere
• I lupi non possono ucciderlo
• Muore se il Veggente lo investiga`,
    color: '#7c3aed',
    phaseOrder: "any",
    actsAtNight: "alive",
    effectType: 'required',
    numberOfUsage: 'unlimited',

    passiveEffect(gameState: any, player: any) {
        // Remove lupo kills from lupomannaro
        RoleAPI.removeKills(player.id, 'lupo');
    },
    
    resolve(gameState: any, action: any) {
        const targetId = Number(action?.data?.targetId);
        const roleId = String(action?.data?.roleId || '');
        const lupomannaroId = action.playerId || 0;
        
        if (!Number.isFinite(targetId) || targetId <= 0 || !roleId) return;
        const target = RoleAPI.getPlayer(targetId);
        if (!target) return;
        const isCorrect = checkPlayerRole(targetId, roleId, gameState);
        if (isCorrect) {
            RoleAPI.addKill(targetId, 'lupomannaro');
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
    
    checkWinConstraint(gameState: any) {
        return mannariBlocksOtherWins(gameState);
    },
    
    getPromptComponent: componentFactory('Lupomannaro', "prompt"),
    getResolveDetailsComponent: componentFactory('Lupomannaro', "details"),
};

export default lupomannaro;




