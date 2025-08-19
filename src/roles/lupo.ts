import type { RoleDef } from '../types';
import { useWinConditions } from '../utils/winConditions';
import { addToHistory } from '../utils/roleUtils';

const wolf: RoleDef = {
    id: 'wolf',
    name: 'Lupo',
    team: 'lupi',
    visibleAsTeam: 'lupi',
    countAs: 'lupi',
    description: 'Di notte i lupi scelgono una vittima. Vincono quando restano solo loro o raggiungono la parità con gli altri.',
    color: '#ef4444',
    phaseOrder: 1,
    group: true,
    actsAtNight: "alive",
    usage: 'requiredEveryNight',
    revealAlliesWithinRole: true,
    minCount: 1,
    maxCount: (state: any) => Math.max(1, Math.floor(((state?.setup?.numPlayers || 0) - 1) / 2)),
    getGroupPromptComponent() {
        return () => import('../components/roles/Wolf/WolvesPrompt.vue');
    },
    getGroupResolveDetailsComponent(gameState: any, action: any) {
        return () => import('../components/resolve-details/WolvesResolveDetails.vue');
    },
    resolve(gameState: any, action: any) {
        const isGroup = action.kind === 'group';
        // Handle both action.data.targetId and action.result.targetId formats
        const id = Number(action?.data?.targetId || action?.result?.targetId);
        if (Number.isFinite(id)) {
            const pk = gameState.night.context.pendingKills as Record<number, Array<{ role: string; notSavable: boolean }>>;
            if (!pk[id]) pk[id] = [];
            // Check if this kill is already pending from wolves
            const hasWolfKill = pk[id].some(kill => kill.role === 'wolf');
            if (!hasWolfKill) {
                pk[id].push({ role: 'wolf', notSavable: false });
                
                // Only create history entry if this is the first wolf (representative)
                // This prevents multiple history entries for the same group action
                if (action.playerId === action.playerIds?.[0]) {
                    addToHistory(gameState, action.playerId || 0, gameState.nightNumber, 'wolf_attack', {
                        target: id
                    });
                }
            }
        }
    },
    checkWin(gameState: any) {
        const { wolvesWin } = useWinConditions();
        return wolvesWin(gameState);
    },
};

export default wolf;




