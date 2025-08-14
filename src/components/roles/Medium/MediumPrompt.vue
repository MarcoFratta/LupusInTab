<script setup lang="ts">
import { computed, ref } from 'vue';
import PromptSelect from '../../prompts/PromptSelect.vue';

const props = defineProps<{ gameState: any, player: any, onComplete: (r:any)=>void }>();

const targetId = ref<number | null>(null);
const selectable = computed(() => props.gameState.players.filter((p: any) => p.alive && p.id !== props.player?.id));
const result = computed(() => {
	if (!targetId.value) return null;
	const target = props.gameState.players.find((p: any) => p.id === targetId.value);
	if (!target) return null;
	const seenTeam = props.gameState.roleMeta[target.roleId]?.visibleAsTeam || props.gameState.roleMeta[target.roleId]?.team;
	return String(seenTeam).toUpperCase();
});

const choices = computed(() => [
	{ label: 'Select a player…', value: null },
	...selectable.value.map((p: any) => ({ label: p.name, value: p.id }))
]);

const canSubmit = computed(() => Number.isFinite(Number(targetId.value)) && Number(targetId.value) > 0);

function submit() {
	if (!canSubmit.value) return;
	props.onComplete({ targetId: targetId.value });
}

const selectedPlayer = computed(() => {
	if (!targetId.value) return null;
	return props.gameState.players.find((p: any) => p.id === targetId.value) || null;
});

const teamId = computed(() => {
	if (!selectedPlayer.value) return null as string | null;
	const rid = selectedPlayer.value.roleId;
	return props.gameState.roleMeta[rid]?.visibleAsTeam || props.gameState.roleMeta[rid]?.team || null;
});

const teamLabel = computed(() => {
	if (!teamId.value) return null;
	const t = String(teamId.value).toLowerCase();
	return t === 'wolf' ? 'Wolf' : 'Village';
});

const teamPillClass = computed(() => {
	return teamId.value === 'wolf'
		? 'bg-red-500/20 text-red-300 border-red-500/30'
		: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
});
</script>

<template>
	<div class="stack">
		<PromptSelect
			label="Choose a player to check"
			v-model="targetId"
			:choices="choices"
			buttonText="Confirm"
			accent="violet"
			:disabled="!choices.length"
			@confirm="submit"
		/>
		<div v-if="selectedPlayer && teamLabel" class="mt-4 space-y-2">
			<div class="text-sm text-neutral-400">Result</div>
			<div class="bg-neutral-900/60 border border-neutral-800/40 rounded-lg p-4 flex items-center justify-between gap-4">
				<div class="flex items-center gap-3 min-w-0">
					<div class="w-9 h-9 rounded-full bg-neutral-800/70 border border-neutral-700/50 flex items-center justify-center text-neutral-300 text-sm font-medium">
						{{ selectedPlayer.name?.slice(0,1)?.toUpperCase() }}
					</div>
					<div class="min-w-0">
						<div class="text-sm font-semibold text-neutral-100 truncate">{{ selectedPlayer.name }}</div>
						<div class="text-xs text-neutral-400 truncate">plays for</div>
					</div>
				</div>
				<div class="shrink-0">
					<span class="px-2 py-1 rounded text-xs font-medium border" :class="teamPillClass">{{ teamLabel }}</span>
				</div>
			</div>
		</div>
	</div>
</template>


