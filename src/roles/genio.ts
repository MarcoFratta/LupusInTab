import type { RoleDef } from '../types';
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
    color: '#f3e8ff',
    resolve(gameState: any, action: any) {
        const target = action.data?.target;
        
        if (!action || !target || !target.roleId) {
            return null;
        }

        const availableRoles = gameState.setup.rolesEnabled;
        const player = gameState.players.find((p: any) => p.id === action.playerId);
        
        if (!player) return null;
        
        const newRoleDef = ROLES[target.roleId];
        
        if (newRoleDef) {
            player.roleId = target.roleId;
            
            PlayerManager.initializePlayerRoleState(player, newRoleDef);
            
            if (gameState.usedPowers && gameState.usedPowers[target.roleId]) {
                gameState.usedPowers[target.roleId] = gameState.usedPowers[target.roleId].filter(
                    (playerId: number) => playerId !== player.id
                );
            }
            
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
            
            return historyObject;
        }
        
        return null;
    },
    getPromptComponent: componentFactory('Genio', "prompt"),
    getResolveDetailsComponent: componentFactory('Genio', "details")
};
