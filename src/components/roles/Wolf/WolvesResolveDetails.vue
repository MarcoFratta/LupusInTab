<script setup>
import { computed } from 'vue';
import ComparisonRow from '../../ui/ComparisonRow.vue';
const props = defineProps({ state: { type: Object, required: true } });

// Get only wolf-specific kills from night results
const wolfKills = computed(() => {
  const results = Array.isArray(props.state?.night?.results) ? props.state.night.results : [];
  const wolfResults = results.filter((r) => r.roleId === 'wolf');
  
  const targetIds = [];
  for (const result of wolfResults) {
    const targetId = Number(result?.result?.targetId);
    if (Number.isFinite(targetId) && targetId > 0) {
      targetIds.push(targetId);
    }
  }
  return targetIds;
});

// wolves list
const wolves = computed(() => props.state.players.filter((p) => props.state.roleMeta[p.roleId]?.id === 'wolf'));
</script>

<template>
  <div class="space-y-1 text-sm">
    <div v-if="wolfKills.length === 0" class="text-slate-400">Nessun attacco effettuato.</div>
    <div v-else class="space-y-2">
      <ComparisonRow
        label="ucciso"
        :left-items="wolves.map(w => ({ label: w.name, color: props.state.roleMeta['wolf']?.color || '#ef4444' }))"
        :right-items="wolfKills.map(pid => ({ label: props.state.players.find(p=>p.id===pid)?.name, color: props.state.roleMeta[props.state.players.find(p=>p.id===pid)?.roleId]?.color }))"
      />
    </div>
  </div>
</template>


