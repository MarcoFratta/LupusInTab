import type { RoleDef } from '../types';
import { ROLES } from './index';
import { componentFactory } from "../utils/roleUtils";
import { PlayerManager } from '../core/managers/PlayerManager';
import { RoleAPI } from '../utils/roleAPI';

export const genio: RoleDef = {
    id: 'genio',
    name: 'roleNames.genio',
    team: 'villaggio',
    description: 'roleDescriptions.genio',
    longDescription: 'roleDescriptions.genioLong',
    actsAtNight: 'alive',
    effectType: 'required',
    numberOfUsage: 1,
    countAs: 'villaggio',
    visibleAsTeam: 'villaggio',
    score: 1,
    startNight: 3,
    phaseOrder: -1,
    canTargetDead: false,
    color: '#f3e8ff',
    
    resolve(gameState: any, action: any) {
        if (!action) return null;
        
        try {
            const target = action.data?.target;
            
            if (!target || !target.roleId) {
                return null;
            }

            // Get the players from the action (the ones who are acting with this role)
            const actingPlayerIds = action.playerIds || [action.playerId];
            const actingPlayers = actingPlayerIds.map((id: number) => RoleAPI.getPlayer(id)).filter(Boolean);
            
            console.log(`🔄 [DEBUG] Genio transformation starting:`);
            console.log(`🔄 [DEBUG] Acting players:`, actingPlayers.map((p: any) => ({ id: p.id, name: p.name, roleId: p.roleId })));
            console.log(`🔄 [DEBUG] Target role: ${target.roleId}`);
            console.log(`🔄 [DEBUG] Current player roles:`, RoleAPI.getAlivePlayers().map((p: any) => ({ id: p.id, name: p.name, roleId: p.roleId })));
            
            if (actingPlayers.length === 0) {
                console.log(`🔄 [DEBUG] No valid players found for transformation`);
                return null;
            }
            
            const newRoleDef = ROLES[target.roleId];
            if (!newRoleDef) return null;
            
            // Transform only the acting players
            const transformedPlayers = [];
            for (const player of actingPlayers) {
                player.roleId = target.roleId;
                PlayerManager.initializePlayerRoleState(player, newRoleDef);
                transformedPlayers.push(player);
                console.log(`🔄 [DEBUG] Transformed player ${player.name} (ID: ${player.id}) to ${player.roleId}`);
            }
            
            console.log(`🔄 [DEBUG] Transformation complete. ${transformedPlayers.length} players transformed to ${target.roleId}`);
            console.log(`🔄 [DEBUG] Updated player roles:`, RoleAPI.getAlivePlayers().map((p: any) => ({ id: p.id, name: p.name, roleId: p.roleId, actsAtNight: p.roleState?.actsAtNight })));
            
            // Handle role transformation during night phase
            if (gameState.phase === 'night' && gameState.night?.context) {
                console.log(`🔄 [DEBUG] Genio transformation complete. Night phase will continue dynamically.`);
                
                // Remove the original genio role from calledRoles if it was added
                const calledRoles = gameState.night.context.calledRoles;
                const genioIndex = calledRoles.indexOf('genio');
                if (genioIndex !== -1) {
                    calledRoles.splice(genioIndex, 1);
                    console.log(`🔄 [DEBUG] Removed 'genio' from calledRoles to allow new role to act`);
                }
            }
            
            // Clean up usedPowers for all transformed players
            if (gameState.usedPowers && gameState.usedPowers[target.roleId]) {
                for (const player of transformedPlayers) {
                    gameState.usedPowers[target.roleId] = gameState.usedPowers[target.roleId].filter(
                        (playerId: number) => playerId !== player.id
                    );
                }
            }
            
            const historyObject = {
                type: 'genio_transform',
                nightNumber: gameState.nightNumber,
                roleId: 'genio',
                playerIds: transformedPlayers.map(p => p.id),
                data: action,
                message: `${transformedPlayers.map(p => p.name).join(', ')} si sono trasformati in ${newRoleDef.name}`,
                oldRoleId: 'genio',
                newRoleId: target.roleId,
                newRoleName: newRoleDef.name,
                newRoleTeam: newRoleDef.team
            };
            
            return historyObject;
        } catch (error) {
            console.error('Error in Genio transformation:', error);
            return null;
        }
    },
    
    getPromptComponent: componentFactory('Genio', "prompt"),
    getResolveDetailsComponent: componentFactory('Genio', "details")
};
