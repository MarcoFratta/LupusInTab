import type { RoleDef } from '../types';

const dog: RoleDef = {
    id: 'dog',
    name: 'LupoMannaro',
    team: 'mannari',
    visibleAsTeam: 'lupi',
    description: 'Gioca da solo. Vince se restate in due (tu e un altro). Conta come lupi per la parità. I lupi non possono ucciderti. Di notte dichiara un giocatore e un ruolo: se indovini, muore. Se il Veggente indaga il tuo ruolo, muori.',
    color: '#10b981',
    phaseOrder: 2,
    group: false,
    actsAtNight: true,
    usage: 'unlimited',
    countsAsWolfForWin: true,
    immuneToKillers: ['wolf'],
    getPromptComponent() {
        return () => import('../components/roles/shared/PromptDeclare.vue');
    },
    getResolveDetailsComponent() {
        return () => import('../components/roles/shared/DeclareResolveDetails.vue');
    },
    resolve(gameState: any, entry: any) {
        const targetId = Number(entry?.result?.targetId);
        const roleId = String(entry?.result?.roleId || '');
        if (!Number.isFinite(targetId) || targetId <= 0 || !roleId) return;
        const target = gameState.players.find((p: any) => p.id === targetId);
        if (!target) return;
        if (target.roleId === roleId) {
            const pk = gameState.night.context.pendingKills as Record<number, string[]>;
            if (!pk[targetId]) pk[targetId] = [];
            if (!pk[targetId].includes('dog')) pk[targetId].push('dog');
        }
    },
    checkWin(gameState: any) {
        const alive = gameState.players.filter((p: any) => p.alive);
        const anyDogAlive = alive.some((p: any) => p.roleId === 'dog');
        return anyDogAlive && alive.length === 2;
    },
};

export default dog;



