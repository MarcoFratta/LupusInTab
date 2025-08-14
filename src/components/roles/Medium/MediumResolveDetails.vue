<script setup>
import { computed } from 'vue';
import ComparisonRow from '../../ui/ComparisonRow.vue';
const props = defineProps({ state: { type: Object, required: true }, player: { type: Object, required: true } });
const checks = computed(() => (props.state?.night?.summary?.checks || []).filter((c) => c.by === props.player.id));
</script>

<template>
  <div class="space-y-1 text-sm">
    <div class="flex items-center gap-2">
      <template v-if="checks.length">
        <ComparisonRow
          v-for="c in checks"
          :key="'mc-' + c.by + '-' + c.target"
          label="indagato"
          :left-items="[{ label: props.player.name, color: props.state.roleMeta['medium']?.color || '#eab308' }]"
          :right-items="[{ label: props.state.players.find((p)=>p.id===c.target)?.name, color: props.state.roleMeta[props.state.players.find((p)=>p.id===c.target)?.roleId]?.color }]"
        />
      </template>
      <span v-else class="text-neutral-400 text-xs">Nessuna indagine</span>
    </div>
  </div>
</template>


