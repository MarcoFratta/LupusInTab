<script setup lang="ts">
import { computed } from 'vue';
import { ROLES } from '../../../roles';
import { useI18n } from '../../../composables/useI18n';

const { t } = useI18n();

const props = defineProps<{ gameState: any,playerIds: number[], onComplete: (r:any)=>void }>();

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
			<div class="bg-violet-500/10 border border-violet-500/20 rounded-lg p-3 mb-4">
				<p class="text-violet-300 text-sm font-medium">📢 {{ t('rolePrompts.discoverWolvesInVillage') }}</p>
			</div>
		</div>
		
		<div class="bg-neutral-800 rounded-lg p-6 text-center">
			<div class="text-4xl font-bold text-purple-400 mb-2">{{ lupiCount }}</div>
			<div class="text-neutral-300 text-lg">{{ t('rolePrompts.wolvesInVillage') }}</div>
		</div>
		
		<div class="text-center">
			<button 
				@click="submit"
				class="bg-purple-600 hover:bg-purple-700 w-full text-white px-6 py-3 rounded-lg font-medium transition-colors"
			>
				{{ t('rolePrompts.confirm') }}
			</button>
		</div>
	</div>
</template>
