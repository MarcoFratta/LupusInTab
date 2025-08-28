import type { RoleDef } from '../types';
import { useWinConditions } from '../utils/winConditions';
import {componentFactory} from "../utils/roleUtils";

const veggente: RoleDef = {
	id: 'veggente',
	name: 'Veggente',
	team: 'villaggio',
	icon: 'VeggenteIcon',
    score: 7,
    visibleAsTeam: 'villaggio',
    countAs: 'villaggio',
    description: 'Ogni notte scopre la fazione di un giocatore.',
    color: '#8b5cf6',
    phaseOrder: "any",
    actsAtNight: "alive",
    effectType: 'required',
    numberOfUsage: 'unlimited',
    getPromptComponent: componentFactory('Veggente', "prompt"),
    getResolveDetailsComponent: componentFactory('Veggente', "details"),
    resolve(gameState: any, action: any) {
        const targetId = Number(action?.data?.targetId || action?.result?.targetId);
        if (!Number.isFinite(targetId)) return;
        
        const target = gameState.players.find((p: any) => p.id === targetId);
        
        return {
            type: 'veggente_action',
            nightNumber: gameState.nightNumber,
            roleId: 'veggente',
            playerIds: action.playerIds || [],
            targetId: targetId,
            discoveredFaction: target ? (target.roleState?.visibleAsTeam || target.roleState?.realTeam) : undefined,
            data: action.data
        };
    },
    checkWin(gameState: any) {
        const { villageWin } = useWinConditions();
        return villageWin(gameState);
    },
};

export default veggente;


