<script setup lang="ts">
import { computed } from 'vue';
import InvestigationResultCard from '../../ui/InvestigationResultCard.vue';
import { useI18n } from '../../../composables/useI18n';

interface Props {
    gameState: any;
    entry: any;
    players: any[];
    player: any;
}

const props = defineProps<Props>();
const { t } = useI18n();

const misspurpleEvents = computed(() => {
    if (!props.entry || !props.entry.lupiCount) return [];
    return [props.entry];
});

const misspurplePlayers = computed(() => {
    if (!props.entry || !props.entry.playerIds) return [];
    return props.gameState.players.filter((p: any) => props.entry.playerIds.includes(p.id));
});
</script>

<template>
  <div class="space-y-4">
    <template v-if="misspurpleEvents.length">
      <div v-for="event in misspurpleEvents" :key="'mp-' + event.playerId + '-' + event.nightNumber" class="space-y-2">
        <div class="bg-neutral-900/60 border border-neutral-800/40 rounded-lg p-3">
          <div class="flex flex-wrap gap-1 justify-center">
            <span 
              v-for="player in misspurplePlayers" 
              :key="player.id"
              class="px-2 py-1 bg-neutral-800/60 border border-neutral-700/40 rounded text-xs text-neutral-200 max-w-full truncate"
              :title="player.name"
            >
              {{ player.name }}
            </span>
          </div>
        </div>
        
        <InvestigationResultCard 
          :title="t('resolveDetails.investigationResult')"
          :text="t('rolePrompts.wolvesInVillage')"
          :results="event.lupiCount.toString()"
          color="#9333ea"
        />
      </div>
    </template>
    <template v-else></template>
  </div>
</template>
