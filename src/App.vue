<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { PhaseReveal, PhaseNight, PhaseResolve, PhasePreNight, PhaseDay, WinResults, useGameLogic, useGameState, useNightPhase } from './components';
import { SetupHome, SetupPlayers, SetupRoles, SetupSettings } from './components';
import { RoleDetails } from './components';
import { EventHistory } from './components';
import SecondaryButton from './components/ui/SecondaryButton.vue';
import PrimaryButton from './components/ui/PrimaryButton.vue';
import GhostButton from './components/ui/GhostButton.vue';
import ButtonGroup from './components/ui/ButtonGroup.vue';
import { useGameStore } from './stores/game';
import { loadGameState, saveGameState } from './utils/storage';



const savedGameAtBoot = loadGameState();


const route = useRoute();
const router = useRouter();
const store = useGameStore();
const state = store.state;

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
    resumeGame: resumeGameLogic,
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
} = useGameLogic();

const {
    currentTurn,
    currentRole,
    currentActor,
    currentPromptComponent,
    isFirstNightSkipped,
    shouldShowDeadPrompt,
    currentGroupNames
} = useNightPhase();

// Initialize game state and setup watchers
initializeGameState();
setupWatchers();





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





function resumeGame() {
	const saved = loadGameState();
	if (saved && (saved as any).phase !== PHASES.SETUP) {
		resumeGameLogic(saved);
		resumeAvailable.value = false;
	}
}










</script>

<template>
	<!-- Role Details Page -->
	<RoleDetails v-if="isRoleDetails" />
	
	<!-- Main Game Container -->
	<div v-if="!isRoleDetails" class="w-full bg-neutral-950/95 sm:max-w-4xl
	 sm:mx-auto sm:border sm:border-neutral-800/40 sm:rounded-2xl
	 backdrop-blur-sm shadow-xl pt-6 sm:pt-0 sm:p-4 md:p-6 lg:p-8 text-neutral-200" :class="state.phase === PHASES.REVEAL || state.phase === PHASES.NIGHT || state.phase === PHASES.PRE_NIGHT || state.phase === PHASES.RESOLVE || state.phase === PHASES.DAY || state.phase === PHASES.END ? 'overflow-visible' : 'overflow-visible'">

		<!-- Resume banner -->
		<div v-if="resumeAvailable && state.phase === PHASES.SETUP" class="bg-neutral-900/60 sm:border
		 sm:border-neutral-800/40 rounded-xl sm:rounded-xl p-3 sm:p-4 mb-6 mx-4 sm:mx-0 overflow-hidden">
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
		<div v-if="state.phase === PHASES.SETUP" class="space-y-6 text-center px-4 sm:px-0  sm:pb-0">
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

		<!-- Game Phases (outside setup) -->
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
		<div v-else-if="state.phase === PHASES.END" class="
		flex flex-col items-center justify-center px-2 sm:px-6 lg:px-8 py-4 sm:py-6">
			<!-- Main End Game Content -->
			<div v-if="!showEventHistory" class="w-full">
				<WinResults 
					:state="state"
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
					? 'text-blue-400' 
					: 'text-neutral-500'"
			>
				<div class="relative">
					<svg class="w-6 h-6" viewBox="0 0 24 24">
						<path v-if="isHome" fill="currentColor" d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
						<path v-else stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l9-9 9 9M5 10v10a1 1 0 001 1h3a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3a1 1 0 001-1V10"/>
					</svg>
				</div>
				<span class="text-[10px] font-medium mt-1" :class="isHome ? 'text-blue-400' : 'text-neutral-500'">Home</span>
			</router-link>
			<router-link 
				:to="{ name: 'setup', params: { page: 'roles' } }"
				class="flex flex-col items-center justify-center py-2 transition-all duration-200 touch-manipulation"
				:class="isRoles 
					? 'text-blue-400' 
					: 'text-neutral-500'"
			>
				<div class="relative">
					<svg class="w-6 h-6" viewBox="0 0 24 24">
						<path v-if="isRoles" fill="currentColor" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
						<path v-else stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
					</svg>
				</div>
				<span class="text-[10px] font-medium mt-1" :class="isRoles ? 'text-blue-400' : 'text-neutral-500'">Ruoli</span>
			</router-link>
			<router-link 
				:to="{ name: 'setup', params: { page: 'players' } }"
				class="flex flex-col items-center justify-center py-2 transition-all duration-200 touch-manipulation"
				:class="isPlayers 
					? 'text-blue-400' 
					: 'text-neutral-500'"
			>
				<div class="relative">
					<svg class="w-6 h-6" viewBox="0 0 24 24">
						<path v-if="isPlayers" fill="currentColor" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
						<path v-else stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
					</svg>
				</div>
				<span class="text-[10px] font-medium mt-1" :class="isPlayers ? 'text-blue-400' : 'text-neutral-500'">Giocatori</span>
			</router-link>
			<router-link 
				:to="{ name: 'setup', params: { page: 'settings' } }"
				class="flex flex-col items-center justify-center py-2 transition-all duration-200 touch-manipulation"
				:class="isSettings 
					? 'text-blue-400' 
					: 'text-neutral-500'"
			>
				<div class="relative">
					<svg class="w-6 h-6" viewBox="0 0 24 24">
						<path v-if="isSettings" fill="currentColor" d="M12 15a3 3 0 100-6 3 3 0 000 6z"/>
						<path v-if="isSettings" fill="currentColor" d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001 1.51H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/>
						<path v-else stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15a3 3 0 100-6 3 3 0 000 6z"/>
						<path v-else stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001 1.51H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/>
					</svg>

				</div>
				<span class="text-[10px] font-medium mt-1" :class="isSettings ? 'text-blue-400' : 'text-neutral-500'">Impostazioni</span>
			</router-link>
		</div>
	</div>

	<!-- Full Screen Event History Modal -->
	<div v-if="showEventHistory && state.phase === PHASES.END" class="fixed inset-0 bg-neutral-950 z-50 overflow-y-auto">
		<div class="w-full max-w-none sm:max-w-6xl sm:mx-auto min-h-full bg-neutral-950/95 sm:border-x sm:border-neutral-800/40 backdrop-blur-sm shadow-xl text-neutral-200">
			<EventHistory 
				:state="state" 
				:onClose="() => showEventHistory = false" 
			/>
		</div>
	</div>
</template>

 


 
 
 


