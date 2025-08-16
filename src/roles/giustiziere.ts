import type { RoleDef } from '../types';

const justicer: RoleDef = {
    id: 'justicer',
    name: 'Giustiziere',
    team: 'village',
    visibleAsTeam: 'village',
    description: 'Una volta per partita, di notte puoi giustiziare un giocatore. Vinci con il villaggio.',
    color: '#06b6d4',
    phaseOrder: 2,
    group: false,
    actsAtNight: true,
    usage: 'once',
    minCount: 1,
    getPromptComponent() {
        return () => import('../components/roles/Justicer/JusticerPrompt.vue');
    },
    getResolveDetailsComponent() {
        return () => import('../components/roles/Justicer/JusticerResolveDetails.vue');
    },
    resolve(gameState: any, entry: any) {
        const id = Number(entry?.result?.targetId);
        if (!Number.isFinite(id) || id <= 0) return;
        const pk = gameState.night.context.pendingKills as Record<number, string[]>;
        if (!pk[id]) pk[id] = [];
        if (!pk[id].includes('justicer')) pk[id].push('justicer');
    },
};

export default justicer;



