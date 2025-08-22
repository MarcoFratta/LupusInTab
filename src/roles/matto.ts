import type { RoleDef } from '../types';
import {componentFactory} from "../utils/roleUtils";

const matto: RoleDef = {
    id: 'matto',
    name: 'Matto',
    team: 'matti',
    visibleAsTeam: 'matti',
    countAs: 'matti',
    description: 'Un matto che vince immediatamente se viene linciato.',
    color: '#f59e0b',
    phaseOrder: "any",
    
    actsAtNight: "never",
    effectType: 'optional',
    numberOfUsage: 'unlimited',
    maxCount: 1,

    getPromptComponent: componentFactory('Matto', "prompt"),
    getResolveDetailsComponent: componentFactory('Matto', "details"),

    resolve() {},
    checkWin(gameState: any) {
        return false;
    },
};

export default matto;




