import type { RoleDef } from '../types';
import {componentFactory} from "../utils/roleUtils";

const indemoniato: RoleDef = {
    id: 'indemoniato',
    name: 'Indemoniato',
    team: 'lupi',
    visibleAsTeam: 'villaggio',
    score: 2,
    countAs: 'villaggio',
    description: 'Villico che gioca per i lupi. Vince se i lupi vincono.',
    color: '#581c87',
    phaseOrder: "any",
    actsAtNight: "never",
    effectType: 'optional',
    numberOfUsage: 'unlimited',
    getPromptComponent: componentFactory('Indemoniato', "prompt"),
    getResolveDetailsComponent: componentFactory('Indemoniato', "details"),
    resolve() {},
};

export default indemoniato;




