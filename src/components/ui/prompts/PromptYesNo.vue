<script setup lang="ts">
const props = defineProps<{
	label: string;
	yesText?: string;
	noText?: string;
	disabled?: boolean;
}>();

const emit = defineEmits<{
	(e: 'yes'): void;
	(e: 'no'): void;
}>();

function onYes() { emit('yes'); }
function onNo() { emit('no'); }
</script>

<template>
	<div class="space-y-6">
		<div class="text-center">
			<h3 class="text-lg sm:text-xl font-semibold text-neutral-100 mb-2">{{ label }}</h3>
			<div class="w-12 h-0.5 bg-gradient-to-r from-neutral-500 to-neutral-400 mx-auto rounded-full"></div>
		</div>
		
		<div class="flex items-center justify-center gap-4">
			<button 
				class="btn btn-secondary px-8 py-2 text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-200" 
				:class="{ 'btn-disabled': disabled }" 
				:disabled="disabled" 
				@click="onNo"
			>
				{{ noText || 'No' }}
			</button>
			<button 
				class="btn btn-accent px-8 py-2 text-base font-semibold rounded-xl shadow-xl shadow-violet-500/30 hover:shadow-2xl hover:shadow-violet-500/40 transform hover:scale-105 active:scale-95 transition-all duration-200" 
				:class="{ 'btn-disabled': disabled }" 
				:disabled="disabled" 
				@click="onYes"
			>
				{{ yesText || 'Sì' }}
			</button>
		</div>
	</div>
</template>


