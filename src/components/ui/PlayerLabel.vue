<script setup lang="ts">
import { computed } from 'vue';
import { getFactionConfig } from '../../factions';
import { hexToRgba } from '../../utils/color';
import { ROLES } from '../../roles';
import { getFactionDisplayName } from '../../utils/factionUtils';
import { getRoleDisplayName } from '../../utils/roleUtils';
import { useI18n } from '../../composables/useI18n';

const props = defineProps<{ 
  roleId: string;
  showFaction?: boolean;
}>();

const { t } = useI18n();

const roleDef = computed(() => ROLES[props.roleId]);
const faction = computed(() => getFactionConfig(roleDef.value?.team || 'unknown'));

const roleName = computed(() => getRoleDisplayName(props.roleId, t));
const factionColor = computed(() => faction.value?.color || '#9ca3af');
const factionName = computed(() => getFactionDisplayName(roleDef.value?.team || 'unknown', t));

const chipStyle = computed(() => ({
  color: factionColor.value,
  borderColor: hexToRgba(factionColor.value, 0.5) || factionColor.value,
  backgroundColor: hexToRgba(factionColor.value, 0.15) || undefined,
}));
</script>

<template>
  <span class="inline-flex items-center gap-1.5 min-w-0">
    <span class="font-medium text-neutral-200 truncate max-w-[6rem] sm:max-w-none">{{ roleName }}</span>
    <span class="text-[10px] px-2 py-0.5 rounded border truncate max-w-[8rem] sm:max-w-none" :style="chipStyle">
      {{ roleName }}
    </span>
    <span v-if="showFaction !== false" class="text-[10px] px-2 py-0.5 rounded border whitespace-nowrap"
          :style="{ color: factionColor, borderColor: hexToRgba(factionColor, 0.45) || factionColor, backgroundColor: hexToRgba(factionColor, 0.12) || undefined }">
      {{ factionName }}
    </span>
  </span>
</template>


