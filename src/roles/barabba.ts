import type { RoleDef } from '../types';
import { useWinConditions } from '../utils/winConditions';
import { addToHistory } from '../utils/roleUtils';

const barabba: RoleDef = {
    id: 'barabba',
    name: 'Barabba',
    team: 'villaggio',
    visibleAsTeam: 'villaggio',
    countAs: 'villaggio',
    description: 'Una volta per partita, quando morto, scegli un giocatore da uccidere. Non può essere salvato.',
    color: '#29bb46',
    phaseOrder: "any",
    group: false,
    actsAtNight: "dead",
    usage: 'once',
    getPromptComponent() {
        return () => import('../components/roles/Barabba/BarabbaPrompt.vue');
    },
    getResolveDetailsComponent() {
        return () => import('../components/resolve-details/BarabbaResolveDetails.vue');
    },
    resolve(gameState: any, action: any) {
        const id = Number(action?.data?.targetId);
        if (!Number.isFinite(id)) return;
        
        const pk = gameState.night.context.pendingKills as Record<number, Array<{ role: string }>>;
        if (!pk[id]) pk[id] = [];
        pk[id].push({ role: 'barabba' });

        addToHistory(gameState, action.playerId || 0, gameState.nightNumber, 'barabba_execute', {
            target: id
        });
    },
    checkWin(gameState: any) {
        const { villageWin } = useWinConditions();
        return villageWin(gameState);
    },
};

export default barabba;
