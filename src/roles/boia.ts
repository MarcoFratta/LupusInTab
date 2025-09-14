import type { RoleDef } from '../types';
import { villageWin } from '../utils/winConditions';
import { componentFactory } from "../utils/roleUtils";
import { RoleAPI } from '../utils/roleAPI';
import { checkPlayerRole } from '../utils/roleChecking';

const boia: RoleDef = {
    id: 'boia',
    name: 'roleNames.boia',
    team: 'lupi',
    score: 4,
    visibleAsTeam: 'lupi',
    countAs: 'villaggio',
    description: 'roleDescriptions.boia',
    longDescription: 'roleDescriptions.boiaLong',
    color: '#5b21b6',
    phaseOrder: "any",
    actsAtNight: "alive",
    effectType: 'optional',
    numberOfUsage: 1,
    knownTo: ['lupo'],
    revealToAllies: "role",
    getPromptComponent: componentFactory('Boia', "prompt"),
    getResolveDetailsComponent: componentFactory('Boia', "details"),
    
    resolve(gameState: any, action: any) {
        const id = Number(action?.data?.targetId);
        const declaredRoleId = action?.data?.roleId ? String(action.data.roleId) : '';
        if (!Number.isFinite(id)) return;
        
        const targetPlayer = RoleAPI.getPlayer(id);
        if (!targetPlayer) return;
        
        const isCorrect = checkPlayerRole(id, declaredRoleId, gameState);
        
        if (isCorrect) {
            RoleAPI.addKill(id, 'boia', { notSavable: true });
        } else {
            // When multiple Boia players act together and make wrong guess, ALL Boia players die
            const boiaPlayerIds = action.playerIds || [];
            for (const boiaId of boiaPlayerIds) {
                RoleAPI.addKill(boiaId, 'boia', { notSavable: true });
            }
        }

        return {
            type: 'boia_action',
            nightNumber: gameState.nightNumber,
            roleId: 'boia',
            playerIds: action.playerIds || [],
            targetId: id,
            declaredRoleId: declaredRoleId,
            correct: isCorrect,
            data: action.data
        };
    },
    
    checkWin(gameState: any) {
        return villageWin(gameState);
    },
};

export default boia;



