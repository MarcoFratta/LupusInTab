<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useGameStore } from '../../stores/game';
import { ROLE_LIST } from '../../roles/index';
import { FACTIONS } from '../../factions';
import { setRoleEnabled as engineSetRoleEnabled, normalizeRoleCounts as engineNormalizeRoleCounts } from '../../core/engine';
import { SetupTitle } from '../ui';

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
  
  const factionOrder = ['villaggio', 'lupi', 'mannari', 'matti', 'parassita', 'alieni'];
  
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
  <div class="w-full px-3 md:px-6 space-y-4 md:space-y-6">
    <SetupTitle 
      title="Seleziona i Ruoli"
      subtitle="Scegli quali ruoli sono disponibili in questa partita. Contadini e Lupi sono sempre abilitati."
      :showStats="true"
      :statsData="{
        enabled: Object.values(state.setup.rolesEnabled || {}).filter(Boolean).length + 2,
        disabled: Object.values(state.setup.rolesEnabled || {}).filter(v => !v).length
      }"
    />

    <div class="space-y-6">
      <div v-for="faction in rolesByFaction" :key="faction.name" class="space-y-4">
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-3">
            <div class="w-3 h-3 rounded-full" :style="{ backgroundColor: faction.config.color }"></div>
            <h4 class="text-lg md:text-xl font-semibold text-neutral-200">
              {{ faction.config.displayName }}
            </h4>
          </div>
          <div class="flex-1 h-px bg-gradient-to-r from-neutral-600 to-transparent opacity-30"></div>
          <span class="text-sm text-neutral-500 font-medium">{{ faction.roles.length }} ruol{{ faction.roles.length === 1 ? 'o' : 'i' }}</span>
        </div>
        
        <div class="grid gap-3 grid-cols-1">
          <div
            v-for="role in faction.roles"
            :key="role.id"
            class="group relative overflow-hidden rounded-xl border border-neutral-800/40 p-4 md:p-5 transition-all duration-300 bg-neutral-900/60 hover:bg-neutral-900/80 hover:border-neutral-700/50 active:scale-[0.98] touch-manipulation"
            :class="[isEnabled(role.id) ? 'opacity-100' : 'opacity-60 grayscale']"
          >
            <div class="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <div class="relative flex flex-row justify-between gap-4">
              <div class="flex flex-col flex-1">
                <div class="flex items-center gap-3 mb-3">
                  <span class="text-lg md:text-xl font-semibold truncate"
                        :style="{ color: faction.config.color }">
                    {{ role.name }}
                  </span>
                  <div v-if="role.id === 'lupo' || role.id === 'villico'" 
                       class="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                    </svg>
                    Sempre
                  </div>
                </div>
                <div class="text-sm text-neutral-400 leading-relaxed text-left">
                  {{ role.description }}
                </div>
              </div>
              
              <div class="flex flex-col items-end justify-between gap-3">
                <div class="relative w-14 h-7 bg-neutral-600 rounded-full cursor-pointer transition-all duration-200" 
                     :class="{ 'bg-violet-500': isEnabled(role.id) }"
                     @click="toggleRole(role.id)">
                  <div class="absolute top-0.5 w-6 h-6 rounded-full shadow transition-transform duration-200"
                       :class="{ 
                         'translate-x-7 bg-white': isEnabled(role.id), 
                         'translate-x-0.5 bg-neutral-300': !isEnabled(role.id) 
                       }">
                  </div>
                </div>
                
                <div
                  @click="openRoleDetails(role.id)"
                  class="px-3 py-2 h-fit text-sm font-medium text-neutral-400 bg-neutral-800/40 hover:bg-neutral-700/50 border border-neutral-700/30 rounded-lg transition-all duration-200 hover:text-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2 focus:ring-offset-neutral-900 touch-manipulation"
                >
                  Dettagli
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


