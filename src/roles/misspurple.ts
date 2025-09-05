import type { RoleDef } from '../types';
import { villageWin } from '../utils/winConditions';
import { componentFactory } from "../utils/roleUtils";
import { RoleAPI } from '../utils/roleAPI';

const misspurple: RoleDef = {
	id: 'misspurple',
	name: 'Miss Purple',
	team: 'villaggio',
	icon: 'MissPurpleIcon',
    score: 6,
    visibleAsTeam: 'villaggio',
    countAs: 'villaggio',
    description: 'Scopre quanti lupi ci sono ogni notte',
    longDescription: `Miss Purple può contare i lupi nel villaggio.

COME FUNZIONA:
• Ogni notte scopre quanti lupi ci sono nel villaggio
• Il conteggio include tutti i giocatori che appaiono come lupi
• L'azione è obbligatoria: deve contare ogni notte
• I risultati vengono mostrati solo a Miss Purple`,
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
