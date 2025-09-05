import type { RoleDef } from '../types';
import { villageWin } from '../utils/winConditions';
import { componentFactory } from "../utils/roleUtils";
import { RoleAPI } from '../utils/roleAPI';

const barabba: RoleDef = {
    id: 'barabba',
    name: 'Barabba',
    team: 'villaggio',
    visibleAsTeam: 'villaggio',
    score: 6,
    countAs: 'villaggio',
    description: 'Porta un giocatore nell\'aldilà quando è morto',
    longDescription: `Barabba può portare un giocatore nell'aldilà quando è morto.

COME FUNZIONA:
• Quando è morto, può portare con sé un giocatore nell'aldilà
• L'azione è opzionale: può scegliere di non usarla
• Può essere usata solo una volta per partita
• Il giocatore scelto muore immediatamente`,
    color: '#c4b5fd',
    phaseOrder: "any",
    actsAtNight: "dead",
    effectType: 'optional',
    numberOfUsage: 1,
    getPromptComponent: componentFactory('Barabba', "prompt"),
    getResolveDetailsComponent: componentFactory('Barabba', "details"),
    
    resolve(gameState: any, action: any) {
        const id = Number(action?.data?.targetId);
        if (!Number.isFinite(id)) return;
        
        RoleAPI.addKill(id, 'barabba');

        return {
            type: 'barabba_action',
            nightNumber: gameState.nightNumber,
            roleId: 'barabba',
            playerIds: action.playerIds || [],
            targetId: id,
            data: action.data
        };
    },
    
    checkWin(gameState: any) {
        return villageWin(gameState);
    },
};

export default barabba;
