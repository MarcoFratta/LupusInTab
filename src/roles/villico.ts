import type { RoleDef } from '../types';
import { useWinConditions } from '../utils/winConditions';

const villager: RoleDef = {
    id: 'villager',
    name: 'Villico',
    team: 'villaggio',
    visibleAsTeam: 'villaggio',
    countAs: 'villaggio',
    description: 'Un semplice abitante del villaggio. Nessuna azione notturna.',
    color: '#6b7280',
    phaseOrder: "any",
    group: false,
    actsAtNight: "never",
    usage: 'unlimited',
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



