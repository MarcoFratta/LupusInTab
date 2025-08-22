import { RoleDef } from '../types';
import { ROLES } from './index';
import {componentFactory} from "../utils/roleUtils";

export const genio: RoleDef = {
    id: 'genio',
    name: 'Genio',
    team: 'villaggio',
    description: 'A partire dalla 3ª notte, puoi scegliere un ruolo tra 3 ruoli selezionati casualmente e diventare immediatamente parte di quel ruolo.',
    actsAtNight: 'alive',
    effectType: 'required',
    numberOfUsage: 1,
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
            player.roleState = {
                realTeam: newRoleDef.team,
                countAs: newRoleDef.countAs || newRoleDef.team,
                phaseOrder: newRoleDef.phaseOrder !== undefined ? newRoleDef.phaseOrder : 'any',
                usage: newRoleDef.usage || 'unlimited',
                effectType: newRoleDef.effectType || 'optional',
                numberOfUsage: newRoleDef.numberOfUsage || 'unlimited',
                startNight: newRoleDef.startNight || 1,
                canTargetDead: newRoleDef.canTargetDead || false,
                affectedRoles: newRoleDef.affectedRoles || [],
                knownTo: newRoleDef.knownTo || [],
                revealPartnersRoleIds: newRoleDef.revealPartnersRoleIds || [],
                revealAlliesWithinRole: newRoleDef.revealAlliesWithinRole || false,
                revealToAllies: newRoleDef.revealToAllies || 'team',
                revealToPartners: newRoleDef.revealToPartners || 'role'
            };
            
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
