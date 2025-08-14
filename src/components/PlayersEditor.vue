<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{ players: Array<{ name: string }>, numPlayers: number, onClose: ()=>void, onApply:(players: Array<{name:string}>, num: number)=>void }>();
const localPlayers = ref(props.players.map(p => ({ ...p })));
const localNum = ref(props.numPlayers);

function addPlayer() { localPlayers.value.push({ name: `Player ${localPlayers.value.length + 1}` }); localNum.value = localPlayers.value.length; }
function removePlayer(idx: number) { localPlayers.value.splice(idx, 1); localNum.value = localPlayers.value.length; }
function apply() { props.onApply(localPlayers.value, localNum.value); props.onClose(); }
</script>

<template>
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
    <div class="w-full max-w-lg rounded-2xl border border-neutral-800/50 bg-neutral-950/95 p-5 backdrop-blur-sm">
      <div class="mb-3 flex items-center justify-between">
        <h3 class="text-lg font-semibold text-neutral-100">Edit Players</h3>
        <button class="btn btn-secondary text-xs" @click="onClose">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          Close
        </button>
      </div>
      <div class="mb-3">
        <label class="text-xs font-medium text-neutral-300">Number of players</label>
        <input type="number" v-model.number="localNum" min="4" max="20" class="mt-1 w-full rounded-lg border border-neutral-800/60 bg-neutral-900/70 px-3 py-2 text-neutral-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40" />
      </div>
      <div class="max-h-80 overflow-auto space-y-2 pr-1.5">
        <div v-for="(p, idx) in localPlayers" :key="idx" class="flex items-center gap-2.5 p-2.5 bg-neutral-900/60 border border-neutral-800/40 rounded-lg">
          <div class="w-6 h-6 bg-indigo-600 rounded text-white text-xs font-medium flex items-center justify-center flex-shrink-0">{{ idx + 1 }}</div>
          <input type="text" v-model="p.name" class="flex-1 px-2 py-1 bg-transparent border border-neutral-800/40 rounded text-neutral-100 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/40 focus:border-indigo-500/40" :placeholder="`Player ${idx + 1}`" />
          <button class="btn btn-secondary text-[11px]" @click="removePlayer(idx)">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            Remove
          </button>
        </div>
      </div>
      <div class="mt-3 flex items-center justify-between gap-2">
        <button class="btn btn-secondary text-sm" @click="addPlayer">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 5v14m-7-7h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          Add player
        </button>
        <button class="btn btn-primary text-sm" @click="apply">Apply</button>
      </div>
		</div>
	</div>
</template>


