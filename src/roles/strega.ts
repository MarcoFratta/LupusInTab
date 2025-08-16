import type { RoleDef } from '../types';

const witch: RoleDef = {
    id: 'witch',
    name: 'Miedium',
    team: 'village',
    visibleAsTeam: 'village',
    description: 'Di notte, controlla la fazione di un giocatore morto. Se non ci sono morti, non puoi agire ma vedrai comunque il prompt.',
    color: '#8b5cf6',
    phaseOrder: 4,
    group: false,
    actsAtNight: true,
    usage: 'unlimited',
    canTargetDead: true,
    getPromptComponent() {
        return () => import('../components/roles/Witch/WitchPrompt.vue');
    },
    getResolveDetailsComponent() {
        return () => import('../components/roles/Witch/WitchResolveDetails.vue');
    },
    resolve(gameState: any, entry: any) {
        const id = Number(entry?.result?.targetId);
        if (!Number.isFinite(id) || id <= 0) return;
        const target = gameState.players.find((p: any) => p.id === id);
        if (!target || target.alive) return; // must be dead
        const seenTeam = gameState.roleMeta[target.roleId]?.visibleAsTeam || gameState.roleMeta[target.roleId]?.team;
        gameState.night.context.checks.push({ by: entry.playerId ?? 0, target: id, team: seenTeam });
    },
};

export default witch;



