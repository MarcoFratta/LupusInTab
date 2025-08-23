<script setup lang="ts">
interface RoleDisplayInfo {
  name: string;
  faction: string;
  color: string;
}

interface Props {
  roleInfo: RoleDisplayInfo;
  groupNames: string[];
}

defineProps<Props>();
</script>

<template>
  <div class="text-center">
    <h2 
      class="text-xl font-semibold mb-2" 
      :style="{ color: roleInfo.color }"
    >
      {{ roleInfo.name }}
    </h2>
    <div 
      v-if="groupNames && groupNames.length > 0" 
      class="bg-neutral-900/60 border border-neutral-800/40 rounded-lg px-3 py-2"
    >
      <div class="flex flex-wrap gap-2 justify-center">
        <span 
          v-for="name in groupNames" 
          :key="name"
          class="px-2 py-1 bg-neutral-800/50 rounded text-xs text-slate-300"
        >
          {{ name }}
        </span>
      </div>
    </div>
  </div>
</template>
