import type { RoleDef } from '../types';
import { wolvesWin } from '../utils/winConditions';
import { RoleAPI } from '../utils/roleAPI';

const indemoniato: RoleDef = {
    id: 'indemoniato',
    name: 'Indemoniato',
    team: 'lupi',
    visibleAsTeam: 'villaggio',
    score: 4,
    countAs: 'villaggio',
    description: 'Villico che gioca per i lupi',
    longDescription: `L'Indemoniato è un villico che gioca per i lupi.

COME FUNZIONA:
• Appare come villaggio alle investigazioni
• Conta come villaggio per le condizioni di vittoria
• Vince se i lupi vincono
• Non ha abilità notturne`,
    color: '#581c87',
    phaseOrder: "any",
    actsAtNight: "never",
    effectType: 'optional',
    numberOfUsage: 'unlimited',
    resolve() {},
    checkWin(gameState: any) {
        return wolvesWin(gameState);
    },
};

export default indemoniato;




