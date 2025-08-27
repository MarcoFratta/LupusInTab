<script setup>
const props = defineProps({
	gameState: { type: Object, required: true },
	nightNumber: { type: Number, required: true },
});

const indemoniatoPlayers = computed(() => {
  if (!props.entry || !props.entry.playerIds) return [];
  return props.gameState.players.filter(p => props.entry.playerIds.includes(p.id));
});
</script>

<template>
	<div class="space-y-3">
		<div class="text-center">
			<div class="text-lg font-semibold text-neutral-100">Indemoniato</div>
			<div class="text-sm text-neutral-400">L'indemoniato dorme tranquillamente</div>
		</div>
		
		<div class="bg-neutral-800/60 rounded-lg p-3">
			<div class="text-sm text-neutral-300">
				<strong>{{ indemoniatoPlayers.length }}</strong> indemoniato/i in gioco
			</div>
		</div>
	</div>
</template>

