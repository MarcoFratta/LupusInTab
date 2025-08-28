<template>
  <div class="w-full px-4 md:px-6 md:max-w-4xl space-y-8 text-center">
    <div class="space-y-4">
      <div class="relative">
        <div class="absolute inset-0 bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 blur-3xl rounded-full"></div>
        <h2 class="relative text-3xl md:text-4xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
          Fine partita
        </h2>
      </div>
      
      <div class="w-24 h-1 bg-gradient-to-r from-violet-500 to-fuchsia-500 mx-auto rounded-full"></div>
    </div>

    <div class="relative">
      <div class="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-fuchsia-500/5 to-transparent rounded-2xl"></div>
      <div class="relative bg-neutral-900/80 backdrop-blur-sm border border-neutral-800/60 rounded-2xl p-6 md:p-8 space-y-6">
        <div class="text-center space-y-3">
          <div class="text-4xl md:text-5xl font-black" :class="getWinnerColor(winner)">
            {{ getWinnerText(winner) }}
          </div>
          <div v-if="winner !== 'tie' && winner" class="text-neutral-400 text-lg">
            La battaglia è finita
          </div>
        </div>

        <div v-if="winner !== 'tie' && winner" class="space-y-3">
          <div v-if="Array.isArray(winner)" class="space-y-3">
            <div v-for="team in winner" :key="team" class="group">
              <div class="relative overflow-hidden rounded-xl pb-2 transition-all duration-300 hover:scale-[1.02]"
                   :class="getTeamBorderColor(team)">
                <div class="absolute inset-0 bg-gradient-to-br
                 from-white/5 to-transparent opacity-0 
                 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div class="relative">
                  <div class="flex items-center justify-center space-x-3 mb-4">
                    <div class="w-3 h-3 rounded-full" :style="{ backgroundColor: getTeamColor(team) }"></div>
                    <div class="text-xl md:text-2xl font-bold" :class="getTeamTextColor(team)">
                      {{ getTeamDisplayName(team) }}
                    </div>
                    <div class="w-3 h-3 rounded-full" :style="{ backgroundColor: getTeamColor(team) }"></div>
                  </div>
                  <PlayerRoleList 
                    :state="state" 
                    :players="state.players.filter(p => p.roleState?.realTeam === team)" 
                  />
                </div>
              </div>
            </div>
          </div>
          <div v-else>
            <div class="group">
              <div class="relative overflow-hidden rounded-xl p-6 transition-all duration-300 hover:scale-[1.02]"
                   :class="getTeamBorderColor(winner)">
                <div class="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div class="relative">
                  <div class="flex items-center justify-center space-x-3 mb-4">
                    <div class="w-3 h-3 rounded-full" :style="{ backgroundColor: getTeamColor(winner) }"></div>
                    <div class="text-xl md:text-2xl font-bold" :class="getTeamTextColor(winner)">
                      {{ getTeamDisplayName(winner) }}
                    </div>
                    <div class="w-3 h-3 rounded-full" :style="{ backgroundColor: getTeamColor(winner) }"></div>
                  </div>
                  <PlayerRoleList 
                    :state="state" 
                    :players="state.players.filter(p => p.roleState?.realTeam === winner)" 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="winner === 'tie'" class="text-center py-8">
          <div class="text-6xl mb-4">💀</div>
          <div class="text-neutral-400 text-lg">
            Nessuno ha vinto questa battaglia
          </div>
        </div>
      </div>
    </div>
    
    <div class="space-y-4">
      <ButtonGroup class="w-full max-w-md mx-auto">
        <GhostButton full-width @click="$emit('toggleEventHistory')" class="group">
          Eventi
        </GhostButton>
        <PrimaryButton full-width @click="$emit('newGame')" class="group">
          Nuova partita
        </PrimaryButton>
      </ButtonGroup>
    </div>
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
import { FACTIONS } from '../../factions';

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

function getTeamColor(team: string): string {
  const faction = FACTIONS[team];
  return faction?.color || '#6b7280';
}
</script>
