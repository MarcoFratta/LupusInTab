import type { RoleDef } from '../types';
import { villageWin } from '../utils/winConditions';
import {componentFactory} from "../utils/roleUtils";

const guardia: RoleDef = {
    id: 'guardia',
    name: 'Guardia',
    team: 'villaggio',
    score: 5,
    visibleAsTeam: 'villaggio',
    countAs: 'villaggio',
    description: 'Ogni notte protegge un giocatore dagli attacchi dei lupi.',
    color: '#8b5cf6',
	phaseOrder: "any",
    actsAtNight: "alive",
    effectType: 'required',
    numberOfUsage: 'unlimited',
    getPromptComponent: componentFactory('Guardia', "prompt"),
    getResolveDetailsComponent: componentFactory('Guardia', "details"),
    resolve(gameState: any, action: any) {
        const id = Number(action?.data?.targetId || action?.result?.targetId);
        if (!Number.isFinite(id)) return;
        
        const pk = gameState.night.context.pendingKills as Record<number, Array<{ role: string }>>;
        if (pk && pk[id]) {
            const lupoKills = pk[id].filter(kill => kill.role === 'lupo');
            pk[id] = pk[id].filter(kill => kill.role !== 'lupo');
            
            if (pk[id].length === 0) {
                delete pk[id];
            }
            
            // Record the save action in context
            if (lupoKills.length > 0) {
                if (!gameState.night.context.saves) {
                    gameState.night.context.saves = [];
                }
                if (!gameState.night.context.savesBy) {
                    gameState.night.context.savesBy = [];
                }
                
                gameState.night.context.saves.push({
                    targetId: id,
                    fromRoles: lupoKills.map(kill => kill.role)
                });
                
                gameState.night.context.savesBy.push({
                    by: action.playerId,
                    target: id,
                    fromRoles: lupoKills.map(kill => kill.role)
                });
            }
        }
        
        return {
            type: 'guardia_action',
            nightNumber: gameState.nightNumber,
            roleId: 'guardia',
            playerIds: action.playerIds || [],
            targetId: id,
            data: action.data
        };
    },
    checkWin(gameState: any) {
        return villageWin(gameState);
    },
};

export default guardia;


