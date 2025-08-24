import type { RoleDef } from '../types';
import { useWinConditions } from '../utils/winConditions';
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
        const { villageWin } = useWinConditions();
        return villageWin(gameState);
    },
    getPromptComponent: componentFactory('Villico', "prompt"),
    getResolveDetailsComponent: componentFactory('Villico', "details"),
};

export default villico;



