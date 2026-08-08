<script setup lang="ts">
import { ROLES } from './roles';
import { FACTIONS } from './factions';
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Capacitor } from '@capacitor/core';
import { useRegisterSW } from 'virtual:pwa-register/vue';
import { PhaseReveal, PhaseNight, PhaseResolve, PhasePreNight, PhaseDay, WinResults, useGameLogic, useGameState, useNightPhase } from './components';
import { SetupHome, SetupPlayers, SetupRoles, SetupSettings } from './components';
import { RoleDetails } from './components';
import { EventHistory, NewRolesPopup } from './components';
import SecondaryButton from './components/ui/SecondaryButton.vue';
import PrimaryButton from './components/ui/PrimaryButton.vue';
import GhostButton from './components/ui/GhostButton.vue';
import ButtonGroup from './components/ui/ButtonGroup.vue';
import { useGameStore } from './stores/game';
import { loadGameState, saveGameState } from './utils/storage';
import { useNewRolesPopup, useI18n, useTeamBalance } from './composables';
import { LanguageSwitcher, SetupTitle, IOSInstallPrompt } from './components/ui';
import { Analytics } from '@vercel/analytics/vue'

const { t } = useI18n();
const { teamBalance } = useTeamBalance();

const savedGameAtBoot = loadGameState();


const route = useRoute();
const router = useRouter();
const store = useGameStore();
const state = store.state as any;

const showResumeBanner = ref(true);
const showNewGameSetup = ref(false);
const showPlayersAccordion = ref(false);
const showRolesAccordion = ref(true);
const showConfirmNewGameModal = ref(false);

// Computed properties for the resume game section
const savedAlive = computed(() => savedGameAtBoot?.players?.filter((p: any) => p.alive) || []);
const savedDead = computed(() => savedGameAtBoot?.players?.filter((p: any) => !p.alive) || []);
const savedGameRoles = computed(() => {
	const counts = savedGameAtBoot?.setup?.rolesCounts;
	if (!counts) return [];
	return Object.entries(counts)
		.filter(([_, count]) => (count as number) > 0)
		.map(([roleId, count]) => {
			const roleDef = ROLES[roleId];
			const team = roleDef?.team || 'villaggio';
			const faction = FACTIONS[team];
			return {
				id: roleId,
				name: roleDef?.name || roleId,
				team,
				color: faction?.color || '#6b7280',
				count: count as number
			};
		})
		.sort((a, b) => {
			const teamOrder: Record<string, number> = { villaggio: 0, lupi: 1, mannari: 2, matti: 3, parassita: 4, alieni: 5 };
			return (teamOrder[a.team] ?? 99) - (teamOrder[b.team] ?? 99);
		});
});

const savedPhaseDisplay = computed(() => {
	const state = savedGameAtBoot;
	if (!state) return '';
	const phase = state.phase || 'night';
	
	if (phase === 'night' && state.nightNumber) {
		return `${t('phases.night')} ${state.nightNumber}`;
	} else if (phase === 'day' && state.dayNumber) {
		return `${t('phases.day')} ${state.dayNumber}`;
	}
	return t(`phases.${phase}`);
});

const {
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
} = useGameState();

const {
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
    backToDayFromPreNight,
    replayNightLocal,
    quitAndReset,
    onLynch,
    onSkipDay,
    onElectSindaco
} = useGameLogic();

// Initialize game state and setup watchers
initializeGameState();
setupWatchers();


const {
	showPopup: showNewRolesPopup,
	newRoles,
	closePopup: closeNewRolesPopup
} = useNewRolesPopup();

// Service worker registration and update handling
const { needRefresh, updateServiceWorker } = useRegisterSW({
    onRegistered(r) {
        console.log('SW Registered: ' + r);
    },
    onRegisterError(error) {
        console.log('SW registration error', error);
    },
});

const showUpdateNotification = ref(false);
watch(needRefresh, (newValue) => {
    if (newValue) {
        showUpdateNotification.value = true;
    }
});

const refreshApp = () => {
    updateServiceWorker(true);
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
            		{ id: 1, name: 'Test Player 1', roleId: 'lupo', alive: true, roleState: {} },
            		{ id: 2, name: 'Test Player 2', roleId: 'villico', alive: true, roleState: {} }
        ],
        setup: { numPlayers: 2, players: [], rolesCounts: {}, rolesEnabled: {} },
        revealIndex: 0,
        night: { turns: [], currentIndex: 0, results: [], context: null, summary: null },
        settings: { skipFirstNightActions: true, enableSindaco: false, discussionTimerEnabled: false },
        sindacoId: null,
        winner: null,
        lynchedHistory: [],
        usedPowers: {},

        custom: {},
        history: {},
        nightDeathsByNight: {},
        lynchedHistoryByDay: {}
    };
    
    saveGameState(testState as any);
    
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
	
	// Add capacitor-mobile class to body for scrollbar hiding
	document.body.classList.add('capacitor-mobile');
});

// Handle bottom navigation conditional CSS classes
watch(
    () => state.phase,
    (newPhase) => {
        const hasBottomNav = newPhase === PHASES.SETUP;
        const body = document.body;
        const app = document.querySelector('#app');
        
        if (hasBottomNav) {
            app?.classList.add('has-bottom-nav');
        } else {
            app?.classList.remove('has-bottom-nav');
        }
        

    },
    { immediate: true }
);


async function resumeGameLocal() {
	const saved = loadGameState();
	if (saved && (saved as any).phase !== PHASES.SETUP) {
		await resumeGame(saved);
		resumeAvailable.value = false;
	}
}

const handleStartGameRequest = () => {
	if (resumeAvailable.value) {
		showConfirmNewGameModal.value = true;
	} else {
		beginRevealLocal();
	}
};

const confirmNewGame = () => {
	showConfirmNewGameModal.value = false;
	beginRevealLocal();
};

const cancelNewGame = () => {
	showConfirmNewGameModal.value = false;
};

</script>

<template class="bg-neutral-950">
	<Analytics />
	<LanguageSwitcher />
	<IOSInstallPrompt v-if="state.phase === PHASES.SETUP" />
	<!-- Role Details Page -->
	<RoleDetails v-if="isRoleDetails" />
	
	<!-- PWA Update Notification -->
	<div v-if="showUpdateNotification" class="fixed top-4 left-4 right-4 z-50 bg-violet-600 text-white p-4 rounded-lg shadow-lg">
		<div class="flex items-center justify-between">
			<div>
				<h3 class="font-semibold">{{ t('updates.available') }}</h3>
				<p class="text-sm opacity-90">{{ t('updates.description') }}</p>
			</div>
			<button 
				@click="refreshApp" 
				class="bg-white text-violet-600 px-4 py-2 rounded-lg font-medium hover:bg-violet-50 transition-colors"
			>
				{{ t('updates.refreshNow') }}
			</button>
		</div>
	</div>

	<!-- Main Game Container -->
	<div v-if="!isRoleDetails" class="w-full bg-neutral-950 sm:bg-transparent sm:max-w-md lg:max-w-4xl
	 sm:mx-auto sm:border sm:border-neutral-800/40 sm:rounded-2xl
	 backdrop-blur-sm sm:p-4 md:p-6 lg:p-8 text-neutral-200 capacitor-mobile
	 flex flex-col flex-grow"
       :class="[
           state.phase === PHASES.SETUP ? 'justify-start' : 'justify-center',
           'overflow-visible'
       ]">
		
		<!-- Setup Phase -->
		<div v-if="state.phase === PHASES.SETUP" class="space-y-6 text-center py-2 px-4 sm:px-0 sm:pb-0">
			<!-- Desktop Page Navigation (hidden on mobile) -->
			<div class="hidden sm:flex gap-1 p-1 bg-white/5 border border-white/10 rounded-lg w-full text-sm">
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
					{{ t('nav.roles') }}
				</router-link>
				<router-link 
					:to="{ name: 'setup', params: { page: 'players' } }"
					class="flex-1 text-center py-1"
					:class="isPlayers 
						? 'btn btn-primary shadow-sm' 
						: 'btn btn-ghost'"
				>
					{{ t('nav.players') }}
				</router-link>
				<router-link 
					:to="{ name: 'setup', params: { page: 'settings' } }"
					class="flex-1 text-center py-1"
					:class="isSettings 
						? 'btn btn-primary shadow-sm' 
						: 'btn btn-ghost'"
				>
					{{ t('nav.settings') }}
				</router-link>
			</div>

			<!-- Page Content -->
			<template v-if="isHome">
				<div class="w-full px-3 md:px-6 space-y-4 md:space-y-6">
					<!-- Generic Title for Home -->
					<SetupTitle :title="t('setup.playTitle') || 'Gioca'" />

					<!-- Game In Progress Section -->
					<div v-if="resumeAvailable && !showNewGameSetup" class="w-full max-w-md mx-auto mt-4 sm:mt-8 mb-6 relative z-10 space-y-4 md:space-y-6">
						
						<!-- Card 1: Header, Balance, and Action Buttons -->
						<div class="bg-neutral-900/60 border border-neutral-800/40 rounded-xl p-3 md:p-4 shadow-lg">
							<!-- Header -->
							<div class="flex flex-col items-center text-center gap-2 mb-4 md:mb-5">
								<h2 class="text-lg font-bold text-white">{{ t('game.gameInProgressTitle') }}</h2>
								<span class="text-violet-300 font-semibold bg-violet-500/15 px-3 py-1 rounded-lg text-xs border border-violet-500/20">
									{{ savedPhaseDisplay }}
								</span>
							</div>

							<!-- Initial Team Balance Section -->
							<div class="mb-4">
								<div class="flex items-center justify-between mb-2">
									<h3 class="text-xs font-bold text-neutral-500 uppercase tracking-widest">{{ t('setup.balance') }}</h3>
									<div class="text-sm font-bold" 
											 :class="teamBalance.fairness >= 70 ? 'text-violet-400' : teamBalance.fairness >= 50 ? 'text-yellow-400' : 'text-red-400'">
										{{ teamBalance.fairness }}%
									</div>
								</div>
								
								<div class="w-full bg-neutral-800/40 rounded-full h-1.5 overflow-hidden">
									<div class="h-1.5 rounded-full transition-all duration-500 ease-out"
											 :class="teamBalance.fairness >= 70 ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500' : teamBalance.fairness >= 50 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : 'bg-gradient-to-r from-red-500 to-orange-500'"
											 :style="{ width: `${teamBalance.fairness}%` }">
									</div>
								</div>
							</div>

							<!-- Action Buttons -->
							<div class="space-y-2.5 mt-2">
								<button @click="resumeGameLocal" class="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-400 hover:to-fuchsia-400 text-white font-semibold rounded-xl transition-all shadow-lg shadow-violet-500/25 active:scale-[0.98]">
									<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
									</svg>
									{{ t('game.resumeGame') }}
								</button>
								<button @click="showNewGameSetup = true" class="w-full flex items-center justify-center gap-2 px-6 py-3 bg-neutral-800/60 hover:bg-neutral-700/60 text-neutral-400 font-medium rounded-xl transition-all border border-neutral-700/40 active:scale-[0.98]">
									{{ t('game.createNewGame') }}
								</button>
							</div>
						</div>

						<!-- Card 2: Roles List Accordion -->
						<div v-if="savedGameRoles.length" class="bg-neutral-900/60 border border-neutral-800/40 rounded-xl p-3 md:p-4">
							<button @click="showRolesAccordion = !showRolesAccordion" class="w-full flex items-center justify-between mb-3 group">
								<h3 class="text-xs font-bold text-neutral-500 uppercase tracking-widest group-hover:text-neutral-400 transition-colors">{{ t('game.rolesInGame') }}</h3>
								<svg class="w-4 h-4 text-neutral-500 transition-transform duration-200" :class="{ 'rotate-180': showRolesAccordion }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
								</svg>
							</button>
							<div v-show="showRolesAccordion" class="grid gap-2 grid-cols-1 sm:grid-cols-2">
								<div v-for="role in savedGameRoles" :key="role.id" class="flex items-center justify-between p-3 rounded-lg bg-neutral-950/40 border border-neutral-800/30">
									<div class="flex items-center gap-3">
										<span class="w-2.5 h-2.5 rounded-full" :style="{ backgroundColor: role.color }"></span>
										<span class="font-medium text-sm text-neutral-200">{{ t(role.name) }}</span>
									</div>
									<div class="text-neutral-500 text-sm font-semibold">x{{ role.count }}</div>
								</div>
							</div>
						</div>

						<!-- Card 3: Players Accordion -->
						<div class="bg-neutral-900/60 border border-neutral-800/40 rounded-xl p-3 md:p-4">
							<button @click="showPlayersAccordion = !showPlayersAccordion" class="w-full flex items-center justify-between mb-2 group">
								<h3 class="text-xs font-bold text-neutral-500 uppercase tracking-widest group-hover:text-neutral-400 transition-colors">
									{{ t('players.players') }} <span class="opacity-75">({{ savedGameAtBoot?.players?.length || 0 }})</span>
								</h3>
								<svg class="w-4 h-4 text-neutral-500 transition-transform duration-200" :class="{ 'rotate-180': showPlayersAccordion }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
								</svg>
							</button>

							<div v-show="showPlayersAccordion" class="mt-3 bg-neutral-950/40 rounded-lg border border-neutral-800/30 p-3 space-y-3">
								<!-- Alive Players -->
								<div v-if="savedAlive.length">
									<h4 class="text-[10px] font-bold text-emerald-500/70 uppercase tracking-wider mb-2 px-0.5 flex items-center gap-1.5">
										<div class="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
										{{ t('game.alive') }} ({{ savedAlive.length }})
									</h4>
									<div class="flex flex-wrap gap-1.5">
										<span
											v-for="player in savedAlive"
											:key="player.id"
											class="px-2.5 py-1 text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 rounded-md"
										>
											{{ player.name }}
										</span>
									</div>
								</div>
								<!-- Dead Players -->
								<div v-if="savedDead.length">
									<h4 class="text-[10px] font-bold text-red-500/60 uppercase tracking-wider mb-2 px-0.5 flex items-center gap-1.5">
										<div class="w-1.5 h-1.5 rounded-full bg-red-400/60"></div>
										{{ t('game.dead') }} ({{ savedDead.length }})
									</h4>
									<div class="flex flex-wrap gap-1.5">
										<span
											v-for="player in savedDead"
											:key="player.id"
											class="px-2.5 py-1 text-xs font-medium bg-red-500/8 text-red-400/70 border border-red-500/10 rounded-md line-through decoration-red-500/30"
										>
											{{ player.name }}
										</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				<!-- Setup Config UI (Hidden when Game in Progress view is shown) -->
				<div v-if="!resumeAvailable || showNewGameSetup" class="w-full">
					<div v-if="resumeAvailable && showNewGameSetup" class="absolute top-4 left-4 z-50 md:top-6 md:left-6">
						<button @click="showNewGameSetup = false" class="p-1.5 rounded-lg bg-neutral-900/60 hover:bg-neutral-800/60 border border-neutral-800/40 transition-all duration-200 hover:scale-105 cursor-pointer text-white">
							<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
							</svg>
						</button>
					</div>
					<SetupHome @startGame="handleStartGameRequest(beginRevealLocal)" />
				</div>
			</template>
			<SetupRoles v-show="isRoles" />
			<SetupPlayers v-show="isPlayers" />
			<SetupSettings v-show="isSettings" />
		</div>

		<!-- Game Phases (outside setup) -->
		<!-- Reveal Roles Phase -->
		<PhaseReveal v-else-if="state.phase === PHASES.REVEAL" :state="state" :onStartNight="beginNight" />


		<!-- Pre-Night Phase -->
		<PhasePreNight v-else-if="state.phase === PHASES.PRE_NIGHT" :state="state" :onContinue="beginNight" :onBackToDay="backToDayFromPreNight" />

		<!-- Night Phase -->
		<PhaseNight v-else-if="state.phase === PHASES.NIGHT" :state="state" :onPromptComplete="onPromptComplete" />


		<!-- Resolve Phase -->
		<PhaseResolve v-else-if="state.phase === PHASES.RESOLVE" :state="state" :onContinue="continueToDayLocal" :onReset="quitAndReset" :onReplay="replayNightLocal" />

		<!-- Day Phase -->
		<PhaseDay v-else-if="state.phase === PHASES.DAY" :state="state" :onLynch="onLynch" :onElectSindaco="onElectSindaco" :onSkipDay="onSkipDay" :onReset="quitAndReset" />

		<!-- End Phase -->
		<div v-else-if="state.phase === PHASES.END" class="
		flex flex-col items-center justify-center px-2 sm:px-6 lg:px-8 py-4 sm:py-6">
			<!-- Main End Game Content -->
			<div v-if="!showEventHistory" class="w-full">
				<WinResults 
					:state="state as any"
					@toggle-event-history="toggleEventHistory"
					@new-game="quitAndReset"
				/>
			</div>
		</div>
	</div>

	<!-- Mobile Bottom Navigation Bar - Moved outside main container for proper fixed positioning -->
	<div v-if="state.phase === PHASES.SETUP" class="fixed bottom-0 left-0 right-0 bg-neutral-950/98 border-t border-neutral-800/20 backdrop-blur-xl sm:hidden z-50 pb-safe shadow-2xl">
		<div class="grid grid-cols-4 px-2 py-1">
			<router-link 
				:to="{ name: 'setup', params: { page: 'home' } }"
				class="flex flex-col items-center justify-center py-2 transition-all duration-200 touch-manipulation"
				:class="isHome 
					? 'text-violet-400' 
					: 'text-neutral-500'"
			>
				<div class="relative">
					<svg class="w-6 h-6" viewBox="0 0 24 24">
						<path v-if="isHome" fill="currentColor" d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
						<path v-else stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l9-9 9 9M5 10v10a1 1 0 001 1h3a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3a1 1 0 001-1V10"/>
					</svg>
				</div>
				<span class="text-[10px] font-medium mt-1" :class="isHome ? 'text-violet-400' : 'text-neutral-500'">Home</span>
			</router-link>
			<router-link 
				:to="{ name: 'setup', params: { page: 'roles' } }"
				class="flex flex-col items-center justify-center py-2 transition-all duration-200 touch-manipulation"
				:class="isRoles 
					? 'text-violet-400' 
					: 'text-neutral-500'"
			>
				<div class="relative">
					<svg class="w-6 h-6" viewBox="0 0 24 24">
						<path v-if="isRoles" fill="currentColor" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
						<path v-else stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
					</svg>
				</div>
				<span class="text-[10px] font-medium mt-1" :class="isRoles ? 'text-violet-400' : 'text-neutral-500'">{{ t('nav.roles') }}</span>
			</router-link>
			<router-link 
				:to="{ name: 'setup', params: { page: 'players' } }"
				class="flex flex-col items-center justify-center py-2 transition-all duration-200 touch-manipulation"
				:class="isPlayers 
					? 'text-violet-400' 
					: 'text-neutral-500'"
			>
				<div class="relative">
					<svg class="w-6 h-6" viewBox="0 0 24 24">
						<path v-if="isPlayers" fill="currentColor" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
						<path v-else stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
					</svg>
				</div>
				<span class="text-[10px] font-medium mt-1" :class="isPlayers ? 'text-violet-400' : 'text-neutral-500'">{{ t('nav.players') }}</span>
			</router-link>
			<router-link 
				:to="{ name: 'setup', params: { page: 'settings' } }"
				class="flex flex-col items-center justify-center py-2 transition-all duration-200 touch-manipulation"
				:class="isSettings 
					? 'text-violet-400' 
					: 'text-neutral-500'"
			>
				<div class="relative">
					<svg class="w-6 h-6" viewBox="0 0 24 24">
						<path v-if="isSettings" fill="currentColor" d="M12 15a3 3 0 100-6 3 3 0 000 6z"/>
						<path v-else stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15a3 3 0 100-6 3 3 0 000 6z"/>
						<path v-if="isSettings" fill="currentColor" d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001 1.51H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/>
						<path v-else stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001 1.51H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/>
					</svg>
				</div>
				<span class="text-[10px] font-medium mt-1" :class="isSettings ? 'text-violet-400' : 'text-neutral-500'">{{ t('nav.settings') }}</span>
			</router-link>
		</div>
	</div>

	<!-- Full Screen Event History Modal -->
	<div v-if="showEventHistory && state.phase === PHASES.END" class="fixed inset-0 bg-neutral-950 z-50 overflow-y-auto">
		<div class="w-full max-w-none sm:max-w-8xl sm:mx-auto min-h-full bg-neutral-950/95 sm:border-x sm:border-neutral-800/40 backdrop-blur-sm shadow-xl text-neutral-200">
			<EventHistory 
				:state="state" 
				:onClose="() => showEventHistory = false" 
			/>
		</div>
	</div>

	<!-- New Roles Popup -->
	<NewRolesPopup
      class=""
		:show="showNewRolesPopup"
		:new-roles="newRoles"
		@close="closeNewRolesPopup"
	/>

	<!-- Confirm New Game Modal -->
	<div v-if="showConfirmNewGameModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-sm">
		<div class="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl relative overflow-hidden">
			<div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-rose-500"></div>
			<div class="flex flex-col items-center text-center space-y-4">
				<div class="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mb-2 border border-red-500/20 shadow-inner">
					<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
					</svg>
				</div>
				<div>
					<h3 class="text-lg font-bold text-white mb-2">{{ t('game.confirmOverwriteTitle') }}</h3>
					<p class="text-neutral-400 text-sm leading-relaxed">{{ t('game.confirmOverwriteText') }}</p>
				</div>
				<div class="flex gap-3 w-full mt-4">
					<button @click="cancelNewGame" class="flex-1 px-4 py-2.5 rounded-xl font-medium text-neutral-300 bg-neutral-800/80 hover:bg-neutral-700 border border-neutral-700/50 transition-colors">
						{{ t('game.cancelNewGame', 'Annulla') }}
					</button>
					<button @click="confirmNewGame" class="flex-1 px-4 py-2.5 rounded-xl font-medium text-white bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-400 hover:to-rose-400 transition-colors shadow-lg shadow-red-500/25">
						{{ t('game.confirmOverwrite', 'Sovrascrivi') }}
					</button>
				</div>
			</div>
		</div>
	</div>

	<!-- App Update Overlay -->
	<!-- Removed cache visual components -->
</template>

 


 
 
 


