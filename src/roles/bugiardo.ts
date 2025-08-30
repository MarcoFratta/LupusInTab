import type { RoleDef } from '../types';
import { wolvesWin } from '../utils/winConditions';
import {componentFactory} from "../utils/roleUtils";

const bugiardo: RoleDef = {
	id: 'bugiardo',
	name: 'Bugiardo',
	team: 'lupi',
	icon: 'BugiardoIcon',
    score: 8,
    visibleAsTeam: 'villaggio',
    countAs: 'villaggio',
    description: 'Un aiutante dei lupi che può scoprire il ruolo di un morto una sola volta per partita.',
    color: '#dc2626',
    phaseOrder: "any",
    actsAtNight: "alive",
    effectType: 'optional',
    numberOfUsage: 1,
    startNight: 2,
    canTargetDead: true,
    getPromptComponent: componentFactory('Bugiardo', "prompt"),
    getResolveDetailsComponent: componentFactory('Bugiardo', "details"),
    resolve(gameState: any, action: any) {
        if (gameState.nightNumber < this.startNight!) return;
        
        const targetId = Number(action?.data?.targetId || action?.result?.targetId);
        if (!Number.isFinite(targetId)) return;
        
        const target = gameState.players.find((p: any) => p.id === targetId);
        if (!target) return;
        
        return {
            type: 'bugiardo_action',
            nightNumber: gameState.nightNumber,
            roleId: 'bugiardo',
            playerIds: action.playerIds || [],
            targetId: targetId,
            discoveredRole: target.roleId,
            discoveredRealTeam: target.roleState?.realTeam,
            data: action.data
        };
    },
    checkWin(gameState: any) {
        return wolvesWin(gameState);
    },
};

export default bugiardo;
