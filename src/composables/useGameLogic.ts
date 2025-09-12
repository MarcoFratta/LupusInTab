import { computed, ref, watch } from 'vue';
import { useGameStore } from '../stores/game';
import { useRouter } from 'vue-router';
import { 
    beginReveal, 
    nextReveal, 
    startNextNight, 
    recordNightResult, 
    resolveNight, 
    continueToDay, 
    completeDay, 
    lynchPlayer, 
    setSindaco, 
    evaluateWinner,
    createEmptyState,
    initDefaultRolesCounts as engineInitDefaultRolesCounts,
    initSetupPlayers as engineInitSetupPlayers,
    resizePlayers as engineResizePlayers,
    normalizeRoleCounts as engineNormalizeRoleCounts,
    updateRoleCount as engineUpdateRoleCount,
    getMaxCountForRole as engineGetMaxCountForRole
} from '../core/engine';
import { NightPhaseManager } from '../core/managers/NightPhaseManager';
import { ROLE_LIST, ROLES } from '../roles';
import { shuffled } from '../utils/random';
import { loadGameState, saveGameState, clearSavedGame, loadPlayersSetup } from '../utils/storage';

export function useGameLogic() {
    const store = useGameStore();
    const router = useRouter();
    const state = store.state;

    const PHASES = {
        SETUP: 'setup',
        REVEAL: 'revealRoles',
        NIGHT: 'night',
        RESOLVE: 'resolve',
        DAY: 'day',
        PRE_NIGHT: 'preNight',
        END: 'end'
    } as const;

    function resetAll() {
        const currentSettings = { ...state.settings };
        
        // Reset the game state to empty
        Object.assign(store.state, createEmptyState());
        
        // Restore settings
        state.settings = currentSettings;
        state.showRoleResee = false;
        state.revealPhaseState = {
            showIntro: true,
            showPreNightInfo: false,
            showRoleReveal: false,
            roleRevealed: false
        };
        
        // Load saved players setup (this should NOT be cleared by clearSavedGame)
        const savedPlayers = loadPlayersSetup();
        if (savedPlayers && savedPlayers.players?.length) {
            state.setup.numPlayers = Math.max(4, Math.min(20, Number(savedPlayers.numPlayers) || 6));
            state.setup.players = savedPlayers.players.map((p: { name?: string }, i: number) => ({ name: (p?.name || `Giocatore ${i+1}`) }));
            
            if (savedPlayers.rolesCounts && typeof savedPlayers.rolesCounts === 'object') {
                state.setup.rolesCounts = { ...savedPlayers.rolesCounts };
            } else {
                engineInitDefaultRolesCounts(state as any);
            }
            
            if (savedPlayers.rolesEnabled && typeof savedPlayers.rolesEnabled === 'object') {
                state.setup.rolesEnabled = { ...savedPlayers.rolesEnabled };
            }
            
            engineNormalizeRoleCounts(state as any);
        } else {
            // If no saved players, initialize with default setup
            engineInitSetupPlayers(state as any);
        }
        
        // Clear the saved game state (but NOT the players setup)
        clearSavedGame();
    }

    async function resumeGame(saved: any) {
        if (saved && saved.phase !== PHASES.SETUP) {

            
            state.phase = saved.phase;
            state.nightNumber = saved.nightNumber;
            state.dayNumber = saved.dayNumber;
            state.players = saved.players || [];
            state.setup = saved.setup || { numPlayers: 6, players: [], rolesCounts: {}, rolesEnabled: {} };
            state.revealIndex = saved.revealIndex || 0;
            
            // Restore night state with proper Set reconstruction
            if (saved.night) {
                const calledRoles = saved.night.context?.calledRoles;
                
                const reconstructedCalledRoles = (() => {
                    if (Array.isArray(calledRoles)) {
                        return new Set(calledRoles);
                    } else if (calledRoles && typeof calledRoles === 'object') {
                        // Handle case where calledRoles was saved as an object with keys
                        const keys = Object.keys(calledRoles);
                        return new Set(keys);
                    } else {
                        return new Set();
                    }
                })();
                
                // Ensure calledRoles is synchronized with the turns array
                const turns = saved.night.turns || [];
                if (turns.length > 0) {
                    for (const turn of turns) {
                        if (turn.roleId) {
                            reconstructedCalledRoles.add(turn.roleId);
                        }
                    }
                }
                
                // Additional safety check: ensure all roles in turns are in calledRoles
                if (turns.length > 0 && reconstructedCalledRoles.size === 0) {
                    console.warn(`🌙 [WARNING] resumeGame - calledRoles is empty but turns exist, reconstructing from turns`);
                    for (const turn of turns) {
                        if (turn.roleId) {
                            reconstructedCalledRoles.add(turn.roleId);
                        }
                    }
                }
                
                state.night = {
                    turns: turns,
                    currentIndex: saved.night.currentIndex || 0,
                    results: saved.night.results || [],
                    summary: saved.night.summary || null,
                    context: saved.night.context ? {
                        pendingKills: saved.night.context.pendingKills || {},
                        savesBy: saved.night.context.savesBy || [],
                        checks: saved.night.context.checks || [],
                        calledRoles: Array.from(reconstructedCalledRoles)
                    } : null
                };
            } else {
                state.night = { turns: [], currentIndex: 0, results: [], context: null, summary: null };
            }
            
            state.settings = saved.settings || { skipFirstNightActions: true, enableSindaco: false, discussionTimerEnabled: false };
            state.sindacoId = saved.sindacoId || null;
            state.winner = saved.winner || null;
            state.lynchedHistory = saved.lynchedHistory || [];
            state.usedPowers = saved.usedPowers || {};
            // Always reset showRoleResee to false when resuming to ensure proper reveal flow
            state.showRoleResee = false;
            
            // Smart restoration of reveal phase state
            if (saved.revealPhaseState) {
                // When resuming, always reset the role reveal state to ensure proper flow
                state.revealPhaseState = {
                    ...saved.revealPhaseState,
                    showRoleReveal: false,
                    roleRevealed: false
                };
            } else {
                // If no saved state, determine the correct initial state based on current game state
                if (saved.phase === 'revealRoles') {
                    if (saved.revealIndex === 0) {
                        // At the beginning of reveal phase
                        state.revealPhaseState = {
                            showIntro: true,
                            showPreNightInfo: false,
                            showRoleReveal: false,
                            roleRevealed: false
                        };
                    } else if (saved.revealIndex >= saved.players.length) {
                        // At the end of reveal phase, ready for prenight
                        state.revealPhaseState = {
                            showIntro: false,
                            showPreNightInfo: true,
                            showRoleReveal: false,
                            roleRevealed: false
                        };
                    } else {
                        // In the middle of reveal phase
                        state.revealPhaseState = {
                            showIntro: false,
                            showPreNightInfo: false,
                            showRoleReveal: false,
                            roleRevealed: false
                        };
                    }
                } else {
                    // Default state for other phases
                    state.revealPhaseState = {
                        showIntro: true,
                        showPreNightInfo: false,
                        showRoleReveal: false,
                        roleRevealed: false
                    };
                }
            }
            
            state.custom = saved.custom || {};
            state.history = saved.history || {};
            state.nightDeathsByNight = saved.nightDeathsByNight || {};
            state.lynchedHistoryByDay = saved.lynchedHistoryByDay || {};
            state.groupings = saved.groupings || [];
            
            // If resuming to night phase, ensure proper night state restoration
            if (state.phase === PHASES.NIGHT && state.night?.context) {
                const { NightPhaseManager } = await import('../core/managers/NightPhaseManager');
                NightPhaseManager.resumeNight(state as any, ROLES as any);
            }

        }
    }

    function initDefaultRolesCounts() { 
        engineInitDefaultRolesCounts(state as any); 
    }

    function initSetupPlayers() { 
        engineInitSetupPlayers(state as any); 
    }

    function resizePlayers(nextCount: any) { 
        engineResizePlayers(state as any, Number(nextCount) || 0); 
    }

    function normalizeRoleCounts() { 
        engineNormalizeRoleCounts(state as any); 
    }

    function updateRoleCount(roleId: string, count: number) { 
        engineUpdateRoleCount(state as any, roleId, count); 
    }

    function getMaxCountForRole(roleId: string): number { 
        return engineGetMaxCountForRole(state as any, roleId); 
    }

    function navigateToPage(page: 'home' | 'roles' | 'players' | 'settings') {
        if (state.phase === PHASES.SETUP) {
            router.replace({ name: 'setup', params: { page } });
        }
    }

    function updatePlayersFromEditor(players: Array<{name: string}>, numPlayers: number) {
        state.setup.players = players;
        resizePlayers(numPlayers);
        normalizeRoleCounts();
    }

    function beginRevealLocal() { 
        beginReveal(state as any, ROLE_LIST as any, shuffled); 
    }

    function nextRevealLocal() { 
        nextReveal(state as any, () => beginNight()); 
    }

    function beginNight() { 
        console.log(`🌙 [DEBUG] useGameLogic.beginNight called - Current phase: ${state.phase}, Night: ${state.nightNumber}`);
        state.showRoleResee = false;
        startNextNight(state as any, ROLES as any); 
        console.log(`🌙 [DEBUG] useGameLogic.beginNight completed - New phase: ${state.phase}, Night: ${state.nightNumber}`);
    }

    function onPromptComplete(result: any) {
        console.log(`🌙 [DEBUG] useGameLogic.onPromptComplete called with result:`, result);
        
        recordNightResult(state as any, result);
        console.log(`🌙 [DEBUG] useGameLogic.onPromptComplete - After recordNightResult, phase: ${state.phase}`);
        
        if (state.phase === PHASES.NIGHT) {
            const nextTurn = NightPhaseManager.nextRole(state as any);
            if (!nextTurn) {
                console.log(`🌙 [DEBUG] useGameLogic.onPromptComplete - No more turns, transitioning to resolve`);
                state.phase = PHASES.RESOLVE;
                resolveNight(state as any, ROLES as any);
            }
        }
    }

    function resolveNightLocal() { 
        console.log(`🌙 [DEBUG] useGameLogic.resolveNight called - Current phase: ${state.phase}`);
        resolveNight(state as any, ROLES as any); 
        console.log(`🌙 [DEBUG] useGameLogic.resolveNight completed - Phase: ${state.phase}`);
    }

    function continueToDayLocal() {
        console.log(`🌙 [DEBUG] useGameLogic.continueToDay called - Current phase: ${state.phase}`);
        const winners = evaluateWinner(state as any, ROLES as any);
        if (winners) {
            console.log(`🌙 [DEBUG] useGameLogic.continueToDay - Winners found:`, winners);
            state.winner = winners as any;
            state.phase = PHASES.END as any;
            return;
        }
        continueToDay(state as any, ROLES as any);
        console.log(`🌙 [DEBUG] useGameLogic.continueToDay completed - Phase: ${state.phase}`);
    }

    function startNextNightLocal() { 
        console.log(`🌙 [DEBUG] useGameLogic.startNextNight called - Current phase: ${state.phase}, Night: ${state.nightNumber}`);
        startNextNight(state as any, ROLES as any); 
        console.log(`🌙 [DEBUG] useGameLogic.startNextNight completed - New phase: ${state.phase}, Night: ${state.nightNumber}`);
    }

    function quitAndReset() { 
        resetAll(); 
    }

    function onLynch(playerId: number) {
        lynchPlayer(state as any, playerId);
        completeDay(state as any, ROLES as any);
    }

    function onSkipDay() {
        completeDay(state as any, ROLES as any);
    }

    function onElectSindaco(playerId: number) {
        setSindaco(state as any, playerId);
    }

    return {
        PHASES,
        resetAll,
        resumeGame,
        initDefaultRolesCounts,
        initSetupPlayers,
        resizePlayers,
        normalizeRoleCounts,
        updateRoleCount,
        getMaxCountForRole,
        navigateToPage,
        updatePlayersFromEditor,
        beginRevealLocal,
        nextRevealLocal,
        beginNight,
        onPromptComplete,
        resolveNightLocal,
        continueToDayLocal,
        startNextNightLocal,
        quitAndReset,
        onLynch,
        onSkipDay,
        onElectSindaco
    };
}
