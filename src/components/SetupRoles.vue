<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useGameStore } from '../stores/game';
import { ROLE_LIST } from '../roles/index';
import { FACTIONS } from '../factions';
import { setRoleEnabled as engineSetRoleEnabled, normalizeRoleCounts as engineNormalizeRoleCounts } from '../core/engine';

const store = useGameStore();
const state = store.state as any;
const router = useRouter();

const roles = computed(() => ROLE_LIST);

// Group roles by faction for better organization
const rolesByFaction = computed(() => {
  const groups: Record<string, typeof ROLE_LIST> = {};
  
  roles.value.forEach(role => {
    if (!groups[role.team]) {
      groups[role.team] = [];
    }
    groups[role.team].push(role);
  });
  
  // Define faction order for consistent display
  const factionOrder = ['villaggio', 'lupi', 'mannari', 'matti'];
  
  return factionOrder.map(factionName => ({
    name: factionName,
    config: FACTIONS[factionName],
    roles: groups[factionName] || []
  })).filter(group => group.roles.length > 0);
});

function toggleRole(roleId: string): void {
  		// Villico and Lupo cannot be disabled
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
  <div class="space-y-6">
    <!-- Intro -->
    <div class="text-center">
      <h3 class="text-lg font-semibold text-neutral-100 mb-1">Seleziona i ruoli</h3>
      <p class="text-sm text-neutral-400">Scegli quali ruoli sono disponibili in questa partita. Contadini e Lupi sono sempre abilitati.</p>
    </div>

    <!-- Roles grouped by faction -->
    <div class="space-y-8">
      <div v-for="faction in rolesByFaction" :key="faction.name" class="space-y-4">
        <!-- Faction header -->
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 rounded-full" :class="faction.config.ringColor.replace('ring-', 'bg-').replace('/40', '')"></div>
            <h4 class="text-base font-semibold" :style="{ color: faction.config.color }">
              {{ faction.config.displayName }}
            </h4>
          </div>
          <div class="flex-1 h-px bg-neutral-800/50"></div>
          <span class="text-xs text-neutral-500">{{ faction.roles.length }} ruol{{ faction.roles.length === 1 ? 'o' : 'i' }}</span>
        </div>
        
        <!-- Roles in this faction -->
        <div class="grid gap-3 grid-cols-1">
          <div
            v-for="role in faction.roles"
            :key="role.id"
            class="relative rounded-xl border border-neutral-800/40 p-4 transition-all ring-1 ring-inset bg-neutral-900/50 overflow-hidden"
            :class="[faction.config.ringColor, isEnabled(role.id) ? 'opacity-100' : 'opacity-60 grayscale']"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2 flex-wrap md:flex-nowrap min-w-0 md:items-start">
                  <span class="text-sm font-semibold truncate min-w-0" :style="{ color: faction.config.color }">{{ role.name }}</span>
                </div>
                <div class="mt-1 text-xs text-neutral-400 line-clamp-2 text-left">{{ role.description }}</div>
                				<div v-if="role.id === 'lupo' || role.id === 'villico'" class="mt-2 text-[10px] text-neutral-400 text-left">Sempre abilitato</div>
              </div>
              
              <div class="shrink-0 flex flex-col items-end gap-2">
                <!-- Toggle switch -->
                <button
                  type="button"
                  class="w-10 h-6 rounded-full border border-neutral-800/50 bg-neutral-900/60 relative transition-colors hover:bg-neutral-800/70"
                  :class="isEnabled(role.id) ? 'bg-neutral-800/60' : 'bg-neutral-900/60'"
                  @click="toggleRole(role.id)"
                  					:disabled="role.id === 'lupo' || role.id === 'villico'"
                >
                  <div class="absolute top-1/2 -translate-y-1/2 transition-all w-4 h-4 rounded-full"
                       :class="isEnabled(role.id) ? 'translate-x-6 bg-emerald-400' : 'translate-x-1 bg-neutral-600'" />
                </button>
                
                <!-- Details button -->
                <button
                  @click="openRoleDetails(role.id)"
                  class="px-2 py-1 text-[10px] font-medium text-neutral-400 bg-neutral-800/40 hover:bg-neutral-700/50 border border-neutral-700/50 rounded-md transition-colors"
                >
                  Dettagli
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Note -->
    <div class="text-center text-xs text-neutral-400">
      Puoi regolare il numero per ogni ruolo nella Home. I Contadini riempiono automaticamente gli slot rimanenti.
    </div>
  </div>
</template>


