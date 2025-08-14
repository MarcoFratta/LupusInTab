<script setup>
import { computed } from 'vue';
import ComparisonRow from '../../ui/ComparisonRow.vue';
const props = defineProps({ state: { type: Object, required: true }, player: { type: Object, required: true } });

// Show the doctor's chosen targets from night results (records choices regardless of whether a kill happened)
const doctorChoices = computed(() => {
  const results = Array.isArray(props.state?.night?.results) ? props.state.night.results : [];
  return results
    .filter((r) => r.roleId === 'doctor' && r.playerId === props.player.id)
    .map((r) => ({ target: Number(r?.result?.targetId) }))
    .filter((x) => Number.isFinite(x.target) && x.target > 0);
});
</script>

<template>
  <div class="space-y-1 text-sm">
    <div class="flex items-center gap-2">
      <template v-if="doctorChoices.length">
        <ComparisonRow
          v-for="s in doctorChoices"
          :key="'dc-' + props.player.id + '-' + s.target"
          label="salvato"
          :left-items="[{ label: props.player.name, color: props.state.roleMeta['doctor']?.color || '#22c55e' }]"
          :right-items="[{ label: props.state.players.find((p)=>p.id===s.target)?.name, color: props.state.roleMeta[props.state.players.find((p)=>p.id===s.target)?.roleId]?.color }]"
        />
      </template>
      <span v-else class="text-neutral-400 text-xs">Nessun salvataggio</span>
    </div>
  </div>
</template>


