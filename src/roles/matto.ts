import type { RoleDef } from '../types';
import { RoleAPI } from '../utils/roleAPI';

const matto: RoleDef = {
    id: 'matto',
    name: 'roleNames.matto',
    team: 'matti',
    visibleAsTeam: 'villaggio',
    countAs: 'villaggio',
    score: 30,
    description: 'roleDescriptions.matto',
    longDescription: 'roleDescriptions.mattoLong',
    color: '#e9d5ff',
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




