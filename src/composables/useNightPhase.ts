import { computed } from 'vue';
import { useGameStore } from '../stores/game';
import { NightPhaseManager } from '../core/managers/NightPhaseManager';
import { ROLES } from '../roles';
import { getFactionConfig } from '../factions';
import { GAME_CONSTANTS } from '../constants/game';

export function useNightPhase() {
    const store = useGameStore();
    const state = store.state;

    const PHASES = {
        NIGHT: 'night',
    };

    const currentTurn = computed(() => {
        if (state.phase !== PHASES.NIGHT) return null;
        const turn = NightPhaseManager.getCurrentTurn(state);
        console.log(`🌙 [DEBUG] useNightPhase - currentTurn computed:`, turn);
        return turn;
    });

    const currentRole = computed(() => {
        const entry = currentTurn.value;
        if (!entry) return null;
        const role = ROLES[entry.roleId] || null;
        console.log(`🌙 [DEBUG] useNightPhase - currentRole computed:`, role?.name || 'null');
        return role;
    });

    const currentActor = computed(() => {
        const entry = currentTurn.value;
        if (!entry) return null;
        if (entry.kind === 'single') {
            return state.players.find(p => p.id === entry.playerId) || null;
        }
        const actor = { id: 0, name: currentRole.value?.name, roleId: entry.roleId };
        console.log(`🌙 [DEBUG] useNightPhase - currentActor computed:`, actor);
        return actor;
    });

    const currentPromptComponent = computed(() => {
        if (!currentActor.value || !currentActor.value.roleId) return null;
        
        const role = ROLES[currentActor.value.roleId];
        if (!role || role.actsAtNight === 'never') return null;
        
        const component = role.getPromptComponent;
        console.log(`🌙 [DEBUG] useNightPhase - currentPromptComponent computed:`, component ? 'found' : 'null', 'for role:', currentActor.value.roleId);
        return component;
    });

    const isFirstNightSkipped = computed(() => {
        const skipped = !!state.settings?.skipFirstNightActions && state.nightNumber === 1;
        console.log(`🌙 [DEBUG] useNightPhase - isFirstNightSkipped computed:`, skipped, `(nightNumber: ${state.nightNumber}, skipFirstNightActions: ${state.settings?.skipFirstNightActions})`);
        return skipped;
    });

    const shouldShowDeadPrompt = computed(() => {
        const entry = currentTurn.value;
        if (!entry) return false;
        const alivePlayers = state.players.filter(p => p.alive);
        const anyAlive = alivePlayers.some(p => p.roleId === entry.roleId);
        return !anyAlive;
    });

    const shouldShowAlivePrompt = computed(() => {
        const entry = currentTurn.value;
        if (!entry) return false;
        
        const deadMembers = state.players.filter((p) => 
            entry.playerIds.includes(p.id) && p.alive && p.roleState?.actsAtNight === 'dead'
        );
        return deadMembers.length > 0;
    });

    const shouldShowBlockedPrompt = computed(() => {
        const entry = currentTurn.value;
        if (!entry) return false;
        
        const aliveMembers = state.players.filter((p) => 
            entry.playerIds.includes(p.id) && p.alive
        );
        
        const blockedMembers = aliveMembers.filter((player) => 
            player.roleState?.actsAtNight === 'blocked'
        );
        
        return aliveMembers.length > 0 && 
               blockedMembers.length > 0 && 
               aliveMembers.every((player) => 
                 player.roleState?.actsAtNight === 'blocked'
               );
    });

    const shouldShowStartNightPrompt = computed(() => {
        const entry = currentTurn.value;
        if (!entry) return false;
        
        const restrictedMembers = state.players.filter((p) => 
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
        
        const aliveMembers = state.players.filter((p) => 
            entry.playerIds.includes(p.id) && p.alive
        );
        
        if (aliveMembers.length === 0) return false;
        
        const exceededMembers = aliveMembers.filter((p) => {
            const numberOfUsage = p.roleState?.numberOfUsage;
            if (numberOfUsage === 'unlimited' || numberOfUsage === undefined) return false;
            
            const usedPowers = state.usedPowers?.[p.roleId] || [];
            const timesUsed = usedPowers.filter((playerId) => playerId === p.id).length;
            return timesUsed >= numberOfUsage;
        });
        
        return exceededMembers.length > 0 && exceededMembers.length === aliveMembers.length;
    });

    const getEarliestStartNight = () => {
        const entry = currentTurn.value;
        if (!entry) return 1;
        
        const rolePlayers = state.players.filter((p) => 
            entry.playerIds.includes(p.id)
        );
        const startNights = rolePlayers
            .map((p) => p.roleState?.startNight)
            .filter((n) => n && typeof n === 'number');
        
        return startNights.length > 0 ? Math.min(...startNights) : 1;
    };

    const currentGroupNames = computed(() => {
        const entry = currentTurn.value;
        if (!entry) return null as string[] | null;
        return entry.playerIds
            .map(id => state.players.find(p => p.id === id)?.name)
            .filter((n): n is string => !!n);
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

    return {
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
        getEarliestStartNight
    };
}
