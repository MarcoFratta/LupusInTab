<script setup>
import { computed, ref } from 'vue';
import PromptSelect from './PromptSelect.vue';
import PromptSelectString from './PromptSelectString.vue';
import SkipConfirmButtons from '../SkipConfirmButtons.vue';
import PrimaryButton from '../PrimaryButton.vue';
import { ROLES } from '../../../roles';

const props = defineProps({
    gameState: { type: Object, required: true },
    player: { type: Object, required: true },
    onComplete: { type: Function, required: true },
    skippable: { type: Boolean, default: true },
    availablePlayers: { type: Array, default: null },
    availableRoles: { type: Array, default: null },
});

const targetId = ref(null);
const roleId = ref(null);

const aliveChoices = computed(() => {
    if (props.availablePlayers) {
        return [
            { label: 'Giocatore…', value: null },
            ...props.availablePlayers.map(p => ({ label: p.name, value: p.id }))
        ];
    }
    
    return [
        { label: 'Giocatore…', value: null },
        ...props.gameState.players
            .filter(p => p.alive && p.id !== props.player.id)
            .map(p => ({ label: p.name, value: p.id }))
    ];
});

const roleChoices = computed(() => {
    if (props.availableRoles) {
        return [
            { label: 'Ruolo…', value: null }, 
            ...props.availableRoles.map((roleId) => ({ 
                label: ROLES[roleId]?.name || roleId, 
                value: roleId 
            }))
        ];
    }
    
    const playersInGame = props.gameState.players || [];
    const rolesInGame = [...new Set(playersInGame.map(p => p.roleId))];
    
    const availableRoles = rolesInGame.filter(roleId => roleId !== props.player.roleId);
    
    return [
        { label: 'Ruolo…', value: null }, 
        ...availableRoles.map((roleId) => ({ 
            label: ROLES[roleId]?.name || roleId, 
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
        <div class="grid grid-cols-[1fr_auto_1fr] items-start gap-x-2 gap-y-1">
            <div class="muted">Giocatore</div>
            <div></div>
            <div class="muted">Ruolo</div>
            <div class="h-full flex items-center w-full">
                <PromptSelect :label="''" v-model="targetId" :choices="aliveChoices" buttonText="" />
            </div>
            <div class="h-full flex items-center justify-center text-neutral-400 text-base leading-none">→</div>
            <div class="h-full flex items-center w-full">
                <PromptSelectString :label="''" v-model="roleId" :choices="roleChoices" buttonText="" />
            </div>
        </div>
        
        <SkipConfirmButtons
            v-if="skippable"
            :confirm-disabled="!canSubmit"
            @confirm="submit"
            @skip="skip"
        />
        
        <PrimaryButton
            v-else
            :disabled="!canSubmit"
            @click="submit"
            class="w-full"
        >
            Conferma
        </PrimaryButton>
    </div>
</template>

