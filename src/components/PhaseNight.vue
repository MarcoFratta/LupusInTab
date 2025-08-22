<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue';
import { ROLES } from '../roles';
import { getFactionConfig } from '../factions';


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
  	return { id: 0, name: currentRole.value?.name, roleId: entry.roleId } as any;
});

const currentPromptComponent = computed(() => {
    if (!currentActor.value || !currentActor.value.roleId) return null;
    
    const role = ROLES[currentActor.value.roleId];
    if (!role || role.actsAtNight === 'never') return null;
    
    const promptComponentLoader = role.getPromptComponent;
    if (promptComponentLoader && typeof promptComponentLoader === 'function') {
        return defineAsyncComponent(promptComponentLoader);
    }
    return null;
});

const isFirstNightSkipped = computed(() => !!props.state.settings?.skipFirstNightActions && props.state.nightNumber === 1);



const shouldShowDeadPrompt = computed(() => {
  const entry = currentTurn.value;
  if (!entry) return false;
  
  // For all roles, check if any alive members exist
  const aliveMembers = props.state.players.filter((p: any) => 
    entry.playerIds.includes(p.id) && p.alive
  );
  return aliveMembers.length === 0;
});

const shouldShowAlivePrompt = computed(() => {
  const entry = currentTurn.value;
  if (!entry) return false;
  
  // For all roles, check if any alive members have actsAtNight: 'dead'
  const deadMembers = props.state.players.filter((p: any) => 
    entry.playerIds.includes(p.id) && p.alive && p.roleState?.actsAtNight === 'dead'
  );
  return deadMembers.length > 0;
});

const shouldShowBlockedPrompt = computed(() => {
  const entry = currentTurn.value;
  if (!entry) return false;
  
  // For all roles, check if ALL alive members are blocked
  // This should only happen when a role actually blocks them, not as a default state
  const aliveMembers = props.state.players.filter((p: any) => 
    entry.playerIds.includes(p.id) && p.alive
  );
  
  // Check if any player is actually blocked by another role
  const blockedMembers = aliveMembers.filter((player: any) => 
    player.roleState?.actsAtNight === 'blocked'
  );
  
  // Only show blocked prompt if ALL alive members are blocked AND at least one is actually blocked
  return aliveMembers.length > 0 && blockedMembers.length > 0 && aliveMembers.every((player: any) => 
    player.roleState?.actsAtNight === 'blocked'
  );
});

const shouldShowStartNightPrompt = computed(() => {
  const entry = currentTurn.value;
  if (!entry) return false;
  
  // For all roles, check if any alive members have startNight restrictions
  const restrictedMembers = props.state.players.filter((p: any) => 
    entry.playerIds.includes(p.id) && p.alive && p.roleState?.startNight && props.state.nightNumber < p.roleState.startNight
  );
  return restrictedMembers.length > 0;
});

const shouldShowUsageLimitPrompt = computed(() => {
  const entry = currentTurn.value;
  if (!entry) return false;
  
  // For all roles, check if any alive members have exceeded usage limits
  const exceededMembers = props.state.players.filter((p: any) => {
    if (!entry.playerIds.includes(p.id) || !p.alive) return false;
    
    const numberOfUsage = p.roleState?.numberOfUsage;
    if (numberOfUsage === 'unlimited' || numberOfUsage === undefined) return false;
    
    const usedPowers = props.state.usedPowers?.[p.roleId] || [];
    const timesUsed = usedPowers.filter((playerId: number) => playerId === p.id).length;
    return timesUsed >= numberOfUsage;
  });
  
  return exceededMembers.length > 0;
});

const currentGroupNames = computed(() => {
  const entry = currentTurn.value;
  if (!entry) return [];
  
  return props.state.players
    .filter((p: any) => entry.playerIds.includes(p.id))
    .map((p: any) => p.name);
});

const roleDisplayInfo = computed(() => {
  const role = currentRole.value;
  if (!role) return null;
  
  const factionConfig = getFactionConfig(role.team);
  return {
    name: role.name,
    faction: factionConfig?.displayName || role.team,
    color: factionConfig?.color || '#6b7280'
  };
});

const getEarliestStartNight = () => {
  const entry = currentTurn.value;
  if (!entry) return 2;
  
  const rolePlayers = props.state.players.filter((p: any) => entry.playerIds.includes(p.id));
  const startNights = rolePlayers
    .map((p: any) => p.roleState?.startNight)
    .filter((n: any) => n && typeof n === 'number');
  
  return startNights.length > 0 ? Math.min(...startNights) : 2;
};
</script>

<template>
  <div class="space-y-3 text-center">
    <div v-if="roleDisplayInfo" class="text-center">
      <h2 class="text-xl font-semibold mb-2" :style="{ color: roleDisplayInfo.color }">{{ roleDisplayInfo.name }}</h2>
      <div v-if="currentGroupNames && currentGroupNames.length > 0" 
           class="bg-neutral-900/60 border border-neutral-800/40 rounded-lg px-3 py-2">
        <div class="flex flex-wrap gap-2 justify-center">
          <span v-for="name in currentGroupNames" 
                :key="name"
                class="px-2 py-1 bg-neutral-800/50 rounded text-xs text-slate-300">
            {{ name }}
          </span>
        </div>
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
          <div class="text-neutral-100 font-medium text-lg">Tutti i giocatori con questo ruolo sono morti</div>
          <div class="text-neutral-400 text-sm mt-1">Non possono usare il loro ruolo questa notte</div>
        </div>
        <button class="btn btn-primary w-full" @click="props.onPromptComplete({ skipped: true })">Continua</button>
      </div>

      <div v-else-if="shouldShowAlivePrompt" class="text-center p-4 space-y-4">
        <div class="text-green-400 text-4xl">🟢</div>
        <div>
          <div class="text-neutral-100 font-medium text-lg">I giocatori con questo ruolo sono vivi</div>
          <div class="text-neutral-400 text-sm mt-1">Devono essere morti per usare il loro ruolo</div>
        </div>
        <button class="btn btn-primary w-full" @click="props.onPromptComplete({ skipped: true })">Continua</button>
      </div>

      <div v-else-if="shouldShowBlockedPrompt" class="text-center p-4 space-y-4">
        <div class="text-amber-400 text-4xl">🚫</div>
        <div>
          <div class="text-neutral-100 font-medium text-lg">Tutti i giocatori con questo ruolo sono bloccati</div>
          <div class="text-neutral-400 text-sm mt-1">Qualcuno ha bloccato il loro ruolo</div>
        </div>
        <button class="btn btn-primary w-full" @click="props.onPromptComplete({ blocked: true })">Continua</button>
      </div>

      <div v-else-if="shouldShowStartNightPrompt" class="text-center p-4 space-y-4">
        <div class="text-blue-400 text-4xl">⏰</div>
        <div>
          <div class="text-neutral-100 font-medium text-lg">Non è ancora il momento</div>
          <div class="text-neutral-400 text-sm mt-1">Questo ruolo può essere usato a partire dalla notte {{ getEarliestStartNight() }}</div>
        </div>
        <button class="btn btn-primary w-full" @click="props.onPromptComplete({ skipped: true })">Continua</button>
      </div>

      <div v-else-if="shouldShowUsageLimitPrompt" class="text-center p-4 space-y-4">
        <div class="text-purple-400 text-4xl">🔒</div>
        <div>
          <div class="text-neutral-100 font-medium text-lg">Limite di utilizzo raggiunto</div>
          <div class="text-neutral-400 text-sm mt-1">Questo ruolo è già stato usato il massimo numero di volte</div>
        </div>
        <button class="btn btn-primary w-full" @click="props.onPromptComplete({ skipped: true })">Continua</button>
      </div>

      <div v-else-if="currentPromptComponent" class="space-y-4">
        <component :is="currentPromptComponent" 
          :gameState="props.state" 
          :player="currentActor" 
          :onComplete="props.onPromptComplete" 
        />
      </div>

      <div v-else class="text-center p-4 space-y-4">
        <div class="text-neutral-400 text-sm">Nessuna azione richiesta per questo ruolo</div>
        <button class="btn btn-primary w-full" @click="props.onPromptComplete({ skipped: true })">Continua</button>
      </div>
    </div>
  </div>
</template>


