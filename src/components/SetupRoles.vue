<script setup lang="ts">
import { computed } from 'vue';
import { useGameStore } from '../stores/game';
import { ROLE_LIST } from '../roles/index';
import { setRoleEnabled as engineSetRoleEnabled, normalizeRoleCounts as engineNormalizeRoleCounts } from '../core/engine';

const store = useGameStore();
const state = store.state as any;

const roles = computed(() => ROLE_LIST);

function toggleRole(roleId: string): void {
  // Villager and Wolf cannot be disabled
  if (roleId === 'wolf' || roleId === 'villager') return;
  const current = !!(state.setup.rolesEnabled?.[roleId]);
  engineSetRoleEnabled(state, roleId, !current);
}

function isEnabled(roleId: string): boolean {
  if (roleId === 'wolf' || roleId === 'villager') return true;
  return state.setup.rolesEnabled?.[roleId] ?? true;
}

function roleTeamClass(team: string): string {
  // Use a subtle ring only; avoid coloring the whole card to prevent clashes with role color name
  if (team === 'wolf') return 'ring-red-500/40';
  if (team === 'crazyman') return 'ring-violet-500/40';
  if (team === 'dog') return 'ring-indigo-500/40';
  return 'ring-emerald-500/40';
}

function rolePillTeamClass(team: string): string {
  if (team === 'wolf') return 'bg-red-500/20 text-red-400';
  if (team === 'crazyman') return 'bg-violet-500/20 text-violet-400';
  if (team === 'dog') return 'bg-indigo-500/20 text-indigo-400';
  return 'bg-emerald-500/20 text-emerald-400';
}

</script>

<template>
  <div class="space-y-6">
    <!-- Intro -->
    <div class="text-center">
      <h3 class="text-lg font-semibold text-neutral-100 mb-1">Seleziona i ruoli</h3>
      <p class="text-sm text-neutral-400">Scegli quali ruoli sono disponibili in questa partita. Contadini e Lupi sono sempre abilitati.</p>
    </div>

    <!-- Grid of role toggles (one per row for readability) -->
    <div class="grid gap-3 grid-cols-1">
      <button
        v-for="role in roles"
        :key="role.id"
        type="button"
        class="group relative text-left rounded-xl border border-neutral-800/40 p-4 transition-all ring-1 ring-inset bg-neutral-900/50 hover:bg-neutral-900/70"
        :class="[roleTeamClass(role.team), isEnabled(role.id) ? 'opacity-100' : 'opacity-60 grayscale']"
        @click="toggleRole(role.id)"
        :disabled="role.id === 'wolf' || role.id === 'villager'"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <div class="flex items-center gap-2">
              <span class="text-sm font-semibold truncate" :style="{ color: role.color || '#e5e7eb' }">{{ role.name }}</span>
              <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-medium"
                    :class="rolePillTeamClass(role.team)">
                <span class="w-1 h-1 rounded-full bg-current"></span>
                {{ role.team === 'wolf' ? 'Wolf' : (role.team === 'crazyman' ? 'Crazyman' : (role.team === 'dog' ? 'Dog' : 'Village')) }}
              </span>
            </div>
            <div class="mt-1 text-xs text-neutral-400 line-clamp-2">{{ role.description }}</div>
          </div>
          <div class="shrink-0">
            <div class="w-10 h-6 rounded-full border border-neutral-800/50 bg-neutral-900/60 relative transition-colors"
                 :class="isEnabled(role.id) ? 'bg-neutral-800/60' : 'bg-neutral-900/60'">
              <div class="absolute top-1/2 -translate-y-1/2 transition-all w-4 h-4 rounded-full"
                   :class="isEnabled(role.id) ? 'translate-x-6 bg-emerald-400' : 'translate-x-1 bg-neutral-600'" />
            </div>
          </div>
        </div>
         <div v-if="role.id === 'wolf' || role.id === 'villager'" class="mt-2 text-[10px] text-neutral-400">Sempre abilitato</div>
      </button>
    </div>

    <!-- Note -->
    <div class="text-center text-xs text-neutral-400">
      Puoi regolare il numero per ogni ruolo nella Home. I Contadini riempiono automaticamente gli slot rimanenti.
    </div>
  </div>
</template>


