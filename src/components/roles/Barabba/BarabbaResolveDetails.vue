<script setup>
import { computed } from 'vue';
import RoleComparisonCard from '../../ui/RoleComparisonCard.vue';

const props = defineProps({
    gameState: { type: Object, required: true },
    entry: { type: Object, required: true },
    players: { type: Array, required: false },
    player: { type: Object, required: false },
});

const barabbaEvent = computed(() => {
    // The entry is now the role-specific history object
    return props.entry;
});

const targetId = computed(() => barabbaEvent.value?.targetId);
const target = computed(() => targetId.value ? props.gameState.players.find(p => p.id === targetId.value) : null);

const barabbaPlayers = computed(() => props.gameState.players.filter(p => p.roleId === 'barabba'));

const representativeBarabba = computed(() => {
  const barabbaList = barabbaPlayers.value;
  if (barabbaList.length === 0) return null;
  
  // Create a representative barabba object that shows all names
  return {
    ...barabbaList[0],
    name: barabbaList.length === 1 ? barabbaList[0].name : barabbaList.map(b => b.name).join(', '),
    roleId: 'barabba'
  };
});

const hasAction = computed(() => target.value && representativeBarabba.value);
</script>

<template>
    <div class="space-y-4">
        <template v-if="hasAction">
            <RoleComparisonCard
                :game-state="props.gameState"
                :left-player="representativeBarabba"
                :right-player="target"
                left-label="Barabba"
                right-label="Bersaglio"
                :center-content="{
                    action: 'ha ucciso'
                }"
            />
        </template>
        <template v-else></template>
    </div>
</template>
