import { computed } from 'vue';
import type { Player } from '../types';
import { ROLES } from '../roles';
import { getFactionConfig } from '../factions';
import { GAME_CONSTANTS } from '../constants/game';
import { NightPhaseManager } from '../core/managers/NightPhaseManager';

export interface UseNightPhaseOptions {
  state: any;
  onPromptComplete: (result: any) => void;
}

export function useNightPhase({ state, onPromptComplete }: UseNightPhaseOptions) {
  const alivePlayers = computed(() => state.players.filter((p: Player) => p.alive));
  
  const currentTurn = computed(() => 
    NightPhaseManager.getCurrentTurn(state)
  );
  
  const currentRole = computed(() => 
    currentTurn.value ? ROLES[currentTurn.value.roleId] : null
  );
  
  const currentActor = computed(() => {
    const entry = currentTurn.value;
    if (!entry) return null;
    
    if (entry.kind === 'single') {
      return state.players.find((p: Player) => p.id === entry.playerId) || null;
    }
    
    return { 
      id: 0, 
      name: currentRole.value?.name, 
      roleId: entry.roleId 
    } as any;
  });

  const currentPromptComponent = computed(() => {
    if (!currentActor.value?.roleId) return null;
    
    const role = ROLES[currentActor.value.roleId];
    if (!role || role.actsAtNight === 'never') return null;
    
    const promptComponentLoader = role.getPromptComponent;
    if (promptComponentLoader && typeof promptComponentLoader === 'function') {
      return promptComponentLoader;
    }
    return null;
  });

  const isFirstNightSkipped = computed(() => 
    !!state.settings?.skipFirstNightActions && state.nightNumber === 1
  );

  const shouldShowDeadPrompt = computed(() => {
    const entry = currentTurn.value;
    if (!entry) return false;
    
    const aliveMembers = state.players.filter((p: Player) => 
      entry.playerIds.includes(p.id) && p.alive
    );
    return aliveMembers.length === 0;
  });

  const shouldShowAlivePrompt = computed(() => {
    const entry = currentTurn.value;
    if (!entry) return false;
    
    const deadMembers = state.players.filter((p: Player) => 
      entry.playerIds.includes(p.id) && p.alive && p.roleState?.actsAtNight === 'dead'
    );
    return deadMembers.length > 0;
  });

  const shouldShowBlockedPrompt = computed(() => {
    const entry = currentTurn.value;
    if (!entry) return false;
    
    const aliveMembers = state.players.filter((p: Player) => 
      entry.playerIds.includes(p.id) && p.alive
    );
    
    const blockedMembers = aliveMembers.filter((player: Player) => 
      player.roleState?.actsAtNight === 'blocked'
    );
    
    return aliveMembers.length > 0 && 
           blockedMembers.length > 0 && 
           aliveMembers.every((player: Player) => 
             player.roleState?.actsAtNight === 'blocked'
           );
  });

  const shouldShowStartNightPrompt = computed(() => {
    const entry = currentTurn.value;
    if (!entry) return false;
    
    const restrictedMembers = state.players.filter((p: Player) => 
      entry.playerIds.includes(p.id) && 
      p.alive && 
      p.roleState?.startNight && 
      state.nightNumber < p.roleState.startNight
    );
    return restrictedMembers.length > 0;
  });

  const shouldShowUsageLimitPrompt = computed(() => {
    const entry = currentTurn.value;
    if (!entry) return false;
    
    const aliveMembers = state.players.filter((p: Player) => 
      entry.playerIds.includes(p.id) && p.alive
    );
    
    if (aliveMembers.length === 0) return false;
    
    const exceededMembers = aliveMembers.filter((p: Player) => {
      const numberOfUsage = p.roleState?.numberOfUsage;
      if (numberOfUsage === 'unlimited' || numberOfUsage === undefined) return false;
      
      const usedPowers = state.usedPowers?.[p.roleId] || [];
      const timesUsed = usedPowers.filter((playerId: number) => playerId === p.id).length;
      return timesUsed >= numberOfUsage;
    });
    
    // Only show usage limit prompt if ALL alive players have exceeded their usage limit
    return exceededMembers.length > 0 && exceededMembers.length === aliveMembers.length;
  });

  const currentGroupNames = computed(() => {
    const entry = currentTurn.value;
    if (!entry) return [];
    
    return state.players
      .filter((p: Player) => entry.playerIds.includes(p.id))
      .map((p: Player) => p.name);
  });

  const roleDisplayInfo = computed(() => {
    const role = currentRole.value;
    if (!role) return null;
    
    const factionConfig = getFactionConfig(role.team);
    return {
      name: role.name,
      faction: factionConfig?.displayName || role.team,
      color: factionConfig?.color || GAME_CONSTANTS.DEFAULT_ROLE_COLOR
    };
  });

  const getEarliestStartNight = () => {
    const entry = currentTurn.value;
    if (!entry) return GAME_CONSTANTS.DEFAULT_START_NIGHT;
    
    const rolePlayers = state.players.filter((p: Player) => 
      entry.playerIds.includes(p.id)
    );
    const startNights = rolePlayers
      .map((p: Player) => p.roleState?.startNight)
      .filter((n: number) => n && typeof n === 'number');
    
    return startNights.length > 0 ? Math.min(...startNights) : GAME_CONSTANTS.DEFAULT_START_NIGHT;
  };

  return {
    alivePlayers,
    currentTurn,
    currentRole,
    currentActor,
    currentPromptComponent,
    isFirstNightSkipped,
    shouldShowDeadPrompt,
    shouldShowAlivePrompt,
    shouldShowBlockedPrompt,
    shouldShowStartNightPrompt,
    shouldShowUsageLimitPrompt,
    currentGroupNames,
    roleDisplayInfo,
    getEarliestStartNight,
    onPromptComplete
  };
}
