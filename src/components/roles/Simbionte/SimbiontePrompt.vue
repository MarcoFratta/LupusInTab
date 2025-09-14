<script setup lang="ts">
import { computed, ref } from 'vue';
import PromptSelect from '../../ui/prompts/PromptSelect.vue';
import DisplayFaction from '../../ui/DisplayFaction.vue';
import { ROLES } from '../../../roles';
import { getFactionConfig } from '../../../factions';
import { getRoleDisplayName } from '../../../utils/roleUtils';
import { useI18n } from '../../../composables/useI18n';

const { t } = useI18n();

const props = defineProps<{
  gameState: any;
  playerIds: number[];
  onComplete: (result: any) => void;
}>();

const targetId = ref<number | null>(null);

const choices = computed(() => {
  const alive = props.gameState.players.filter((p: any) => 
    p.alive && 
    !props.playerIds.includes(p.id)
  );
  return [
    { label: t('rolePrompts.selectPlayerPlaceholder'), value: null },
    ...alive.map((p: any) => ({ label: p.name, value: p.id }))
  ];
});

const canSubmit = computed(() => Number.isFinite(Number(targetId.value)) && Number(targetId.value) > 0);

const targetRole = computed(() => {
  if (!targetId.value) return null;
  const targetPlayer = props.gameState.players.find((p: any) => p.id === targetId.value);
  return targetPlayer ? ROLES[targetPlayer.roleId] : null;
});

const targetFaction = computed(() => {
  if (!targetRole.value) return null;
  return getFactionConfig(targetRole.value.team);
});

function submit() {
  if (!canSubmit.value) return;
  props.onComplete({ target: { playerId: targetId.value } });
}
</script>

<template>
  <div class="space-y-4">
    <div class="text-center mb-4">
      <div class="bg-violet-500/10 border border-violet-500/20 rounded-lg p-3 mb-4">
        <p class="text-violet-300 text-sm font-medium">📢 {{ t('rolePrompts.choosePlayerToTransform') }}</p>
      </div>
      <div class="w-16 h-16 mx-auto mb-4 bg-neutral-800/40 rounded-full flex items-center justify-center">
        <span class="text-neutral-300 text-3xl">🦠</span>
      </div>
      <p class="text-neutral-400 text-xs">
        {{ t('rolePrompts.powerOncePerGame') }}
      </p>
    </div>

    <PromptSelect
      :label="t('rolePrompts.choosePlayerToTransform')"
      v-model="targetId"
      :choices="choices"
      :buttonText="t('rolePrompts.confirmSelection')"
      accent="violet"
      :disabled="choices.length === 0"
      @confirm="submit"
    >
      <div v-if="targetRole && targetFaction" class="text-center p-4
      bg-neutral-800/40 rounded-lg border border-neutral-700/40">
        <p class="text-neutral-300 text-sm">
          {{ t('resolveDetails.transformedInto') }}
          <span
              class="font-semibold"
              :style="{ color: targetFaction.color }"
          >
          {{ getRoleDisplayName(targetRole.id, t) }}
        </span>
        </p>
      </div>
    </PromptSelect>

  </div>
</template>
