import type { RoleDef } from '../types';

const crazyman: RoleDef = {
    id: 'crazyman',
    name: 'Matto',
    team: 'crazyman',
    visibleAsTeam: 'village',
    description: 'Vinci da solo se il villaggio ti lincia. Agli altri appari come un Villico.',
    color: '#a855f7',
    phaseOrder: 97,
    group: false,
    actsAtNight: false,
    usage: 'unlimited',
    minCount: 0,
    maxCount: 1,
    getPromptComponent() {
        // No night action for Crazyman
        return () => Promise.resolve(() => null as any);
    },
    resolve() {},
    // Crazyman win is handled at lynch time because they are dead when winning
};

export default crazyman;



