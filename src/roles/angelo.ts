import type { RoleDef } from '../types';
import { useWinConditions } from '../utils/winConditions';
import { addToHistory } from '../utils/roleUtils';

const angelo: RoleDef = {
    id: 'angelo',
    name: 'Angelo',
    team: 'villaggio',
    visibleAsTeam: 'villaggio',
    countAs: 'villaggio',
    description: 'Una volta per partita, scegli un giocatore morto da riportare in vita.',
    color: '#fbbf24',
    phaseOrder: "any",
    group: false,
    actsAtNight: "alive",
    usage: 'once',
    getPromptComponent() {
        return () => import('../components/roles/Angelo/AngeloPrompt.vue');
    },
    getResolveDetailsComponent() {
        return () => import('../components/resolve-details/AngeloResolveDetails.vue');
    },
    resolve(gameState: any, action: any) {
        const id = Number(action?.data?.targetId);
        if (!Number.isFinite(id)) return;
        
        const target = gameState.players.find(p => p.id === id);
        if (target && !target.alive) {
            target.alive = true;
        }

        addToHistory(gameState, action.playerId || 0, gameState.nightNumber, 'angelo_resurrect', {
            target: id
        });
    },
    checkWin(gameState: any) {
        const { villageWin } = useWinConditions();
        return villageWin(gameState);
    },
};

export default angelo;
