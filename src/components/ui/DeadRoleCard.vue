<script setup lang="ts">
import { useI18n } from '../../composables/useI18n';

interface Props {
  reason: string;
  player: any;
}

const props = defineProps<Props>();
const { t } = useI18n();

const getReasonText = (reason: string) => {
  switch (reason) {
    case 'dead':
      return t('blocking.dead');
    case 'alive':
      return t('blocking.alive');
    case 'startNight':
      return t('blocking.startNight', { night: props.player?.roleState?.startNight || 2 });
    case 'usageLimit':
      return t('blocking.usageLimit');
    default:
      return t('blocking.default');
  }
};
</script>

<template>
  <div class="text-center p-2 space-y-1">
    <div class="text-red-400 text-lg">💀</div>
    <div>
      <div class="text-neutral-100 font-medium text-xs truncate max-w-full" :title="props.player?.name || t('roleStates.player')">{{ props.player?.name || t('roleStates.player') }} {{ t('roleStates.dead') }}</div>
      <div class="text-neutral-400 text-xs mt-0">
        {{ getReasonText(reason) }}
      </div>
    </div>
  </div>
</template>
