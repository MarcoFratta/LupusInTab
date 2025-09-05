import type { RoleDef } from '../types';
import { villageWin } from '../utils/winConditions';
import { RoleAPI } from '../utils/roleAPI';

const massone: RoleDef = {
	id: 'massone',
	name: 'Massone',
	team: 'villaggio',
	icon: 'MassoneIcon',
    score: 3,
    visibleAsTeam: 'villaggio',
    countAs: 'villaggio',
    description: 'Conosce gli altri massoni',
    longDescription: `Il Massone è un membro del villaggio che conosce gli altri massoni.

COME FUNZIONA:
• Conosce gli altri massoni durante la fase di rivelazione
• Non ha poteri speciali di notte
• Appare come villaggio alle investigazioni
• Conta come villaggio per le condizioni di vittoria`,
    color: '#a78bfa',
    phaseOrder: "any",
    actsAtNight: "never",
    revealAlliesWithinRole: true,
    minCount: 2,
    knownTo: ['massone'],
    revealToAllies: "role",

    resolve() {},
    checkWin(gameState: any) {
        return villageWin(gameState);
    },
};

export default massone;


