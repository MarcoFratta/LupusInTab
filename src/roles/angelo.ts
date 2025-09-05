import type { RoleDef } from '../types';
import { villageWin } from '../utils/winConditions';
import { componentFactory } from "../utils/roleUtils";
import { RoleAPI } from '../utils/roleAPI';

const angelo: RoleDef = {
    id: 'angelo',
    name: 'Angelo',
    team: 'villaggio',
    score: 6,
    visibleAsTeam: 'villaggio',
    countAs: 'villaggio',
    description: 'Riporta in vita un giocatore morto una volta per partita',
    longDescription: `L'Angelo può riportare in vita un giocatore morto.

COME FUNZIONA:
• Una volta per partita, di notte può riportare in vita un giocatore morto
• Il giocatore torna in vita e può partecipare al gioco
• L'azione è opzionale: può scegliere di non usarla
• Non può essere usata più di una volta per partita`,
    color: '#f3e8ff',
    phaseOrder: -2,
    actsAtNight: "alive",
    effectType: 'optional',
    numberOfUsage: 1,
    getPromptComponent: componentFactory('Angelo', "prompt"),
    getResolveDetailsComponent: componentFactory('Angelo', "details"),
    
    resolve(gameState: any, action: any) {
        const id = Number(action?.data?.targetId);
        if (!Number.isFinite(id)) return;
        
        const target = RoleAPI.getPlayer(id);
        if (target && !target.alive) {
            target.alive = true;
        }

        return {
            type: 'angelo_action',
            nightNumber: gameState.nightNumber,
            roleId: 'angelo',
            playerIds: action.playerIds || [],
            targetId: id,
            data: action.data
        };
    },
    
    checkWin(gameState: any) {
        return villageWin(gameState);
    },
};

export default angelo;
