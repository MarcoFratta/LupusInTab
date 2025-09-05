<script setup>
import { computed, ref } from 'vue';
import { ROLES } from '../../../roles';
import PromptSelect from './PromptSelect.vue';

const props = defineProps({
    title: { type: String, required: true },
    description: { type: String, required: true },
    label: { type: String, required: true },
    buttonText: { type: String, default: 'Conferma selezione' },
    accent: { type: String, default: 'blue' },
    onComplete: { type: Function, required: true },
    disabled: { type: Boolean, default: false },
    // Filter options
    excludeRoles: { type: Array, default: () => [] },
    includeOnlyRoles: { type: Array, default: () => [] },
    includeOnlyTeams: { type: Array, default: () => [] },
    customFilter: { type: Function, default: null }
});

const selectedRoleId = ref(null);

const availableRoles = computed(() => {
    let roles = Object.values(ROLES);
    
    // Apply role filters
    if (props.includeOnlyRoles.length > 0) {
        roles = roles.filter(role => props.includeOnlyRoles.includes(role.id));
    } else if (props.excludeRoles.length > 0) {
        roles = roles.filter(role => !props.excludeRoles.includes(role.id));
    }
    
    // Apply team filters
    if (props.includeOnlyTeams.length > 0) {
        roles = roles.filter(role => props.includeOnlyTeams.includes(role.team));
    }
    
    // Apply custom filter
    if (props.customFilter) {
        roles = roles.filter(props.customFilter);
    }
    
    return roles;
});

const choices = computed(() => [
    { label: 'Seleziona un ruolo…', value: null },
    ...availableRoles.value.map((role) => ({ 
        label: role.name, 
        value: role.id,
        disabled: false
    }))
]);

function submit() {
    props.onComplete({ 
        roleId: selectedRoleId.value,
        data: { roleId: selectedRoleId.value }
    });
}
</script>

<template>
    <div class="space-y-6">
        <div class="text-center space-y-3">
            <h3 class="text-lg font-semibold text-white">{{ title }}</h3>
            <p class="text-neutral-400 text-base font-medium">{{ description }}</p>
        </div>
        
        <PromptSelect
            :label="label"
            v-model="selectedRoleId"
            :choices="choices"
            :buttonText="buttonText"
            :accent="accent"
            :disabled="choices.length === 0 || disabled"
            @confirm="submit"
        />
    </div>
</template>
