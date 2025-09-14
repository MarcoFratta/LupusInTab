import type { RoleDef } from '../types';
import { villageWin } from '../utils/winConditions';
import { componentFactory } from "../utils/roleUtils";
import { RoleAPI } from '../utils/roleAPI';

const misspurple: RoleDef = {
	id: 'misspurple',
	name: 'roleNames.misspurple',
	team: 'villaggio',
	icon: 'MissPurpleIcon',
    score: 6,
    visibleAsTeam: 'villaggio',
    countAs: 'villaggio',
    description: 'roleDescriptions.misspurple',
    longDescription: 'roleDescriptions.misspurpleLong',
    color: '#9333ea',
    phaseOrder: "any",
    actsAtNight: "alive",
    effectType: 'required',
    numberOfUsage: 'unlimited',
    getPromptComponent: componentFactory('MissPurple', "prompt"),
    getResolveDetailsComponent: componentFactory('MissPurple', "details"),
    
    resolve(gameState: any, action: any) {
        const lupiCount = RoleAPI.getAlivePlayers().filter((p: any) => 
            p.roleState?.visibleAsTeam === 'lupi'
        ).length;
        
        return {
            type: 'misspurple_action',
            nightNumber: gameState.nightNumber,
            roleId: 'misspurple',
            playerIds: action.playerIds || [],
            lupiCount: lupiCount,
            data: action.data
        };
    },
    
    checkWin(gameState: any) {
        return villageWin(gameState);
    },
};

export default misspurple;
