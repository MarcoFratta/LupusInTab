import type { RoleDef } from '../types';
import { villageWin } from '../utils/winConditions';
import { componentFactory } from "../utils/roleUtils";
import { RoleAPI } from '../utils/roleAPI';

const giustiziere: RoleDef = {
	id: 'giustiziere',
	name: 'roleNames.giustiziere',
	team: 'villaggio',
	icon: 'GiustiziereIcon',
    visibleAsTeam: 'villaggio',
    score: 4,
    countAs: 'villaggio',
    description: 'roleDescriptions.giustiziere',
    longDescription: 'roleDescriptions.giustiziereLong',
    color: '#a78bfa',
    phaseOrder: "any",
    actsAtNight: "alive",
    effectType: 'optional',
    numberOfUsage: 1,
    getPromptComponent: componentFactory('Giustiziere', "prompt"),
    getResolveDetailsComponent: componentFactory('Giustiziere', "details"),
    
    resolve(gameState: any, action: any) {
        const id = Number(action?.data?.targetId);
        if (!Number.isFinite(id)) return;
        
        RoleAPI.addKill(id, 'giustiziere');

        return {
            type: 'giustiziere_action',
            nightNumber: gameState.nightNumber,
            roleId: 'giustiziere',
            playerIds: action.playerIds || [],
            targetId: id,
            data: action.data
        };
    },
    
    checkWin(gameState: any) {
        return villageWin(gameState);
    },
};

export default giustiziere;



