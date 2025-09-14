<script setup>
import { computed } from 'vue';
import { useGameStore } from '../../../stores/game';
import GenericTargetSelectPrompt from '../../ui/prompts/GenericTargetSelectPrompt.vue';
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

const choices = computed(() => {
	const alivePlayers = state.players.filter((p) => 
		p && p.alive
	);
	
	return alivePlayers.map((p) => ({
		label: p.name,
		value: p.id
	}));
});

function handleComplete(data) {
	const result = { 
		targetId: data.targetId || 0,
		saverRole: 'guardia',
		saverPlayerId: props.playerIds[0] || 0
	};
	props.onComplete(result);
}
</script>

<template>
	<div class="space-y-6">
		<div class="text-center space-y-3">
			<div class="bg-violet-500/10 border border-violet-500/20 rounded-lg p-3 mb-4">
				<p class="text-violet-300 text-sm font-medium">📢 {{ t('rolePrompts.protectPlayer') }}</p>
			</div>
		</div>
		
		<GenericTargetSelectPrompt
			:title="t('rolePrompts.protectPlayer')"
			:description="t('rolePrompts.protectPlayer')"
			:label="t('rolePrompts.whoToProtect')"
			:buttonText="t('rolePrompts.confirmSelection')"
			accent="emerald"
			:choices="choices"
			@complete="handleComplete"
		/>
	</div>
</template>


