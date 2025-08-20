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
	phaseOrder: "any", // Acts early to protect players
    group: false,
    actsAtNight: "alive",
    effectType: 'optional',
    numberOfUsage: 'unlimited',
    affectedRoles: ['wolf'],
    getPromptComponent() {
        return () => import('../components/roles/Doctor/DoctorPrompt.vue');
    },
    getResolveDetailsComponent() {
        return () => import('../components/resolve-details/DoctorResolveDetails.vue');
    },
    resolve(gameState: any, action: any) {
        // Handle both action.data.targetId and action.result.targetId formats
        const id = Number(action?.data?.targetId || action?.result?.targetId);
        if (!Number.isFinite(id)) return;
        
        // Direct manipulation of pending kills: remove wolf kills from protected target
        const pk = gameState.night.context.pendingKills as Record<number, Array<{ role: string }>>;
        if (pk && pk[id]) {
            // Remove all wolf kills (Guardia can only save from wolf kills)
            pk[id] = pk[id].filter(kill => kill.role !== 'wolf');
            
            // If no kills remain, remove the entry entirely
            if (pk[id].length === 0) {
                delete pk[id];
            }
        }
        
        // Initialize saves array if it doesn't exist
        if (!Array.isArray(gameState.night.context.saves)) {
            gameState.night.context.saves = [];
        }
        
        // Add save to saves list
        gameState.night.context.saves.push({
            targetId: id,
            fromRoles: ['wolf'],
            byRole: 'guardia'
        });
        
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


