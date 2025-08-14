<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue';
import { ROLES } from '../roles';

const props = defineProps<{ state: any, onPromptComplete: (r:any)=>void }>();

const alivePlayers = computed(() => props.state.players.filter((p: any) => p.alive));
const currentTurn = computed(() => props.state.night.turns[props.state.night.currentIndex] || null);
const currentRole = computed(() => currentTurn.value ? props.state.roleMeta[currentTurn.value.roleId] : null);
const currentActor = computed(() => {
  const entry = currentTurn.value;
  if (!entry) return null;
  if (entry.kind === 'single') {
    return props.state.players.find((p: any) => p.id === entry.playerId) || null;
  }
  return { id: 0, name: currentRole.value?.name, roleId: entry.roleId, group: true } as any;
});

const currentPromptComponent = computed(() => {
  const entry = currentTurn.value;
  if (!entry) return null;
  const role = ROLES[entry.roleId];
  if (!role) return null;
  const factory = entry.kind === 'group' && typeof role.getGroupPromptComponent === 'function'
    ? role.getGroupPromptComponent(props.state, entry)
    : role.getPromptComponent(props.state, currentActor.value);
  return defineAsyncComponent(factory);
});

const isFirstNightSkipped = computed(() => !!props.state.settings?.skipFirstNightActions && props.state.nightNumber === 1);

const shouldShowDeadPrompt = computed(() => {
  const entry = currentTurn.value;
  if (!entry) return false;
  if (entry.kind === 'single') {
    const player = props.state.players.find((p: any) => p.id === entry.playerId);
    return !player || player.alive === false;
  }
  const anyAlive = alivePlayers.value.some((p: any) => p.roleId === entry.roleId);
  return !anyAlive;
});
</script>

<template>
  <div class="space-y-4 text-center">
    <h2 class="text-xl font-semibold text-slate-100">Notte {{ props.state.nightNumber }}</h2>
    <div class="bg-neutral-900/60 border border-neutral-800/40 rounded-lg p-4 space-y-2">
      <div class="text-neutral-400 text-sm">{{ currentTurn?.kind === 'group' ? 'Giocatori attuali' : 'Giocatore attuale' }}</div>
      <div class="flex items-center justify-between">
        <div class="text-xl font-bold text-neutral-100">
          <template v-if="currentTurn?.kind === 'group'">
            {{ (currentTurn?.playerIds || []).map((id:number)=> props.state.players.find((p:any)=>p.id===id)?.name).filter(Boolean).join(', ') || (currentActor && props.state.roleMeta[currentActor.roleId]?.name) }}
          </template>
          <template v-else>{{ currentActor?.name }}</template>
        </div>
        <span class="px-2 py-1 rounded text-xs font-medium border"
              :style="{
                background: ((currentActor && props.state.roleMeta[currentActor.roleId]?.color) ? (props.state.roleMeta[currentActor.roleId]?.color + '22') : undefined),
                color: (currentActor && props.state.roleMeta[currentActor.roleId]?.color) || undefined,
                borderColor: ((currentActor && props.state.roleMeta[currentActor.roleId]?.color) ? (props.state.roleMeta[currentActor.roleId]?.color + '55') : undefined)
              }">
          {{ currentActor && props.state.roleMeta[currentActor.roleId]?.name }}
        </span>
      </div>
    </div>

    <div class="bg-neutral-900/60 border border-neutral-800/40 rounded-lg p-4 text-left">
      <div v-if="shouldShowDeadPrompt" class="flex items-center justify-between">
        <div class="text-slate-300">Il giocatore è morto.</div>
        <button class="btn btn-secondary" @click="props.onPromptComplete({ skipped: true })">Salta</button>
      </div>

      <div v-else-if="isFirstNightSkipped" class="flex items-center justify-between">
        <div class="text-slate-300">La prima notte è tranquilla. Gli effetti sono ignorati.</div>
        <button class="btn btn-secondary" @click="props.onPromptComplete({ skipped: true })">Salta</button>
      </div>

      <component v-else-if="currentPromptComponent"
                 :is="currentPromptComponent"
                 :gameState="props.state"
                 :player="currentActor"
                 :onComplete="props.onPromptComplete" />
    </div>
  </div>
</template>


