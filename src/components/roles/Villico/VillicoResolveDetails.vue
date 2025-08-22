<script setup>
const props = defineProps({
	gameState: { type: Object, required: true },
	nightNumber: { type: Number, required: true },
});

const villicoPlayers = props.gameState.players.filter(p => p.roleId === 'villico');
</script>

<template>
	<div class="space-y-3">
		<div class="text-center">
			<div class="text-lg font-semibold text-neutral-100">Villico</div>
			<div class="text-sm text-neutral-400">I paesani dormono tranquillamente</div>
		</div>
		
		<div class="bg-neutral-800/60 rounded-lg p-3">
			<div class="text-sm text-neutral-300">
				<strong>{{ villicoPlayers.length }}</strong> paesano/i in gioco
			</div>
		</div>
	</div>
</template>

