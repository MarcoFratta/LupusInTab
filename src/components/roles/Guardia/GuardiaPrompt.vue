<script setup>
import { computed, ref } from 'vue';
import { useGameStore } from '../../../stores/game';
import PromptSelect from '../../ui/prompts/PromptSelect.vue';
import SkipConfirmButtons from '../../ui/SkipConfirmButtons.vue';
import { useI18n } from '../../../composables/useI18n';
import { getRoleDisplayName } from '../../../utils/roleUtils';

const { t } = useI18n();

const props = defineProps({
    gameState: { type: Object, required: true },
    playerIds: { type: Array, required: true },
    onComplete: { type: Function, required: true }
});

const store = useGameStore();
const state = store.state;
const targetId = ref(null);

const choices = computed(() => {
	const alivePlayers = state.players.filter((p) => 
		p && p.alive
	);
	
	return [
		{ label: t('rolePrompts.selectPlayer'), value: null },
		...alivePlayers.map((p) => ({
			label: p.name,
			value: p.id
		}))
	];
});

const canSubmit = computed(() => {
	return targetId.value !== null && Number.isFinite(Number(targetId.value)) && Number(targetId.value) > 0;
});

function handleComplete(data) {
	const result = { 
		targetId: data.targetId || 0,
		saverRole: 'guardia',
		saverPlayerId: props.playerIds[0] || 0
	};
	props.onComplete(result);
}

function handleSkip() {
	props.onComplete({ 
		targetId: null,
		saverRole: 'guardia',
		saverPlayerId: props.playerIds[0] || 0,
		skipped: true
	});
}
</script>

<template>
	<div class="space-y-6">
		<div class="text-center space-y-3">
			<div class="bg-violet-500/10 border border-violet-500/20 rounded-lg p-3 mb-4">
				<p class="text-violet-300 text-sm font-medium">📢 {{ t('rolePrompts.protectPlayer') }}</p>
			</div>
		</div>
		
		<div class="space-y-6">
			<div class="text-center space-y-3">
				<h3 class="text-lg font-semibold text-white">{{ t('rolePrompts.protectPlayer') }}</h3>
				<p class="text-neutral-400 text-base font-medium">{{ t('rolePrompts.whoToProtect') }}</p>
			</div>
			
			<PromptSelect
				:label="t('rolePrompts.whoToProtect')"
				v-model="targetId"
				:choices="choices"
				accent="emerald"
			/>
			
			<SkipConfirmButtons
				:confirm-disabled="!canSubmit"
				@confirm="handleComplete({ targetId: targetId })"
				@skip="handleSkip"
			/>
		</div>
	</div>
</template>


