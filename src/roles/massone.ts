import type { RoleDef } from '../types';
import { villageWin } from '../utils/winConditions';
import { RoleAPI } from '../utils/roleAPI';

const massone: RoleDef = {
	id: 'massone',
	name: 'roleNames.massone',
	team: 'villaggio',
	icon: 'MassoneIcon',
    score: 3,
    visibleAsTeam: 'villaggio',
    countAs: 'villaggio',
    description: 'roleDescriptions.massone',
    longDescription: 'roleDescriptions.massoneLong',
    color: '#a78bfa',
    phaseOrder: "any",
    actsAtNight: "never",
    revealAlliesWithinRole: true,
    minCount: 2,
    knownTo: ['massone'],
    revealToAllies: "role",

    resolve() {},
    checkWin(gameState: any) {
        return villageWin(gameState);
    },
};

export default massone;


