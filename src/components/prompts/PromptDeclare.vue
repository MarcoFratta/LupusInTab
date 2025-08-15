<script setup>
import { computed, ref } from 'vue';
import PromptSelect from './PromptSelect.vue';
import PromptSelectString from './PromptSelectString.vue';

const props = defineProps({
    gameState: { type: Object, required: true },
    player: { type: Object, required: true },
    onComplete: { type: Function, required: true },
});

const targetId = ref(null);
const roleId = ref(null);

const aliveChoices = computed(() => [
    { label: 'Giocatore…', value: null },
    ...props.gameState.players
        .filter(p => p.alive && p.id !== props.player.id)
        .map(p => ({ label: p.name, value: p.id }))
]);

const roleChoices = computed(() => {
    const meta = props.gameState.roleMeta || {};
    // Get only role IDs that are actually assigned to players in the current game
    const playersInGame = props.gameState.players || [];
    const rolesInGame = [...new Set(playersInGame.map(p => p.roleId))]; // Remove duplicates
    
    // Exclude the current player's role (LupoMannaro cannot declare himself)
    const availableRoles = rolesInGame.filter(roleId => roleId !== props.player.roleId);
    
    return [
        { label: 'Ruolo…', value: null }, 
        ...availableRoles.map((roleId) => ({ 
            label: meta[roleId]?.name || roleId, 
            value: roleId 
        }))
    ];
});

const canSubmit = computed(() => Number.isFinite(Number(targetId.value)) && Number(targetId.value) > 0 && roleId.value !== null && roleId.value !== '');

function submit() {
    if (!canSubmit.value) return;
    props.onComplete({ targetId: Number(targetId.value), roleId: String(roleId.value), used: true });
}

function skip() {
    props.onComplete({ targetId: null, roleId: null, used: false });
}
</script>

<template>
    <div class="space-y-3">
        <div class="grid grid-cols-[1fr_auto_1fr] gap-3 items-end">
            <PromptSelect label="Giocatore bersaglio" v-model="targetId" :choices="aliveChoices" buttonText="" />
            <div class="text-neutral-400 text-sm">→</div>
            <PromptSelectString label="Ruolo" v-model="roleId" :choices="roleChoices" buttonText="" />
        </div>
        <div class="grid grid-cols-2 gap-2">
            <button class="btn btn-secondary w-full" @click="skip">Salta</button>
            <button class="btn btn-primary w-full" :class="{ 'btn-disabled': !canSubmit }" :disabled="!canSubmit" @click="submit">Conferma</button>
        </div>
    </div>
</template>
