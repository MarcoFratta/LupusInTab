import type { RoleDef } from '../types';

const demoniac: RoleDef = {
    id: 'demoniac',
    name: 'Indemoniato',
    team: 'village',
    visibleAsTeam: 'wolf',
    description: 'Alleato segreto dei lupi. Visto come Lupo dagli altri. Nessuna azione notturna. Vince quando vincono i Lupi, ma non conta come Lupo per la parità.',
    color: '#fb7185',
    phaseOrder: 98,
    group: false,
    actsAtNight: false,
    usage: 'unlimited',
    knownToTeams: ['wolf'],
    revealToAllies: 'role',
    getPromptComponent() {
        return () => Promise.resolve(() => null as any);
    },
    resolve() {},
    // No custom checkWin: wolves will declare victory; demoniac shares that win
};

export default demoniac;



