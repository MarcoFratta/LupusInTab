import type { RoleDef } from '../types';
import { useWinConditions } from '../utils/winConditions';
import {componentFactory} from "../utils/roleUtils";

const angelo: RoleDef = {
    id: 'angelo',
    name: 'Angelo',
    team: 'villaggio',
    score: 3,
    visibleAsTeam: 'villaggio',
    countAs: 'villaggio',
    description: 'Una volta per partita, riporta in vita un giocatore morto.',
    color: '#fbbf24',
    phaseOrder: -1,
    actsAtNight: "alive",
    effectType: 'optional',
    numberOfUsage: 1,
    getPromptComponent: componentFactory('Angelo', "prompt"),
    getResolveDetailsComponent: componentFactory('Angelo', "details"),
    resolve(gameState: any, action: any) {
        const id = Number(action?.data?.targetId);
        if (!Number.isFinite(id)) return;
        
        const target = gameState.players.find(p => p.id === id);
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
        const { villageWin } = useWinConditions();
        return villageWin(gameState);
    },
};

export default angelo;
