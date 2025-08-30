<template>
  <div class="bg-neutral-900/60 border border-neutral-800/40 rounded-lg p-6">
    <div class="text-center mb-6">
      <p class="text-neutral-300 text-sm">
        Scegli uno dei tre ruoli disponibili per trasformarti
      </p>
    </div>

    <div class="grid gap-4 mb-6">
      <div
        v-for="(role, index) in availableRoles"
        :key="`${role.id}-${shuffleKey}`"
        @click="selectRole(role)"
        :class="getRoleCardClasses()"
        class="rounded-lg p-4 cursor-pointer transition-all duration-200"
      >
        <div class="flex items-center gap-3">
          <div class="flex-1 text-left">
            <div class="font-semibold text-neutral-100">{{ role.name }}</div>
            <div 
              class="text-xs font-medium"
              :style="{ color: role.factionConfig?.color || '#9ca3af' }"
            >
              {{ role.factionConfig?.displayName || role.team }}
            </div>
          </div>
          <div 
            :class="getRoleNumberClasses()"
            class="w-6 h-6 rounded-full border-2 flex items-center justify-center"
          >
            <span class="text-xs font-bold">{{ index + 1 }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="text-center">
      <button
        @click="reshuffleRoles"
        class="px-6 py-3 bg-neutral-800/60 hover:bg-neutral-700/80 border border-neutral-600/40 hover:border-neutral-500/60 rounded-xl text-neutral-200 text-sm font-medium transition-all duration-200 flex items-center gap-3 mx-auto shadow-lg hover:shadow-xl"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="text-neutral-300">
          <path d="M1 4v6h6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M23 20v-6h-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Rimescola i ruoli
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { ROLES } from '../../../roles';
import { getFactionConfig } from '../../../factions';

const props = defineProps<{
  gameState: any;
  player: any;
  playerIds: number[];
  onComplete: (result: any) => void;
}>();

const shuffleKey = ref(0);
const selectedRoles = ref<any[]>([]);

const genioFaction = computed(() => {
  return getFactionConfig('villaggio'); // Genio is part of villaggio faction
});

const getAvailableRoleIds = () => {
  const enabledRoles = props.gameState.setup.rolesEnabled;
  const allRoles = ROLES;
  
  // Debug logging
  console.log('Enabled roles from game state:', enabledRoles);
  console.log('Available roles in ROLES:', Object.keys(allRoles));
  
  // If rolesEnabled is not properly populated, fall back to all available roles
  if (!enabledRoles || Object.keys(enabledRoles).length === 0) {
    console.log('No enabled roles found, using all available roles');
    return Object.keys(allRoles).filter(roleId => roleId !== 'genio');
  }
  
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
  return availableRoleIds;
};

const generateRandomRoles = () => {
  const availableRoleIds = getAvailableRoleIds();
  
  // Shuffle and select 3 random roles
  const shuffled = [...availableRoleIds].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, 3);
  
  console.log('Selected roles for Genio:', selected);
  
  selectedRoles.value = selected.map(roleId => ({
    id: roleId,
    name: ROLES[roleId]?.name || roleId,
    team: ROLES[roleId]?.team || 'unknown',
    factionConfig: getFactionConfig(ROLES[roleId]?.team)
  }));
};

const availableRoles = computed(() => {
  // This computed property now just returns the reactive selectedRoles
  return selectedRoles.value;
});

const reshuffleRoles = () => {
  shuffleKey.value++;
  generateRandomRoles();
  console.log('Roles reshuffled, new shuffle key:', shuffleKey.value);
};

const getRoleCardClasses = () => {
  return 'bg-neutral-800/30 border border-neutral-700/40 hover:bg-neutral-800/50 hover:border-neutral-600/60';
};

const getRoleNumberClasses = () => {
  return 'border-neutral-400 text-neutral-400';
};

const selectRole = (role: any) => {
  props.onComplete({
    target: { roleId: role.id }
  });
};

onMounted(() => {
  // Generate initial random roles
  generateRandomRoles();
  
  // Ensure we have 3 random roles
  if (selectedRoles.value.length < 3) {
    console.warn('Not enough available roles for Genio della Lampada');
  }
});
</script>
