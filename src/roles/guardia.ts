import type { RoleDef } from '../types';
import { useWinConditions } from '../utils/winConditions';
import {componentFactory} from "../utils/roleUtils";

const guardia: RoleDef = {
    id: 'guardia',
    name: 'Guardia',
    team: 'villaggio',
    visibleAsTeam: 'villaggio',
    countAs: 'villaggio',
    description: 'Ogni notte scegli un giocatore da proteggere dai lupi.',
    color: '#3b82f6',
	phaseOrder: "any",
    actsAtNight: "alive",
    effectType: 'optional',
    numberOfUsage: 'unlimited',
    affectedRoles: ['lupo'],
    getPromptComponent: componentFactory('Guardia', "prompt"),
    getResolveDetailsComponent: componentFactory('Guardia', "details"),
    resolve(gameState: any, action: any) {
        const id = Number(action?.data?.targetId || action?.result?.targetId);
        if (!Number.isFinite(id)) return;
        
        const pk = gameState.night.context.pendingKills as Record<number, Array<{ role: string }>>;
        if (pk && pk[id]) {
            pk[id] = pk[id].filter(kill => kill.role !== 'lupo');
            
            if (pk[id].length === 0) {
                delete pk[id];
            }
        }
        
        if (!Array.isArray(gameState.night.context.saves)) {
            gameState.night.context.saves = [];
        }
        
        gameState.night.context.saves.push({
            targetId: id,
            fromRoles: ['lupo'],
            byRole: 'guardia'
        });
        
        if (!Array.isArray(gameState.night.context.savesBy)) {
            gameState.night.context.savesBy = [];
        }
        gameState.night.context.savesBy.push({ 
            by: action.playerId ?? 0, 
            target: id,
            fromRoles: ['lupo']
        });
        
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
        const { villageWin } = useWinConditions();
        return villageWin(gameState);
    },
};

export default guardia;


