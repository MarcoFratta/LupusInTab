import type { RoleDef } from '../types';
import {useWinConditions} from "../utils/winConditions";
import {componentFactory} from "../utils/roleUtils";

const medium: RoleDef = {
    id: 'medium',
    name: 'Medium',
    team: 'villaggio',
    visibleAsTeam: 'villaggio',
    countAs: 'villaggio',
    description: 'Ogni notte scegli un giocatore morto per scoprire la sua fazione.',
    color: '#eab308',
    phaseOrder: "any",
    actsAtNight: "alive",
    effectType: 'required',
    numberOfUsage: 'unlimited',
    getPromptComponent: componentFactory('Medium', "prompt"),
    getResolveDetailsComponent: componentFactory('Medium', "details"),
    resolve(gameState: any, action: any) {
        const id = Number(action?.data?.targetId || action?.result?.targetId);
        if (!Number.isFinite(id) || id <= 0) return;
        const target = gameState.players.find((p: any) => p.id === id);
        if (!target) return;
        const seenTeam = target.roleState?.visibleAsTeam || target.roleState?.realTeam;
        
        if (!Array.isArray(gameState.night.context.checks)) {
            gameState.night.context.checks = [];
        }
        gameState.night.context.checks.push({ by: action.playerId ?? 0, target: id, team: seenTeam });
        
        if (target.roleId === 'lupomannaro') {
            const pk = gameState.night.context.pendingKills as Record<number, Array<{ role: string }>>;
            if (!pk[id]) pk[id] = [];
            pk[id].push({ role: 'medium' });
        }
        
        return {
            type: 'medium_action',
            nightNumber: gameState.nightNumber,
            roleId: 'medium',
            playerIds: action.playerIds || [],
            targetId: id,
            discoveredFaction: seenTeam,
            data: action.data
        };
    },
    checkWin(gameState: any) {
        const { villageWin } = useWinConditions();
        return villageWin(gameState);
    },
};

export default medium;



