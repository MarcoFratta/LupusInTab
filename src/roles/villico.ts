import type { RoleDef } from '../types';
import { useWinConditions } from '../utils/winConditions';

const villager: RoleDef = {
    id: 'villager',
    name: 'Villico',
    team: 'village',
    visibleAsTeam: 'village',
    description: 'Nessun potere notturno. Aiuta il villaggio a scoprire i lupi.',
    color: '#22c55e',
    phaseOrder: 99,
    group: false,
    actsAtNight: false, // ensure auto-skip at night
    usage: 'unlimited',
    // No prompt component to enforce auto-skip
    getPromptComponent() {
        return () => Promise.resolve(() => null as any);
    },
    resolve() {},
    checkWin(gameState: any) {
        const { villageWin } = useWinConditions();
        return villageWin(gameState);
    },
};

export default villager;



