import type { RoleDef } from '../types';
import { useWinConditions } from '../utils/winConditions';
import { addToHistory } from '../utils/roleUtils';

const guardia: RoleDef = {
    id: 'guardia',
    name: 'Guardia',
    team: 'villaggio',
    visibleAsTeam: 'villaggio',
    countAs: 'villaggio',
    description: 'Ogni notte scegli un giocatore da proteggere dai lupi.',
    color: '#3b82f6',
    	phaseOrder: 0, // Acts early to protect players
    group: false,
    actsAtNight: "alive",
    usage: 'unlimited',
    affectedRoles: ['wolf'],
    getPromptComponent() {
        return () => import('../components/roles/Doctor/DoctorPrompt.vue');
    },
    getResolveDetailsComponent() {
        return () => import('../components/resolve-details/DoctorResolveDetails.vue');
    },
    resolve(gameState: any, action: any) {
        const id = Number(action?.data?.targetId);
        if (!Number.isFinite(id)) return;
        
        // Direct manipulation of pending kills: remove wolf kills from protected target
        const pk = gameState.night.context.pendingKills as Record<number, Array<{ role: string; notSavable: boolean }>>;
        if (pk[id]) {
            // Remove all wolf kills that are savable (not notSavable)
            pk[id] = pk[id].filter(kill => !(kill.role === 'wolf' && !kill.notSavable));
            
            // If no kills remain, remove the entry entirely
            if (pk[id].length === 0) {
                delete pk[id];
            }
        }
        
        // Also track who saved whom for display purposes
        if (!Array.isArray(gameState.night.context.savesBy)) {
            gameState.night.context.savesBy = [];
        }
        gameState.night.context.savesBy.push({ 
            by: action.playerId ?? 0, 
            target: id,
            fromRoles: ['wolf'] // Guardia protects from wolf kills
        });
        
        // Log to history
        addToHistory(gameState, action.playerId || 0, gameState.nightNumber, 'doctor_protection', {
            target: id
        });
    },
    checkWin(gameState: any) {
        const { villageWin } = useWinConditions();
        return villageWin(gameState);
    },
};

export default guardia;


