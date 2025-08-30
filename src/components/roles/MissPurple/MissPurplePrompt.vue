<script setup lang="ts">
import { computed } from 'vue';
import { ROLES } from '../../../roles';

const props = defineProps<{ gameState: any, player: any, playerIds: number[], onComplete: (r:any)=>void }>();

const lupiCount = computed(() => {
    return props.gameState.players.filter((p: any) => 
        p.alive && (p.roleState?.visibleAsTeam === 'lupi' || p.roleState?.team === 'lupi')
    ).length;
});

function submit() {
    props.onComplete({ lupiCount: lupiCount.value });
}
</script>

<template>
	<div class="space-y-6">
		<div class="text-center space-y-3">
			<p class="text-neutral-400 text-base font-medium">Scopri quanti lupi ci sono nel villaggio</p>
		</div>
		
		<div class="bg-neutral-800 rounded-lg p-6 text-center">
			<div class="text-4xl font-bold text-purple-400 mb-2">{{ lupiCount }}</div>
			<div class="text-neutral-300 text-lg">lupi nel villaggio</div>
		</div>
		
		<div class="text-center">
			<button 
				@click="submit"
				class="bg-purple-600 hover:bg-purple-700 w-full text-white px-6 py-3 rounded-lg font-medium transition-colors"
			>
				Conferma
			</button>
		</div>
	</div>
</template>
