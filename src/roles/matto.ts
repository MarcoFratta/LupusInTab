import type { RoleDef } from '../types';

const crazyman: RoleDef = {
    id: 'crazyman',
    name: 'Matto',
    team: 'matti',
    visibleAsTeam: 'matti',
    countAs: 'matti',
    description: 'Vinci se vieni linciato. Nessuna azione notturna.',
    color: '#f59e0b',
    phaseOrder: "any",
    group: false,
    actsAtNight: "never",
    effectType: 'optional',
    numberOfUsage: 'unlimited',
    maxCount: 1,

    resolve() {},
    checkWin(gameState: any) {
        // Crazyman wins if lynched (handled in engine.lynchPlayer)
        return false;
    },
};

export default crazyman;




