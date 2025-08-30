import type { RoleDef } from '../types';
import { ROLES } from './index';
import {componentFactory} from "../utils/roleUtils";
import { PlayerManager } from '../core/managers/PlayerManager';

export const simbionte: RoleDef = {
    id: 'simbionte',
    name: 'Simbionte',
    team: 'alieni',
    description: "Può assumere il ruolo di un altro giocatore all'inizio della partita",
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

            const targetPlayer = gameState.players.find((p: any) => p.id === target.playerId);
            if (!targetPlayer || !targetPlayer.roleId) {
                return null;
            }

            const player = gameState.players.find((p: any) => p.id === action.playerId);
            if (!player) return null;
            
            console.log(`🔄 [DEBUG] Simbionte transformation starting:`);
            console.log(`🔄 [DEBUG] Player ${player.name} (ID: ${player.id}) transforming from ${player.roleId} to ${targetPlayer.roleId}`);
            console.log(`🔄 [DEBUG] Current player roles:`, gameState.players.map((p: any) => ({ id: p.id, name: p.name, roleId: p.roleId })));
            
            const newRoleDef = ROLES[targetPlayer.roleId];
            if (!newRoleDef) return null;
            
            player.roleId = targetPlayer.roleId;
            PlayerManager.initializePlayerRoleState(player, newRoleDef);
            
            console.log(`🔄 [DEBUG] Transformation complete. Player ${player.name} is now ${player.roleId}`);
            console.log(`🔄 [DEBUG] Updated player roles:`, gameState.players.map((p: any) => ({ id: p.id, name: p.name, roleId: p.roleId })));
            
            // No need to force recomputation with dynamic approach
            if (gameState.phase === 'night') {
                console.log(`🔄 [DEBUG] Simbionte transformation complete. Night phase will continue dynamically.`);
            }
            
            if (gameState.usedPowers && gameState.usedPowers[targetPlayer.roleId]) {
                gameState.usedPowers[targetPlayer.roleId] = gameState.usedPowers[targetPlayer.roleId].filter(
                    (playerId: number) => playerId !== player.id
                );
            }
            
            const historyObject = {
                type: 'simbionte_transform',
                nightNumber: gameState.nightNumber,
                roleId: 'simbionte',
                playerId: player.id,
                playerIds: [player.id],
                data: action,
                message: `${player.name} si è trasformato in ${newRoleDef.name}`,
                oldRoleId: 'simbionte',
                newRoleId: targetPlayer.roleId,
                newRoleName: newRoleDef.name,
                newRoleTeam: newRoleDef.team,
                targetPlayerId: targetPlayer.id,
                targetPlayerName: targetPlayer.name
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
