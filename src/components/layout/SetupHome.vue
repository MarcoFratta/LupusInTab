<script setup lang="ts">
import { computed, ref } from 'vue';
import { useGameStore } from '../../stores/game';
import { useGameState } from '../../composables/useGameState';
import { ROLE_LIST } from '../../roles/index';
import { shuffled } from '../../utils/random';
import {
  beginReveal as engineBeginReveal,
  getMaxCountForRole as engineGetMaxCountForRole,
  updateRoleCount as engineUpdateRoleCount,
  getMinCountForRole as engineGetMinCountForRole,
} from '../../core/engine';
import RoleCard from '../game/RoleCard.vue';
import { useTeamBalance } from '../../composables/useTeamBalance';
import { SetupTitle } from '../ui';
import { useCache } from '../../composables/useCache';
import { cacheService } from '../../services/CacheService';

const store = useGameStore();
const state = store.state as any;

const { teamBalance } = useTeamBalance();
const { canStart: canStartFromState } = useGameState();
const { currentVersion, newVersion, forceUpdateCheck, isUpdating, clearCache: cacheClearCache, cacheLogs } = useCache();

const debugLogs = computed(() => cacheLogs.value);

const addDebugLog = (message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
  // This will now use the cache service logs
  console.log(`Debug: ${message}`);
};

const clearDebugLogs = () => {
  // Clear cache logs by clearing the cache
  cacheClearCache();
};

const getLogClass = (type: string) => {
  switch (type) {
    case 'success': return 'text-green-400';
    case 'error': return 'text-red-400';
    case 'warning': return 'text-yellow-400';
    default: return 'text-neutral-200';
  }
};

const testCacheInit = async () => {
  addDebugLog('Testing cache initialization...', 'info');
  try {
    // This will trigger the cache service initialization
    addDebugLog('Triggering cache service initialization...', 'info');
    await cacheService.initialize();
    addDebugLog('Cache service initialization completed', 'success');
  } catch (error) {
    addDebugLog(`Cache init test failed: ${error}`, 'error');
  }
};

const testNetworkCheck = async () => {
  addDebugLog('Testing network connection...', 'info');
  try {
    const response = await fetch('https://httpbin.org/status/200');
    if (response.ok) {
      addDebugLog('Network test successful - internet connection available', 'success');
    } else {
      addDebugLog('Network test failed - no internet connection', 'error');
    }
  } catch (error) {
    addDebugLog(`Network test failed: ${error}`, 'error');
  }
};

const testVersionFetch = async () => {
  addDebugLog('Testing version.json fetch...', 'info');
  try {
    const response = await fetch('https://lupus-in-tabula.vercel.app/version.json');
    if (response.ok) {
      const versionInfo = await response.json();
      addDebugLog(`Version fetch successful: ${versionInfo.version}`, 'success');
    } else {
      addDebugLog(`Version fetch failed: HTTP ${response.status}`, 'error');
    }
  } catch (error) {
    addDebugLog(`Version fetch failed: ${error}`, 'error');
  }
};

const clearCache = async () => {
  addDebugLog('Clearing cache...', 'warning');
  try {
    await cacheClearCache();
    addDebugLog('Cache cleared successfully', 'success');
  } catch (error) {
    addDebugLog(`Cache clear failed: ${error}`, 'error');
  }
};

const roleCounts = computed(() => ({ ...state.setup.rolesCounts }));
const totalRolesSelected = computed(() => {
  const values = Object.values(roleCounts.value as Record<string, number>);
  return values.reduce((a: number, b: number) => a + (Number(b) || 0), 0);
});

const disadvantagedTeam = computed(() => {
  const teamData = teamBalance.value.teamData;
  if (!teamData || Object.keys(teamData).length === 0) return null;
  
  let minPower = Infinity;
  let disadvantagedTeamName = '';
  
  Object.entries(teamData).forEach(([teamName, team]) => {
    if (team.players > 0 && team.power < minPower) {
      minPower = team.power;
      disadvantagedTeamName = teamName;
    }
  });
  
  return disadvantagedTeamName;
});

const getTeamDisplayName = (teamName: string) => {
  const teamNames: Record<string, string> = {
    'villaggio': 'Villaggio',
    'lupi': 'Lupi',
    'mannari': 'Mannari',
    'matti': 'Matti'
  };
  return teamNames[teamName] || teamName;
};

const canStart = canStartFromState;

const hasDuplicateNames = computed(() => {
  const names = state.setup.players.map((p: any) => p.name?.trim().toLowerCase()).filter(Boolean);
  const duplicates = names.filter((name: string, index: number) => names.indexOf(name) !== index);
  return duplicates.length > 0;
});

const numWolves = computed(() => roleCounts.value?.['lupo'] || 0);
const hasEnoughPlayers = computed(() => state.setup.players.length >= 4);
const hasEnoughWolves = computed(() => numWolves.value >= 1);
const rolesMatchPlayers = computed(() => totalRolesSelected.value === state.setup.players.length);

function getMaxCountForRole(roleId: string): number {
  return engineGetMaxCountForRole(state, roleId);
}

function getMinCountForRole(roleId: string): number {
  return engineGetMinCountForRole(state as any, roleId);
}

function updateRoleCount(roleId: string, count: number) {
  engineUpdateRoleCount(state, roleId, count);
}

function beginReveal() {
  engineBeginReveal(state, ROLE_LIST as any, shuffled);
}

const factionOrder: Record<string, number> = {
  'villaggio': 0,
  'lupi': 1,
  'mannari': 2,
  'matti': 3,
  'parassita': 4,
  'alieni': 5,
};

const sortedEnabledRoles = computed(() => {
  return ROLE_LIST
    .filter(r => state.setup.rolesEnabled?.[r.id] ?? true)
    .slice()
    .sort((a, b) => {
      const ao = factionOrder[a.team] ?? 99;
      const bo = factionOrder[b.team] ?? 99;
      if (ao !== bo) return ao - bo;
      const ap = Number((a as any).phaseOrder) || 0;
      const bp = Number((b as any).phaseOrder) || 0;
      if (ap !== bp) return ap - bp;
      return String(a.name).localeCompare(String(b.name));
    });
});
</script>

<template>
  <div class="w-full px-3 md:px-6 space-y-4 md:space-y-6">
    <!-- Setup Title -->
    <SetupTitle title="Configurazione" />
    
    <!-- Cache Status Display -->
    <div class="bg-neutral-800/50 border border-neutral-700/40 rounded-xl p-3 mx-4 sm:mx-0">
      <div class="flex items-center justify-between text-sm">
        <span class="text-neutral-400">Cache Status:</span>
        <div class="flex items-center gap-2">
          <span class="text-neutral-300">v{{ currentVersion || 'None' }}</span>
          <span v-if="newVersion && newVersion !== currentVersion" class="text-violet-400">
            → v{{ newVersion }}
          </span>
          <span v-if="isUpdating" class="text-yellow-400">Updating...</span>
        </div>
      </div>
      <div class="mt-2 flex justify-end">
        <button 
          @click="forceUpdateCheck" 
          :disabled="isUpdating"
          class="px-3 py-1 text-xs bg-violet-600 hover:bg-violet-700 disabled:bg-neutral-600 rounded-lg transition-colors"
        >
          {{ isUpdating ? 'Checking...' : 'Check Updates' }}
        </button>
      </div>
    </div>

    <!-- Cache Debug Card -->
    <div class="bg-neutral-800/50 border border-neutral-700/40 rounded-xl p-3 mx-4 sm:mx-0">
      <div class="flex items-center justify-between mb-3">
        <h4 class="text-sm font-medium text-neutral-300">Cache Debug</h4>
        <button 
          @click="clearDebugLogs" 
          class="px-2 py-1 text-xs bg-neutral-600 hover:bg-neutral-500 rounded transition-colors"
        >
          Clear Logs
        </button>
      </div>
      
      <!-- Debug Actions -->
      <div class="flex flex-wrap gap-2 mb-3">
        <button 
          @click="testCacheInit" 
          class="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-500 rounded transition-colors"
        >
          Test Init
        </button>
        <button 
          @click="testNetworkCheck" 
          class="px-2 py-1 text-xs bg-green-600 hover:bg-green-500 rounded transition-colors"
        >
          Test Network
        </button>
        <button 
          @click="testVersionFetch" 
          class="px-2 py-1 text-xs bg-purple-600 hover:bg-purple-500 rounded transition-colors"
        >
          Test Version
        </button>
        <button 
          @click="clearCache" 
          class="px-2 py-1 text-xs bg-red-600 hover:bg-red-500 rounded transition-colors"
        >
          Clear Cache
        </button>
      </div>

      <!-- Debug Logs -->
      <div class="bg-neutral-900/80 rounded-lg p-2 max-h-40 overflow-y-auto">
        <div v-if="debugLogs.length === 0" class="text-xs text-neutral-500 text-center py-2">
          No debug logs yet. Try the actions above or wait for auto-updates.
        </div>
        <div v-else class="space-y-1">
          <div 
            v-for="(log, index) in debugLogs" 
            :key="index" 
            class="text-xs font-mono"
            :class="getLogClass(log.type)"
          >
            <span class="text-neutral-500">{{ log.time }}</span>
            <span class="ml-2">{{ log.message }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Player Count and Start Button -->
    <!-- Quick Status Bar - Mobile Optimized -->
    <div class="bg-neutral-900/60 border border-neutral-800/40 rounded-xl p-3 md:p-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2 md:gap-3">
          <div class="w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300"
               :class="totalRolesSelected === state.setup.players.length 
                 ? 'bg-gradient-to-br from-violet-500/30 to-fuchsia-500/30 border border-violet-400/50' 
                 : 'bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/30'">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
                 :class="totalRolesSelected === state.setup.players.length ? 'text-violet-400' : 'text-red-400'">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="2" fill="none"/>
            </svg>
          </div>
          <div class="flex items-center gap-1 md:gap-2">
            <div class="text-xl md:text-2xl lg:text-3xl font-black leading-none tabular-nums" 
                 :class="totalRolesSelected === state.setup.players.length 
                   ? 'bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent' 
                   : 'bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent'">
              {{ totalRolesSelected }}
            </div>
            <div class="text-xl md:text-2xl lg:text-3xl font-bold leading-none text-neutral-400">/</div>
            <div class="text-xl md:text-2xl lg:text-3xl font-bold leading-none text-neutral-200">{{ state.setup.players.length }}</div>
          </div>
        </div>
        
        <button class="group relative px-3 md:px-4 py-2 md:py-2.5 rounded-lg md:rounded-xl font-semibold text-sm md:text-base transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 overflow-hidden" 
                :class="canStart 
                  ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/25' 
                  : 'bg-neutral-800/60 text-neutral-400 border border-neutral-700/50'" 
                :disabled="!canStart" 
                @click="beginReveal">
          <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div class="absolute inset-0 bg-gradient-to-r from-violet-400 to-fuchsia-400"></div>
            <div class="absolute inset-0 bg-gradient-to-r from-violet-500 to-fuchsia-500 opacity-80"></div>
          </div>
          
          <div class="relative px-2 z-10 flex items-center gap-1.5 md:gap-2">
            <svg v-if="canStart" class="w-4 h-4 md:w-5 md:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
            <svg v-else class="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path>
            </svg>
            <span class="font-medium">{{ canStart ? 'Avvia' : 'Configura' }}</span>
          </div>
          
          <div class="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        </button>
      </div>
    </div>

    <!-- Duplicate Names Warning -->
    <div v-if="hasDuplicateNames" class="bg-red-500/10 border border-red-500/30 rounded-xl p-3 md:p-4">
      <div class="flex items-center gap-3 text-red-400">
        <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
        </svg>
        <span class="text-sm font-medium">Risolvi i nomi duplicati per avviare il gioco</span>
      </div>
    </div>

    <!-- Mobile-First Content Sections -->
    <div class="space-y-4 md:space-y-6">
      
      <!-- Team Balance Section -->
      <div class="bg-neutral-900/60 border border-neutral-800/40 rounded-xl p-4 md:p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg md:text-xl font-semibold text-neutral-200">Bilanciamento</h3>
          <div class="text-2xl md:text-3xl font-bold" 
               :class="teamBalance.fairness >= 70 
                 ? 'text-violet-400' 
                 : teamBalance.fairness >= 50 
                 ? 'text-yellow-400' 
                 : 'text-red-400'">
            {{ teamBalance.fairness }}%
          </div>
        </div>
        
        <div class="space-y-3">
          <div class="w-full bg-neutral-800/40 rounded-full h-2.5 md:h-3 overflow-hidden">
            <div class="h-2.5 md:h-3 rounded-full transition-all duration-500 ease-out"
                 :class="teamBalance.fairness >= 70 
                   ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500' 
                   : teamBalance.fairness >= 50 
                   ? 'bg-gradient-to-r from-yellow-500 to-orange-500' 
                   : 'bg-gradient-to-r from-red-500 to-orange-500'"
                 :style="{ width: `${teamBalance.fairness}%` }">
            </div>
          </div>
          
          <div v-if="disadvantagedTeam && teamBalance.fairness < 100" class="text-center text-xs text-neutral-500">
            Fazione più debole: <span class="font-medium text-neutral-400">{{ getTeamDisplayName(disadvantagedTeam) }}</span>
          </div>
        </div>
      </div>

      <!-- Roles Section -->
      <div class="space-y-4">
        <div class="text-center space-y-3">
          <h3 class="text-lg md:text-xl font-semibold text-neutral-200">Ruoli</h3>
          <div class="w-full md:w-16 h-0.5 bg-gradient-to-r from-violet-500/50 to-fuchsia-500/50 mx-auto rounded-full"></div>
        </div>
        
        <!-- Mobile-Optimized Role Grid -->
        <div class="grid gap-3 grid-cols-2 auto-rows-[1fr]">
          <RoleCard
            v-for="role in sortedEnabledRoles"
            :key="role.id"
            :role="role"
            :count="state.setup.rolesCounts[role.id] || 0"
            :max-count="getMaxCountForRole(role.id)"
            :min-count="getMinCountForRole(role.id)"
            :on-count-change="(count:number) => updateRoleCount(role.id, count)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

