<script setup>
const props = defineProps({
	gameState: { type: Object, required: true },
	nightNumber: { type: Number, required: true },
});

const mattoPlayers = props.gameState.players.filter(p => p.roleId === 'matto');
</script>

<template>
	<div class="space-y-3">
		<div class="text-center">
			<div class="text-lg font-semibold text-neutral-100">Matto</div>
			<div class="text-sm text-neutral-400">Il matto dorme tranquillamente</div>
		</div>
		
		<div class="bg-neutral-800/60 rounded-lg p-3">
			<div class="text-sm text-neutral-300">
				<strong>{{ mattoPlayers.length }}</strong> matto/i in gioco
			</div>
		</div>
	</div>
</template>

