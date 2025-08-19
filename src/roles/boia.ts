import type { RoleDef } from '../types';
import {useWinConditions} from "../utils/winConditions";
import { addToHistory } from '../utils/roleUtils';

const hangman: RoleDef = {
    id: 'hangman',
    name: 'Boia',
    team: 'lupi',
    visibleAsTeam: 'lupi',
    countAs: 'villaggio',
    description: 'Di notte scegli un giocatore da impiccare. Non può essere salvato.',
    color: '#7c3aed',
    phaseOrder: 2,
    group: false,
    actsAtNight: "alive",
    usage: 'unlimited',
    minCount: 1,
    maxCount: (state: any) => state?.setup?.numPlayers || 0,
    getPromptComponent() {
        return () => import('../components/roles/Hangman/HangmanPrompt.vue');
    },
    getResolveDetailsComponent() {
        return () => import('../components/resolve-details/HangmanResolveDetails.vue');
    },
    resolve(gameState: any, action: any) {
        const id = Number(action?.data?.targetId);
        const declaredRoleId = action?.data?.roleId ? String(action.data.roleId) : '';
        if (!Number.isFinite(id)) return;
        
        // Find the target player
        const targetPlayer = gameState.players.find((p: any) => p.id === id);
        if (!targetPlayer) return;
        
        // Check if the guess is correct
        const isCorrect = targetPlayer.roleId === declaredRoleId;
        
        const pk = gameState.night.context.pendingKills as Record<number, Array<{ role: string; notSavable: boolean }>>;
        
        if (isCorrect) {
            // Correct guess: kill the target (cannot be saved)
            if (!pk[id]) pk[id] = [];
            pk[id].push({ role: 'hangman', notSavable: true });
        } else {
            // Incorrect guess: kill the Boia himself
            const boiaId = action.playerId || 0;
            if (!pk[boiaId]) pk[boiaId] = [];
            pk[boiaId].push({ role: 'hangman', notSavable: true });
        }

        // Log to history with the result
        addToHistory(gameState, action.playerId || 0, gameState.nightNumber, 'hangman_execute', {
            target: id,
            roleId: declaredRoleId,
            correct: isCorrect
        });
    },
    checkWin(gameState: any) {
        const { villageWin } = useWinConditions();
        return villageWin(gameState);
    },
};

export default hangman;



