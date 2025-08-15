<script setup>
import { computed } from 'vue';
import ComparisonRow from '../../ui/ComparisonRow.vue';
const props = defineProps({ state: { type: Object, required: true } });
const targeted = computed(() => props.state?.night?.summary?.targeted || []);
// wolves list
const wolves = computed(() => props.state.players.filter((p) => props.state.roleMeta[p.roleId]?.id === 'wolf'));
</script>

<template>
  <div class="space-y-1 text-sm">
    <div v-if="targeted.length === 0" class="text-slate-400">Nessun attacco effettuato.</div>
    <div v-else class="space-y-2">
      <ComparisonRow
        label="ucciso"
        :left-items="wolves.map(w => ({ label: w.name, color: props.state.roleMeta['wolf']?.color || '#ef4444' }))"
        :right-items="targeted.map(pid => ({ label: props.state.players.find(p=>p.id===pid)?.name, color: props.state.roleMeta[props.state.players.find(p=>p.id===pid)?.roleId]?.color }))"
      />
    </div>
  </div>
</template>


