import type { RoleDef } from '../types';
import { villageWin } from '../utils/winConditions';
import {componentFactory} from "../utils/roleUtils";

const medium: RoleDef = {
    id: 'medium',
    name: 'Medium',
    team: 'villaggio',
    visibleAsTeam: 'villaggio',
    score: 5,
    countAs: 'villaggio',
    description: 'Ogni notte comunica con un morto per scoprirne la fazione.',
    color: '#f3e8ff',
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
        
        // Record the check action in context
        if (!gameState.night.context.checks) {
            gameState.night.context.checks = [];
        }
        
        gameState.night.context.checks.push({
            by: action.playerId,
            target: id,
            discoveredFaction: seenTeam
        });
        
        // Special rule: Medium dies if investigating lupomannaro
        if (target.roleId === 'lupomannaro') {
            if (!gameState.night.context.pendingKills[action.playerId]) {
                gameState.night.context.pendingKills[action.playerId] = [];
            }
            gameState.night.context.pendingKills[action.playerId].push({
                role: 'medium'
            });
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
        return villageWin(gameState);
    },
};

export default medium;



