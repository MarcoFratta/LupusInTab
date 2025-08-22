import type { RoleDef } from '../types';
import { useWinConditions } from '../utils/winConditions';
import {componentFactory} from "../utils/roleUtils";

const angelo: RoleDef = {
    id: 'angelo',
    name: 'Angelo',
    team: 'villaggio',
    visibleAsTeam: 'villaggio',
    countAs: 'villaggio',
    description: 'Una volta per partita, scegli un giocatore morto da riportare in vita.',
    color: '#fbbf24',
    phaseOrder: "any",
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
