import type { RoleDef } from '../types';
import { useWinConditions } from '../utils/winConditions';
import {vi} from "vitest";

const lover: RoleDef = {
    id: 'lover',
    name: 'Massone',
    team: 'villaggio',
    visibleAsTeam: 'villaggio',
    countAs: 'villaggio',
    description: 'Tutti i massoni si conoscono durante la prima notte. Vince quando vince il villaggio.',
    color: '#ec4899',
    phaseOrder: "any",
    group: false,
    actsAtNight: "never",
    effectType: 'optional',
    numberOfUsage: 'unlimited',
    revealAlliesWithinRole: true,
    minCount: 2,

    resolve() {},
    checkWin(gameState: any) {
        const { villageWin } = useWinConditions();
        return villageWin(gameState);
    },
};

export default lover;


