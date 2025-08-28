import type { RoleDef } from '../types';
import { useWinConditions } from '../utils/winConditions';
import {componentFactory} from "../utils/roleUtils";

const massone: RoleDef = {
    id: 'massone',
    name: 'Massone',
    team: 'villaggio',
    score: 2,
    visibleAsTeam: 'villaggio',
    countAs: 'villaggio',
    description: 'Conosce gli altri massoni ma non ha nessun potere di notte.',
    color: '#a78bfa',
    phaseOrder: "any",
    actsAtNight: "never",
    effectType: 'optional',
    numberOfUsage: 'unlimited',
    revealAlliesWithinRole: true,
    minCount: 2,
    knownTo: ['massone'],
    revealToAllies: "role",

    getPromptComponent: componentFactory('Massone', "prompt"),
    getResolveDetailsComponent: componentFactory('Massone', "details"),

    resolve() {},
    checkWin(gameState: any) {
        const { villageWin } = useWinConditions();
        return villageWin(gameState);
    },
};

export default massone;


