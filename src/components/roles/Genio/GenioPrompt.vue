<template>
  <div class="bg-neutral-900/60 border border-neutral-800/40 rounded-lg p-6">
    <div class="text-center mb-6">
      <div class="w-16 h-16 mx-auto mb-4 bg-neutral-800/40 rounded-full flex items-center justify-center">
        <span class="text-neutral-300 text-3xl">🧞‍♂️</span>
      </div>

      <p class="text-neutral-300 text-sm">
        Scegli uno dei tre ruoli disponibili per trasformarti
      </p>
    </div>

    <div class="grid gap-4 mb-6">
      <div
        v-for="(role, index) in availableRoles"
        :key="role.id"
        @click="selectRole(role)"
        :class="getRoleCardClasses(role.factionConfig)"
        class="rounded-lg p-4 cursor-pointer transition-all duration-200"
      >
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full flex items-center justify-center text-lg">
            {{ getRoleIcon(role.id) }}
          </div>
          <div class="flex-1">
            <div class="font-semibold text-neutral-100">{{ role.name }}</div>
            <div 
              class="text-xs font-medium"
              :style="{ color: role.factionConfig?.color || '#9ca3af' }"
            >
              {{ role.factionConfig?.displayName || role.team }}
            </div>
          </div>
          <div 
            :class="getRoleNumberClasses(role.factionConfig)"
            class="w-6 h-6 rounded-full border-2 flex items-center justify-center"
          >
            <span class="text-xs font-bold">{{ index + 1 }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { ROLES } from '../../../roles';
import { getFactionConfig } from '../../../factions';

const props = defineProps<{
  gameState: any;
  player: any;
  onComplete: (result: any) => void;
}>();

const genioFaction = computed(() => {
  return getFactionConfig('villaggio'); // Genio is part of villaggio faction
});

const availableRoles = computed(() => {
  const enabledRoles = props.gameState.setup.rolesEnabled;
  const allRoles = ROLES;
  
  // Debug logging
  console.log('Enabled roles from game state:', enabledRoles);
  console.log('Available roles in ROLES:', Object.keys(allRoles));
  
  const availableRoleIds = Object.keys(enabledRoles).filter(roleId => {
    const isEnabled = enabledRoles[roleId];
    const isNotGenio = roleId !== 'genio';
    
    // Handle legacy strega -> medium conversion
    const actualRoleId = roleId === 'strega' ? 'medium' : roleId;
    const roleExists = !!allRoles[actualRoleId];
    
    console.log(`Role ${roleId}: enabled=${isEnabled}, notGenio=${isNotGenio}, exists=${roleExists}, actualRole=${actualRoleId}`);
    
    return isEnabled && isNotGenio && roleExists; // Only include roles that actually exist
  }).map(roleId => roleId === 'strega' ? 'medium' : roleId); // Convert strega to medium
  
  console.log('Available role IDs after filtering:', availableRoleIds);
  
  const shuffled = availableRoleIds.sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, 3);
  
  console.log('Selected roles for Genio:', selected);
  
  return selected.map(roleId => ({
    id: roleId,
    name: allRoles[roleId]?.name || roleId,
    team: allRoles[roleId]?.team || 'unknown',
    factionConfig: getFactionConfig(allRoles[roleId]?.team)
  }));
});

const getRoleIcon = (roleId: string) => {
  const icons: Record<string, string> = {
    // Core roles
    lupo: '🐺',
    villico: '👨‍🌾',
    guardia: '🛡️',
    veggente: '🔮',
    
    // Special roles
    massone: '💕',
    matto: '🤪',
    giustiziere: '⚖️',
    boia: '🔨',
    medium: '🧙‍♀️',
    lupomannaro: '🐕',
    indemoniato: '😈',
    insinuo: '🤐',
    barabba: '🗡️',
    angelo: '👼',
    illusionista: '🎭',
    genio: '🧞‍♂️',
    
    // Additional roles (if more are added later)
    sindaco: '👑',
    cacciatore: '🏹',
    profeta: '⭐',
    investigatore: '🕵️',
    medico: '👨‍⚕️',
    prete: '✝️',
    mercante: '💰',
    soldato: '⚔️',
    ladro: '🥷',
    vampiro: '🧛',
    zombi: '🧟',
    fantasma: '👻',
    stregone: '🔮',
    negromante: '💀',
    druido: '🌿',
    alchimista: '⚗️',
    oracolo: '🔯',
    monaco: '🧘',
    pirata: '🏴‍☠️',
    cavaliere: '🏇',
    assassino: '🗡️',
    spia: '🕴️',
    cuoco: '👨‍🍳',
    bibliotecario: '📚',
    artista: '🎨',
    musicista: '🎵',
    scrittore: '✍️',
    poeta: '📜',
    filosofo: '🤔',
    scienziato: '🔬',
    inventore: '💡',
    esploratore: '🗺️',
    archeologo: '⛏️',
    astronomo: '🔭',
    marinaio: '⚓',
    pilota: '✈️',
    giardiniere: '🌱',
    fabbro: '🔨',
    sarto: '🧵',
    pescatore: '🎣',
    pastore: '🐑',
    contadino: '🚜',
    minatore: '⛏️',
    boscaiolo: '🪓',
    mugnaio: '🌾',
    fornaio: '🍞',
    macellaio: '🥩',
    orefice: '💎',
    ceramista: '🏺',
    tessitore: '🧶',
    cordaio: '🪢',
    carrettiere: '🛒',
    stalliere: '🐴',
    maniscalco: '🔧',
    carpentiere: '🔨',
    muratore: '🧱',
    architetto: '📐',
    ingegnere: '⚙️',
    cartografo: '🗺️',
    navigatore: '🧭'
  };
  
  return icons[roleId] || '❓';
};

const getRoleCardClasses = (factionConfig: any) => {
  if (!factionConfig) {
    return 'bg-neutral-800/30 border border-neutral-700/40 hover:bg-neutral-800/50 hover:border-neutral-600/60';
  }
  
  switch (factionConfig.id) {
    case 'villaggio':
      return 'bg-emerald-900/30 border border-emerald-700/40 hover:bg-emerald-900/50 hover:border-emerald-600/60';
    case 'lupi':
      return 'bg-red-900/30 border border-red-700/40 hover:bg-red-900/50 hover:border-red-600/60';
    case 'mannari':
      return 'bg-indigo-900/30 border border-indigo-700/40 hover:bg-indigo-900/50 hover:border-indigo-600/60';
    case 'matti':
      return 'bg-violet-900/30 border border-violet-700/40 hover:bg-violet-900/50 hover:border-violet-600/60';
    default:
      return 'bg-neutral-800/30 border border-neutral-700/40 hover:bg-neutral-800/50 hover:border-neutral-600/60';
  }
};

const getRoleNumberClasses = (factionConfig: any) => {
  if (!factionConfig) {
    return 'border-neutral-400 text-neutral-400';
  }
  
  switch (factionConfig.id) {
    case 'villaggio':
      return 'border-emerald-400 text-emerald-400';
    case 'lupi':
      return 'border-red-400 text-red-400';
    case 'mannari':
      return 'border-indigo-400 text-indigo-400';
    case 'matti':
      return 'border-violet-400 text-violet-400';
    default:
      return 'border-neutral-400 text-neutral-400';
  }
};

const selectRole = (role: any) => {
  props.onComplete({
    target: { roleId: role.id }
  });
};

onMounted(() => {
  // Ensure we have 3 random roles
  if (availableRoles.value.length < 3) {
    console.warn('Not enough available roles for Genio della Lampada');
  }
});
</script>
