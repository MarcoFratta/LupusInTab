<script setup lang="ts">
import { computed, ref } from 'vue';
import PromptSelect from '../../ui/prompts/PromptSelect.vue';

const props = defineProps<{ gameState: any,playerIds: number[], onComplete: (r:any)=>void }>();

const targetId = ref<number | null>(null);
const choices = computed(() => {
	const alive = props.gameState.players.filter((p: any) => p.alive);
	const hasWolfKills = props.gameState.night?.context?.pendingKills && 
		Object.values(props.gameState.night.context.pendingKills).some((kills: any) => 
			kills.some((kill: any) => kill.role === 'lupo')
		);
	
	if (!hasWolfKills) {
		return [
			{ label: 'Nessun attacco dei lupi da reindirizzare', value: null, disabled: true }
		];
	}
	
	return [
		{ label: 'Nessuno', value: null },
		...alive.map((p: any) => ({ 
			label: p.name, 
			value: p.id,
			disabled: p.roleId === 'ammaestratore'
		}))
	];
});

function submit() {
	props.onComplete({ targetId: targetId.value });
}

function skip() {
	props.onComplete({ skipped: true });
}
</script>

<template>
	<div class="space-y-6">
		<div class="text-center space-y-3">
			<p class="text-neutral-400 text-base font-medium">Scegli un bersaglio per reindirizzare gli attacchi dei lupi</p>
			<p class="text-neutral-500 text-sm">Se scegli un lupo, nessuno morirà. Se scegli un altro giocatore, morirà al posto del bersaglio originale.</p>
		</div>
		
		<PromptSelect
			label="Scegli un bersaglio"
			v-model="targetId"
			:choices="choices"
			buttonText="Conferma"
			accent="emerald"
			@confirm="submit"
		/>
		
		<div class="text-center">
			<button 
				@click="skip"
				class="bg-neutral-600 w-full hover:bg-neutral-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
			>
				Salta
			</button>
		</div>
	</div>
</template>
