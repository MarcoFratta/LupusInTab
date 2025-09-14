<template>
	<div v-if="show" class="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
		<div class="relative mb-6 bg-neutral-900/80 backdrop-blur-sm border border-neutral-800/40 rounded-2xl shadow-2xl shadow-black/40 max-w-md w-full max-h-[80vh] flex flex-col overflow-hidden animate-modalEntrance">
			<!-- Header with gradient accent -->
			<div class="relative p-6 pb-4 flex-shrink-0">
				<div class="absolute inset-0 bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 rounded-t-2xl"></div>
				<div class="relative">
					<h2 class="text-2xl font-bold text-center bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
						{{ t('newRoles.title') }}
					</h2>
					<p class="text-neutral-300 text-center text-sm mt-2">
						{{ t('newRoles.description') }}
					</p>
				</div>
			</div>
			
			<!-- Roles list -->
			<div class="flex-1 overflow-y-auto pt-2 px-6 pb-2">
				<div class="space-y-3">
					<div 
						v-for="(roleId, index) in newRoles" 
						:key="roleId"
						class="group relative overflow-hidden bg-neutral-900/60 border border-neutral-800/40 rounded-xl p-4 hover:bg-neutral-900/80 hover:border-neutral-700/50 transition-all duration-300 hover:scale-[1.02] transform"
						:style="{ animationDelay: `${index * 100}ms` }"
					>
						<div class="flex flex-row items-center justify-between">
								<span class="font-semibold text-neutral-100 text-base">{{ getRoleName(roleId) }}</span>
								<div class="mt-1">
									<span 
										class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border"
										:style="{ 
											color: getFactionColor(roleId), 
											borderColor: getFactionBorderColor(roleId), 
											backgroundColor: getFactionBackgroundColor(roleId) 
										}"
									>
										{{ getFactionName(roleId) }}
									</span>
								</div>
						</div>
					</div>
				</div>
			</div>
			
			<!-- Footer with button -->
			<div class="p-6 pt-4 flex-shrink-0 border-t border-neutral-800/40">
				<button 
					@click="closePopup"
					class="w-full btn btn-accent font-semibold rounded-xl shadow-xl shadow-violet-500/30 hover:shadow-2xl hover:shadow-violet-500/40 transform hover:scale-105 active:scale-95 transition-all duration-300 text-base py-3"
				>
					Perfetto! Ho capito
				</button>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ROLES } from '../../roles';
import { getFactionConfig } from '../../factions';
import { hexToRgba } from '../../utils/color';
import { getFactionDisplayName } from '../../utils/factionUtils';
import { useI18n } from '../../composables/useI18n';

interface Props {
	show: boolean;
	newRoles: string[];
}

interface Emits {
	(e: 'close'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();
const { t } = useI18n();

const getRoleName = (roleId: string): string => {
	return ROLES[roleId]?.name || roleId;
};

const getFactionName = (roleId: string): string => {
	const role = ROLES[roleId];
	return getFactionDisplayName(role?.team, t) || 'Sconosciuto';
};

const getFactionColor = (roleId: string): string => {
	const role = ROLES[roleId];
	const faction = getFactionConfig(role?.team);
	return faction?.color || '#9ca3af';
};

const getFactionBorderColor = (roleId: string): string => {
	const color = getFactionColor(roleId);
	return hexToRgba(color, 0.4) || color;
};

const getFactionBackgroundColor = (roleId: string): string => {
	const color = getFactionColor(roleId);
	return hexToRgba(color, 0.15) || 'transparent';
};

const closePopup = () => {
	emit('close');
};
</script>

<style scoped>
@keyframes modalEntrance {
	from {
		opacity: 0;
		transform: scale(0.95) translateY(10px);
	}
	to {
		opacity: 1;
		transform: scale(1) translateY(0);
	}
}

@keyframes slideInUp {
	from {
		opacity: 0;
		transform: translateY(20px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

.animate-modalEntrance {
	animation: modalEntrance 0.3s ease-out forwards;
}

.space-y-3 > div {
	animation: slideInUp 0.5s ease-out forwards;
	opacity: 0;
}

.animate-bounce {
	animation: bounce 2s infinite;
}

@keyframes bounce {
	0%, 20%, 53%, 80%, 100% {
		transform: translate3d(0,0,0);
	}
	40%, 43% {
		transform: translate3d(0,-8px,0);
	}
	70% {
		transform: translate3d(0,-4px,0);
	}
	90% {
		transform: translate3d(0,-2px,0);
	}
}
</style>
