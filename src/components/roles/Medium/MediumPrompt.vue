<script setup lang="ts">
import { computed, ref } from 'vue';
import PromptSelect from '../../ui/prompts/PromptSelect.vue';
import DisplayFaction from '../../ui/DisplayFaction.vue';
import { useI18n } from '../../../composables/useI18n';

const { t } = useI18n();

interface Props {
    gameState: any;
    playerIds: number[];
    onComplete: (r: any) => void;
}

const props = defineProps<Props>();

const targetId = ref<number | null>(null);
const deadPlayers = computed(() => {
    const allPlayers = props.gameState.players || [];
    const dead = allPlayers.filter((p: any) => !p.alive);
    console.log('Medium Prompt Debug:', {
        totalPlayers: allPlayers.length,
        allPlayers: allPlayers.map((p: any) => ({ id: p.id, name: p.name, alive: p.alive })),
        deadPlayers: dead.map((p: any) => ({ id: p.id, name: p.name, alive: p.alive }))
    });
    return dead;
});

const choices = computed(() => [
    { label: t('mediumPrompt.selectDeadPlayer'), value: null },
    ...deadPlayers.value.map((p: any) => ({ label: p.name, value: p.id }))
]);

function submit() {
    props.onComplete({ targetId: targetId.value });
}

function submitNoAction() {
    props.onComplete({ skipped: true });
}
</script>

<template>
  <div class="space-y-6">
    <div class="text-center space-y-3">
      <div class="bg-violet-500/10 border border-violet-500/20 rounded-lg p-3 mb-4">
        <p class="text-violet-300 text-sm font-medium">📢 {{ t('mediumPrompt.chooseDeadPlayer') }}</p>
      </div>
      <p class="text-neutral-400 text-base font-medium">{{ t('mediumPrompt.checkDeadPlayerFaction') }}</p>
    </div>
    
    <div v-if="deadPlayers.length === 0" class="text-center space-y-4">
      <p class="text-neutral-400 text-base">{{ t('mediumPrompt.noDeadPlayers') }}</p>
      <button 
        class="btn btn-accent w-full py-3 text-lg font-semibold rounded-2xl shadow-xl shadow-violet-500/30 hover:shadow-2xl hover:shadow-violet-500/40 transform hover:scale-105 active:scale-95 transition-all duration-300"
        @click="submitNoAction"
      >
        {{ t('mediumPrompt.continue') }}
      </button>
    </div>
    
    <div v-else class="space-y-6">
      <PromptSelect
        :label="t('mediumPrompt.whoToCheck')"
        v-model="targetId"
        :choices="choices"
        :buttonText="t('rolePrompts.confirmSelection')"
        accent="violet"
        :disabled="!choices.length"
        @confirm="submit"
      >
        <DisplayFaction
          :game-state="gameState"
          :target-id="targetId"
          :discovery-text="t('mediumPrompt.discovered')"
        />
      </PromptSelect>
    </div>
  </div>
</template>
