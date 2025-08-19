import type { RoleDef } from '../types';
import { useWinConditions } from '../utils/winConditions';
import { addToHistory } from '../utils/roleUtils';

const justicer: RoleDef = {
    id: 'justicer',
    name: 'Giustiziere',
    team: 'villaggio',
    visibleAsTeam: 'villaggio',
    countAs: 'villaggio',
    description: 'Una volta per partita, di notte scegli un giocatore da giustiziare. Non può essere salvato.',
    color: '#dc2626',
    phaseOrder: "any",
    group: false,
    actsAtNight: "alive",
    usage: 'once',
    getPromptComponent() {
        return () => import('../components/roles/Justicer/JusticerPrompt.vue');
    },
    getResolveDetailsComponent() {
        return () => import('../components/resolve-details/JusticerResolveDetails.vue');
    },
    resolve(gameState: any, action: any) {
        const id = Number(action?.data?.targetId);
        if (!Number.isFinite(id)) return;
        
        const pk = gameState.night.context.pendingKills as Record<number, Array<{ role: string; notSavable: boolean }>>;
        if (!pk[id]) pk[id] = [];
        pk[id].push({ role: 'justicer', notSavable: true });

        // Log to history
        addToHistory(gameState, action.playerId || 0, gameState.nightNumber, 'justicer_execute', {
            target: id
        });
    },
    checkWin(gameState: any) {
        const { villageWin } = useWinConditions();
        return villageWin(gameState);
    },
};

export default justicer;



