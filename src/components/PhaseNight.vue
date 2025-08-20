<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue';
import { ROLES } from '../roles';

const props = defineProps<{ state: any, onPromptComplete: (r:any)=>void }>();

const alivePlayers = computed(() => props.state.players.filter((p: any) => p.alive));
const currentTurn = computed(() => props.state.night.turns[props.state.night.currentIndex] || null);
const currentRole = computed(() => currentTurn.value ? ROLES[currentTurn.value.roleId] : null);
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
    : role.getPromptComponent?.(props.state, currentActor.value);
  return factory ? defineAsyncComponent(factory) : null;
});

const isFirstNightSkipped = computed(() => !!props.state.settings?.skipFirstNightActions && props.state.nightNumber === 1);

const shouldShowDeadPrompt = computed(() => {
  const entry = currentTurn.value;
  if (!entry) return false;
  
  if (entry.kind === 'single') {
    const player = props.state.players.find((p: any) => p.id === entry.playerId);
    if (!player) return false;
    
    // Show dead prompt if player is dead but has actsAtNight: 'alive'
    return !player.alive && player.roleState?.actsAtNight === 'alive';
  }
  
  if (entry.kind === 'group') {
    // For group roles, check if any alive members exist
    const aliveMembers = props.state.players.filter((p: any) => 
      entry.playerIds.includes(p.id) && p.alive
    );
    return aliveMembers.length === 0;
  }
  
  return false;
});

const shouldShowAlivePrompt = computed(() => {
  const entry = currentTurn.value;
  if (!entry) return false;
  
  if (entry.kind === 'single') {
    const player = props.state.players.find((p: any) => p.id === entry.playerId);
    if (!player) return false;
    
    // Show alive prompt if player is alive but has actsAtNight: 'dead'
    return player.alive && player.roleState?.actsAtNight === 'dead';
  }
  
  return false;
});

const shouldShowBlockedPrompt = computed(() => {
  const entry = currentTurn.value;
  if (!entry) return false;
  
  if (entry.kind === 'single') {
    const player = props.state.players.find((p: any) => p.id === entry.playerId);
    return player && player.roleState?.actsAtNight === 'blocked';
  }
  
  if (entry.kind === 'group') {
    // For group roles, check if ALL alive members are blocked
    const aliveMembers = props.state.players.filter((p: any) => 
      entry.playerIds.includes(p.id) && p.alive
    );
    return aliveMembers.length > 0 && aliveMembers.every((player: any) => 
      player.roleState?.actsAtNight === 'blocked'
    );
  }
  
  return false;
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
            {{ (currentTurn?.playerIds || []).map((id:number)=> props.state.players.find((p:any)=>p.id===id)?.name).filter(Boolean).join(', ') || (currentActor && ROLES[currentActor.roleId]?.name) }}
          </template>
          <template v-else>{{ currentActor?.name }}</template>
        </div>
        <span class="px-2 py-1 rounded text-xs font-medium border"
              :style="{
                background: ((currentActor && ROLES[currentActor.roleId]?.color) ? (ROLES[currentActor.roleId]?.color + '22') : undefined),
                color: (currentActor && ROLES[currentActor.roleId]?.color) || undefined,
                borderColor: ((currentActor && ROLES[currentActor.roleId]?.color) ? (ROLES[currentActor.roleId]?.color + '55') : undefined)
              }">
          {{ currentActor && ROLES[currentActor.roleId]?.name }}
        </span>
      </div>
    </div>

    <div class="bg-neutral-900/60 border border-neutral-800/40 rounded-lg p-4 text-left">
      <div v-if="isFirstNightSkipped" class="bg-white/5 border border-white/10 rounded-lg p-4 space-y-3 text-left">
        <div class="text-slate-300 text-sm">La prima notte è tranquilla. Gli effetti sono ignorati.</div>
        <div class="pt-2">
          <button class="btn btn-primary w-full" @click="props.onPromptComplete({ skipped: true })">Salta</button>
        </div>
      </div>

      <div v-else-if="shouldShowDeadPrompt" class="text-center p-4 space-y-4">
        <div class="text-red-400 text-4xl">💀</div>
        <div>
          <div class="text-neutral-100 font-medium text-lg">Il giocatore è morto</div>
          <div class="text-neutral-400 text-sm mt-1">Non può usare il suo ruolo questa notte</div>
        </div>
        <button class="btn btn-primary w-full" @click="props.onPromptComplete({ skipped: true })">Continua</button>
      </div>

      <div v-else-if="shouldShowAlivePrompt" class="text-center p-4 space-y-4">
        <div class="text-green-400 text-4xl">🟢</div>
        <div>
          <div class="text-neutral-100 font-medium text-lg">Il giocatore è vivo</div>
          <div class="text-neutral-400 text-sm mt-1">Deve essere morto per usare il suo ruolo</div>
        </div>
        <button class="btn btn-primary w-full" @click="props.onPromptComplete({ skipped: true })">Continua</button>
      </div>

      <div v-else-if="shouldShowBlockedPrompt" class="text-center p-4 space-y-4">
        <div class="text-amber-400 text-4xl">🚫</div>
        <div>
          <div class="text-neutral-100 font-medium text-lg">Il giocatore non può usare il suo ruolo questa notte</div>
          <div class="text-neutral-400 text-sm mt-1">Bloccato dall'Illusionista</div>
        </div>
        <button class="btn btn-primary w-full" @click="props.onPromptComplete({ blocked: true })">Continua</button>
      </div>


      <component v-else-if="currentPromptComponent"
                 :is="currentPromptComponent"
                 :gameState="props.state"
                 :player="currentActor"
                 :onComplete="props.onPromptComplete" />
    </div>
  </div>
</template>


