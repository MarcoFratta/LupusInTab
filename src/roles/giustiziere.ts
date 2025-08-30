import type { RoleDef } from '../types';
import { villageWin } from '../utils/winConditions';
import {componentFactory} from "../utils/roleUtils";

const giustiziere: RoleDef = {
	id: 'giustiziere',
	name: 'Giustiziere',
	team: 'villaggio',
	icon: 'GiustiziereIcon',
    visibleAsTeam: 'villaggio',
    score: 4,
    countAs: 'villaggio',
    description: 'Una volta per partita, di notte giustizia un giocatore.',
    color: '#a78bfa',
    phaseOrder: "any",
    actsAtNight: "alive",
    effectType: 'optional',
    numberOfUsage: 1,
    getPromptComponent: componentFactory('Giustiziere', "prompt"),
    getResolveDetailsComponent: componentFactory('Giustiziere', "details"),
    resolve(gameState: any, action: any) {
        const id = Number(action?.data?.targetId);
        if (!Number.isFinite(id)) return;
        
        if (!gameState.night.context.pendingKills) {
            gameState.night.context.pendingKills = {};
        }
        const pk = gameState.night.context.pendingKills as Record<number, Array<{ role: string }>>;
        if (!pk[id]) pk[id] = [];
        pk[id].push({ role: 'giustiziere' });

        return {
            type: 'giustiziere_action',
            nightNumber: gameState.nightNumber,
            roleId: 'giustiziere',
            playerIds: action.playerIds || [],
            targetId: id,
            data: action.data
        };
    },
    checkWin(gameState: any) {
        return villageWin(gameState);
    },
};

export default giustiziere;



