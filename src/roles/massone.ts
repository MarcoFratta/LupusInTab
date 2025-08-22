import type { RoleDef } from '../types';
import { useWinConditions } from '../utils/winConditions';
import {componentFactory} from "../utils/roleUtils";

const massone: RoleDef = {
    id: 'massone',
    name: 'Massone',
    team: 'villaggio',
    visibleAsTeam: 'villaggio',
    countAs: 'villaggio',
    description: 'Un massone che può comunicare con altri massoni.',
    color: '#ec4899',
    phaseOrder: "any",
    
    actsAtNight: "never",
    effectType: 'optional',
    numberOfUsage: 'unlimited',
    revealAlliesWithinRole: true,
    minCount: 2,

    getPromptComponent: componentFactory('Massone', "prompt"),
    getResolveDetailsComponent: componentFactory('Massone', "details"),

    resolve() {},
    checkWin(gameState: any) {
        const { villageWin } = useWinConditions();
        return villageWin(gameState);
    },
};

export default massone;


