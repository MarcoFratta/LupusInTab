<script setup>
import { computed, ref } from 'vue';
import PromptSelect from '../../prompts/PromptSelect.vue';

const props = defineProps({
    gameState: { type: Object, required: true },
    player: { type: Object, required: true },
    onComplete: { type: Function, required: true },
});

const targetId = ref(null);
const roleId = ref('');

const aliveChoices = computed(() => [
    { label: 'Seleziona un giocatore…', value: null },
    ...props.gameState.players
        .filter(p => p.alive && p.id !== props.player.id)
        .map(p => ({ label: p.name, value: p.id }))
]);

const roleChoices = computed(() => {
    const meta = props.gameState.roleMeta || {};
    const ids = Object.keys(meta);
    return [{ label: 'Seleziona un ruolo…', value: '' }, ...ids.map((id) => ({ label: meta[id].name || id, value: id }))];
});

const canSubmit = computed(() => Number.isFinite(Number(targetId.value)) && Number(targetId.value) > 0 && String(roleId.value || '').length > 0);

function submit() {
    if (!canSubmit.value) return;
    props.onComplete({ targetId: Number(targetId.value), roleId: String(roleId.value), used: true });
}

function skip() {
    props.onComplete({ targetId: null, roleId: '', used: false });
}
</script>

<template>
    <div class="space-y-3">
        <div class="grid grid-cols-[1fr_auto_1fr] gap-3 items-end">
            <PromptSelect label="Giocatore bersaglio" v-model="targetId" :choices="aliveChoices" buttonText="" />
            <div class="text-neutral-400 text-sm">→</div>
            <PromptSelect label="Ruolo" v-model="roleId" :choices="roleChoices" buttonText="" />
        </div>
        <div class="flex justify-end gap-2">
            <button class="btn btn-secondary" @click="skip">Salta</button>
            <button class="btn btn-primary" :class="{ 'btn-disabled': !canSubmit }" :disabled="!canSubmit" @click="submit">Conferma</button>
        </div>
    </div>
</template>



