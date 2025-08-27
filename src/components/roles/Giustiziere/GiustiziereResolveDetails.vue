<script setup>
import { computed } from 'vue';
import RoleComparisonCard from '../../ui/RoleComparisonCard.vue';

const props = defineProps({
    gameState: { type: Object, required: true },
    entry: { type: Object, required: true },
    players: { type: Array, required: false },
    player: { type: Object, required: false },
});

const justicerEvent = computed(() => {
    // The entry is now the role-specific history object
    return props.entry;
});

const targetId = computed(() => justicerEvent.value?.targetId);
const target = computed(() => targetId.value ? props.gameState.players.find(p => p.id === targetId.value) : null);

const justicerPlayers = computed(() => {
  if (!props.entry || !props.entry.playerIds) return [];
  return props.gameState.players.filter(p => props.entry.playerIds.includes(p.id));
});

const representativeJusticer = computed(() => {
  const justicerList = justicerPlayers.value;
  if (justicerList.length === 0) return null;
  
  // Create a representative justicer object that shows all names
  return {
    ...justicerList[0],
    name: justicerList.length === 1 ? justicerList[0].name : justicerList.map(j => j.name).join(', '),
    roleId: 'giustiziere'
  };
});

const hasAction = computed(() => target.value && representativeJusticer.value);
</script>

<template>
    <div class="space-y-4">
        <template v-if="hasAction">
            <RoleComparisonCard
                :game-state="props.gameState"
                :left-player="representativeJusticer"
                :right-player="target"
                left-label="Giustiziere"
                right-label="Bersaglio"
                :center-content="{
                    action: 'ha giustiziato'
                }"
            />
        </template>
        <template v-else></template>
    </div>
</template>



