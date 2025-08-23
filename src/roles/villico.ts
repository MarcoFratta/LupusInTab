import type { RoleDef } from '../types';
import { useWinConditions } from '../utils/winConditions';
import {componentFactory} from "../utils/roleUtils";

const villico: RoleDef = {
    id: 'villico',
    name: 'Villico',
    team: 'villaggio',
    visibleAsTeam: 'villaggio',
    countAs: 'villaggio',
    description: 'Un semplice abitante del villaggio. Nessuna azione notturna.',
    color: '#6b7280',
    phaseOrder: "any",
    actsAtNight: "never",
    effectType: 'optional',
    numberOfUsage: 'unlimited',
    resolve() {},
    checkWin(gameState: any) {
        const { villageWin } = useWinConditions();
        return villageWin(gameState);
    },
    getPromptComponent: componentFactory('Villico', "prompt"),
    getResolveDetailsComponent: componentFactory('Villico', "details"),
};

export default villico;



