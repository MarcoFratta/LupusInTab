import type { RoleDef } from '../types';
import { addToHistory } from '../utils/roleUtils';

const dog: RoleDef = {
    id: 'dog',
    name: 'Lupo Mannaro',
    team: 'mannari',
    revealAlliesWithinRole: true,
    visibleAsTeam: 'lupi',
    countAs: 'lupi',
    description: 'Gioca da solo. Vince se restate in due (tu e un altro). I lupi non possono ucciderti. Di notte dichiara un giocatore e un ruolo: se indovini, muore. Se il Veggente indaga il tuo ruolo, muori.',
    color: '#6366f1',
    phaseOrder: "any",
    group: false,
    actsAtNight: "alive",
    usage: 'requiredEveryNight',
    immuneToKillers: ['wolf'],
    getPromptComponent() {
        return () => import('../components/roles/Dog/DogPrompt.vue');
    },
    getResolveDetailsComponent(gameState: any, action: any) {
        return () => import('../components/resolve-details/DogResolveDetails.vue');
    },
    passiveEffect(gameState: any, player: any) {
        // Handle immunity: remove any wolf kills targeting this Lupo Mannaro
        // This runs every night regardless of blocking status
        const pk = gameState.night.context.pendingKills as Record<number, Array<{ role: string; notSavable: boolean }>>;
        if (pk[player.id]) {
            // Remove all wolf kills targeting this Lupo Mannaro (wolves can't kill him)
            pk[player.id] = pk[player.id].filter(kill => kill.role !== 'wolf');
            
            // If no kills remain, remove the entry entirely
            if (pk[player.id].length === 0) {
                delete pk[player.id];
            }
        }
    },
    resolve(gameState: any, action: any) {
        const targetId = Number(action?.data?.targetId);
        const roleId = String(action?.data?.roleId || '');
        const dogId = action.playerId || 0;
        
        // Then, handle his own attack if he made a correct guess
        if (!Number.isFinite(targetId) || targetId <= 0 || !roleId) return;
        const target = gameState.players.find((p: any) => p.id === targetId);
        if (!target) return;
        const isCorrect = target.roleId === roleId;
        if (isCorrect) {
            const pk = gameState.night.context.pendingKills as Record<number, Array<{ role: string; notSavable: boolean }>>;
            if (!pk[targetId]) pk[targetId] = [];
            pk[targetId].push({ role: 'dog', notSavable: true });
        }
        
        // Log to history
        addToHistory(gameState, action.playerId || 0, gameState.nightNumber, 'dog_declare', {
            target: targetId,
            declaredRole: roleId,
            correct: isCorrect
        });
    },
    checkWin(gameState: any) {
        const alive = gameState.players.filter((p: any) => p.alive);
        const anyDogAlive = alive.some((p: any) => p.roleId === 'dog');
        return anyDogAlive && alive.length === 2;
    },
    checkWinConstraint(gameState: any) {
        // If LupoMannaro is alive and more than 2 players remain, block any win
        const alive = gameState.players.filter((p: any) => p.alive);
        const anyDogAlive = alive.some((p: any) => p.roleId === 'dog');
        return anyDogAlive && alive.length > 2;
    },
};

export default dog;




