import type { RoleDef } from '../types';
import { ROLES } from './index';
import { componentFactory } from "../utils/roleUtils";
import { PlayerManager } from '../core/managers/PlayerManager';
import { RoleAPI } from '../utils/roleAPI';

export const simbionte: RoleDef = {
    id: 'simbionte',
    name: 'roleNames.simbionte',
    team: 'alieni',
    description: 'roleDescriptions.simbionte',
    longDescription: 'roleDescriptions.simbionteLong',
    actsAtNight: 'alive',
    effectType: 'required',
    numberOfUsage: 1,
    countAs: 'alieni',
    visibleAsTeam: 'villaggio',
    score: 0,
    startNight: 1,
    phaseOrder: -20,
    canTargetDead: false,
    
    resolve(gameState: any, action: any) {
        if (!action) return null;
        
        try {
            const target = action.data?.target;
            
            if (!target || !target.playerId) {
                return null;
            }

            const targetPlayer = RoleAPI.getPlayerFromState(target.playerId, gameState);
            if (!targetPlayer || !targetPlayer.roleId) {
                return null;
            }

            // Get the players from the action (the ones who are acting with this role)
            const actingPlayerIds = action.playerIds || [action.playerId];
            const actingPlayers = actingPlayerIds.map((id: number) => RoleAPI.getPlayerFromState(id, gameState)).filter(Boolean);
            
            if (actingPlayers.length === 0) {
                return null;
            }
            
            const newRoleDef = ROLES[targetPlayer.roleId];
            if (!newRoleDef) return null;
            
            // Use the new API to transform players
            const transformationResults = RoleAPI.changeMultiplePlayerRoles(actingPlayerIds, targetPlayer.roleId, gameState);
            
            if (transformationResults.length === 0) {
                return null;
            }
            
            const transformedPlayers = transformationResults.map(result => result.player);
            
            const historyObject = {
                type: 'simbionte_transform',
                nightNumber: gameState.nightNumber,
                roleId: 'simbionte',
                playerId: action.playerId, // The player who initiated the action
                playerIds: transformedPlayers.map(p => p.id), // All transformed players
                data: action,
                message: `${transformedPlayers.length} Simbionte si sono trasformati in ${newRoleDef.name}`,
                oldRoleId: 'simbionte',
                newRoleId: targetPlayer.roleId,
                newRoleName: newRoleDef.name,
                newRoleTeam: newRoleDef.team,
                targetPlayerId: targetPlayer.id,
                targetPlayerName: targetPlayer.name,
                transformedPlayerIds: transformedPlayers.map(p => p.id),
                transformedPlayerNames: transformedPlayers.map(p => p.name)
            };
            
            return historyObject;
        } catch (error) {
            console.error(`🔄 [DEBUG] Error in simbionte resolve:`, error);
            return null;
        }
    },
    
    getPromptComponent: componentFactory('Simbionte', "prompt"),
    getResolveDetailsComponent: componentFactory('Simbionte', "details")
};
