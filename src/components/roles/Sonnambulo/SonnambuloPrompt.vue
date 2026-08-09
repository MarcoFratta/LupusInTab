<script setup lang="ts">
import { computed, ref } from 'vue';
import PromptSelect from '../../ui/prompts/PromptSelect.vue';
import { useI18n } from '../../../composables/useI18n';

const { t } = useI18n();

const props = defineProps<{ gameState: any, playerIds: number[], onComplete: (r:any)=>void }>();

const targetId = ref<number | null>(null);
const choices = computed(() => {
	const alive = props.gameState.players.filter((p: any) => p.alive && !props.playerIds.includes(p.id));
	return alive.map((p: any) => ({ label: p.name, value: p.id }));
});

function submit() {
	props.onComplete({ targetId: targetId.value });
}
</script>

<template>
	<div class="space-y-6">
		<div class="text-center space-y-3">
			<div class="bg-violet-500/10 border border-violet-500/20 rounded-lg p-3 mb-4">
				<p class="text-violet-300 text-sm font-medium">📢 {{ t('rolePrompts.sonnambuloChoosePlayer') }}</p>
			</div>
			<p class="text-neutral-400 text-base font-medium">{{ t('rolePrompts.sonnambuloChoosePlayerDescription') }}</p>
		</div>
		
		<PromptSelect
			:label="t('rolePrompts.selectPlayer')"
			v-model="targetId"
			:choices="choices"
			:buttonText="t('rolePrompts.confirmSelection')"
			accent="blue"
			@confirm="submit"
		/>
	</div>
</template>
