import type { RoleDef } from '../types';
import { alieniWin, villageWin, wolvesWin } from '../utils/winConditions';
import { componentFactory } from '../utils/roleUtils';
import { ROLES } from '../roles';
import { RoleAPI } from '../utils/roleAPI';

// Helper function to check if a target role can be used by mutaforma
// Returns { canUse: boolean, reason?: string }
function checkMutaformaCanUseTargetRole(targetRole: any, gameState: any, mutaformaPlayerId: number, targetPlayerId: number) {
    if (!targetRole) return { canUse: false, reason: 'unknown' };

    // Check if role acts at night, considering groupings
    let effectiveRole = targetRole;
    if (targetRole.actsAtNight === 'never') {
        // Check if this role is grouped with a role that can act at night
        const groupings = gameState.groupings || [];
        const grouping = groupings.find((g: any) => g.toRole === targetRole.id); // Pick first grouping found
        
        if (grouping) {
            // Use the grouped role instead
            const groupedRole = ROLES[grouping.fromRole];
            if (groupedRole && groupedRole.actsAtNight !== 'never') {
                effectiveRole = groupedRole;
                console.log(`🔄 [DEBUG] Mutaforma using grouped role: ${groupedRole.id} instead of ${targetRole.id}`);
            } else {
                return { canUse: false, reason: 'never' }; // No valid grouping found
            }
        } else {
            return { canUse: false, reason: 'never' }; // No grouping and actsAtNight is never
        }
    }

    // Check if role requires being dead but mutaforma is alive
    if (effectiveRole.actsAtNight === 'dead') return { canUse: false, reason: 'alive' };

    // Check if role requires being alive but mutaforma is dead
    if (effectiveRole.actsAtNight === 'alive') {
        const mutaformaPlayer = RoleAPI.getPlayer(mutaformaPlayerId);
        if (!mutaformaPlayer || !mutaformaPlayer.alive) return { canUse: false, reason: 'dead' };
    }

    // Check start night restriction
    if (effectiveRole.startNight && typeof effectiveRole.startNight === 'number') {
        if (RoleAPI.getNightNumber() < effectiveRole.startNight) return { canUse: false, reason: 'startNight' };
    }

    // Check usage limit restriction for the target role
    if (effectiveRole.numberOfUsage !== 'unlimited' && effectiveRole.numberOfUsage !== undefined) {
        // Check if the target player has already used their role
        const timesUsed = RoleAPI.getPowerUsageCount(effectiveRole.id, targetPlayerId);
        if (timesUsed >= effectiveRole.numberOfUsage) return { canUse: false, reason: 'usageLimit' };
    }

    return { canUse: true };
}

const mutaforma: RoleDef = {
    id: 'mutaforma',
    name: 'roleNames.mutaforma',
    team: 'alieni',
    visibleAsTeam: 'villaggio',
    countAs: 'alieni',
    score: 35,
    description: 'roleDescriptions.mutaforma',
    longDescription: 'roleDescriptions.mutaformaLong',
    color: '#10b981',
    phaseOrder: 2,
    actsAtNight: "alive",
    effectType: 'required',
    numberOfUsage: 'unlimited',
    getPromptComponent: componentFactory('Mutaforma', "prompt"),
    getResolveDetailsComponent: componentFactory('Mutaforma', "details"),
    
    resolve(gameState: any, action: any) {
        const targetId = Number(action?.data?.targetId || action?.targetId);
        if (!Number.isFinite(targetId) || targetId <= 0) return;
        
        const targetPlayer = RoleAPI.getPlayer(targetId);
        if (!targetPlayer) return;
        
        const targetRoleId = targetPlayer.roleId;
        const targetRole = ROLES[targetRoleId];
        
        if (!targetRole) return;
        
        // Determine the effective role to use (considering groupings)
        let effectiveRoleId = targetRoleId;
        let effectiveRole = targetRole;
        if (targetRole.actsAtNight === 'never') {
            const groupings = gameState.groupings || [];
            const grouping = groupings.find((g: any) => g.toRole === targetRoleId);
            if (grouping) {
                effectiveRoleId = grouping.fromRole;
                effectiveRole = ROLES[effectiveRoleId];
                console.log(`🔄 [DEBUG] Mutaforma will use effective role: ${effectiveRoleId} instead of ${targetRoleId}`);
            }
        }
        
        // Check if Mutaforma can use the target role
        const actualCanUseRole = action.data?.canUseRole !== undefined ? action.data.canUseRole : true;
        
        // Execute the target role's action only if Mutaforma can use it
        let targetRoleResult = null;
        if (actualCanUseRole && effectiveRole.resolve && typeof effectiveRole.resolve === 'function') {
            try {
                // Use the target role's action data from the prompt
                const targetRoleActionData = action.data?.targetRoleAction || action.data;
                
                // Create a properly formatted action for the target role
                const targetRoleAction = {
                    ...action,
                    roleId: effectiveRoleId,
                    playerIds: action.playerIds || [], // Mutaforma players
                    data: targetRoleActionData
                };
                
                // Execute the target role's resolve function
                targetRoleResult = effectiveRole.resolve(gameState, targetRoleAction);
                console.log(`🔄 [DEBUG] Mutaforma executed target role ${effectiveRoleId} action:`, targetRoleResult);
            } catch (error) {
                console.error(`🔄 [DEBUG] Error executing target role ${effectiveRoleId} action:`, error);
                targetRoleResult = null;
            }
        }
        
        // If the role cannot be used, get the reason from the prompt's decision
        let targetRoleReason = null;
        if (!actualCanUseRole) {
            // The reason is stored in targetRoleResult when the role cannot be used
            targetRoleReason = action.data?.targetRoleResult;
            console.log(`🔄 [DEBUG] Mutaforma cannot use role, reason:`, targetRoleReason);
            console.log(`🔄 [DEBUG] Action data:`, action.data);
        }
        
        // Create the mutaforma action
        const mutaformaAction = {
            type: 'mutaforma_action',
            nightNumber: gameState.nightNumber,
            roleId: 'mutaforma',
            playerIds: action.playerIds || [],
            targetId: targetId,
            targetRoleId: effectiveRoleId, // Use effective role ID
            targetPlayerName: targetPlayer.name,
            canUseRole: actualCanUseRole, // Whether Mutaforma can use the target role
            reason: targetRoleReason, // Reason why target role cannot be used (if applicable)
            data: {
                ...action.data,
                targetId: targetId,
                targetRoleId: effectiveRoleId, // Use effective role ID
                targetRoleResult: targetRoleResult // Result of executing the target role's action
            }
        };
        
        // Store the target role info in the data
        mutaformaAction.data = {
            ...mutaformaAction.data,
            targetRole: {
                id: targetRoleId,
                name: targetRole.name,
                team: targetRole.team,
                actsAtNight: targetRole.actsAtNight,
                startNight: targetRole.startNight
            }
        };
        
        return mutaformaAction;
    },
    


    checkWin(gameState: any) {
        return alieniWin(gameState);
    },

    checkWinConstraint(gameState: any) {
        const mutaformaAlive = gameState.players.some((p: any) => 
            p.roleId === 'mutaforma' && p.alive
        );
        
        if (!mutaformaAlive) return false;
        
        const villageWins = villageWin(gameState);
        const wolvesWins = wolvesWin(gameState);
        
        return villageWins || wolvesWins;
    },

    passiveEffect(gameState: any, player: any) {
        const teams = new Set<string>();
        const alivePlayers = RoleAPI.getAlivePlayers();
        
        for (const alivePlayer of alivePlayers) {
            const roleDef = ROLES[alivePlayer.roleId];
            if (!roleDef) continue;
            
            const team = roleDef.countAs || roleDef.team;
            teams.add(team);
        }
        
        const allTeams = new Set<string>();
        const allPlayers = [...RoleAPI.getAlivePlayers(), ...RoleAPI.getDeadPlayers()];
        for (const gamePlayer of allPlayers) {
            const roleDef = ROLES[gamePlayer.roleId];
            if (!roleDef) continue;
            
            const team = roleDef.countAs || roleDef.team;
            allTeams.add(team);
        }
        
        const teamsWithNoAlivePlayers = Array.from(allTeams).filter(team => !teams.has(team));
        
        if (teamsWithNoAlivePlayers.length > 0) {
            const mutaformaPlayers = RoleAPI.getAlivePlayersWithRole('mutaforma');
            
            // Add mutaforma players to pending kills instead of directly killing them
            if (mutaformaPlayers.length > 0) {
                for (const mutaformaPlayer of mutaformaPlayers) {
                    RoleAPI.addKill(mutaformaPlayer.id, 'mutaforma');
                }
            }
        }
        
        return null;
    },
};

export default mutaforma;
