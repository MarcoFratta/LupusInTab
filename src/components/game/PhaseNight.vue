<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue';
import { useNightPhase } from '../../composables/useNightPhase';
import RoleHeader from '../ui/RoleHeader.vue';
import {
  FirstNightSkippedPrompt,
  DeadPrompt,
  AlivePrompt,
  BlockedPrompt,
  StartNightPrompt,
  UsageLimitPrompt,
  NoActionPrompt
} from '../ui/prompts';

interface Props {
  state: any;
  onPromptComplete: (result: any) => void;
}

const props = defineProps<Props>();

const {
  currentPromptComponent,
  currentActor,
  currentRole,
  isFirstNightSkipped,
  shouldShowDeadPrompt,
  shouldShowAlivePrompt,
  shouldShowBlockedPrompt,
  shouldShowStartNightPrompt,
  shouldShowUsageLimitPrompt,
  currentGroupNames,
  roleDisplayInfo,
  currentTurn,
  getEarliestStartNight
} = useNightPhase();

const asyncPromptComponent = computed(() => {
  if (!currentPromptComponent.value) return null;
  const component = defineAsyncComponent(currentPromptComponent.value);
  console.log(`🌙 [DEBUG] PhaseNight - asyncPromptComponent computed:`, component ? 'found' : 'null');
  return component;
});

// Add debug logging for prompt conditions
const debugPromptConditions = computed(() => {
  try {
    console.log(`🌙 [DEBUG] PhaseNight - Prompt conditions:`, {
      isFirstNightSkipped: isFirstNightSkipped.value,
      shouldShowDeadPrompt: shouldShowDeadPrompt.value,
      shouldShowAlivePrompt: shouldShowAlivePrompt.value,
      shouldShowBlockedPrompt: shouldShowBlockedPrompt.value,
      shouldShowStartNightPrompt: shouldShowStartNightPrompt.value,
      shouldShowUsageLimitPrompt: shouldShowUsageLimitPrompt.value,
      hasAsyncPromptComponent: !!asyncPromptComponent.value,
      currentActor: currentActor.value,
      currentRole: currentRole.value?.name
    });
  } catch (error) {
    console.warn(`🌙 [DEBUG] PhaseNight - Error in debug logging:`, error);
  }
  return true;
});

// Trigger debug logging whenever computed values change
try {
  debugPromptConditions.value;
} catch (error) {
  console.warn(`🌙 [DEBUG] PhaseNight - Error triggering debug logging:`, error);
}
</script>

<template>
  <div class="flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
    <div class="w-full max-w-2xl space-y-6 text-center">
      <RoleHeader 
        v-if="roleDisplayInfo" 
        :role-info="roleDisplayInfo" 
        :group-names="currentGroupNames" 
      />

      <div class="bg-neutral-900/60 border border-neutral-800/40 rounded-lg p-4 text-left">
        <FirstNightSkippedPrompt 
          v-if="isFirstNightSkipped" 
          :on-complete="props.onPromptComplete" 
        />

        <DeadPrompt 
          v-else-if="shouldShowDeadPrompt" 
          :on-complete="props.onPromptComplete" 
        />

        <AlivePrompt 
          v-else-if="shouldShowAlivePrompt" 
          :on-complete="props.onPromptComplete" 
        />

        <BlockedPrompt 
          v-else-if="shouldShowBlockedPrompt" 
          :on-complete="props.onPromptComplete" 
        />

        <StartNightPrompt 
          v-else-if="shouldShowStartNightPrompt" 
          :earliest-start-night="getEarliestStartNight()"
          :on-complete="props.onPromptComplete" 
        />

        <UsageLimitPrompt 
          v-else-if="shouldShowUsageLimitPrompt" 
          :on-complete="props.onPromptComplete" 
        />

        <component 
          v-else-if="asyncPromptComponent" 
          :is="asyncPromptComponent"
          :gameState="props.state" 
          :player="currentTurn?.playerIds?.length > 0 ? props.state.players.find(p => p.id === currentTurn.playerIds[0]) : currentActor" 
          :playerIds="currentTurn?.playerIds || []"
          :onComplete="props.onPromptComplete" 
        />

        <NoActionPrompt 
          v-else 
          :on-complete="props.onPromptComplete" 
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Mobile-specific fixes for night phase */
@media (max-width: 768px) {
  .min-h-screen {
    min-height: 100vh;
    min-height: 100dvh; /* Dynamic viewport height for mobile */
  }
  
  /* Prevent horizontal overflow */
  .w-full {
    max-width: 100vw;
    overflow-x: hidden;
  }
}
</style>


