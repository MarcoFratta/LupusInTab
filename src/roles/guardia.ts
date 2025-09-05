import type { RoleDef } from '../types';
import { villageWin } from '../utils/winConditions';
import { componentFactory } from "../utils/roleUtils";
import { RoleAPI } from "../utils/roleAPI";

const guardia: RoleDef = {
    id: 'guardia',
    name: 'Guardia',
    team: 'villaggio',
    score: 5,
    visibleAsTeam: 'villaggio',
    countAs: 'villaggio',
    description: 'Protegge un giocatore ogni notte',
    longDescription: `La Guardia è il protettore del villaggio, capace di salvare vite preziose.

COME FUNZIONA:
• Ogni notte può scegliere un giocatore da proteggere
• Il giocatore protetto non può essere ucciso dai lupi quella notte
• Non può proteggere lo stesso giocatore due notti consecutive
• L'azione è obbligatoria: deve proteggere ogni notte`,
    color: '#8b5cf6',
	phaseOrder: "any",
    actsAtNight: "alive",
    effectType: 'required',
    numberOfUsage: 'unlimited',
    getPromptComponent: componentFactory('Guardia', "prompt"),
    getResolveDetailsComponent: componentFactory('Guardia', "details"),
    
    resolve(gameState: any, action: any) {
        const id = Number(action?.data?.targetId || action?.result?.targetId);
        if (!Number.isFinite(id)) return;
        
        // Check if target has pending lupo kills
        const pendingKills = RoleAPI.getPendingKills(id);
        const lupoKills = pendingKills.filter(kill => kill.role === 'lupo');
        
        if (lupoKills.length > 0) {
            // Remove lupo kills
            RoleAPI.removeKills(id, 'lupo');
            
            // Record the save
            RoleAPI.addSave(id, action.playerId, lupoKills.map(kill => kill.role));
        }
        
        return {
            type: 'guardia_action',
            nightNumber: gameState.nightNumber,
            roleId: 'guardia',
            playerIds: action.playerIds || [],
            targetId: id,
            data: action.data
        };
    },
    
    checkWin(gameState: any) {
        return villageWin(gameState);
    },
};

export default guardia;


