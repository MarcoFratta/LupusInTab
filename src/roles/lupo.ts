import type { RoleDef } from '../types';
import { useWinConditions } from '../utils/winConditions';
import {componentFactory} from "../utils/roleUtils";

const lupo: RoleDef = {
    id: 'lupo',
    name: 'Lupi',
    team: 'lupi',
    visibleAsTeam: 'lupi',
    countAs: 'lupi',
    description: 'Di notte i lupi scelgono una vittima. Vincono quando restano solo loro o raggiungono la parità con gli altri.',
    color: '#ef4444',
    phaseOrder: 1,
    actsAtNight: "alive",
    effectType: 'required',
    numberOfUsage: 'unlimited',
    revealAlliesWithinRole: true,
    minCount: 1,
    maxCount: (state: any) => Math.max(1, Math.floor(((state?.setup?.numPlayers || 0) - 1) / 2)),
    getPromptComponent: componentFactory('Lupo', "prompt"),
    getResolveDetailsComponent: componentFactory('Lupo', "details"),
    resolve(gameState: any, action: any) {
        const id = Number(action?.data?.targetId || action?.result?.targetId);
        if (Number.isFinite(id)) {
            const pk = gameState.night.context.pendingKills as Record<number, Array<{ role: string }>>;
            if (!pk[id]) pk[id] = [];
            const hasLupoKill = pk[id].some(kill => kill.role === 'lupo');
            if (!hasLupoKill) {
                pk[id].push({ role: 'lupo' });
            }
        }
        
        return {
            type: 'lupo_action',
            nightNumber: gameState.nightNumber,
            roleId: 'lupo',
            playerIds: action.playerIds || [],
            targetId: id,
            data: action.data
        };
    },
    checkWin(gameState: any) {
        const { wolvesWin } = useWinConditions();
        return wolvesWin(gameState);
    },
};

export default lupo;




