import type { RoleDef } from '../types';
import { useWinConditions } from '../utils/winConditions';

const lover: RoleDef = {
    id: 'lover',
    name: 'Massone',
    team: 'village',
    visibleAsTeam: 'village',
    description: 'Sei legato a un altro giocatore. Vedrai il tuo partner durante la rivelazione. Nessuna azione notturna.',
    color: '#22c55e',
    phaseOrder: 98,
    group: false,
    actsAtNight: false,
    usage: 'unlimited',
    // Each lover should see the other lover during reveal
    revealPartnersRoleIds: ['lover'],
    revealToPartners: 'role',
    // Lovers don't have a night action; return a null component
    getPromptComponent() {
        return () => Promise.resolve(() => null as any);
    },
    resolve() {},
    checkWin(gameState: any) {
        const { loversWin } = useWinConditions();
        return loversWin(gameState);
    },
};

export default lover;


