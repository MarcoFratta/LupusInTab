import type { RoleDef } from '../types';
import { villageWin } from '../utils/winConditions';
import { RoleAPI } from '../utils/roleAPI';

const villico: RoleDef = {
	id: 'villico',
	name: 'Contadino',
	team: 'villaggio',
	icon: 'VillicoIcon',
    score: 1,
    visibleAsTeam: 'villaggio',
    countAs: 'villaggio',
    description: 'Abitante del villaggio senza poteri speciali',
    longDescription: `Il Contadino è un abitante del villaggio senza poteri speciali.

COME FUNZIONA:
• Non ha poteri speciali di notte
• Appare come villaggio alle investigazioni
• Conta come villaggio per le condizioni di vittoria
• Vince se il villaggio vince`,
    color: '#6b7280',
    phaseOrder: "any",
    actsAtNight: "never",
    effectType: 'optional',
    numberOfUsage: 'unlimited',
    resolve() {},
    checkWin(gameState: any) {
        return villageWin(gameState);
    }
};

export default villico;



