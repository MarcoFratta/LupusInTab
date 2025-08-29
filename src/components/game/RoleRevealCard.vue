<script setup lang="ts">
import { getFactionConfig } from '../../factions';
import FactionLabel from '../ui/FactionLabel.vue';
import { LongPressButton } from '../ui';
import * as RoleIcons from '../roles/icons';

const props = defineProps<{
  player: any;
  roleDef: any;
  knownRoleAllies?: any[];
  knownTeamAllies?: any[];
}>();

const emit = defineEmits<{
  next: [];
}>();

function handleNext() {
  emit('next');
}
</script>

<template>
  <div v-if="roleDef">
    <div class="bg-gradient-to-br from-neutral-900/80 to-neutral-800/60 border border-neutral-700/40 rounded-xl p-4 md:p-6">
      <div class="text-center space-y-4">
        <div>
          <!-- Icons temporarily hidden - will be shown later -->
          <!-- <div v-if="roleDef.icon && RoleIcons[roleDef.icon as keyof typeof RoleIcons]" class="w-20 h-20 mx-auto bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 border border-violet-500/30 rounded-full flex items-center justify-center mb-4">
            <component :is="RoleIcons[roleDef.icon as keyof typeof RoleIcons]" class="w-10 h-10 text-violet-400" />
          </div> -->
          <div class="text-2xl md:text-3xl font-extrabold tracking-tight mb-2" 
               :style="{ color: getFactionConfig(roleDef.team)?.color || '#e5e7eb' }">
            {{ roleDef.name }}
          </div>
          <div v-if="roleDef.description" class="text-neutral-300 text-sm md:text-base leading-relaxed max-w-md mx-auto mb-4">
            {{ roleDef.description }}
          </div>
          
          <div class="inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-neutral-800/40 border border-neutral-700/40">
            <span class="text-neutral-200 font-medium">La tua fazione</span>
            <FactionLabel :team="roleDef.team" :labelText="getFactionConfig(roleDef.team)?.displayName || roleDef.team" size="lg" />
          </div>
        </div>

        <div v-if="(props.knownRoleAllies && props.knownRoleAllies.length) || (props.knownTeamAllies && props.knownTeamAllies.length)" class="pt-4 border-t border-neutral-700/40">
          <div class="text-center mb-4">
            <h4 class="text-base md:text-lg font-semibold text-neutral-200 mb-2">Le tue informazioni</h4>
            <div class="w-12 h-0.5 bg-gradient-to-r from-violet-500/50 to-fuchsia-500/50 mx-auto rounded-full"></div>
          </div>
          
          <div v-if="props.knownRoleAllies && props.knownRoleAllies.length" class="mb-4 last:mb-0">
            <div class="text-neutral-300 text-sm font-medium mb-2 flex items-center gap-2">
              <div class="w-1 h-4 rounded-full bg-violet-400"></div>
              Vi conoscete a vicenda ({{ props.knownRoleAllies.length }})
            </div>
            <div class="space-y-2">
              <div v-for="p in props.knownRoleAllies" :key="p.id" class="flex items-center justify-between p-3 bg-neutral-800/40 border border-neutral-700/40 rounded-lg hover:bg-neutral-800/60 transition-colors">
                <span class="text-neutral-100 font-medium truncate max-w-full" :title="p.name">{{ p.name }}</span>
                <FactionLabel :team="p.team" :labelText="p.labelText" size="lg" />
              </div>
            </div>
          </div>

          <div v-if="props.knownTeamAllies && props.knownTeamAllies.length">
            <div class="text-neutral-300 text-sm font-medium mb-2 flex items-center gap-2">
              <div class="w-1 h-4 rounded-full bg-fuchsia-400"></div>
              Tu conosci loro ({{ props.knownTeamAllies.length }})
            </div>
            <div class="space-y-2">
              <div v-for="p in props.knownTeamAllies" :key="p.id" class="flex items-center justify-between p-3 bg-neutral-800/40 border border-neutral-700/40 rounded-lg hover:bg-neutral-800/60 transition-colors">
                <span class="text-neutral-100 font-medium truncate max-w-full" :title="p.name">{{ p.name }}</span>
                <FactionLabel :team="p.team" :labelText="p.labelText" size="lg" />
              </div>
            </div>
          </div>
        </div>

        <!-- Prossimo button inside the card -->
        <div class="pt-4">
          <LongPressButton 
            size="md"
            fullWidth
            @activate="handleNext"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
            </svg>
            Prossimo
          </LongPressButton>
        </div>
      </div>
    </div>
  </div>
  
  <div v-else class="space-y-4">
    <div class="bg-neutral-900/60 border border-neutral-800/40 rounded-xl p-4 md:p-6 text-center">
      <div class="space-y-3">
        <div class="w-12 h-12 mx-auto bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/30 rounded-full flex items-center justify-center">
          <svg class="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
          </svg>
        </div>
        <div>
          <div class="text-xl md:text-2xl font-extrabold tracking-tight text-neutral-200 mb-1">Ruolo sconosciuto</div>
          <div class="text-neutral-400 text-xs md:text-sm">{{ player?.roleId }}</div>
        </div>
      </div>
    </div>
    <div class="pt-2">
      <LongPressButton 
        size="md"
        fullWidth
        @activate="handleNext"
      >
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
        </svg>
        Tieni premuto per continuare (1.5s)
      </LongPressButton>
    </div>
  </div>
</template>


