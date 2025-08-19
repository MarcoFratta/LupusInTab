<script setup lang="ts">
import { computed } from 'vue';
import { getFactionConfig } from '../../factions';
import { hexToRgba } from '../../utils/color';
import { ROLES } from '../../roles';

const props = defineProps<{ 
  roleId: string;
  showFaction?: boolean;
}>();

const roleDef = computed(() => ROLES[props.roleId]);
const faction = computed(() => getFactionConfig(roleDef.value?.team || 'unknown'));

const roleName = computed(() => roleDef.value?.name || props.roleId);
const roleColor = computed(() => roleDef.value?.color || faction.value?.color || '#9ca3af');
const factionColor = computed(() => faction.value?.color || '#9ca3af');
const factionName = computed(() => faction.value?.displayName || roleDef.value?.team || 'unknown');

const chipStyle = computed(() => ({
  color: roleColor.value,
  borderColor: hexToRgba(factionColor.value, 0.5) || factionColor.value,
  backgroundColor: hexToRgba(roleColor.value, 0.15) || undefined,
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


