import type { RoleDef } from '../types';
import { addToHistory } from '../utils/roleUtils';
import {useWinConditions} from "../utils/winConditions";

const witch: RoleDef = {
    id: 'witch',
    name: 'Medium',
    team: 'villaggio',
    visibleAsTeam: 'villaggio',
    countAs: 'villaggio',
    description: 'Ogni notte scegli un giocatore per scoprire il suo ruolo.',
    color: '#eab308',
    phaseOrder: "any",
    group: false,
    actsAtNight: "alive",
    usage: 'unlimited',
    getPromptComponent() {
        return () => import('../components/roles/Witch/WitchPrompt.vue');
    },
    getResolveDetailsComponent() {
        return () => import('../components/resolve-details/WitchResolveDetails.vue');
    },
    resolve(gameState: any, action: any) {
        const id = Number(action?.data?.targetId);
        if (!Number.isFinite(id) || id <= 0) return;
        const target = gameState.players.find((p: any) => p.id === id);
        if (!target) return;
        const seenTeam = target.roleState?.visibleAsTeam || target.roleState?.realTeam;
        gameState.night.context.checks.push({ by: action.playerId ?? 0, target: id, team: seenTeam });
        // Dog dies if Medium checks his role (special rule)
        if (target.roleId === 'dog') {
            const pk = gameState.night.context.pendingKills as Record<number, Array<{ role: string; notSavable: boolean }>>;
            if (!pk[id]) pk[id] = [];
            pk[id].push({ role: 'medium', notSavable: false });
        }
        // Log to history
        addToHistory(gameState, action.playerId || 0, gameState.nightNumber, 'witch_check', {
            target: id,
            discoveredFaction: seenTeam
        });
    },
    checkWin(gameState: any) {
        const { villageWin } = useWinConditions();
        return villageWin(gameState);
    },
};

export default witch;



