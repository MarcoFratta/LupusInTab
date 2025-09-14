<script setup lang="ts">
import { computed, ref } from 'vue';
import PromptSelect from '../../ui/prompts/PromptSelect.vue';
import DisplayFaction from '../../ui/DisplayFaction.vue';
import { ROLES } from '../../../roles';
import { useI18n } from '../../../composables/useI18n';

const { t } = useI18n();

const props = defineProps<{ gameState: any, playerIds: number[], onComplete: (r:any)=>void }>();

const targetId = ref<number | null>(null);
const selectable = computed(() => props.gameState.players.filter((p: any) => p.alive && !props.playerIds.includes(p.id)));
const choices = computed(() => [
	{ label: t('rolePrompts.selectPlayer'), value: null },
	...selectable.value.map((p: any) => ({ label: p.name, value: p.id }))
]);

function submit() {
	props.onComplete({ targetId: targetId.value });
}
</script>

<template>
	<div class="space-y-6">
		<div class="text-center space-y-3">
			<div class="bg-violet-500/10 border border-violet-500/20 rounded-lg p-3 mb-4">
				<p class="text-violet-300 text-sm font-medium">📢 {{ t('rolePrompts.investigatePlayer') }}</p>
			</div>
			<p class="text-neutral-400 text-base font-medium">{{ t('rolePrompts.checkFaction') }}</p>
		</div>
		
		<PromptSelect
			:label="t('rolePrompts.whoToCheck')"
			v-model="targetId"
			:choices="choices"
			:buttonText="t('rolePrompts.confirmSelection')"
			accent="violet"
			:disabled="!choices.length"
			@confirm="submit"
		>
			<DisplayFaction
				:game-state="gameState"
				:target-id="targetId"
				:discovery-text="t('rolePrompts.discovered')"
			/>
		</PromptSelect>
	</div>
</template>


