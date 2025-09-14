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
    const used = props.gameState.usedPowers?.['angelo'] || [];
    return props.playerIds.some(playerId => used.includes(playerId));
});

const targetId = ref(null);
const selectable = computed(() => props.gameState.players.filter(p => !p.alive));
const choices = computed(() => [
    { label: t('rolePrompts.selectDeadPlayer'), value: null },
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

function submitNoAction() {
    props.onComplete({ skipped: true });
}
</script>

<template>
    <div class="space-y-6">
        <div class="text-center space-y-3">
            <div class="bg-violet-500/10 border border-violet-500/20 rounded-lg p-3 mb-4">
                <p class="text-violet-300 text-sm font-medium">📢 {{ t('rolePrompts.chooseDeadPlayerToResurrect') }}</p>
            </div>
            <p class="text-neutral-400 text-base font-medium">{{ t('rolePrompts.angeloChooseDeadPlayerDescription') }}</p>
        </div>
        
        <div v-if="hasActed" class="text-center">
            <div class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-500/10 border border-neutral-500/20">
                <svg class="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                </svg>
                <span class="text-sm font-medium text-neutral-300">{{ t('rolePrompts.alreadyUsedPower') }}</span>
            </div>
        </div>
        
        <div v-else-if="selectable.length === 0" class="text-center space-y-4">
            <p class="text-neutral-400 text-base">{{ t('rolePrompts.noDeadPlayersToResurrect') }}</p>
            <button 
                class="btn btn-accent w-full py-3 text-lg font-semibold rounded-2xl shadow-xl shadow-violet-500/30 hover:shadow-2xl hover:shadow-violet-500/40 transform hover:scale-105 active:scale-95 transition-all duration-300"
                @click="submitNoAction"
            >
                {{ t('rolePrompts.continue') }}
            </button>
        </div>
        
        <div v-else class="space-y-6">
            <PromptSelect
                :label="t('rolePrompts.whoToResurrect')"
                v-model="targetId"
                :choices="choices"
                buttonText=""
                accent="yellow"
                :disabled="choices.length === 0"
            />
            <SkipConfirmButtons
                confirm-text="rolePrompts.resurrect"
                :confirm-disabled="!canSubmit"
                @confirm="submit"
                @skip="skip"
            />
        </div>
        
        <div v-if="hasActed">
            <SkipConfirmButtons
                :showSkip="false"
                confirm-text="rolePrompts.continue"
                :confirm-disabled="false"
                @confirm="skip"
            />
        </div>
    </div>
</template>
