import { useGameStore } from '../stores/game';
import { useRouter } from 'vue-router';
import {
    createEmptyState as engineCreateEmptyState,
    initDefaultRolesCounts as engineInitDefaultRolesCounts,
    initSetupPlayers as engineInitSetupPlayers,
    resizePlayers as engineResizePlayers,
    normalizeRoleCounts as engineNormalizeRoleCounts,
    updateRoleCount as engineUpdateRoleCount,
    getMaxCountForRole as engineGetMaxCountForRole,
    beginReveal as engineBeginReveal,
    nextReveal as engineNextReveal,
    startNextNight as engineStartNextNight,
    recordNightResult as engineRecordNightResult,
    resolveNight as engineResolveNight,
    continueToDay as engineContinueToDay,
    lynchPlayer as engineLynchPlayer,
    completeDay as engineCompleteDay,
    setSindaco as engineSetSindaco,
    evaluateWinner as engineEvaluateWinner,
} from '../core/engine';
import { loadPlayersSetup, clearSavedGame } from '../utils/storage';
import { ROLE_LIST, ROLES } from '../roles';
import { shuffled } from '../utils/random';

export function useGameLogic() {
    const store = useGameStore();
    const router = useRouter();
    const state = store.state;

    const PHASES = {
        SETUP: 'setup',
        REVEAL: 'revealRoles',
        PRE_NIGHT: 'preNight',
        NIGHT: 'night',
        RESOLVE: 'resolve',
        DAY: 'day',
        END: 'end',
    };

    function resetAll() {
        const currentSettings = { ...state.settings };
        
        Object.assign(store.state, engineCreateEmptyState());
        
        state.settings = currentSettings;
        
        const savedPlayers = loadPlayersSetup();
        if (savedPlayers && savedPlayers.players?.length) {
            state.setup.numPlayers = Math.max(4, Math.min(20, Number(savedPlayers.numPlayers) || 6));
            state.setup.players = savedPlayers.players.map((p: { name?: string }, i: number) => ({ name: (p?.name || `Giocatore ${i+1}`) }));
            
            if (savedPlayers.rolesCounts && typeof savedPlayers.rolesCounts === 'object') {
                state.setup.rolesCounts = { ...savedPlayers.rolesCounts };
            } else {
                initDefaultRolesCounts();
            }
            
            if (savedPlayers.rolesEnabled && typeof savedPlayers.rolesEnabled === 'object') {
                state.setup.rolesEnabled = { ...savedPlayers.rolesEnabled };
            }
            
            normalizeRoleCounts();
        } else {
            initSetupPlayers();
        }
        clearSavedGame();
    }

    function resumeGame(saved: any) {
        if (saved && saved.phase !== PHASES.SETUP) {
            state.phase = saved.phase;
            state.nightNumber = saved.nightNumber;
            state.dayNumber = saved.dayNumber;
            state.players = saved.players || [];
            state.setup = saved.setup || { numPlayers: 6, players: [], rolesCounts: {}, rolesEnabled: {} };
            state.revealIndex = saved.revealIndex || 0;
            state.night = saved.night || { turns: [], currentIndex: 0, results: [], context: null, summary: null };
            state.settings = saved.settings || { skipFirstNightActions: true, enableSindaco: false, discussionTimerEnabled: false };
            state.sindacoId = saved.sindacoId || null;
            state.winner = saved.winner || null;
            state.lynchedHistory = saved.lynchedHistory || [];
            state.usedPowers = saved.usedPowers || {};
            
            state.custom = saved.custom || {};
            state.history = saved.history || {};
            state.nightDeathsByNight = saved.nightDeathsByNight || {};
            state.lynchedHistoryByDay = saved.lynchedHistoryByDay || {};
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

    function beginReveal() { 
        engineBeginReveal(state as any, ROLE_LIST as any, shuffled); 
    }

    function nextReveal() { 
        engineNextReveal(state as any, () => beginNight()); 
    }

    function beginNight() { 
        engineStartNextNight(state as any, ROLES as any); 
    }

    function onPromptComplete(result: any) {
        engineRecordNightResult(state as any, result);
        if (state.phase === PHASES.RESOLVE) engineResolveNight(state as any, ROLES as any);
    }

    function resolveNight() { 
        engineResolveNight(state as any, ROLES as any); 
    }

    function continueToDay() {
        const winners = engineEvaluateWinner(state as any, ROLES as any);
        if (winners) {
            state.winner = winners as any;
            state.phase = PHASES.END as any;
            return;
        }
        engineContinueToDay(state as any, ROLES as any);
    }

    function startNextNight() { 
        engineStartNextNight(state as any, ROLES as any); 
    }

    function quitAndReset() { 
        resetAll(); 
    }

    function onLynch(playerId: number) {
        engineLynchPlayer(state as any, playerId);
        engineCompleteDay(state as any, ROLES as any);
    }

    function onSkipDay() {
        engineCompleteDay(state as any, ROLES as any);
    }

    function onElectSindaco(playerId: number) {
        engineSetSindaco(state as any, playerId);
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
        beginReveal,
        nextReveal,
        beginNight,
        onPromptComplete,
        resolveNight,
        continueToDay,
        startNextNight,
        quitAndReset,
        onLynch,
        onSkipDay,
        onElectSindaco
    };
}
