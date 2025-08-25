<template>
  <div class="w-full px-2 md:max-w-4xl space-y-6 text-center">
    <h2 class="text-xl font-semibold text-slate-100">Fine partita</h2>
    <div class="bg-white/5 border w-full border-white/10
    rounded-lg p-4 space-y-4 text-left">
      <div class="text-2xl font-bold" :class="getWinnerColor(winner)">
        {{ getWinnerText(winner) }}
      </div>
      <div v-if="winner !== 'tie' && winner">
        <div class="text-slate-300 text-sm mb-2">Vincitori:</div>
        <div v-if="Array.isArray(winner)" class="space-y-4">
          <div v-for="team in winner" :key="team" class="bg-white/5 border border-white/10 rounded-lg p-4" :class="getTeamBorderColor(team)">
            <div class="text-lg font-semibold mb-3" :class="getTeamTextColor(team)">
              {{ getTeamDisplayName(team) }}
            </div>
            <PlayerRoleList 
              :state="state" 
              :players="state.players.filter(p => p.roleState?.realTeam === team)" 
            />
          </div>
        </div>
        <div v-else>
          <div class="bg-white/5 border border-white/10 rounded-lg p-4" :class="getTeamBorderColor(winner)">
            <div class="text-lg font-semibold mb-3" :class="getTeamTextColor(winner)">
              {{ getTeamDisplayName(winner) }}
            </div>
            <PlayerRoleList 
              :state="state" 
              :players="state.players.filter(p => p.roleState?.realTeam === winner)" 
            />
          </div>
        </div>
      </div>
    </div>
    
    <ButtonGroup class="mt-6">
      <GhostButton full-width @click="$emit('toggleEventHistory')">
        📋 Eventi
      </GhostButton>
      <PrimaryButton full-width @click="$emit('newGame')">
        Nuova partita
      </PrimaryButton>
    </ButtonGroup>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { GameState } from '../../types';
import PlayerRoleList from '../ui/PlayerRoleList.vue';
import ButtonGroup from '../ui/ButtonGroup.vue';
import GhostButton from '../ui/GhostButton.vue';
import PrimaryButton from '../ui/PrimaryButton.vue';
import { useWinLogic } from '../../composables/useWinLogic';

interface Props {
  state: GameState;
}

interface Emits {
  (e: 'toggleEventHistory'): void;
  (e: 'newGame'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const winner = computed(() => props.state.winner);

const {
  getWinnerColor,
  getWinnerText,
  getTeamDisplayName,
  getTeamBorderColor,
  getTeamTextColor
} = useWinLogic();
</script>
