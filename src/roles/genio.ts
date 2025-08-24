import { RoleDef } from '../types';
import { ROLES } from './index';
import {componentFactory} from "../utils/roleUtils";
import { PlayerManager } from '../core/managers/PlayerManager';

export const genio: RoleDef = {
    id: 'genio',
    name: 'Genio',
    team: 'villaggio',
    description: 'Dalla 3ª notte può trasformarsi in un altro ruolo a scelta tra 3 a caso',
    actsAtNight: 'alive',
    effectType: 'required',
    numberOfUsage: 1,
    countAs: 'villaggio',
    visibleAsTeam: 'villaggio',
    score: 1,
    startNight: 3,
    phaseOrder: 0,
    canTargetDead: false,
    resolve(gameState: any, action: any) {
        console.log('Genio resolve - action:', action);
        
        // The target data is nested in action.data.target
        const target = action.data?.target;
        console.log('Genio resolve - target:', target);
        
        if (!action || !target || !target.roleId) {
            console.log('Genio resolve - Missing action, target, or target.roleId');
            return null;
        }

        const availableRoles = gameState.setup.rolesEnabled;
        const player = gameState.players.find((p: any) => p.id === action.playerId);
        console.log('Genio resolve - player:', player);
        
        if (!player) return null;
        
        console.log('Genio resolve - availableRoles:', availableRoles);
        console.log('Genio resolve - target.roleId:', target.roleId);
        
        // Genio can transform into any role that exists, regardless of game setup
        const newRoleDef = ROLES[target.roleId];
        console.log('Genio resolve - newRoleDef:', newRoleDef);
        
        if (newRoleDef) {
            player.roleId = target.roleId;
            
            // Use the proper utility function to initialize role state
            // This ensures all properties including numberOfUsage are set correctly
            PlayerManager.initializePlayerRoleState(player, newRoleDef);
            
            // Clear any existing power usage records for this player
            // This ensures the transformed player starts with a fresh usage count
            if (gameState.usedPowers && gameState.usedPowers[target.roleId]) {
                gameState.usedPowers[target.roleId] = gameState.usedPowers[target.roleId].filter(
                    (playerId: number) => playerId !== player.id
                );
            }
            
            // Return history object for display
            const historyObject = {
                type: 'genio_transform',
                nightNumber: gameState.nightNumber,
                roleId: 'genio',
                playerId: player.id,
                playerIds: [player.id],
                data: action,
                message: `${player.name} si è trasformato in ${newRoleDef.name}`,
                oldRoleId: 'genio',
                newRoleId: target.roleId,
                newRoleName: newRoleDef.name,
                newRoleTeam: newRoleDef.team
            };
            
            console.log('Genio resolve - Returning history object:', historyObject);
            return historyObject;
        }
        
        console.log('Genio resolve - No transformation possible, returning null');
        return null;
    },
    getPromptComponent: componentFactory('Genio', "prompt"),
    getResolveDetailsComponent: componentFactory('Genio', "details")
};
