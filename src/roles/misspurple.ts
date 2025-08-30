import type { RoleDef } from '../types';
import { villageWin } from '../utils/winConditions';
import {componentFactory} from "../utils/roleUtils";

const misspurple: RoleDef = {
	id: 'misspurple',
	name: 'Miss Purple',
	team: 'villaggio',
	icon: 'MissPurpleIcon',
    score: 6,
    visibleAsTeam: 'villaggio',
    countAs: 'villaggio',
    description: 'Ogni notte scopre quanti lupi ci sono nel villaggio.',
    color: '#9333ea',
    phaseOrder: "any",
    actsAtNight: "alive",
    effectType: 'required',
    numberOfUsage: 'unlimited',
    getPromptComponent: componentFactory('MissPurple', "prompt"),
    getResolveDetailsComponent: componentFactory('MissPurple', "details"),
    resolve(gameState: any, action: any) {
        const lupiCount = gameState.players.filter((p: any) => 
            p.alive && (p.roleState?.visibleAsTeam === 'lupi')
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
