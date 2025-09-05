import type { RoleDef } from '../types';
import { RoleAPI } from '../utils/roleAPI';

const matto: RoleDef = {
    id: 'matto',
    name: 'Matto',
    team: 'matti',
    visibleAsTeam: 'villaggio',
    countAs: 'villaggio',
    score: 30,
    description: 'Vince se viene linciato dal villaggio',
    longDescription: `Il Matto è un ruolo che vince solo se viene linciato.

COME FUNZIONA:
• Vince da solo se viene linciato dal villaggio durante il giorno
• Non ha abilità notturne
• Appare come villaggio alle investigazioni
• Conta come villaggio per le condizioni di vittoria`,
    color: '#e9d5ff',
    phaseOrder: "any",
    actsAtNight: "never",
    effectType: 'optional',
    numberOfUsage: 'unlimited',
    resolve() {},
    checkWin(gameState: any) {
        return false;
    },
};

export default matto;




