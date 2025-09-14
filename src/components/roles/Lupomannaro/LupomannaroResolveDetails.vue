<script setup>
import { computed } from 'vue';
import RoleComparisonCard from '../../ui/RoleComparisonCard.vue';
import { ROLES } from '../../../roles';
import { getFactionConfig } from '../../../factions';
import { useI18n } from '../../../composables/useI18n';
import { getRoleDisplayName } from '../../../utils/roleUtils';

const props = defineProps({
	gameState: { type: Object, required: true },
	entry: { type: Object, required: true },
	players: { type: Array, required: false },
	player: { type: Object, required: true },
});

const { t } = useI18n();

const lupomannaroPlayers = computed(() => {
  if (!props.entry || !props.entry.playerIds) return [];
  return props.gameState.players.filter(p => props.entry.playerIds.includes(p.id));
});

const lupomannaroEvent = computed(() => {
    return props.entry;
});

const targetId = computed(() => lupomannaroEvent.value?.targetId);
const target = computed(() => targetId.value ? 
	props.gameState.players.find((p) => p.id === targetId.value) : null
);

const roleId = computed(() => lupomannaroEvent.value?.declaredRole);
const roleName = computed(() => roleId.value ? getRoleDisplayName(roleId.value, t) : 'N/A');
const isCorrect = computed(() => lupomannaroEvent.value?.correct);

const hasDeclaration = computed(() => target.value && roleId.value);

const centerContent = computed(() => ({
    action: t('resolveDetails.chose'),
    declaredRole: {
        name: roleName.value || 'N/A',
        color: roleName.value ? (getFactionConfig(ROLES[roleId.value]?.team)?.color || '#9ca3af') : '#9ca3af'
    },
    status: {
        isCorrect: isCorrect.value,
        text: isCorrect.value ? t('resolveDetails.correct') : t('resolveDetails.wrong')
    }
}));
</script>

<template>
    <div v-if="!hasDeclaration" class="text-neutral-400 text-center text-xs">{{ t('resolveDetails.noDeclaration') }}</div>
    <RoleComparisonCard
        v-else-if="lupomannaroPlayers.length > 0"
        :game-state="gameState"
        :left-player="lupomannaroPlayers"
        :right-player="target"
        :left-label="getRoleDisplayName('lupomannaro', t)"
        :right-label="t('resolveDetails.target')"
        :center-content="centerContent"
    />
</template>

