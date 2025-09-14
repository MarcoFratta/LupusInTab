<script setup>
import { computed, ref } from 'vue';
import PromptSelect from '../../ui/prompts/PromptSelect.vue';
import SkipConfirmButtons from '../../ui/SkipConfirmButtons.vue';
import { useI18n } from '../../../composables/useI18n';

const props = defineProps({
    gameState: { type: Object, required: true },
    playerIds: { type: Array, required: true },
    onComplete: { type: Function, required: true }
});

const { t } = useI18n();

const hasActed = computed(() => {
    const used = props.gameState.usedPowers?.['justicer'] || [];
    return props.playerIds.some(playerId => used.includes(playerId));
});

const targetId = ref(null);
const selectable = computed(() => props.gameState.players.filter(p => p.alive && !props.playerIds.includes(p.id)));
const choices = computed(() => [
    { label: t('rolePrompts.selectPlayer'), value: null },
    ...selectable.value.map((p) => ({ label: p.name, value: p.id }))
]);

const canSubmit = computed(() => Number.isFinite(Number(targetId.value)) && Number(targetId.value) > 0);

function submit() {
    if (!canSubmit.value) return;
    props.onComplete({ targetId: targetId.value, used: true });
}

function skip() {
    props.onComplete({ targetId: null, used: false });
}
</script>

<template>
    <div class="space-y-6">
        <div class="text-center space-y-3">
            <div class="bg-violet-500/10 border border-violet-500/20 rounded-lg p-3 mb-4">
                <p class="text-violet-300 text-sm font-medium">📢 {{ t('rolePrompts.choosePlayerToExecute') }}</p>
            </div>
            <p class="text-neutral-400 text-base font-medium">{{ t('rolePrompts.giustiziereChoosePlayerDescription') }}</p>
        </div>
        
        <div v-if="hasActed" class="text-center">
            <div class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-500/10 border border-neutral-500/20">
                <svg class="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                </svg>
                <span class="text-sm font-medium text-neutral-300">{{ t('rolePrompts.alreadyUsedPower') }}</span>
            </div>
        </div>
        
        <PromptSelect
            v-else
            :label="t('rolePrompts.whoToExecute')"
            v-model="targetId"
            :choices="choices"
            buttonText=""
            accent="violet"
            :disabled="choices.length === 0"
        />
        
        <SkipConfirmButtons
            v-if="!hasActed"
            confirm-text="rolePrompts.execute"
            :confirm-disabled="!canSubmit"
            @confirm="submit"
            @skip="skip"
        />
        <div v-else>
            <SkipConfirmButtons
                :showSkip="false"
                confirm-text="rolePrompts.continue"
                :confirm-disabled="false"
                @confirm="skip"
            />
        </div>
    </div>
</template>



