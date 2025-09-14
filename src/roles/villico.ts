import type { RoleDef } from '../types';
import { villageWin } from '../utils/winConditions';
import { RoleAPI } from '../utils/roleAPI';

const villico: RoleDef = {
	id: 'villico',
	name: 'roleNames.villico',
	team: 'villaggio',
	icon: 'VillicoIcon',
    score: 1,
    visibleAsTeam: 'villaggio',
    countAs: 'villaggio',
    description: 'roleDescriptions.villico',
    longDescription: 'roleDescriptions.villicoLong',
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



