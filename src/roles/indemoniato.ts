import type { RoleDef } from '../types';
import { wolvesWin } from '../utils/winConditions';
import { RoleAPI } from '../utils/roleAPI';

const indemoniato: RoleDef = {
    id: 'indemoniato',
    name: 'roleNames.indemoniato',
    team: 'lupi',
    visibleAsTeam: 'villaggio',
    score: 4,
    countAs: 'villaggio',
    description: 'roleDescriptions.indemoniato',
    longDescription: 'roleDescriptions.indemoniatoLong',
    color: '#581c87',
    phaseOrder: "any",
    actsAtNight: "never",
    resolve() {},
    checkWin(gameState: any) {
        return wolvesWin(gameState);
    },
};

export default indemoniato;




