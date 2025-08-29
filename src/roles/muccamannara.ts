import type { RoleDef } from '../types';
import { mannariWin } from '../utils/winConditions';

const muccamannara: RoleDef = {
    id: 'muccamannara',
    name: 'Mucca Mannara',
    team: 'mannari',
    score: 30,
    revealAlliesWithinRole: false,
    visibleAsTeam: 'lupi',
    countAs: 'villaggio',
    description: 'Vince solo se rimane in vita con un altro giocatore. ' +
        'Se rimane in vita, nessun altro può vincere. ' +
        'I lupi non possono ucciderla. ' +
        'Muore se il veggente la indaga.',
    color: '#7c3aed',
    phaseOrder: "any",
    actsAtNight: "never",
    numberOfUsage: 'unlimited',
    resolve(){},
    passiveEffect(gameState: any, player: any) {
        const pk = gameState.night.context.pendingKills as Record<number, Array<{ role: string }>>;
        if (pk[player.id]) {
            pk[player.id] = pk[player.id].filter(kill => kill.role !== 'lupo');
            
            if (pk[player.id].length === 0) {
                delete pk[player.id];
            }
        }
    },

    checkWin(gameState: any) {
        return mannariWin(gameState);
    },
};

export default muccamannara;
