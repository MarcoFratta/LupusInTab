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
    <div class="space-y-6">
        <div class="space-y-4">
            <div class="text-center">
                <h4 class="text-base font-medium text-neutral-200 mb-2">Seleziona giocatore e ruolo</h4>
                <div class="w-8 h-0.5 bg-gradient-to-r from-neutral-500 to-neutral-400 mx-auto rounded-full"></div>
            </div>
            
            <div class="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] items-start gap-4 sm:gap-x-3 sm:gap-y-2">
                <div class="text-center sm:text-left">
                    <label class="block text-sm font-medium text-neutral-300 mb-2">Giocatore</label>
                    <div class="relative">
                        <select 
                            v-model="targetId"
                            class="w-full appearance-none rounded-xl border-2 border-neutral-500/40 bg-neutral-900/80 backdrop-blur-sm px-4 py-3 text-neutral-100 text-base font-medium hover:bg-neutral-900/90 focus:outline-none focus:ring-4 focus:ring-neutral-400/30 transition-all duration-200 shadow-lg"
                        >
                            <option v-for="opt in aliveChoices" :key="String(opt.value)" :value="opt.value">
                                {{ opt.label }}
                            </option>
                        </select>
                        <span class="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </span>
                    </div>
                </div>
                
                <div class="hidden sm:flex h-full items-center justify-center text-neutral-400 text-2xl leading-none">
                    →
                </div>
                
                <div class="text-center sm:text-right">
                    <label class="block text-sm font-medium text-neutral-300 mb-2">Ruolo</label>
                    <div class="relative">
                        <select 
                            v-model="roleId"
                            class="w-full appearance-none rounded-xl border-2 border-neutral-500/40 bg-neutral-900/80 backdrop-blur-sm px-4 py-3 text-neutral-100 text-base font-medium hover:bg-neutral-900/90 focus:outline-none focus:ring-4 focus:ring-neutral-400/30 transition-all duration-200 shadow-lg"
                        >
                            <option v-for="opt in roleChoices" :key="String(opt.value)" :value="opt.value">
                                {{ opt.label }}
                            </option>
                        </select>
                        <span class="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </span>
                    </div>
                </div>
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

