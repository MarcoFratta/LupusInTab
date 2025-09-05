import type { RoleDef } from '../types';
import { ROLES } from './index';
import { componentFactory } from "../utils/roleUtils";
import { PlayerManager } from '../core/managers/PlayerManager';
import { RoleAPI } from '../utils/roleAPI';

export const simbionte: RoleDef = {
    id: 'simbionte',
    name: 'Simbionte',
    team: 'alieni',
    description: 'Assume il ruolo di un altro giocatore all\'inizio',
    longDescription: `Il Simbionte può assumere il ruolo di un altro giocatore.

COME FUNZIONA:
• All'inizio della partita può scegliere un giocatore
• Assume il ruolo del giocatore scelto per il resto della partita
• Il giocatore originale mantiene il suo ruolo
• L'azione è obbligatoria: deve scegliere un giocatore`,
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

            const targetPlayer = RoleAPI.getPlayer(target.playerId);
            if (!targetPlayer || !targetPlayer.roleId) {
                return null;
            }

            // Get the players from the action (the ones who are acting with this role)
            const actingPlayerIds = action.playerIds || [action.playerId];
            const actingPlayers = actingPlayerIds.map((id: number) => RoleAPI.getPlayer(id)).filter(Boolean);
            
            console.log(`🔄 [DEBUG] Simbionte transformation starting:`);
            console.log(`🔄 [DEBUG] Acting players:`, actingPlayers.map(p => ({ id: p.id, name: p.name, roleId: p.roleId })));
            console.log(`🔄 [DEBUG] Target role: ${targetPlayer.roleId} (${targetPlayer.name})`);
            console.log(`🔄 [DEBUG] Current player roles:`, RoleAPI.getAlivePlayers().map((p: any) => ({ id: p.id, name: p.name, roleId: p.roleId })));
            
            const newRoleDef = ROLES[targetPlayer.roleId];
            if (!newRoleDef) return null;
            
            // Transform only the acting players
            const transformedPlayers = [];
            for (const player of actingPlayers) {
                player.roleId = targetPlayer.roleId;
                PlayerManager.initializePlayerRoleState(player, newRoleDef);
                transformedPlayers.push(player);
                console.log(`🔄 [DEBUG] Transformed player ${player.name} (ID: ${player.id}) to ${player.roleId}`);
            }
            
            console.log(`🔄 [DEBUG] Transformation complete. ${transformedPlayers.length} players transformed to ${targetPlayer.roleId}`);
            console.log(`🔄 [DEBUG] Updated player roles:`, RoleAPI.getAlivePlayers().map((p: any) => ({ id: p.id, name: p.name, roleId: p.roleId, actsAtNight: p.roleState?.actsAtNight })));
            
            // Handle role transformation during night phase
            if (gameState.phase === 'night' && gameState.night?.context) {
                console.log(`🔄 [DEBUG] Simbionte transformation complete. Night phase will continue dynamically.`);
                
                // Remove the original simbionte role from calledRoles if it was added
                const calledRoles = gameState.night.context.calledRoles;
                const simbionteIndex = calledRoles.indexOf('simbionte');
                if (simbionteIndex !== -1) {
                    calledRoles.splice(simbionteIndex, 1);
                    console.log(`🔄 [DEBUG] Removed 'simbionte' from calledRoles to allow new role to act`);
                }
            }
            
            // Clean up usedPowers for all transformed players
            if (gameState.usedPowers && gameState.usedPowers[targetPlayer.roleId]) {
                for (const player of transformedPlayers) {
                    gameState.usedPowers[targetPlayer.roleId] = gameState.usedPowers[targetPlayer.roleId].filter(
                        (playerId: number) => playerId !== player.id
                    );
                }
            }
            
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
