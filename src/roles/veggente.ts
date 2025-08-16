import type { RoleDef } from '../types';
import { useWinConditions } from '../utils/winConditions';

const medium: RoleDef = {
    id: 'medium',
    name: 'Veggente',
    team: 'village',
    visibleAsTeam: 'village',
    description: 'Di notte, indaga un giocatore per conoscerne la fazione (come appare).',
    color: '#eab308',
    phaseOrder: 4,
    group: false,
    actsAtNight: true,
    usage: 'unlimited',
    getPromptComponent() {
        return () => import('../components/roles/Medium/MediumPrompt.vue');
    },
    getResolveDetailsComponent() {
        return () => import('../components/roles/Medium/MediumResolveDetails.vue');
    },
    resolve(gameState: any, entry: any) {
        const id = Number(entry?.result?.targetId);
        if (!Number.isFinite(id) || id <= 0) return;
        const target = gameState.players.find((p: any) => p.id === id);
        if (!target) return;
        const seenTeam = gameState.roleMeta[target.roleId]?.visibleAsTeam || gameState.roleMeta[target.roleId]?.team;
        gameState.night.context.checks.push({ by: entry.playerId ?? 0, target: id, team: seenTeam });
        // Dog dies if Medium checks his role (special rule)
        if (target.roleId === 'dog') {
            const pk = gameState.night.context.pendingKills as Record<number, string[]>;
            if (!pk[id]) pk[id] = [];
            if (!pk[id].includes('medium')) pk[id].push('medium');
        }
    },
    checkWin(gameState: any) {
        const { villageWin } = useWinConditions();
        return villageWin(gameState);
    },
};

export default medium;


