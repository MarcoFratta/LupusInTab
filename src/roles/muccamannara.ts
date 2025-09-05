import type { RoleDef } from '../types';
import { mannariWin, mannariBlocksOtherWins } from '../utils/winConditions';
import { RoleAPI } from '../utils/roleAPI';

const muccamannara: RoleDef = {
    id: 'muccamannara',
    name: 'Mucca Mannara',
    team: 'mannari',
    score: 33,
    revealAlliesWithinRole: false,
    visibleAsTeam: 'lupi',
    countAs: 'villaggio',
    description: 'Vince solo se rimane viva con un altro giocatore',
    longDescription: `La Mucca Mannara è un ruolo solitario con poteri speciali.

COME FUNZIONA:
• Vince solo se rimane in vita con esattamente un altro giocatore
• Se rimane in vita, nessun altro può vincere
• I lupi non possono ucciderla
• Conosce l'identità dei lupi
• Muore se il Veggente la investiga`,
    color: '#7c3aed',
    phaseOrder: "any",
    actsAtNight: "never",
    resolve(){},
    
    passiveEffect(gameState: any, player: any) {
        // Remove lupo kills from muccamannara
        RoleAPI.removeKills(player.id, 'lupo');
    },

    checkWin(gameState: any) {
        return mannariWin(gameState);
    },
    
    checkWinConstraint(gameState: any) {
        return mannariBlocksOtherWins(gameState);
    },
};

export default muccamannara;
