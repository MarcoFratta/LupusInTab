<script setup lang="ts">
interface RoleDisplayInfo {
  name: string;
  faction: string;
  color: string;
}

interface Props {
  roleInfo: RoleDisplayInfo;
  groupNames: string[];
}

defineProps<Props>();
</script>

<template>
  <div class="space-y-4 md:space-y-6">
    <div class="text-center space-y-3 md:space-y-4">
      <h2 
        class="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent truncate max-w-full"
        :title="roleInfo.name"
      >
        {{ roleInfo.name }}
      </h2>
      <div class="w-16 md:w-24 h-0.5 md:h-1 bg-gradient-to-r from-violet-500 to-fuchsia-500 mx-auto rounded-full"></div>
    </div>

    <div 
      v-if="groupNames && groupNames.length > 0" 
      class="bg-neutral-900/60 border border-neutral-800/40 rounded-xl p-4 md:p-6"
    >
      <div class="text-center mb-4">
        <h3 class="text-lg md:text-xl font-semibold text-neutral-200 mb-2">Giocatori con questo ruolo</h3>
        <div class="w-12 h-0.5 bg-gradient-to-r from-violet-500/50 to-fuchsia-500/50 mx-auto rounded-full"></div>
      </div>
      
      <div class="flex flex-wrap gap-2 justify-center">
        <span 
          v-for="name in groupNames" 
          :key="name"
          class="inline-flex items-center gap-2 px-3 py-2 bg-neutral-800/40 border border-neutral-700/40 rounded-lg text-sm font-medium text-neutral-200 hover:bg-neutral-800/60 transition-colors max-w-[10rem] truncate"
          :title="name"
        >
          <span class="w-2 h-2 rounded-full bg-violet-400 flex-shrink-0"></span>
          {{ name }}
        </span>
      </div>
    </div>
  </div>
</template>
