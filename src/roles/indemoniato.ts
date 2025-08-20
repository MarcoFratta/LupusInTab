import type { RoleDef } from '../types';

const demoniac: RoleDef = {
    id: 'demoniac',
    name: 'Indemoniato',
    team: 'lupi',
    visibleAsTeam: 'lupi',
    countAs: 'villaggio',
    description: 'Alleato segreto dei lupi. Visto come lupi dagli altri. Nessuna azione notturna. Vince quando vincono i lupi, ma non conta come lupi per la parità.',
    color: '#fb7185',
    phaseOrder: "any",
    group: false,
    actsAtNight: "never",
    effectType: 'optional',
    numberOfUsage: 'unlimited',
    knownTo: ['wolf'],
    revealToAllies: 'role',

    resolve() {},
    // No custom checkWin: wolves will declare victory; demoniac shares that win
};

export default demoniac;




