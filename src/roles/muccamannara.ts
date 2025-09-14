import type { RoleDef } from '../types';
import { mannariWin, mannariBlocksOtherWins } from '../utils/winConditions';
import { RoleAPI } from '../utils/roleAPI';

const muccamannara: RoleDef = {
    id: 'muccamannara',
    name: 'roleNames.muccamannara',
    team: 'mannari',
    score: 33,
    revealAlliesWithinRole: false,
    visibleAsTeam: 'lupi',
    countAs: 'villaggio',
    description: 'roleDescriptions.muccamannara',
    longDescription: 'roleDescriptions.muccamannaraLong',
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
