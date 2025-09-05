import { ref, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useGameStore } from '../stores/game';
import { useGameAPI } from './useGameAPI';
import { loadGameState, loadPlayersSetup, loadSettings, saveGameState, savePlayersSetup, saveSettings, clearSavedGame } from '../utils/storage';
import { initSetupPlayers } from '../core/engine';
import { DEFAULT_ROLES_CONFIG } from '../config/defaultRoles';

/**
 * Refactored useGameState composable using the new Game API
 * This demonstrates how to eliminate props drilling and use centralized state access
 */
export function useGameState() {
    const route = useRoute();
    const store = useGameStore();
    const state = store.state;
    
    // Use the Game API for all game state access
    const gameAPI = useGameAPI();

    const resumeAvailable = ref(false);
    const currentPage = ref<'home' | 'roles' | 'players' | 'settings'>('home');
    const showEventHistory = ref(false);

    const routePage = computed(() => {
        const p = route.params.page as string | undefined;
        return (p === 'players' || p === 'settings' || p === 'roles') ? p : 'home';
    });

    const isHome = computed(() => routePage.value === 'home');
    const isRoles = computed(() => routePage.value === 'roles');
    const isPlayers = computed(() => routePage.value === 'players');
    const isSettings = computed(() => routePage.value === 'settings');
    const isRoleDetails = computed(() => route.name === 'role-details');

    // Use Game API instead of direct state access
    const alivePlayers = computed(() => gameAPI.getAlivePlayers.value);
    const wolvesAlive = computed(() => gameAPI.getAlivePlayersByTeam('lupi'));
    const villagersAlive = computed(() => gameAPI.getAlivePlayersByTeam('villaggio'));

    const roleCounts = computed(() => ({ ...state.setup.rolesCounts }));
    const totalRolesSelected = computed(() => Object.values(roleCounts.value).reduce((a: number, b: number) => a + (b || 0), 0));
    
    const canStart = computed(() => {
        const numWolves = roleCounts.value['lupo'] || 0;
        const totalsMatch = totalRolesSelected.value === state.setup.players.length;
        
        const hasDuplicateNames = (() => {
            const names = state.setup.players.map((p: any) => p.name?.trim().toLowerCase()).filter(Boolean);
            const duplicates = names.filter((name: string, index: number) => names.indexOf(name) !== index);
            return duplicates.length > 0;
        })();
        
        return state.setup.players.length >= 4 && numWolves >= 1 && totalsMatch && !hasDuplicateNames;
    });

    function initializeGameState() {
        if (!(state as any).settings) {
            (state as any).settings = { skipFirstNightActions: true, enableSindaco: false, discussionTimerEnabled: false };
        }
        
        if (!(state as any).setup?.rolesEnabled) {
            (state as any).setup.rolesEnabled = { ...DEFAULT_ROLES_CONFIG.rolesEnabled };
        }

        if (state.phase === 'setup') {
            const savedPlayers = loadPlayersSetup();
            if (savedPlayers && Array.isArray(savedPlayers.players) && savedPlayers.players.length > 0) {
                state.setup.numPlayers = Math.max(4, Math.min(20, Number(savedPlayers.numPlayers) || 6));
                state.setup.players = savedPlayers.players.map((p: { name?: string }, i: number) => ({ name: (p?.name || `Giocatore ${i+1}`) }));
                
                if (savedPlayers.rolesCounts && typeof savedPlayers.rolesCounts === 'object') {
                    state.setup.rolesCounts = { ...savedPlayers.rolesCounts };
                }
                
                if (savedPlayers.rolesEnabled && typeof savedPlayers.rolesEnabled === 'object') {
                    state.setup.rolesEnabled = { ...savedPlayers.rolesEnabled };
                }
            } else {
                initSetupPlayers(state);
            }
        }

        const savedSettings = loadSettings();
        if (savedSettings && typeof savedSettings === 'object') {
            state.settings.skipFirstNightActions = !!savedSettings.skipFirstNightActions;
            state.settings.enableSindaco = !!savedSettings.enableSindaco;
            state.settings.discussionTimerEnabled = !!savedSettings.discussionTimerEnabled;
            state.settings.difficolta = !!savedSettings.difficolta;
        }

        const p = route.params.page as string | undefined;
        const page = (p === 'players' || p === 'settings') ? p : 'home';
        currentPage.value = page as any;
    }

    function setupWatchers() {
        // Watch specific properties instead of the entire state to avoid Set corruption
        watch(
            () => ({
                phase: state.phase,
                nightNumber: state.nightNumber,
                dayNumber: state.dayNumber,
                players: state.players,
                setup: state.setup,
                revealIndex: state.revealIndex,
                settings: state.settings,
                sindacoId: state.sindacoId,
                winner: state.winner,
                lynchedHistory: state.lynchedHistory,
                usedPowers: state.usedPowers,
                showRoleResee: state.showRoleResee,
                groupings: state.groupings,
                custom: state.custom,
                history: state.history,
                revealPhaseState: state.revealPhaseState,
                nightDeathsByNight: state.nightDeathsByNight,
                lynchedHistoryByDay: state.lynchedHistoryByDay
            }),
            () => {
                if (state.phase !== 'setup') {
                    // Convert Set to array before saving for proper serialization
                    const stateToSave = { ...state };
                    if (stateToSave.night?.context?.calledRoles instanceof Set) {
                        stateToSave.night.context.calledRoles = Array.from(stateToSave.night.context.calledRoles);
                    }
                    saveGameState(stateToSave);
                }
            },
            { deep: true }
        );

        watch(
            () => ({ 
                players: state.setup.players.map((p: { name: string }) => p.name), 
                numPlayers: state.setup.numPlayers,
                rolesCounts: state.setup.rolesCounts,
                rolesEnabled: state.setup.rolesEnabled
            }),
            () => {
                savePlayersSetup({
                    numPlayers: state.setup.numPlayers,
                    players: state.setup.players.map((p: { name: string }) => ({ name: p.name })),
                    rolesCounts: { ...state.setup.rolesCounts },
                    rolesEnabled: { ...state.setup.rolesEnabled }
                });
            },
            { deep: true }
        );

        watch(
            () => state.settings,
            () => {
                saveSettings({
                    skipFirstNightActions: !!state.settings.skipFirstNightActions,
                    enableSindaco: !!state.settings.enableSindaco,
                    discussionTimerEnabled: !!state.settings.discussionTimerEnabled,
                });
            },
            { deep: true }
        );

        watch(() => state.phase, (newPhase) => {
            if (newPhase === 'setup') {
                const saved = loadGameState();
                const hasSavedGame = !!(saved && saved.phase !== 'setup');
                resumeAvailable.value = hasSavedGame;
            }
        }, { immediate: true });
    }

    function checkForSavedGames() {
        const saved = loadGameState();
        const hasSavedGame = !!(saved && saved.phase !== 'setup');
        resumeAvailable.value = hasSavedGame;
        return { hasSavedGame, saved };
    }

    function dismissResumeBanner() {
        clearSavedGame();
        resumeAvailable.value = false;
    }

    function toggleEventHistory() {
        showEventHistory.value = !showEventHistory.value;
    }

    // New methods using Game API
    function getPlayersByRole(roleId: string) {
        return gameAPI.getPlayersByRole(roleId);
    }

    function getAlivePlayersByRole(roleId: string) {
        return gameAPI.getAlivePlayersByRole(roleId);
    }

    function hasRole(playerId: number, roleId: string, considerGroupings: boolean = false) {
        return gameAPI.hasRole(playerId, roleId, considerGroupings);
    }

    function getPlayer(playerId: number) {
        return gameAPI.getPlayer(playerId);
    }

    function getWinningTeams() {
        return gameAPI.getWinningTeams();
    }

    return {
        // Existing methods
        resumeAvailable,
        currentPage,
        showEventHistory,
        routePage,
        isHome,
        isRoles,
        isPlayers,
        isSettings,
        isRoleDetails,
        alivePlayers,
        wolvesAlive,
        villagersAlive,
        roleCounts,
        totalRolesSelected,
        canStart,
        initializeGameState,
        setupWatchers,
        checkForSavedGames,
        dismissResumeBanner,
        toggleEventHistory,
        
        // New Game API methods
        getPlayersByRole,
        getAlivePlayersByRole,
        hasRole,
        getPlayer,
        getWinningTeams,
        
        // Expose Game API for advanced usage
        gameAPI
    };
}
