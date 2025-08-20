import type { RoleDef } from '../types';
import { useWinConditions } from '../utils/winConditions';
import { getPlayerRealTimeVisibleTeam, addToHistory } from '../utils/roleUtils';

const medium: RoleDef = {
    id: 'medium',
    name: 'Veggente',
    team: 'villaggio',
    visibleAsTeam: 'villaggio',
    countAs: 'villaggio',
    description: 'Ogni notte scegli un giocatore per scoprire il suo ruolo.',
    color: '#8b5cf6',
    phaseOrder: "any",
    group: false,
    actsAtNight: "alive",
    effectType: 'optional',
    numberOfUsage: 'unlimited',
    getPromptComponent() {
        return () => import('../components/roles/Medium/MediumPrompt.vue');
    },
    getResolveDetailsComponent() {
        return () => import('../components/resolve-details/MediumResolveDetails.vue');
    },
    resolve(gameState: any, action: any) {
        // Handle both action.data.targetId and action.result.targetId formats
        const targetId = Number(action?.data?.targetId || action?.result?.targetId);
        if (!Number.isFinite(targetId)) return;
        
        const target = gameState.players.find((p: any) => p.id === targetId);
        
        // Always create history entry, even for missing targets
        addToHistory(gameState, action.playerId || 0, gameState.nightNumber, 'veggente_investigation', {
            target: targetId,
            discoveredFaction: target ? (target.roleState?.visibleAsTeam || target.roleState?.realTeam) : undefined
        });
    },
    checkWin(gameState: any) {
        const { villageWin } = useWinConditions();
        return villageWin(gameState);
    },
};

export default medium;


