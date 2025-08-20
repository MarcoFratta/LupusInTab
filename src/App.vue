<script setup lang="ts">
import { ref, reactive, computed, watch, defineAsyncComponent, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ROLES, ROLE_LIST } from './roles/index';
// @ts-ignore - ambient module declarations provided in env.d.ts
import { saveGameState, loadGameState, clearSavedGame, savePlayersSetup, loadPlayersSetup, saveSettings, loadSettings } from './utils/storage';
import PhaseReveal from './components/PhaseReveal.vue';
import PhaseNight from './components/PhaseNight.vue';
import PhaseResolve from './components/PhaseResolve.vue';
import PhasePreNight from './components/PhasePreNight.vue';
import PhaseDay from './components/PhaseDay.vue';
import SetupHome from './components/SetupHome.vue';
import SetupPlayers from './components/SetupPlayers.vue';
import SetupRoles from './components/SetupRoles.vue';
import SetupSettings from './components/SetupSettings.vue';
import PlayerRoleList from './components/ui/PlayerRoleList.vue';
import RoleDetails from './components/RoleDetails.vue';
import EventHistory from './components/EventHistory.vue';
import SecondaryButton from './components/ui/SecondaryButton.vue';
import PrimaryButton from './components/ui/PrimaryButton.vue';
import GhostButton from './components/ui/GhostButton.vue';
import ButtonGroup from './components/ui/ButtonGroup.vue';
// @ts-ignore - ambient module declarations provided in env.d.ts
import { shuffled } from './utils/random';
import { useGameStore } from './stores/game';
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
    beginNight as engineBeginNight,
    recordNightResult as engineRecordNightResult,
    resolveNight as engineResolveNight,
    continueToDay as engineContinueToDay,
    startNextNight as engineStartNextNight,
    lynchPlayer as engineLynchPlayer,
    completeDay as engineCompleteDay,
    setSindaco as engineSetSindaco,
    evaluateWinner as engineEvaluateWinner,
} from './core/engine';

const PHASES = {
	SETUP: 'setup',
	REVEAL: 'revealRoles',
    PRE_NIGHT: 'preNight',
	NIGHT: 'night',
	RESOLVE: 'resolve',
	DAY: 'day',
	END: 'end',
};

const savedGameAtBoot = loadGameState();
const resumeAvailable = ref(!!(savedGameAtBoot && (savedGameAtBoot as any).phase !== PHASES.SETUP));

// Debug logging


const route = useRoute();
const router = useRouter();
const currentPage = ref<'home' | 'roles' | 'players' | 'settings'>('home');
const showEventHistory = ref(false);
const store = useGameStore();
const state = store.state;
// Ensure settings exist even if state was restored from an older schema
if (!(state as any).settings) {
    (state as any).settings = { skipFirstNightActions: true, enableSindaco: false, discussionTimerEnabled: false };
}
// Ensure rolesEnabled exists in setup for older saved states
if (!(state as any).setup?.rolesEnabled) {
    // Default active roles: only Villager and Wolf
    (state as any).setup.rolesEnabled = { wolf: true, villager: true } as any;
}
// Ensure eventHistory exists for older saved states
if (!state.eventHistory) {
    state.eventHistory = { nights: [], days: [] };
}
const routePage = computed(() => {
    const p = route.params.page as string | undefined;
    return (p === 'players' || p === 'settings' || p === 'roles') ? p : 'home';
});
const isHome = computed(() => routePage.value === 'home');
const isRoles = computed(() => routePage.value === 'roles');
const isPlayers = computed(() => routePage.value === 'players');
const isSettings = computed(() => routePage.value === 'settings');
const isRoleDetails = computed(() => route.name === 'role-details');
// Hydration
// 1) Do NOT auto-resume a game; only resume if started and the user asks
// 2) Always load players setup from dedicated storage if available
const savedPlayers0 = loadPlayersSetup();
if (state.phase === PHASES.SETUP) {
    if (savedPlayers0 && Array.isArray(savedPlayers0.players) && savedPlayers0.players.length > 0) {
        state.setup.numPlayers = Math.max(4, Math.min(20, Number(savedPlayers0.numPlayers) || 6));
        state.setup.players = savedPlayers0.players.map((p: { name?: string }, i: number) => ({ name: (p?.name || `Giocatore ${i+1}`) }));
        
        // Restore role configuration if available
        if (savedPlayers0.rolesCounts && typeof savedPlayers0.rolesCounts === 'object') {
            state.setup.rolesCounts = { ...savedPlayers0.rolesCounts };
        } else {
            initDefaultRolesCounts();
        }
        
        if (savedPlayers0.rolesEnabled && typeof savedPlayers0.rolesEnabled === 'object') {
            state.setup.rolesEnabled = { ...savedPlayers0.rolesEnabled };
        }
        
        normalizeRoleCounts();
    }
}
// Initialize tab from route once
{
    const p = route.params.page as string | undefined;
    const page = (p === 'players' || p === 'settings') ? p : 'home';
    currentPage.value = page as any;
}

// Persist state: only save a resumable game once it's started (not in setup)
let isInitialBoot = true;
watch(
    () => state,
    () => {
        if (state.phase !== PHASES.SETUP) {
            saveGameState(state);
            isInitialBoot = false;
        } else if (!isInitialBoot) {
            clearSavedGame();
        }
    },
    { deep: true }
);

// Persist players setup and role configuration independently so they are restored across visits
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

// Load settings on boot (defaults are in store) and persist changes
const savedSettings0 = loadSettings();
if (savedSettings0 && typeof savedSettings0 === 'object') {
    state.settings.skipFirstNightActions = !!savedSettings0.skipFirstNightActions;
    state.settings.enableSindaco = !!savedSettings0.enableSindaco;
    state.settings.discussionTimerEnabled = !!savedSettings0.discussionTimerEnabled;
}
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

// Make resumeAvailable reactive to state changes and more robust
watch(() => state.phase, (newPhase) => {
    if (newPhase === PHASES.SETUP) {
        const saved = loadGameState();
        const hasSavedGame = !!(saved && saved.phase !== PHASES.SETUP);
        resumeAvailable.value = hasSavedGame;
    }
}, { immediate: true });

// Also check for saved games on boot, but defer until after watchers are set up
const checkForSavedGames = () => {
    const saved = loadGameState();
    
    const hasSavedGame = !!(saved && saved.phase !== PHASES.SETUP);
    resumeAvailable.value = hasSavedGame;
    
    return { hasSavedGame, saved };
};

// Manual test function for resume
const testResume = () => {
    const result = checkForSavedGames();
    
    if (result.hasSavedGame) {
        resumeGame();
    }
};

// Function to manually save a test game state
const saveTestGame = () => {
    const testState = {
        phase: PHASES.REVEAL,
        nightNumber: 0,
        dayNumber: 0,
        players: [
            { id: 1, name: 'Test Player 1', roleId: 'wolf', alive: true, roleState: {} },
            { id: 2, name: 'Test Player 2', roleId: 'villager', alive: true, roleState: {} }
        ],
        setup: { numPlayers: 2, players: [], rolesCounts: {}, rolesEnabled: {} },
        revealIndex: 0,
        night: { turns: [], currentIndex: 0, results: [], context: null, summary: null },
        settings: { skipFirstNightActions: true, enableSindaco: false, discussionTimerEnabled: false },
        sindacoId: null,
        winner: null,
        lynchedHistory: [],
        usedPowers: {},
        eventHistory: { nights: [], days: [] },
        custom: {},
        history: {},
        nightDeathsByNight: {},
        lynchedHistoryByDay: {}
    };
    
    saveGameState(testState);
    
    // Force a check for saved games
    setTimeout(() => {
        checkForSavedGames();
    }, 100);
};

// Check for saved games after a delay to ensure all watchers are set up
setTimeout(checkForSavedGames, 100);
setTimeout(checkForSavedGames, 500);
setTimeout(checkForSavedGames, 1000);

// Also check after component is mounted
onMounted(() => {
    // Wait a bit more for any async operations to complete
    setTimeout(() => {
        checkForSavedGames();
    }, 200);
});

function resetAll() {
    // Save current settings before reset
    const currentSettings = { ...state.settings };
    
    Object.assign(store.state, engineCreateEmptyState());
    
    // Restore settings immediately after reset
    state.settings = currentSettings;
    
	// Ensure setup players are re-initialized, preferring saved players if present
	const savedPlayers = loadPlayersSetup();
	if (savedPlayers && savedPlayers.players?.length) {
		state.setup.numPlayers = Math.max(4, Math.min(20, Number(savedPlayers.numPlayers) || 6));
        state.setup.players = savedPlayers.players.map((p: { name?: string }, i: number) => ({ name: (p?.name || `Giocatore ${i+1}`) }));
		
        // Restore role configuration if available
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
    resumeAvailable.value = false;
    isInitialBoot = false;
}

// derive alive groups via engine selectors
const alivePlayers = computed(() => state.players.filter(p => p.alive));
const wolvesAlive = computed(() => alivePlayers.value.filter(p => p.roleState?.realTeam === 'lupi'));
const villagersAlive = computed(() => alivePlayers.value.filter(p => p.roleState?.realTeam !== 'lupi'));

// winner computed inside engine flow

function resumeGame() {
	const saved = loadGameState();
	if (saved && (saved as any).phase !== PHASES.SETUP) {
		// Manually update each property to maintain reactivity
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
		state.eventHistory = saved.eventHistory || { nights: [], days: [] };
		state.custom = saved.custom || {};
		state.history = saved.history || {};
		state.nightDeathsByNight = saved.nightDeathsByNight || {};
		state.lynchedHistoryByDay = saved.lynchedHistoryByDay || {};
		resumeAvailable.value = false;
	}
}

function dismissResumeBanner() {
    clearSavedGame();
    resumeAvailable.value = false;
    isInitialBoot = false;
}

// Setup helpers
function initDefaultRolesCounts() { engineInitDefaultRolesCounts(state as any); }

function initSetupPlayers() { engineInitSetupPlayers(state as any); }

function resizePlayers(nextCount: any) { engineResizePlayers(state as any, Number(nextCount) || 0); }

function normalizeRoleCounts() { engineNormalizeRoleCounts(state as any); }

function updateRoleCount(roleId: string, count: number) { engineUpdateRoleCount(state as any, roleId, count); }

function getMaxCountForRole(roleId: string): number { return engineGetMaxCountForRole(state as any, roleId); }

function navigateToPage(page: 'home' | 'roles' | 'players' | 'settings') {
    currentPage.value = page;
    if (state.phase === PHASES.SETUP) {
        router.replace({ name: 'setup', params: { page } });
    }
}

function updatePlayersFromEditor(players: Array<{name: string}>, numPlayers: number) {
    state.setup.players = players;
    resizePlayers(numPlayers);
    normalizeRoleCounts();
    currentPage.value = 'home';
}

if (state.phase === PHASES.SETUP && state.setup.players.length === 0) {
    const savedPlayers = loadPlayersSetup();
    if (savedPlayers && savedPlayers.players?.length) {
        state.setup.numPlayers = Math.max(4, Math.min(20, Number(savedPlayers.numPlayers) || 6));
        state.setup.players = savedPlayers.players.map((p: { name?: string }, i: number) => ({ name: (p?.name || `Giocatore ${i+1}`) }));
        
        // Restore role configuration if available
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
        engineInitSetupPlayers(state as any);
    }
}

const roleCounts = computed(() => ({ ...state.setup.rolesCounts }));

const totalRolesSelected = computed(() => Object.values(roleCounts.value).reduce((a: number, b: number) => a + (b || 0), 0));
const canStart = computed(() => {
    const numWolves = roleCounts.value['wolf'] || 0;
    return state.setup.players.length >= 4 && numWolves >= 1 && totalRolesSelected.value === state.setup.numPlayers;
});

function beginReveal() { engineBeginReveal(state as any, ROLE_LIST as any, shuffled); }

function nextReveal() { engineNextReveal(state as any, () => beginNight()); }

// Night engine
function beginNight() { engineStartNextNight(state as any, ROLES as any); }

const currentTurn = computed(() => {
	if (state.phase !== PHASES.NIGHT) return null;
	return state.night.turns[state.night.currentIndex] || null;
});

const currentRole = computed(() => {
	const entry = currentTurn.value;
	if (!entry) return null;
	return ROLES[entry.roleId] || null;
});

const currentActor = computed(() => {
	const entry = currentTurn.value;
	if (!entry) return null;
	if (entry.kind === 'single') {
		return state.players.find(p => p.id === entry.playerId) || null;
	}
	return { id: 0, name: currentRole.value?.name, roleId: entry.roleId, group: true };
});

const currentPromptComponent = computed(() => {
	const entry = currentTurn.value;
	if (!entry) return null;
	const role = ROLES[entry.roleId];
	if (!role) return null;
	const factory = entry.kind === 'group' && typeof role.getGroupPromptComponent === 'function'
		? role.getGroupPromptComponent(state, entry)
		: role.getPromptComponent?.(state, currentActor.value);
	return factory ? defineAsyncComponent(factory) : null;
});

const isFirstNightSkipped = computed(() => !!state.settings?.skipFirstNightActions && state.nightNumber === 1);

const shouldShowDeadPrompt = computed(() => {
	const entry = currentTurn.value;
	if (!entry) return false;
	if (entry.kind === 'single') {
		const player = state.players.find(p => p.id === entry.playerId);
		return !player || player.alive === false;
	}
	// group: show dead prompt if no alive members of the group
	const anyAlive = alivePlayers.value.some(p => p.roleId === entry.roleId);
	return !anyAlive;
});

const currentGroupNames = computed(() => {
	const entry = currentTurn.value;
	if (!entry || entry.kind !== 'group') return null as string[] | null;
	return entry.playerIds
		.map(id => state.players.find(p => p.id === id)?.name)
		.filter((n): n is string => !!n);
});

function onPromptComplete(result: any) {
    engineRecordNightResult(state as any, result);
    if (state.phase === PHASES.RESOLVE) engineResolveNight(state as any, ROLES as any);
}

function resolveNight() { engineResolveNight(state as any, ROLES as any); }

function continueToDay() {
    const winner = engineEvaluateWinner(state as any, ROLES as any);
    if (winner) {
        state.winner = winner as any;
        state.phase = PHASES.END as any;
        return;
    }
    engineContinueToDay(state as any, ROLES as any);
}

function startNextNight() { engineStartNextNight(state as any, ROLES as any); }

function quitAndReset() { resetAll(); }

// UI state only for setup pages, other phases manage their own UI

// Day phase actions
function onLynch(playerId: number) {
    engineLynchPlayer(state as any, playerId);
    // After lynch, complete the day: check winner then start next night
    engineCompleteDay(state as any, ROLES as any);
}

function onSkipDay() {
    // No lynch: record empty day event and complete the day
    if (!state.eventHistory) state.eventHistory = { nights: [], days: [] };
    state.eventHistory.days.push({
        day: state.dayNumber,
        lynched: null
    });
    engineCompleteDay(state as any, ROLES as any);
}

function onElectSindaco(playerId: number) {
    engineSetSindaco(state as any, playerId);
}

function toggleEventHistory() {
    showEventHistory.value = !showEventHistory.value;
}
</script>

<template>
	<!-- Role Details Page -->
	<RoleDetails v-if="isRoleDetails" />
	
	<!-- Main Game Container -->
	<div v-else class="w-full max-w-4xl mx-auto bg-neutral-950/95 border border-neutral-800/40 rounded-2xl backdrop-blur-sm shadow-xl p-4 sm:p-6 md:p-8 text-neutral-200">
		<h1 class="text-2xl md:text-3xl font-semibold text-neutral-100 mb-6 text-center">Lupus in Tabula</h1>
		<div class="h-px bg-neutral-800/40 mb-6"></div>

		<!-- Resume banner -->
		<div v-if="resumeAvailable && state.phase === PHASES.SETUP" class="bg-neutral-900/60 border border-neutral-800/40 rounded-xl p-3 sm:p-4 mb-6 overflow-hidden">
			<div class="space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between sm:gap-4">
				<div class="text-center sm:text-left min-w-0 flex-1">
					<h3 class="text-base sm:text-lg font-semibold text-neutral-100 mb-1 truncate">Partita in corso</h3>
					<p class="text-xs sm:text-sm text-neutral-400 leading-relaxed">Hai una partita salvata che puoi riprendere</p>
				</div>
				<div class="flex gap-1.5 sm:gap-2 w-full sm:w-auto">
					<button class="btn btn-secondary text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 flex-1 sm:flex-none" @click="dismissResumeBanner">Ignora</button>
					<button class="btn btn-primary text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 flex-1 sm:flex-none" @click="resumeGame">Riprendi</button>
				</div>
			</div>
		</div>

		<!-- Setup Phase -->
		<div v-if="state.phase === PHASES.SETUP" class="space-y-6 text-center">
			<!-- Page Navigation -->
			<div class="grid grid-cols-2 sm:flex gap-1 p-1 bg-white/5 border border-white/10 rounded-lg w-full text-sm">
				<router-link 
					:to="{ name: 'setup', params: { page: 'home' } }"
					class="flex-1 text-center py-1"
					:class="isHome 
						? 'btn btn-primary shadow-sm' 
						: 'btn btn-ghost'"
				>
					Home
				</router-link>
				<router-link 
					:to="{ name: 'setup', params: { page: 'roles' } }"
					class="flex-1 text-center py-1"
					:class="isRoles 
						? 'btn btn-primary shadow-sm' 
						: 'btn btn-ghost'"
				>
					Ruoli
				</router-link>
				<router-link 
					:to="{ name: 'setup', params: { page: 'players' } }"
					class="flex-1 text-center py-1"
					:class="isPlayers 
						? 'btn btn-primary shadow-sm' 
						: 'btn btn-ghost'"
				>
					Giocatori
				</router-link>
				<router-link 
					:to="{ name: 'setup', params: { page: 'settings' } }"
					class="flex-1 text-center py-1"
					:class="isSettings 
						? 'btn btn-primary shadow-sm' 
						: 'btn btn-ghost'"
				>
					Impostazioni
				</router-link>
			</div>

				<!-- Page Content -->
				<SetupHome v-show="isHome" 
					@save-test-game="saveTestGame"
					@test-resume="testResume"
					@check-saved-games="checkForSavedGames"
				/>
				<SetupRoles v-show="isRoles" />
				<SetupPlayers v-show="isPlayers" />
				<SetupSettings v-show="isSettings" />
			</div>

			<!-- Reveal Roles Phase -->
			<PhaseReveal v-else-if="state.phase === PHASES.REVEAL" :state="state" :onStartNight="beginNight" />

			<!-- Pre-Night Phase -->
			<PhasePreNight v-else-if="state.phase === PHASES.PRE_NIGHT" :state="state" :onContinue="beginNight" />

			<!-- Night Phase -->
			<PhaseNight v-else-if="state.phase === PHASES.NIGHT" :state="state" :onPromptComplete="onPromptComplete" />

			<!-- Resolve Phase -->
			<PhaseResolve v-else-if="state.phase === PHASES.RESOLVE" :state="state" :onContinue="continueToDay" :onReset="quitAndReset" />

			<!-- Day Phase -->
			<PhaseDay v-else-if="state.phase === PHASES.DAY" :state="state" :onLynch="onLynch" :onElectSindaco="onElectSindaco" :onSkipDay="onSkipDay" :onReset="quitAndReset" />

			<!-- End Phase -->
			<div v-else-if="state.phase === PHASES.END" class="space-y-4 text-center">
				<!-- Main End Game Content -->
				<div v-if="!showEventHistory" class="space-y-6">
					<h2 class="text-xl font-semibold text-slate-100 mb-6">Fine partita</h2>
					<div class="bg-white/5 border border-white/10 rounded-lg p-6 space-y-4 text-left">
						<div class="text-2xl font-bold" :class="state.winner === 'lupi' ? 'text-red-400' : (state.winner === 'matti' ? 'text-violet-400' : (state.winner === 'tie' ? 'text-yellow-400' : 'text-emerald-400'))">
							{{ state.winner === 'tie' ? 'Pareggio, tutti sono morti' : (state.winner || 'Sconosciuto') + ' vincono' }}
						</div>
						<div v-if="state.winner !== 'tie'">
							<div class="text-slate-300 text-sm mb-2">Vincitori:</div>
							<PlayerRoleList 
								:state="state" 
								:players="state.players.filter(p => p.roleState?.realTeam === state.winner)" 
							/>
						</div>
						<div class="text-slate-400">Grazie per aver giocato.</div>
					</div>
					
					<!-- Action Buttons with consistent styling -->
					<ButtonGroup class="mt-6">
						<GhostButton full-width @click="toggleEventHistory">
							📋 Eventi
						</GhostButton>
						<PrimaryButton full-width @click="quitAndReset">
							Nuova partita
						</PrimaryButton>
					</ButtonGroup>
				</div>
			</div>
	</div>

	<!-- Full Screen Event History Modal -->
	<div v-if="showEventHistory && state.phase === PHASES.END" class="fixed inset-0 bg-neutral-950 z-50 overflow-hidden">
		<div class="w-full max-w-6xl mx-auto h-full bg-neutral-950/95 border-x border-neutral-800/40 backdrop-blur-sm shadow-xl p-4 sm:p-6 md:p-8 text-neutral-200">
			<EventHistory 
				:state="state" 
				:onClose="() => showEventHistory = false" 
			/>
		</div>
	</div>
</template>

 


 
 
 


