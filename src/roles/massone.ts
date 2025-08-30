import type { RoleDef } from '../types';
import { villageWin } from '../utils/winConditions';
import {componentFactory} from "../utils/roleUtils";

const massone: RoleDef = {
	id: 'massone',
	name: 'Massone',
	team: 'villaggio',
	icon: 'MassoneIcon',
    score: 3,
    visibleAsTeam: 'villaggio',
    countAs: 'villaggio',
    description: 'Conosce gli altri massoni ma non ha nessun potere di notte.',
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


