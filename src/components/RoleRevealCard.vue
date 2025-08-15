<script setup>
import { ref } from 'vue';

const props = defineProps({
	player: { type: Object, required: true },
	roleMeta: { type: Object, required: true },
});

const emit = defineEmits(['next']);
const revealed = ref(false);

// Team mapping for display
const teamMapping = {
  'lupi': 'Lupi',
  'village': 'Villaggio', 
  'matti': 'Folle',
  'mannari': 'Mannari'
};

function getTeamClasses(team) {
  if (team === 'lupi') return 'bg-red-500/20 text-red-400 border-red-500/30';
  if (team === 'matti') return 'bg-violet-500/20 text-violet-400 border-violet-500/30';
  if (team === 'mannari') return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30';
  return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
}

function reveal() { revealed.value = true; }
function next() { revealed.value = false; emit('next'); }
</script>

<template>
	<div class="w-full flex justify-center">
    <div class="w-full max-w-md bg-neutral-900/60 border border-neutral-800/40 rounded-xl p-6 text-center space-y-4">
			<div v-if="!revealed" class="space-y-3">
				<div class="text-neutral-400 text-sm">Tocca per rivelare il ruolo</div>
				<button class="btn btn-primary" @click="reveal">Rivela</button>
			</div>
			<div v-else class="space-y-3">
				<div class="text-neutral-400 text-sm">Il tuo ruolo è</div>
				<div class="rounded-xl p-4 border border-white/10" :style="{ background: (roleMeta.color || '#111827') + '22' }">
					<div class="text-2xl font-extrabold tracking-tight" :style="{ color: roleMeta.color || '#e5e7eb' }">{{ roleMeta.name }}</div>
					<div v-if="roleMeta.description" class="mt-2 text-sm text-neutral-300 leading-snug">{{ roleMeta.description }}</div>
				</div>
				<!-- Faction section below to avoid color overlap -->
				<div class="bg-neutral-900/60 border border-neutral-800/40 rounded-lg p-3">
					<div class="flex items-center justify-between">
						<div class="text-slate-100 text-sm font-medium">La tua fazione è</div>
						<span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border"
								:class="getTeamClasses(roleMeta.team)">
							{{ teamMapping[roleMeta.team] || roleMeta.team }}
						</span>
					</div>
				</div>
				<!-- Extra confidential info for this player goes here -->
				<slot></slot>
				<button class="btn btn-primary" @click="next">Nascondi e avanti</button>
			</div>
		</div>
	</div>
</template>


