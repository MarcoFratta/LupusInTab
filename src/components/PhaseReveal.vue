<script setup lang="ts">
import { computed, ref } from 'vue';
import RoleRevealCard from './RoleRevealCard.vue';
import { nextReveal as engineNextReveal } from '../core/engine';

const props = defineProps<{ state: any, onStartNight: () => void }>();

const showIntro = ref(true);
const showPreNightInfo = ref(false);

const currentPlayer = computed(() => props.state.players[props.state.revealIndex]);
const currentRoleMeta = computed(() => props.state.roleMeta[currentPlayer.value.roleId]);

// Players to show as known allies to wolves etc.
const knownAllies = computed(() => {
  const roleMeta = currentRoleMeta.value;
  if (!roleMeta) return [] as any[];
  const allPlayers = props.state.players as Array<any>;
  const revealToTeams: string[] = (props.state.roleMeta[roleMeta.id]?.knownToTeams || []) as any;
  // If any of the current player's teams are in revealToTeams, show players whose roles have knownToTeams including that team
  // Simpler rule: If current player's team is in another role's knownToTeams, show those players to current player
  const players = allPlayers.filter(p => {
    if (p.id === currentPlayer.value.id) return false;
    const rm = props.state.roleMeta[p.roleId];
    if (!rm) return false;
    // Show wolves to wolves unless the current role disables intra-team ally reveal
    if (rm.team === roleMeta.team && roleMeta.team === 'wolf' && (roleMeta.revealAlliesWithinTeam !== false)) return true;
    const kt = rm.knownToTeams as string[] | undefined;
    return Array.isArray(kt) && kt.includes(roleMeta.team);
  });
  // Map with label based on role's reveal policy
  return players.map(p => {
    const rm = props.state.roleMeta[p.roleId];
    const showMode = rm.revealToAllies || 'team';
    const labelText = showMode === 'role' ? rm.name : rm.team.toUpperCase();
    return { id: p.id, name: p.name, labelText, team: rm.team, color: rm.color };
  });
});

// Partners to show (e.g., Lovers). If the current player has a role that lists revealPartnersRoleIds, show others with those roles
const partnerPlayers = computed(() => {
  const roleMeta = currentRoleMeta.value;
  if (!roleMeta) return [] as any[];
  const ids: string[] = (roleMeta.revealPartnersRoleIds || []) as any;
  if (!ids.length) return [] as any[];
  const players = (props.state.players as Array<any>).filter(p => p.id !== currentPlayer.value.id && ids.includes(props.state.roleMeta[p.roleId]?.id));
  return players.map(p => {
    const rm = props.state.roleMeta[p.roleId];
    const showMode = roleMeta.revealToPartners || 'team';
    const labelText = showMode === 'role' ? rm.name : rm.team.toUpperCase();
    return { id: p.id, name: p.name, labelText, team: rm.team, color: rm.color };
  });
});

function continueFromIntro() {
  showIntro.value = false;
}

function nextReveal() {
  engineNextReveal(props.state, () => {
    // At the end of reveal sequence, show a safety info screen before starting Night 1
    showPreNightInfo.value = true;
  });
}

function startNight() {
  props.onStartNight();
}
</script>

<template>
  <div class="space-y-4 text-center">
    <h2 class="text-xl font-semibold text-slate-100">Rivelazione dei ruoli</h2>

    <!-- Intro info card shown once at the start of reveal phase -->
    <div v-if="showIntro" class="bg-white/5 border border-white/10 rounded-lg p-6 text-left space-y-3">
      <div class="text-slate-100 text-sm font-medium">Come rivelare i ruoli</div>
      <div class="text-slate-400 text-sm">
        Passa il dispositivo a ogni giocatore a turno. Tocca per vedere il tuo ruolo, poi passa al prossimo.
      </div>
      <div class="flex justify-end pt-1">
        <button class="btn btn-primary" @click="continueFromIntro">Inizia rivelazioni</button>
      </div>
    </div>

    <!-- Pre-night safety card shown only after the last player reveal -->
    <div v-else-if="showPreNightInfo" class="bg-white/5 border border-white/10 rounded-lg p-6 text-left space-y-3">
      <div class="text-slate-100 text-sm font-medium">Prima che inizi la Notte</div>
      <div class="text-slate-400 text-sm">
        Riporta il dispositivo al moderatore. Premi "Inizia Notte" per continuare. Evita che l’ultimo giocatore veda i lupi per errore.
      </div>
      <div class="flex justify-end pt-1">
        <button class="btn btn-primary" @click="startNight">Inizia Notte</button>
      </div>
    </div>

    <!-- Reveal card for current player -->
    <template v-else>
      <div class="bg-white/5 border border-white/10 rounded-lg p-6 text-center space-y-1">
        <div class="text-slate-400 text-sm">Passa il telefono a</div>
        <div class="text-2xl font-bold text-slate-100">{{ currentPlayer.name }}</div>
      </div>
      <div class="bg-white/5 border border-white/10 rounded-lg p-4 space-y-3">
        <RoleRevealCard :player="currentPlayer" :roleMeta="props.state.roleMeta[currentPlayer.roleId]" @next="nextReveal">
          <template>
            <!-- Known to wolves / allies (confidential) -->
            <div v-if="knownAllies.length" class="bg-neutral-900/60 border border-neutral-800/40 rounded-lg p-3 text-left">
              <div class="text-slate-100 text-sm font-medium mb-1">Alleati conosciuti</div>
              <div class="text-slate-400 text-xs">Questi giocatori sono noti alla tua fazione.</div>
              <div class="mt-2 flex flex-col gap-1">
                <div v-for="p in knownAllies" :key="p.id" class="flex items-center justify-between gap-2 px-2 py-1 rounded text-xs font-medium border border-neutral-700/50 bg-neutral-800/50 text-neutral-200 text-left">
                  <span class="truncate">{{ p.name }}</span>
                  <span class="inline-flex items-center rounded px-2 py-0.5 text-[10px] font-semibold border"
                        :style="{ background: (p.color || '#6b7280') + '22', color: p.color || '#e5e7eb' }">
                    {{ p.labelText }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Partners (e.g., Lovers) (confidential) -->
            <div v-if="partnerPlayers.length" class="bg-neutral-900/60 border border-neutral-800/40 rounded-lg p-3 text-left">
              <div class="text-slate-100 text-sm font-medium mb-1">Partner</div>
              <div class="text-slate-400 text-xs">Sei collegato con:</div>
              <div class="mt-2 flex flex-col gap-1">
                <div v-for="p in partnerPlayers" :key="p.id" class="flex items-center justify-between gap-2 px-2 py-1 rounded text-xs font-medium border border-neutral-700/50 bg-neutral-800/50 text-neutral-200 text-left">
                  <span class="truncate">{{ p.name }}</span>
                  <span class="inline-flex items-center rounded px-2 py-0.5 text-[10px] font-semibold border"
                        :style="{ background: (p.color || '#6b7280') + '22', color: p.color || '#e5e7eb' }">
                    {{ p.labelText }}
                  </span>
                </div>
              </div>
            </div>
          </template>
        </RoleRevealCard>
      </div>
    </template>
  </div>
</template>


