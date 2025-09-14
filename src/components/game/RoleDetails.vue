<script setup lang="ts">
import { computed, onMounted, watch, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ROLES } from '../../roles/index';
import { getFactionConfig } from '../../factions';
import type { RoleDef } from '../../types';
import { useI18n } from '../../composables/useI18n';
import { getLocalizedRole } from '../../utils/roleLocalization';
import { getFactionDisplayName } from '../../utils/factionUtils';
import { getRoleDisplayName } from '../../utils/roleUtils';

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const roleId = computed(() => route.query.role as string);
const role = computed(() => {
  const rawRole = ROLES[roleId.value] as RoleDef | undefined;
  if (!rawRole) return undefined;
  return getLocalizedRole(roleId.value, t);
});

// Map a role id to its localized display name
function mapRoleIdToName(id: string): string {
  const localizedRole = getLocalizedRole(id, t);
  return localizedRole?.name || id;
}

// Get win condition from faction config
function getWinCondition(team: string): string {
  const faction = getFactionConfig(team);
  return faction?.winConditionDescription ? t(faction.winConditionDescription) : t('roleDetails.specificRoleCondition');
}

// Get actsAtNight display text
function getActsAtNightText(actsAtNight: string | undefined): string {
  switch (actsAtNight) {
    case 'always': return t('roleDetails.always');
    case 'alive': return t('roleDetails.whenAlive');
    case 'dead': return t('roleDetails.whenDead');
    case 'never': return t('roleDetails.never');
    default: return t('roleDetails.never');
  }
}

// Usage policy display - updated for new API
function getUsageDisplay(role: RoleDef): string {
  // Handle legacy usage property first
  if (role.usage) {
    const legacyDisplay: Record<string, string> = {
      'unlimited': t('roleDetails.unlimited'),
      'once': t('roleDetails.once'),
      'requiredEveryNight': t('roleDetails.required')
    };
    return legacyDisplay[role.usage] || role.usage;
  }
  
  // Use new numberOfUsage property
  if (role.numberOfUsage === 'unlimited') {
    return t('roleDetails.unlimited');
  } else if (typeof role.numberOfUsage === 'number') {
    const times = role.numberOfUsage === 1 ? t('roleDetails.times').replace('volte', 'volta') : t('roleDetails.times');
    return `${role.numberOfUsage} ${times} ${t('roleDetails.timesPerGame')}`;
  }
  
  return t('roleDetails.notSpecified');
}

// Effect type display
function getEffectTypeDisplay(effectType?: string): string {
  switch (effectType) {
    case 'required': return t('roleDetails.required');
    case 'optional': return t('roleDetails.optional');
    default: return t('roleDetails.optional');
  }
}

// Start night display
function getStartNightDisplay(startNight?: number): string {
  if (!startNight || startNight === 1) {
    return t('roleDetails.fromNight') + ' ' + t('roleDetails.firstNight');
  }
  return t('roleDetails.fromNight') + ` ${startNight}${t('roleDetails.nightOrdinal')}`;
}

// Get faction display info
function getFactionInfo(team: string | undefined) {
  if (!team) {
    return {
      name: t('roleDetails.unknown'),
      color: 'text-neutral-400',
      bgColor: 'bg-neutral-400',
      ringColor: 'ring-neutral-500/40'
    };
  }
  
  const faction = getFactionConfig(team);
  
  // Convert hex color to Tailwind background class
  let bgColor = 'bg-neutral-400';
  if (faction?.color) {
    // Map common hex colors to Tailwind classes
    const colorMap: Record<string, string> = {
      '#10b981': 'bg-emerald-500', // villaggio green
      '#dc2626': 'bg-red-500',     // lupi red
      '#7c3aed': 'bg-violet-600',  // mannari medium violet
      '#f59e0b': 'bg-amber-500',   // matti amber
      '#3b82f6': 'bg-blue-500',    // parassita blue
      '#8b5cf6': 'bg-violet-500'   // alieni violet
    };
    bgColor = colorMap[faction.color] || 'bg-neutral-400';
  }
  
  return {
    name: getFactionDisplayName(team, t),
    color: faction?.color || 'text-neutral-400',
    bgColor: bgColor,
    ringColor: faction?.ringColor || 'ring-neutral-500/40'
  };
}

function goBack() {
  router.back();
}

// Min/Max count display
function getCountDisplay(role: RoleDef): { min: string; max: string } {
  const defaultPlayers = 8;
  
  let min = '0';
  let max = t('roleDetails.unlimited');
  
  if (role.minCount !== undefined) {
    min = typeof role.minCount === 'function' ? role.minCount(defaultPlayers).toString() : role.minCount.toString();
  }
  
  if (role.maxCount !== undefined) {
    max = typeof role.maxCount === 'function' ? role.maxCount(defaultPlayers).toString() : role.maxCount.toString();
  }
  
  return { min, max };
}

onMounted(() => {
  if (!role.value) {
    router.push('/setup/roles');
  }
  
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

watch(roleId, () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
</script>

<template>
  		<div v-if="role" class="w-full min-h-screen bg-neutral-950 sm:bg-neutral-950/95 sm:max-w-4xl sm:mx-auto sm:border sm:border-neutral-800/40 sm:rounded-2xl backdrop-blur-sm shadow-xl
  pt-6 sm:pt-0 sm:p-4 md:p-6 lg:p-8 text-neutral-200 role-details-page">
    <!-- Header with back button and role name -->
    <div class="relative mb-6">
      <!-- Back button in top left -->
             <div
         @click="goBack"
         class="absolute ml-4 p-1.5 rounded-lg bg-neutral-900/60 hover:bg-neutral-800/60 border border-neutral-800/40 transition-all duration-200 hover:scale-105 z-10 cursor-pointer"
       >
         <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
         </svg>
       </div>
      
      <!-- Role name as main title -->
      <div class="text-center">
        <h1 class="text-2xl md:text-3xl font-semibold text-neutral-100">{{ getRoleDisplayName(role.id, t) }}</h1>
        <p class="text-sm text-neutral-400 mt-1">{{ t('roleDetails.completeRoleDetails') }}</p>
      </div>
    </div>

    <!-- Main content -->
    <div class="space-y-6 px-4 sm:px-0">

      <div class="space-y-6">
        <!-- Role description card -->
        <div class="rounded-lg border border-neutral-800/40 bg-neutral-900/60 p-4">
          <div class="space-y-4">
            <!-- Short description -->
            <div class="flex items-start gap-3">
              <div class="w-8 h-8 rounded-lg flex items-center justify-center" 
                   :style="{ backgroundColor: getFactionConfig(role.team)?.color + '20' || '#374151' }">
                <div class="w-3 h-3 rounded-full" 
                     :style="{ backgroundColor: getFactionConfig(role.team)?.color || '#9ca3af' }"></div>
              </div>
              <div class="flex-1">
                <h3 class="text-sm font-semibold text-neutral-200 mb-1">{{ t('roleDetails.description') }}</h3>
                <p class="text-sm text-neutral-400 leading-relaxed">{{ role.description }}</p>
              </div>
            </div>
            
            <!-- Long description with examples and strategy -->
            <div v-if="role.longDescription" class="border-t border-neutral-800/40 pt-4">
              <div class="flex items-start gap-3">
                <div class="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-500/20">
                  <svg class="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div class="flex-1">
                  <h3 class="text-sm font-semibold text-neutral-200 mb-2">{{ t('roleDetails.detailedDescription') }}</h3>
                  <div class="text-sm text-neutral-300 leading-relaxed whitespace-pre-line">{{ role.longDescription }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Faction Information Section -->
        <div class="space-y-4">
          <!-- Section header -->
          <div class="flex items-center gap-2">
            <div class="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
            <h4 class="text-sm font-semibold text-emerald-400">{{ t('roleDetails.factionInformation') }}</h4>
            <div class="flex-1 h-px bg-neutral-800/50"></div>
          </div>
          
          <div class="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            <!-- Real faction -->
            <div class="rounded-lg border border-neutral-800/40 bg-neutral-900/60 p-3">
              <div class="flex items-center gap-3 mb-2">
                <div class="w-2.5 h-2.5 rounded-full" :style="{ backgroundColor: getFactionConfig(role.team)?.color || '#9ca3af' }"></div>
                <span class="text-sm font-medium text-neutral-200">{{ t('roleDetails.realFaction') }}</span>
              </div>
              <div class="flex items-center gap-2 mb-1">
                <span class="font-semibold text-sm" :style="{ color: getFactionConfig(role.team)?.color || '#e5e7eb' }">
                  {{ getFactionInfo(role.team).name }}
                </span>
              </div>
              <p class="text-xs text-neutral-400">{{ t('roleDetails.realFactionDesc') }}</p>
            </div>

            <!-- Visible faction -->
            <div class="rounded-lg border border-neutral-800/40 bg-neutral-900/60 p-3">
              <div class="flex items-center gap-3 mb-2">
                <div class="w-2.5 h-2.5 rounded-full" :style="{ backgroundColor: getFactionConfig(role.visibleAsTeam || role.team || 'villaggio')?.color || '#9ca3af' }"></div>
                <span class="text-sm font-medium text-neutral-200">{{ t('roleDetails.howItAppears') }}</span>
              </div>
              <div class="flex items-center gap-2 mb-1">
                <span class="font-semibold text-sm" :style="{ color: getFactionConfig(role.visibleAsTeam || role.team || 'villaggio')?.color || '#e5e7eb' }">
                  {{ getFactionInfo(role.visibleAsTeam || role.team || 'villaggio').name }}
                </span>
              </div>
              <p class="text-xs text-neutral-400">{{ t('roleDetails.howItAppearsDesc') }}</p>
            </div>

            <!-- Counts as faction -->
            <div v-if="role.countAs" class="rounded-lg border border-neutral-800/40 bg-neutral-900/60 p-3">
              <div class="flex items-center gap-3 mb-2">
                <div class="w-2.5 h-2.5 rounded-full" :style="{ backgroundColor: getFactionConfig(role.countAs)?.color || '#9ca3af' }"></div>
                <span class="text-sm font-medium text-neutral-200">{{ t('roleDetails.countsAs') }}</span>
              </div>
              <div class="flex items-center gap-2 mb-1">
                <span class="font-semibold text-sm" :style="{ color: getFactionConfig(role.countAs)?.color || '#e5e7eb' }">
                  {{ getFactionInfo(role.countAs).name }}
                </span>
              </div>
              <p class="text-xs text-neutral-400">{{ t('roleDetails.countsAsDesc') }}</p>
            </div>
          </div>
        </div>

        <!-- Game Mechanics Section -->
        <div class="space-y-4">
          <!-- Section header -->
          <div class="flex items-center gap-2">
            <div class="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
            <h4 class="text-sm font-semibold text-blue-400">{{ t('roleDetails.gameMechanics') }}</h4>
            <div class="flex-1 h-px bg-neutral-800/50"></div>
          </div>
          
          <div class="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            <!-- Player count constraints -->
            <div class="rounded-lg border border-neutral-800/40 bg-neutral-900/60 p-3">
              <div class="flex items-center gap-3 mb-2">
                <div class="w-2.5 h-2.5 rounded-full bg-purple-500"></div>
                <span class="text-sm font-medium text-neutral-200">{{ t('roleDetails.playerCount') }}</span>
              </div>
              <div class="space-y-2">
                <div class="flex justify-between items-center">
                  <span class="text-xs text-neutral-400">{{ t('roleDetails.minCount') }}:</span>
                  <span class="font-semibold text-sm">{{ getCountDisplay(role).min }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-xs text-neutral-400">{{ t('roleDetails.maxCount') }}:</span>
                  <span class="font-semibold text-sm">{{ getCountDisplay(role).max }}</span>
                </div>
              </div>
            </div>

            <!-- Win condition -->
            <div class="rounded-lg border border-neutral-800/40 bg-neutral-900/60 p-3">
              <div class="flex items-center gap-3 mb-2">
                <div class="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                <span class="text-sm font-medium text-neutral-200">{{ t('roleDetails.winCondition') }}</span>
              </div>
              <p class="text-xs text-neutral-400 leading-relaxed">
                {{ getWinCondition(role.team) }}
              </p>
            </div>

            <!-- When can act at night -->
            <div v-if="role.actsAtNight && role.actsAtNight !== 'never'" class="rounded-lg border border-neutral-800/40 bg-neutral-900/60 p-3">
              <div class="flex items-center gap-3 mb-2">
                <div class="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                <span class="text-sm font-medium text-neutral-200">{{ t('roleDetails.nightAction') }}</span>
              </div>
              <p class="text-xs text-neutral-400 leading-relaxed">
                {{ getActsAtNightText(role.actsAtNight) }}
              </p>
            </div>

            <!-- Usage count -->
            <div v-if="role.usage || role.numberOfUsage" class="rounded-lg border border-neutral-800/40 bg-neutral-900/60 p-3">
              <div class="flex items-center gap-3 mb-2">
                <div class="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                <span class="text-sm font-medium text-neutral-200">{{ t('roleDetails.usage') }}</span>
              </div>
              <p class="text-xs text-neutral-400 leading-relaxed">
                {{ getUsageDisplay(role) }}
              </p>
            </div>

            <!-- Start night -->
            <div v-if="role.startNight && role.startNight > 1" class="rounded-lg border border-neutral-800/40 bg-neutral-900/60 p-3">
              <div class="flex items-center gap-3 mb-2">
                <div class="w-2.5 h-2.5 rounded-full bg-cyan-500"></div>
                <span class="text-sm font-medium text-neutral-200">{{ t('roleDetails.startNight') }}</span>
              </div>
              <p class="text-xs text-neutral-400 leading-relaxed">
                {{ getStartNightDisplay(role.startNight) }}
              </p>
            </div>
          </div>
        </div>

        <!-- Abilities Section -->
        <div v-if="role.actsAtNight !== 'never' || role.usage || role.numberOfUsage || role.effectType || role.startNight || role.affectedRoles" class="space-y-4">
          <!-- Section header -->
          <div class="flex items-center gap-2">
            <div class="w-2.5 h-2.5 rounded-full bg-orange-500"></div>
            <h4 class="text-sm font-semibold text-orange-400">{{ t('roleDetails.abilitiesAndFeatures') }}</h4>
            <div class="flex-1 h-px bg-neutral-800/50"></div>
          </div>
          
          <div class="rounded-lg border border-neutral-800/40 bg-neutral-900/60 p-4">
            <div class="grid gap-3 grid-cols-1">
              <!-- Effect type (required/optional) -->
              <div v-if="role.effectType" class="flex items-center gap-3 p-3 rounded-lg bg-neutral-800/40">
                <div class="w-2 h-2 rounded-full bg-amber-400"></div>
                <span class="text-xs font-medium text-neutral-200">{{ getEffectTypeDisplay(role.effectType) }}</span>
              </div>
              

              
              <!-- Can target dead -->
              <div v-if="role.canTargetDead" class="flex items-center gap-3 p-3 rounded-lg bg-neutral-800/40">
                <div class="w-2 h-2 rounded-full bg-gray-400"></div>
                <span class="text-xs font-medium text-neutral-200">{{ t('roleDetails.canTargetDead') }}</span>
              </div>
              
              <!-- Affected roles -->
              <div v-if="role.affectedRoles?.length" class="flex items-center gap-3 p-3 rounded-lg bg-neutral-800/40">
                <div class="w-2 h-2 rounded-full bg-red-400"></div>
                <span class="text-xs font-medium text-neutral-200">{{ t('roleDetails.affects') }}: {{ role.affectedRoles.map(mapRoleIdToName).join(', ') }}</span>
              </div>
              
              <!-- Known to other roles -->
              <div v-if="role.knownTo?.length" class="flex items-center gap-3 p-3 rounded-lg bg-neutral-800/40">
                <div class="w-2 h-2 rounded-full bg-pink-400"></div>
                <span class="text-xs font-medium text-neutral-200">{{ t('roleDetails.knownTo') }}: {{ role.knownTo.map(mapRoleIdToName).join(', ') }}</span>
              </div>
              
              <!-- Reveal to allies -->
              <div v-if="role.revealToAllies" class="flex items-center gap-3 p-3 rounded-lg bg-neutral-800/40">
                <div class="w-2 h-2 rounded-full bg-indigo-400"></div>
                <span class="text-xs font-medium text-neutral-200">{{ t('roleDetails.revealedToAllies') }}: {{ role.revealToAllies === 'role' ? t('roleDetails.roleName') : t('roleDetails.factionOnly') }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Fallback if role not found -->
  		<div v-else class="w-full min-h-screen bg-neutral-950 sm:bg-neutral-950/95 sm:max-w-4xl sm:mx-auto sm:border sm:border-neutral-800/40 sm:rounded-2xl backdrop-blur-sm shadow-xl pt-6 sm:pt-0 sm:p-4 md:p-6 lg:p-8 text-neutral-200">
    <!-- Header with back button -->
    <div class="relative mb-6">
      <!-- Back button in top left -->
      <button 
        @click="router.push('/setup/roles')"
        class="absolute top-0 left-0 p-1.5 rounded-lg bg-neutral-900/60 hover:bg-neutral-800/60 border border-neutral-800/40 transition-all duration-200 hover:scale-105 z-10"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      
      <!-- Error title -->
      <div class="text-center">
        <h1 class="text-2xl md:text-3xl font-semibold text-neutral-100">{{ t('roleDetails.roleNotFoundTitle') }}</h1>
        <p class="text-sm text-neutral-400 mt-1">{{ t('roleDetails.roleNotFoundSubtitle') }}</p>
      </div>
    </div>
    
    <div class="flex items-center justify-center min-h-96">
      <div class="text-center space-y-4 px-4 sm:px-0">
        <div class="w-16 h-16 rounded-full bg-neutral-800/40 flex items-center justify-center mx-auto">
          <svg class="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <div class="space-y-2">
          <p class="text-sm text-neutral-400">{{ t('roleDetails.roleNotFound') }}</p>
        </div>
        <button 
          @click="router.push('/setup/roles')"
          class="btn btn-primary text-sm px-4 py-2"
        >
          {{ t('roleDetails.backToRoles') }}
        </button>
      </div>
    </div>
  </div>
</template>
