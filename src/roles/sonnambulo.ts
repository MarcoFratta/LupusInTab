import type { RoleDef } from '../types';
import { villageWin } from '../utils/winConditions';
import { componentFactory } from "../utils/roleUtils";

const sonnambulo: RoleDef = {
    id: 'sonnambulo',
    name: 'roleNames.sonnambulo',
    team: 'villaggio',
    icon: 'SonnambuloIcon',
    score: 1, // relatively low impact role, similar to Villager
    visibleAsTeam: 'villaggio',
    countAs: 'villaggio',
    description: 'roleDescriptions.sonnambulo',
    longDescription: 'roleDescriptions.sonnambuloLong',
    color: '#3b82f6', // blue-ish color
    phaseOrder: "any",
    actsAtNight: "alive",
    effectType: 'required',
    numberOfUsage: 'unlimited',
    getPromptComponent: componentFactory('Sonnambulo', "prompt"),
    getResolveDetailsComponent: componentFactory('Sonnambulo', "details"),
    resolve(gameState: any, action: any) {
        // playerIds contains all Sonnambulos acting together
        const sIds = action.playerIds && action.playerIds.length > 0 ? action.playerIds : [action.playerId];
        const targetId = Number(action?.data?.targetId || action?.result?.targetId);
        if (!Number.isFinite(targetId)) return;

        // Initialize pendingKills if missing
        if (!gameState.night.context.pendingKills) {
            gameState.night.context.pendingKills = {};
        }
        const pk = gameState.night.context.pendingKills;
        for (const sId of sIds) {
            if (!pk[sId]) pk[sId] = [];
        }
        if (!pk[targetId]) pk[targetId] = [];

        const targetPlayer = gameState.players.find((p: any) => p.id === targetId);
        // Check if the target is actually in the wolves team (supports lupo, lupoCieco, lupoCiccione, etc.)
        const isTargetWolf = targetPlayer?.roleState?.realTeam === 'lupi';

        // Helper to check if a specific player's house was attacked by wolves tonight
        const wasAttackedByWolves = (pId: number) => {
            // Check if there is currently a wolf kill on them (supports LupoCieco & Ammaestratore redirects)
            const hasWolfKill = pk[pId]?.some((k: any) => k.role === 'lupo');
            // Check if they were saved from a wolf kill tonight (e.g. by Guardia)
            const wasSavedFromWolf = gameState.night.context.savesBy?.some((save: any) => 
                save.target === pId && save.fromRoles.includes('lupo')
            );
            return hasWolfKill || wasSavedFromWolf;
        };

        const tTargetedByWolves = wasAttackedByWolves(targetId);

        for (const sId of sIds) {
            const sTargetedByWolves = wasAttackedByWolves(sId);

            // 1. CLEAR all kills on Sonnambulo's home.
            // Since he is visiting someone else, kills directed at his own house fail (no-op).
            pk[sId] = [];

            // 2. Evaluate survival at destination
            if (isTargetWolf) {
                // Goes to a Wolf
                if (sTargetedByWolves) {
                    // If targeted by wolves and goes to a wolf, he dies
                    pk[sId].push({ role: 'sonnambulo', reason: 'Sonnambulo targeted by wolves and went to a wolf' });
                }
                // else safe! (wolves are out hunting)
            } else {
                // Goes to someone who isn't a Wolf
                if (tTargetedByWolves) {
                    // Let's check if target was saved by Guardia this night
                    const savedByGuardia = gameState.night.context.savesBy?.some((save: any) => 
                        save.target === targetId && save.fromRoles.includes('lupo')
                    );
                    
                    if (!savedByGuardia) {
                        // Target's home was not saved from wolves, so Sonnambulo dies in the attack!
                        pk[sId].push({ role: 'sonnambulo', reason: 'Sonnambulo died at target house attacked by wolves' });
                    }
                }
            }
        }

        return {
            type: 'sonnambulo_action',
            nightNumber: gameState.nightNumber,
            roleId: 'sonnambulo',
            playerIds: action.playerIds || [],
            targetId: targetId,
            data: action.data
        };
    },
    checkWin(gameState: any) {
        return villageWin(gameState);
    }
};

export default sonnambulo;
