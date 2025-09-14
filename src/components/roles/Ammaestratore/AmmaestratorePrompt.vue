<script setup lang="ts">
import { computed, ref } from 'vue';
import PromptSelect from '../../ui/prompts/PromptSelect.vue';
import { useI18n } from '../../../composables/useI18n';

const { t } = useI18n();

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
			{ label: t('rolePrompts.noWolfAttacksToRedirect'), value: null, disabled: true }
		];
	}
	
	return [
		{ label: t('common.none'), value: null },
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
			<div class="bg-violet-500/10 border border-violet-500/20 rounded-lg p-3 mb-4">
				<p class="text-violet-300 text-sm font-medium">📢 {{ t('rolePrompts.chooseTargetForWolves') }}</p>
			</div>
			<p class="text-neutral-400 text-base font-medium">{{ t('rolePrompts.chooseTargetToRedirect') }}</p>
			<p class="text-neutral-500 text-sm">{{ t('rolePrompts.ammaestratoreDescription') }}</p>
		</div>
		
		<PromptSelect
			:label="t('rolePrompts.chooseTarget')"
			v-model="targetId"
			:choices="choices"
			:buttonText="t('rolePrompts.confirmSelection')"
			accent="emerald"
			@confirm="submit"
		/>
		
		<div class="text-center">
			<button 
				@click="skip"
				class="bg-neutral-600 w-full hover:bg-neutral-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
			>
				{{ t('common.skip') }}
			</button>
		</div>
	</div>
</template>
