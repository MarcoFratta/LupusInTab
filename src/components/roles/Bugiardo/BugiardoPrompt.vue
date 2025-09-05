<script setup lang="ts">
import { computed, ref } from 'vue';
import PromptSelect from '../../ui/prompts/PromptSelect.vue';
import { ROLES } from '../../../roles';
import { getFactionConfig } from '../../../factions';

const props = defineProps<{ gameState: any,playerIds: number[], onComplete: (r:any)=>void }>();

const targetId = ref<number | null>(null);
const selectable = computed(() => props.gameState.players.filter((p: any) => !p.alive && !props.playerIds.includes(p.id)));
const choices = computed(() => [
	{ label: 'Seleziona un giocatore morto…', value: null },
	...selectable.value.map((p: any) => ({ label: `${p.name}`, value: p.id }))
]);

const canUsePower = computed(() => {
    if (props.gameState.nightNumber < 2) return false;
    if (props.gameState.custom?.bugiardo?.usedPowers?.[props.playerIds[0]]) return false;
    return true;
});

const selectedPlayer = computed(() => {
    if (!targetId.value) return null;
    return props.gameState.players.find((p: any) => p.id === targetId.value) || null;
});

const getRoleColor = (roleId: string) => {
    const role = ROLES[roleId];
    return role?.color || '#9ca3af';
};

const getFactionColor = (roleId: string) => {
    const role = ROLES[roleId];
    if (!role?.team) return '#9ca3af';
    const factionConfig = getFactionConfig(role.team);
    return factionConfig?.color || '#9ca3af';
};



function submit() {
	props.onComplete({ targetId: targetId.value });
}

function skip() {
	props.onComplete({ targetId: null });
}
</script>

<template>
	<div class="space-y-4">
		<div class="text-center space-y-2">
			<p class="text-neutral-400 text-base font-medium">Investiga un giocatore morto per scoprire il suo ruolo reale</p>
			<p class="text-sm text-neutral-500">Puoi usare questo potere una sola volta per partita, a partire dalla notte 2</p>
		</div>
		
		<div v-if="!canUsePower" class="bg-neutral-800 rounded-lg p-6 text-center">
			<div class="text-neutral-400 text-lg">
				<span v-if="gameState.nightNumber < 2">Potrai usare questo potere dalla notte 2</span>
				<span v-else>Hai già usato questo potere</span>
			</div>
		</div>
		
		<template v-else>
			<PromptSelect
				label="Chi vuoi investigare?"
				v-model="targetId"
				:choices="choices"
				buttonText="Conferma selezione"
				accent="red"
				:disabled="!choices.length"
				@confirm="submit"
			>
				<div v-if="selectedPlayer" class="space-y-3">
					<div class="bg-neutral-900/60 border border-neutral-800/40 rounded-lg p-4">
						<div class="text-center space-y-3">
							<div class="text-xs text-neutral-400">Risultato investigazione</div>
							<div class="flex items-center justify-center gap-3">
								<span class="text-neutral-400 text-xs">aveva il ruolo</span>
								<span 
									class="px-3 py-1.5 rounded text-sm font-medium border"
									:style="{ 
										borderColor: getFactionColor(selectedPlayer.roleId) + '40',
										backgroundColor: getFactionColor(selectedPlayer.roleId) + '20',
										color: getFactionColor(selectedPlayer.roleId)
									}"
								>
									{{ ROLES[selectedPlayer.roleId]?.name || selectedPlayer.roleId }}
								</span>
							</div>
						</div>
					</div>
				</div>
			</PromptSelect>
			
			<div class="text-center">
				<button 
					@click="skip"
					class="bg-neutral-600 w-full hover:bg-neutral-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
				>
					Salta
				</button>
			</div>
		</template>
	</div>
</template>
