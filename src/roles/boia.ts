import type { RoleDef } from '../types';

const hangman: RoleDef = {
    id: 'hangman',
    name: 'Boia',
    team: 'lupi',
    visibleAsTeam: 'lupi',
    description: 'Una volta per partita, di notte: dichiara un giocatore e un ruolo. Se indovini, muore; altrimenti muori tu. I lupi ti conoscono; tu non conosci loro.',
    color: '#f97316',
    phaseOrder: 2,
    group: false,
    actsAtNight: true,
    usage: 'once',
    // Wolves should see Hangman as ally including role; Hangman does not see wolves
    knownToTeams: ['lupi'],
    revealToAllies: 'role',
    revealAlliesWithinTeam: false,
    minCount: 1,
    maxCount: 1,
    getPromptComponent() {
        return () => import('../components/roles/Hangman/HangmanPrompt.vue');
    },
    getResolveDetailsComponent() {
        return () => import('../components/roles/Hangman/HangmanResolveDetails.vue');
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
            if (!pk[targetId].includes('hangman')) pk[targetId].push('hangman');
        } else {
            const pk = gameState.night.context.pendingKills as Record<number, string[]>;
            const selfId = (entry as any).playerId as number;
            if (!pk[selfId]) pk[selfId] = [];
            if (!pk[selfId].includes('hangman')) pk[selfId].push('hangman');
        }
    },
};

export default hangman;



