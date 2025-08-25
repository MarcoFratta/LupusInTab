import { ref, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useGameStore } from '../stores/game';
import { loadGameState, loadPlayersSetup, loadSettings, saveGameState, savePlayersSetup, saveSettings, clearSavedGame } from '../utils/storage';

export function useGameState() {
    const route = useRoute();
    const store = useGameStore();
    const state = store.state;

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

    const alivePlayers = computed(() => state.players.filter(p => p.alive));
    const wolvesAlive = computed(() => alivePlayers.value.filter(p => p.roleState?.realTeam === 'lupi'));
    const villagersAlive = computed(() => alivePlayers.value.filter(p => p.roleState?.realTeam !== 'lupi'));

    const roleCounts = computed(() => ({ ...state.setup.rolesCounts }));
    const totalRolesSelected = computed(() => Object.values(roleCounts.value).reduce((a: number, b: number) => a + (b || 0), 0));
    
    const canStart = computed(() => {
        const numWolves = roleCounts.value['lupo'] || 0;
        return state.setup.players.length >= 4 && numWolves >= 1 && totalRolesSelected.value === state.setup.numPlayers;
    });

    function initializeGameState() {
        if (!(state as any).settings) {
            (state as any).settings = { skipFirstNightActions: true, enableSindaco: false, discussionTimerEnabled: false };
        }
        
        if (!(state as any).setup?.rolesEnabled) {
            (state as any).setup.rolesEnabled = { lupo: true, villico: true, parassita: false } as any;
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
            }
        }

        const savedSettings = loadSettings();
        if (savedSettings && typeof savedSettings === 'object') {
            state.settings.skipFirstNightActions = !!savedSettings.skipFirstNightActions;
            state.settings.enableSindaco = !!savedSettings.enableSindaco;
            state.settings.discussionTimerEnabled = !!savedSettings.discussionTimerEnabled;
        }

        const p = route.params.page as string | undefined;
        const page = (p === 'players' || p === 'settings') ? p : 'home';
        currentPage.value = page as any;
    }

    function setupWatchers() {
        watch(
            () => state,
            () => {
                if (state.phase !== 'setup') {
                    saveGameState(state);
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

    return {
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
        toggleEventHistory
    };
}
