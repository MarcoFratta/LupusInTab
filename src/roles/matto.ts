import type { RoleDef } from '../types';
import {componentFactory} from "../utils/roleUtils";

const matto: RoleDef = {
    id: 'matto',
    name: 'Matto',
    team: 'matti',
    visibleAsTeam: 'villaggio',
    countAs: 'villaggio',
    score: 30,
    description: 'Vince da solo se viene linciato dal villaggio.',
    color: '#f59e0b',
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




