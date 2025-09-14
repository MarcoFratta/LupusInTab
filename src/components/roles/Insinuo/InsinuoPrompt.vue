<template>
    <div class="space-y-4">
        <div class="text-center">
            <div class="bg-violet-500/10 border border-violet-500/20 rounded-lg p-3 mb-4">
                <p class="text-violet-300 text-sm font-medium">📢 {{ t('rolePrompts.choosePlayerToInsinuate') }}</p>
            </div>
            <p class="text-neutral-400 text-sm">{{ t('rolePrompts.choosePlayerToInsinuateDescription') }}</p>
        </div>
        
        <PromptSelect
            :label="t('rolePrompts.whoToInsinuate')"
            v-model="selectedTargetId"
            :choices="playerChoices"
            :placeholder="t('rolePrompts.selectPlayerPlaceholder')"
            :buttonText="t('rolePrompts.confirmSelection')"
            accent="violet"
            @confirm="onTargetSelect"
        >
            <div v-if="selectedTarget && targetFactionInfo" class="bg-neutral-900/60 border border-neutral-800/40 rounded-xl p-4">
                <div class="text-center space-y-3">
                    <div class="text-neutral-300 text-sm">{{ t('rolePrompts.youChose') }}</div>
                    <div class="text-neutral-100 font-medium truncate max-w-full" :title="selectedTarget.name">{{ selectedTarget.name }}</div>
                    <FactionComparisonCard 
                        :current-team="targetFactionInfo.currentTeam"
                        :next-team="targetFactionInfo.nextTeam"
                    />
                </div>
            </div>
        </PromptSelect>
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import PromptSelect from '../../ui/prompts/PromptSelect.vue';
import FactionComparisonCard from '../../ui/FactionComparisonCard.vue';
import { useI18n } from '../../../composables/useI18n';

const { t } = useI18n();

const props = defineProps<{ gameState: any, playerIds: number[], onComplete: (r:any)=>void }>();

const selectedTargetId = ref<number | null>(null);

const alivePlayers = computed(() => 
    props.gameState.players.filter((p: any) => p.alive && !props.playerIds.includes(p.id))
);

const playerChoices = computed(() => 
    alivePlayers.value.map((p: any) => ({ label: p.name, value: p.id }))
);

const selectedTarget = computed(() => 
    selectedTargetId.value ? alivePlayers.value.find((p: any) => p.id === selectedTargetId.value) : null
);

const targetFactionInfo = computed(() => {
    if (!selectedTarget.value) return null;
    
    const currentVisible = selectedTarget.value.roleState?.visibleAsTeam || selectedTarget.value.roleState?.realTeam || 'villaggio';
    const nextVisible = currentVisible === 'lupi' ? 'villaggio' : 'lupi';
    
    return {
        current: currentVisible === 'lupi' ? t('factions.lupi') : t('factions.villaggio'),
        next: nextVisible === 'lupi' ? t('factions.lupi') : t('factions.villaggio'),
        currentTeam: currentVisible,
        nextTeam: nextVisible
    };
});

function onTargetSelect() {
    props.onComplete({ targetId: selectedTargetId.value });
}
</script>
