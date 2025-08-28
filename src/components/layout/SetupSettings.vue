<script setup lang="ts">
import { useGameStore } from '../../stores/game';
import { watch, computed } from 'vue';
import { saveSettings } from '../../utils/storage';

const store = useGameStore();
const state = store.state as any;

const activeSettingsCount = computed(() => Object.values(state.settings).filter(Boolean).length);

watch(() => state.settings, () => {
  saveSettings({
    skipFirstNightActions: !!state.settings.skipFirstNightActions,
    enableSindaco: !!state.settings.enableSindaco,
    discussionTimerEnabled: !!state.settings.discussionTimerEnabled,
  });
}, { deep: true });

const openBuyMeACoffee = () => {
  window.open('https://buymeacoffee.com/frattarolaf', '_blank');
};

const openGitHubStar = () => {
  window.open('https://github.com/MarcoFratta/LupusInTab', '_blank');
};

const openGitHubIssue = () => {
  window.open('https://github.com/MarcoFratta/LupusInTab/issues/new', '_blank');
};

const gameSettings = [
  {
    key: 'skipFirstNightActions',
    title: 'Salta le azioni della prima notte',
    description: 'Tutti i ruoli vengono chiamati nella Notte 1, ma i loro effetti sono ignorati.',
    disabled: false
  },
  {
    key: 'enableSindaco',
    title: 'Abilita Sindaco',
    description: 'Il voto del sindaco vale doppio durante la votazione quando è in vita.',
    disabled: true
  },
  {
    key: 'discussionTimerEnabled',
    title: 'Timer discussione (giorno)',
    description: 'Mostra un timer compatto nella fase di linciaggio per la discussione (max 60 minuti).',
    disabled: false
  }
];

const toggleSetting = (key: string) => {
  state.settings[key] = !state.settings[key];
};
</script>

<template>
  <div class="w-full px-3 md:px-6 space-y-4 md:space-y-6">
         <div class="space-y-3 md:space-y-4">
       <div class="relative text-center">
         <div class="absolute inset-0 bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 blur-2xl md:blur-3xl rounded-full"></div>
         <h2 class="relative text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
           Impostazioni
         </h2>
       </div>
       
       <div class="w-16 md:w-24 h-0.5 md:h-1 bg-gradient-to-r from-violet-500 to-fuchsia-500 mx-auto rounded-full"></div>
       
       <p class="text-sm md:text-base text-neutral-400 max-w-md leading-relaxed text-left">
         Personalizza le regole e le funzionalità per questa partita.
       </p>
       
       <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20">
         <div class="w-2 h-2 rounded-full bg-violet-500"></div>
         <span class="text-xs font-medium text-violet-400">{{ activeSettingsCount }} attiv{{ activeSettingsCount === 1 ? 'a' : 'e' }}</span>
       </div>
     </div>

    <div class="space-y-4">
      <h3 class="text-lg font-semibold text-neutral-200">Opzioni di Gioco</h3>
      
      <div class="space-y-3">
        <div class="group relative p-4 rounded-lg border border-neutral-800/40 bg-neutral-900/30 hover:bg-neutral-900/50 hover:border-neutral-700/50 transition-all duration-200">
          <div class="flex items-start justify-between gap-4">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <span class="text-sm font-medium text-neutral-200">Salta le azioni della prima notte</span>
              </div>
              <div class="text-xs text-neutral-500 leading-relaxed">
                Tutti i ruoli vengono chiamati nella Notte 1, ma i loro effetti sono ignorati.
              </div>
            </div>
            
            <div class="flex-shrink-0">
              <div class="relative w-12 h-6 bg-neutral-700 rounded-full cursor-pointer transition-all duration-200 hover:scale-105" 
                   :class="{ 'bg-violet-500': state.settings.skipFirstNightActions }"
                   @click="state.settings.skipFirstNightActions = !state.settings.skipFirstNightActions">
                <div class="absolute top-0.5 w-5 h-5 rounded-full shadow-sm transition-transform duration-200"
                     :class="{ 
                       'translate-x-6 bg-white': state.settings.skipFirstNightActions, 
                       'translate-x-0.5 bg-neutral-300': !state.settings.skipFirstNightActions 
                     }">
                </div>
              </div>
            </div>
          </div>
          
          <div v-if="state.settings.skipFirstNightActions" 
               class="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-500 rounded-b-lg">
          </div>
        </div>

        <div class="group relative p-4 rounded-lg border border-neutral-800/40 bg-neutral-900/30 hover:bg-neutral-900/50 hover:border-neutral-700/50 transition-all duration-200 opacity-80">
          <div class="flex items-start justify-between gap-4">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <span class="text-sm font-medium text-neutral-200">Abilita Sindaco</span>
              </div>
              <div class="text-xs text-neutral-500 leading-relaxed">
                Il voto del sindaco vale doppio durante la votazione quando è in vita.
              </div>
            </div>
            
            <div class="flex-shrink-0">
              <div class="relative w-12 h-6 bg-neutral-700 rounded-full cursor-pointer transition-all duration-200 hover:scale-105" 
                   :class="{ 'bg-violet-500': state.settings.enableSindaco }"
                   @click="state.settings.enableSindaco = !state.settings.enableSindaco">
                <div class="absolute top-0.5 w-5 h-5 rounded-full shadow-sm transition-transform duration-200"
                     :class="{ 
                       'translate-x-6 bg-white': state.settings.enableSindaco, 
                       'translate-x-0.5 bg-neutral-300': !state.settings.enableSindaco 
                     }">
                </div>
              </div>
            </div>
          </div>
          
          <div v-if="state.settings.enableSindaco" 
               class="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-500 rounded-b-lg">
          </div>
        </div>

        <div class="group relative p-4 rounded-lg border border-neutral-800/40 bg-neutral-900/30 hover:bg-neutral-900/50 hover:border-neutral-700/50 transition-all duration-200">
          <div class="flex items-start justify-between gap-4">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <span class="text-sm font-medium text-neutral-200">Timer discussione (giorno)</span>
              </div>
              <div class="text-xs text-neutral-500 leading-relaxed">
                Mostra un timer compatto nella fase di linciaggio per la discussione (max 60 minuti).
              </div>
            </div>
            
            <div class="flex-shrink-0">
              <div class="relative w-12 h-6 bg-neutral-700 rounded-full cursor-pointer transition-all duration-200 hover:scale-105" 
                   :class="{ 'bg-violet-500': state.settings.discussionTimerEnabled }"
                   @click="state.settings.discussionTimerEnabled = !state.settings.discussionTimerEnabled">
                <div class="absolute top-0.5 w-5 h-5 rounded-full shadow-sm transition-transform duration-200"
                     :class="{ 
                       'translate-x-6 bg-white': state.settings.discussionTimerEnabled, 
                       'translate-x-0.5 bg-neutral-300': !state.settings.discussionTimerEnabled 
                     }">
                </div>
              </div>
            </div>
          </div>
          
          <div v-if="state.settings.discussionTimerEnabled" 
               class="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-500 rounded-b-lg">
          </div>
        </div>
      </div>
    </div>

    <div class="space-y-4">
      <h3 class="text-lg font-semibold text-neutral-200">Supporta il Progetto</h3>
      
      <div class="space-y-3">
        <div class="p-4 rounded-lg border border-neutral-800/40 bg-neutral-900/30 hover:bg-neutral-900/50 hover:border-neutral-700/50 transition-all duration-200">
          <div class="space-y-3">
            <div class="space-y-1">
              <span class="text-sm font-medium text-neutral-200">Offrimi un caffè</span>
              <p class="text-xs text-neutral-500 leading-relaxed">
                Se ti piace il progetto, considera di supportarlo con una donazione per mantenere il progetto attivo.
              </p>
            </div>
                         <button 
               @click="openBuyMeACoffee"
               class="w-full py-2.5 px-4 bg-orange-500/20 hover:bg-orange-500/30 text-neutral-400 hover:text-neutral-300 text-sm font-medium rounded-lg transition-all duration-200 border border-orange-500/30 hover:border-orange-500/50">
               Offri un caffè
             </button>
          </div>
        </div>

        <div class="p-4 rounded-lg border border-neutral-800/40 bg-neutral-900/30 hover:bg-neutral-900/50 hover:border-neutral-700/50 transition-all duration-200">
          <div class="space-y-3">
            <div class="space-y-1">
              <span class="text-sm font-medium text-neutral-200">Contribuisci su GitHub</span>
              <p class="text-xs text-neutral-500 leading-relaxed">
                Lascia una stella al progetto e segnala eventuali problemi o suggerimenti per miglioramenti.
              </p>
            </div>
            <div class="flex flex-col sm:flex-row gap-2">
              <button 
                @click="openGitHubStar"
                class="flex-1 py-2.5 px-4 bg-neutral-600/20 hover:bg-neutral-600/30 text-neutral-400 hover:text-neutral-300 text-sm font-medium rounded-lg transition-all duration-200 border border-neutral-500/30 hover:border-neutral-500/50">
                Lascia una stella
              </button>
              <button 
                @click="openGitHubIssue"
                class="flex-1 py-2.5 px-4 bg-neutral-600/20 hover:bg-neutral-600/30 text-neutral-400 hover:text-neutral-300 text-sm font-medium rounded-lg transition-all duration-200 border border-neutral-500/30 hover:border-neutral-500/50">
                Segnala un problema
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

