<script setup>
import { computed } from 'vue';
import RoleComparisonCard from '../../ui/RoleComparisonCard.vue';

const props = defineProps({
    gameState: { type: Object, required: true },
    entry: { type: Object, required: true },
    players: { type: Array, required: false },
    player: { type: Object, required: false },
});

const angeloEvent = computed(() => {
    // The entry is now the role-specific history object
    return props.entry;
});

const targetId = computed(() => angeloEvent.value?.targetId);
const target = computed(() => targetId.value ? props.gameState.players.find(p => p.id === targetId.value) : null);

const angeloPlayers = computed(() => {
  if (!props.entry || !props.entry.playerIds) return [];
  return props.gameState.players.filter(p => props.entry.playerIds.includes(p.id));
});

const representativeAngelo = computed(() => {
  const angeloList = angeloPlayers.value;
  if (angeloList.length === 0) return null;
  
  // Create a representative angelo object that shows all names
  return {
    ...angeloList[0],
    name: angeloList.length === 1 ? angeloList[0].name : angeloList.map(a => a.name).join(', '),
    roleId: 'angelo'
  };
});

const hasAction = computed(() => target.value && representativeAngelo.value);
</script>

<template>
    <div class="space-y-4">
        <template v-if="hasAction">
            <RoleComparisonCard
                :game-state="props.gameState"
                :left-player="representativeAngelo"
                :right-player="target"
                left-label="Angelo"
                right-label="Resuscitato"
                :center-content="{
                    action: 'ha resuscitato'
                }"
            />
        </template>
        <template v-else></template>
    </div>
</template>
