<script setup lang="ts">
import { ref, reactive, computed, watch, defineAsyncComponent } from 'vue';
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

function createEmptyState() {
	return {
		phase: PHASES.SETUP,
		nightNumber: 0,
		dayNumber: 0,
		players: [], // { id, name, roleId, alive }
		roleMeta: {}, // roleId -> { id, name, team, phaseOrder }
		setup: {
			numPlayers: 6,
			players: [], // { name }
			rolesCounts: {}, // roleId -> count
		},
		revealIndex: 0,
		night: {
			turns: [], // [{ kind:'single', roleId, playerId } | { kind:'group', roleId, playerIds:[] }]
			currentIndex: 0,
			results: [], // { roleId, kind, playerId?, playerIds?, result }
			context: null, // { kills:[], saves:[], checks:[{by, target, isWolf}] }
			summary: null, // { targeted:[], saved:[], died:[], checks:[] }
		},
        settings: { skipFirstNightActions: true, enableSindaco: false },
		winner: null, // 'wolves' | 'villagers'
	};
}

const savedGameAtBoot = loadGameState();
const resumeAvailable = ref(!!(savedGameAtBoot && (savedGameAtBoot as any).phase !== PHASES.SETUP));
const route = useRoute();
const router = useRouter();
const currentPage = ref<'home' | 'roles' | 'players' | 'settings'>('home');
const showEventHistory = ref(false);
const store = useGameStore();
const state = store.state;
// Ensure settings exist even if state was restored from an older schema
if (!(state as any).settings) {
    (state as any).settings = { skipFirstNightActions: true, enableSindaco: false };
}
// Ensure rolesEnabled exists in setup for older saved states
if (!(state as any).setup?.rolesEnabled) {
    (state as any).setup.rolesEnabled = { wolf: true, villager: true, doctor: true, medium: true, lover: false, crazyman: false, justicer: false, hangman: false, witch: false, dog: false, demoniac: false } as any;
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
watch(
    () => state,
    () => {
        if (state.phase !== PHASES.SETUP) {
            saveGameState(state);
        } else {
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
}
watch(
    () => state.settings,
    () => {
        saveSettings({
            skipFirstNightActions: !!state.settings.skipFirstNightActions,
            enableSindaco: !!state.settings.enableSindaco,
        });
    },
    { deep: true }
);

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
}

// derive alive groups via engine selectors
const alivePlayers = computed(() => state.players.filter(p => p.alive));
const wolvesAlive = computed(() => alivePlayers.value.filter(p => state.roleMeta[p.roleId]?.team === 'lupi'));
const villagersAlive = computed(() => alivePlayers.value.filter(p => state.roleMeta[p.roleId]?.team !== 'lupi'));

// winner computed inside engine flow

function resumeGame() {
	const saved = loadGameState();
	if (saved && (saved as any).phase !== PHASES.SETUP) {
		Object.assign(store.state, saved);
		resumeAvailable.value = false;
	}
}

function dismissResumeBanner() {
    clearSavedGame();
    resumeAvailable.value = false;
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
	return state.roleMeta[entry.roleId] || null;
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
    engineContinueToDay(state as any);
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
		<div v-if="resumeAvailable && state.phase === PHASES.SETUP" class="bg-neutral-900/60 border border-neutral-800/40 rounded-xl p-4 mb-6">
			<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
				<div>
					<div class="font-medium text-neutral-100 text-sm">Riprendere la partita precedente?</div>
					<div class="text-neutral-400 text-xs">È stata trovata una sessione salvata su questo dispositivo.</div>
				</div>
				<div class="flex gap-2">
					<button class="btn btn-secondary text-xs" @click="dismissResumeBanner">Chiudi</button>
					<button class="btn btn-primary text-xs" @click="resumeGame">Riprendi partita</button>
				</div>
			</div>
		</div>

		<!-- Setup Phase -->
		<div v-if="state.phase === PHASES.SETUP" class="space-y-6 text-center">
					<!-- Page Navigation -->
		<div class="grid grid-cols-2 sm:flex gap-1 p-1 bg-white/5 border border-white/10 rounded-lg">
			<router-link 
				:to="{ name: 'setup', params: { page: 'home' } }"
                class="text-sm"
                :class="isHome 
                    ? 'btn btn-primary shadow-sm' 
                    : 'btn btn-ghost'"
			>
				Home
			</router-link>
			<router-link 
				:to="{ name: 'setup', params: { page: 'roles' } }"
				class="text-sm"
				:class="isRoles 
					? 'btn btn-primary shadow-sm' 
					: 'btn btn-ghost'"
			>
				Ruoli
			</router-link>
			<router-link 
				:to="{ name: 'setup', params: { page: 'players' } }"
				class="text-sm"
                :class="isPlayers 
                    ? 'btn btn-primary shadow-sm' 
                    : 'btn btn-ghost'"
			>
				Giocatori
			</router-link>
			<router-link 
				:to="{ name: 'setup', params: { page: 'settings' } }"
				class="text-sm"
                :class="isSettings 
                    ? 'btn btn-primary shadow-sm' 
                    : 'btn btn-ghost'"
			>
				Impostazioni
			</router-link>
		</div>

            <!-- Page Content -->
            <SetupHome v-show="isHome" />
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
                    <div class="text-2xl font-bold" :class="state.winner === 'lupi' ? 'text-red-400' : (state.winner === 'matti' ? 'text-violet-400' : 'text-emerald-400')">
                        {{ (state.winner || 'Sconosciuto') + ' vincono' }}
                    </div>
                    <div>
                        <div class="text-slate-300 text-sm mb-2">Vincitori:</div>
                        <PlayerRoleList 
                            :state="state" 
                            :players="state.players.filter(p => (state.winner === 'matti' ? (state.roleMeta[p.roleId]?.team === 'matti') : (p.alive && state.roleMeta[p.roleId]?.team === state.winner)))" 
                        />
                    </div>
                    <div class="text-slate-400">Grazie per aver giocato.</div>
                </div>
                
                <!-- Action Buttons with consistent styling -->
                <div class="grid grid-cols-2 gap-2 mt-6">
                    <button class="btn btn-ghost w-full" @click="toggleEventHistory">
                        📋 Eventi
                    </button>
                    <button class="btn btn-primary w-full" @click="quitAndReset">
                        Nuova partita
                    </button>
                </div>
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

 


 


