import type { RoleDef } from '../types';
import { useWinConditions } from '../utils/winConditions';

const wolf: RoleDef = {
    id: 'wolf',
    name: 'Lupo',
    team: 'lupi',
    visibleAsTeam: 'lupi',
    description: 'Di notte i lupi scelgono una vittima. Vincono quando restano solo loro o raggiungono la parità con gli altri.',
    color: '#ef4444',
    phaseOrder: 1,
    group: true,
    actsAtNight: true,
    usage: 'requiredEveryNight',
    revealToAllies: 'role',
    getGroupPromptComponent() {
        return () => import('../components/roles/Wolf/WolvesPrompt.vue');
    },
    getGroupResolveDetailsComponent() {
        return () => import('../components/roles/Wolf/WolvesResolveDetails.vue');
    },
    resolve(gameState: any, entry: any) {
        const isGroup = entry.kind === 'group';
        const id = Number(entry?.result?.targetId);
        if (Number.isFinite(id)) {
            const pk = gameState.night.context.pendingKills as Record<number, string[]>;
            if (!pk[id]) pk[id] = [];
            if (!pk[id].includes('wolf')) pk[id].push('wolf');
        }
    },
    checkWin(gameState: any) {
        const { wolvesWin } = useWinConditions();
        return wolvesWin(gameState);
    },
};

export default wolf;




