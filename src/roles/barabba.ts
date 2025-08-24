import type { RoleDef } from '../types';
import { useWinConditions } from '../utils/winConditions';
import {componentFactory} from "../utils/roleUtils";

const barabba: RoleDef = {
    id: 'barabba',
    name: 'Barabba',
    team: 'villaggio',
    visibleAsTeam: 'villaggio',
    score: 4,
    countAs: 'villaggio',
    description: 'Quando è morto, può portare con sé un giocatore nell\'aldilà una volta per partita.',
    color: '#29bb46',
    phaseOrder: "any",
    actsAtNight: "dead",
    effectType: 'optional',
    numberOfUsage: 1,
    getPromptComponent: componentFactory('Barabba', "prompt"),
    getResolveDetailsComponent: componentFactory('Barabba', "details"),
    resolve(gameState: any, action: any) {
        const id = Number(action?.data?.targetId);
        if (!Number.isFinite(id)) return;
        
        const pk = gameState.night.context.pendingKills as Record<number, Array<{ role: string }>>;
        if (!pk[id]) pk[id] = [];
        pk[id].push({ role: 'barabba' });

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
        const { villageWin } = useWinConditions();
        return villageWin(gameState);
    },
};

export default barabba;
