<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useGameStore } from '../../stores/game';
import { ROLE_LIST } from '../../roles/index';
import { FACTIONS } from '../../factions';
import { setRoleEnabled as engineSetRoleEnabled, normalizeRoleCounts as engineNormalizeRoleCounts } from '../../core/engine';

const store = useGameStore();
const state = store.state as any;
const router = useRouter();

const roles = computed(() => ROLE_LIST);

const rolesByFaction = computed(() => {
  const groups: Record<string, typeof ROLE_LIST> = {};
  
  roles.value.forEach(role => {
    if (!groups[role.team]) {
      groups[role.team] = [];
    }
    groups[role.team].push(role);
  });
  
  const factionOrder = ['villaggio', 'lupi', 'mannari', 'matti'];
  
  return factionOrder.map(factionName => ({
    name: factionName,
    config: FACTIONS[factionName],
    roles: groups[factionName] || []
  })).filter(group => group.roles.length > 0);
});

function toggleRole(roleId: string): void {
  if (roleId === 'lupo' || roleId === 'villico') return;
  const current = !!(state.setup.rolesEnabled?.[roleId]);
  engineSetRoleEnabled(state, roleId, !current);
}

function isEnabled(roleId: string): boolean {
  if (roleId === 'lupo' || roleId === 'villico') return true;
  return state.setup.rolesEnabled?.[roleId] ?? true;
}

function openRoleDetails(roleId: string): void {
  router.push({ name: 'role-details', query: { role: roleId } });
}
</script>

<template>
  <div class="space-y-4 px-4 sm:px-0">
    <!-- Header Section -->
    <div class="text-center space-y-3">
      <div class="space-y-2">
        <h2 class="text-xl sm:text-xl font-bold text-neutral-100">Seleziona i Ruoli</h2>
        <p class="text-xs text-neutral-400 max-w-md mx-auto leading-relaxed">
          Scegli quali ruoli sono disponibili in questa partita. Contadini e Lupi sono sempre abilitati.
        </p>
      </div>
      
      <!-- Role Summary -->
      <div class="flex items-center justify-center gap-2">
        <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
          <div class="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
          <span class="text-xs font-medium text-neutral-200">Abilitati</span>
          <span class="text-xs font-bold text-emerald-400">
            {{ Object.values(state.setup.rolesEnabled || {}).filter(Boolean).length + 2 }}
          </span>
        </div>
        <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-500/10 border border-neutral-500/20">
          <div class="w-2.5 h-2.5 rounded-full bg-neutral-500"></div>
          <span class="text-xs font-medium text-neutral-200">Disabilitati</span>
          <span class="text-xs font-bold text-neutral-400">
            {{ Object.values(state.setup.rolesEnabled || {}).filter(v => !v).length }}
          </span>
        </div>
      </div>
    </div>

    <!-- Roles grouped by faction -->
    <div class="space-y-4">
      <div v-for="faction in rolesByFaction" :key="faction.name" class="space-y-3">
        <!-- Faction header -->
        <div class="flex items-center gap-2">
          <div class="flex items-center gap-2">
            <div class="w-2.5 h-2.5 rounded-full" :style="{ backgroundColor: faction.config.color }"></div>
            <h4 class="text-sm font-semibold" :style="{ color: faction.config.color }">
              {{ faction.config.displayName }}
            </h4>
          </div>
          <div class="flex-1 h-px bg-neutral-800/50"></div>
          <span class="text-xs text-neutral-500 font-medium">{{ faction.roles.length }} ruol{{ faction.roles.length === 1 ? 'o' : 'i' }}</span>
        </div>
        
        <!-- Roles in this faction -->
        <div class="grid gap-2.5 grid-cols-1">
          <div
            v-for="role in faction.roles"
            :key="role.id"
            class="relative rounded-lg border border-neutral-800/40 p-3 transition-all duration-300 bg-neutral-900/50 overflow-hidden hover:bg-neutral-900/70 hover:border-neutral-700/50 active:scale-[0.98] touch-manipulation"
            :class="[isEnabled(role.id) ? 'opacity-100' : 'opacity-60 grayscale']"
            :style="{ borderColor: isEnabled(role.id) ? `${faction.config.color}40` : undefined }"
          >
            <div class="flex flex-row justify-between gap-3">
              <div class="flex flex-col">
                <div class="flex items-center gap-2 mb-2">
                  <span class="text-sm font-semibold truncate" :style="{ color: faction.config.color }">
                    {{ role.name }}
                  </span>
                  <div v-if="role.id === 'lupo' || role.id === 'villico'" 
                       class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <svg class="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    Sempre
                  </div>
                </div>
                <div class="text-xs text-neutral-400 leading-relaxed text-left">
                  {{ role.description }}
                </div>
              </div>
              
              <div class="flex flex-col items-end justify-between gap-2">
                <!-- Toggle switch -->
                <div class="relative w-12 h-6 bg-neutral-600 rounded-full cursor-pointer" 
                     :class="{ 'bg-emerald-500': isEnabled(role.id) }"
                     @click="toggleRole(role.id)">
                  <div class="absolute top-1 w-4 h-4 rounded-full shadow transition-transform duration-200"
                       :class="{ 
                         'translate-x-6': isEnabled(role.id), 
                         'translate-x-1 bg-white': !isEnabled(role.id) 
                       }"
                       :style="isEnabled(role.id) ? { backgroundColor: faction.config.color } : {}">
                  </div>
                </div>
                
                <!-- Details button -->
                <div
                  @click="openRoleDetails(role.id)"
                  class="px-1.5 py-1 h-fit text-xs font-medium text-neutral-400 bg-neutral-800/40 hover:bg-neutral-700/50 border border-neutral-700/30 rounded-sm transition-all duration-200 hover:text-neutral-300 focus:outline-none focus:ring-1 focus:ring-neutral-500 focus:ring-offset-1 focus:ring-offset-neutral-900 touch-manipulation"
                >
                  Dettagli
                </div>
              </div>
            </div>
            
            <!-- Faction indicator line -->
            <div v-if="isEnabled(role.id)" 
                 class="absolute bottom-0 left-0 right-0 h-0.5 transition-all duration-300"
                 :style="{ backgroundColor: faction.config.color }">
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Note -->
    <div class="text-center p-3 rounded-lg bg-neutral-800/30 border border-neutral-700/30">
      <div class="flex items-center justify-center gap-2 text-xs text-neutral-400">
        <span>Puoi regolare il numero per ogni ruolo nella Home. I Contadini riempiono automaticamente gli slot rimanenti.</span>
      </div>
    </div>
  </div>
</template>


