<template>
	<div v-if="show" class=" fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
		<div class="mb-4 bg-neutral-900 border border-neutral-700 rounded-lg shadow-2xl max-w-md w-full max-h-[70vh] flex flex-col">
			<div class="p-6 flex-shrink-0">
				<div class="flex items-center justify-center mb-4">
					<h2 class="text-xl font-bold text-violet-400">Nuovi Ruoli Disponibili!</h2>
				</div>
				
				<div class="space-y-3">
					<p class="text-neutral-300 text-sm">
						Abbiamo aggiunto nuovi ruoli! Ecco cosa c'è nuovo:
					</p>
				</div>
			</div>
			
			<div class="flex-1 overflow-y-auto px-6 pb-6">
				<div class="space-y-3">
					<div 
						v-for="roleId in newRoles" 
						:key="roleId"
						class="flex items-center justify-between p-3 bg-neutral-800/50 rounded-lg border border-neutral-700/50"
					>
						<span class="font-medium text-neutral-200">{{ getRoleName(roleId) }}</span>
						<span 
							class="text-[11px] px-2 py-0.5 rounded border font-medium"
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
			
			<div class="py-3 px-6 flex-shrink-0 border-t border-neutral-700/50">
				<div class="flex justify-end">
					<button 
						@click="closePopup"
						class="px-6 py-2 w-full bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-lg transition-colors"
					>
						Perfetto!
					</button>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ROLES } from '../../roles';
import { getFactionConfig } from '../../factions';
import { hexToRgba } from '../../utils/color';

interface Props {
	show: boolean;
	newRoles: string[];
}

interface Emits {
	(e: 'close'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const getRoleName = (roleId: string): string => {
	return ROLES[roleId]?.name || roleId;
};

const getFactionName = (roleId: string): string => {
	const role = ROLES[roleId];
	const faction = getFactionConfig(role?.team);
	return faction?.displayName || role?.team || 'Sconosciuto';
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
