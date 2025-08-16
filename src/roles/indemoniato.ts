import type { RoleDef } from '../types';

const demoniac: RoleDef = {
    id: 'demoniac',
    name: 'Indemoniato',
    team: 'lupi',
    visibleAsTeam: 'lupi',
    description: 'Alleato segreto dei lupi. Visto come lupi dagli altri. Nessuna azione notturna. Vince quando vincono i lupi, ma non conta come lupi per la parità.',
    color: '#fb7185',
    phaseOrder: 98,
    group: false,
    actsAtNight: false,
    usage: 'unlimited',
    knownToTeams: ['lupi'],
    revealToAllies: 'role',
    getPromptComponent() {
        return () => Promise.resolve(() => null as any);
    },
    resolve() {},
    // No custom checkWin: wolves will declare victory; demoniac shares that win
};

export default demoniac;




