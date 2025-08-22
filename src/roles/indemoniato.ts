import type { RoleDef } from '../types';
import {componentFactory} from "../utils/roleUtils";

const indemoniato: RoleDef = {
    id: 'indemoniato',
    name: 'Indemoniato',
    team: 'lupi',
    visibleAsTeam: 'lupi',
    countAs: 'villaggio',
    description: 'Un indemoniato che appare come lupo ma conta per il villaggio.',
    color: '#fb7185',
    phaseOrder: "any",
    
    actsAtNight: "never",
    effectType: 'optional',
    numberOfUsage: 'unlimited',
    getPromptComponent: componentFactory('Indemoniato', "prompt"),
    getResolveDetailsComponent: componentFactory('Indemoniato', "details"),

    resolve() {},
};

export default indemoniato;




