import { computed } from 'vue';
import { useGameStore } from '../stores/game';
import { NightPhaseManager } from '../core/managers/NightPhaseManager';
import { ROLES } from '../roles';
import { getFactionConfig } from '../factions';
import { GAME_CONSTANTS } from '../constants/game';
import { getFactionDisplayName } from '../utils/factionUtils';
import { getRoleDisplayName } from '../utils/roleUtils';
import { useI18n } from './useI18n';

export function useNightPhase() {
    const store = useGameStore();
    const state = store.state;
    const { t } = useI18n();

    const PHASES = {
        NIGHT: 'night',
    };

    const currentTurn = computed(() => {
        if (state.phase !== PHASES.NIGHT) {
            return null;
        }
        
        const turn = NightPhaseManager.nextRole(state as any);
        console.log(`🌙 [DEBUG] useNightPhase.currentTurn - turn:`, turn);
        return turn;
    });

    const currentRole = computed(() => {
        const entry = currentTurn.value;
        if (!entry) {
            return null;
        }
        
        const role = ROLES[entry.roleId] || null;
        return role;
    });

    const currentActor = computed(() => {
        const entry = currentTurn.value;
        if (!entry) return null;
        if (entry.kind === 'single') {
            return state.players.find(p => p.id === entry.playerId);
        }
        const actor = { id: 0, name: currentRole.value?.name, roleId: entry.roleId };
        return actor;
    });

    const currentPromptComponent = computed(() => {
        if (!currentActor.value || !currentActor.value.roleId) {
            return null;
        }
        
        const role = ROLES[currentActor.value.roleId];
        if (!role) {
            return null;
        }
        
        if (role.actsAtNight === 'never') {
            return null;
        }
        
        const component = role.getPromptComponent;
        return component;
    });

    const isFirstNightSkipped = computed(() => {
        const skipped = !!state.settings?.skipFirstNightActions && state.nightNumber === 1;
        return skipped;
    });

    const shouldShowDeadPrompt = computed(() => {
        const entry = currentTurn.value;
        if (!entry) return false;
        const turnPlayers = entry.playerIds
        const alivePlayers = state.players.filter(p => turnPlayers.includes(p.id) && p.alive);
        const deadPlayers = state.players.filter(p => turnPlayers.includes(p.id) && !p.alive);
        
        // Check if any dead players have roles that can act when dead
        const deadPlayersWithDeadAction = deadPlayers.filter(p => {
            const role = ROLES[p.roleId];
            return role && role.actsAtNight === 'dead';
        });
        
        // If there are dead players with roles that can act when dead, don't show generic dead prompt
        if (deadPlayersWithDeadAction.length > 0) return false;
        
        // Only show dead prompt if all players are dead and none can act when dead
        return alivePlayers.length === 0;
    });

    const shouldShowAlivePrompt = computed(() => {
        const entry = currentTurn.value;
        if (!entry) return false;
        
        const aliveMembers = state.players.filter((p) => 
            entry.playerIds.includes(p.id) && p.alive
        );
        
        const deadMembers = state.players.filter((p) => 
            entry.playerIds.includes(p.id) && !p.alive
        );
        
        // Check if there are alive players whose roles require them to be dead to act
        const aliveMembersWithDeadAction = aliveMembers.filter((p) => {
            const role = ROLES[p.roleId];
            return role && role.actsAtNight === 'dead';
        });
        
        // Check if there are dead players whose roles can act when dead
        const deadMembersWithDeadAction = deadMembers.filter((p) => {
            const role = ROLES[p.roleId];
            return role && role.actsAtNight === 'dead';
        });
        
        // Only show alive prompt if there are alive players with dead-action roles
        // AND no dead players can act (so the role-specific prompt won't show)
        return aliveMembersWithDeadAction.length > 0 && deadMembersWithDeadAction.length === 0;
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
        if (!entry) return null as Array<{ name: string; id: number }> | null;
        
        // Deduplicate player IDs to prevent duplicate keys in Vue template
        const uniquePlayerIds = [...new Set(entry.playerIds)];
        
        return uniquePlayerIds
            .map((id: number) => {
                const player = state.players.find(p => p.id === id);
                return player ? { name: player.name, id: player.id } : null;
            })
            .filter((p): p is { name: string; id: number } => !!p);
    });

    const roleDisplayInfo = computed(() => {
        const role = currentRole.value;
        if (!role) return null;
        
        const factionConfig = getFactionConfig(role.team);
        return {
            name: getRoleDisplayName(role.id, t),
            faction: getFactionDisplayName(role.team, t),
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
