import type { RoleDef } from '../types';
import {villageWin} from '../utils/winConditions';
import {componentFactory} from "../utils/roleUtils";

const villico: RoleDef = {
    id: 'villico',
    name: 'Villico',
    team: 'villaggio',
    score: 1,
    visibleAsTeam: 'villaggio',
    countAs: 'villaggio',
    description: 'Abitante del villaggio senza poteri speciali.',
    color: '#6b7280',
    phaseOrder: "any",
    actsAtNight: "never",
    effectType: 'optional',
    numberOfUsage: 'unlimited',
    resolve() {},
    checkWin(gameState: any) {
        return villageWin(gameState);
    }
};

export default villico;



