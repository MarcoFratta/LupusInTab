import type { RoleDef } from '../types';
import { alieniWin, villageWin, wolvesWin } from '../utils/winConditions';
import { componentFactory } from '../utils/roleUtils';
import { ROLES } from '../roles';

// Helper function to check if a target role can be used by mutaforma
function checkMutaformaCanUseTargetRole(targetRole: any, gameState: any, mutaformaPlayerId: number) {
    if (!targetRole) return false;

    // Check if role acts at night
    if (targetRole.actsAtNight === 'never') return false;

    // Check if role requires being dead but mutaforma is alive
    if (targetRole.actsAtNight === 'dead') return false;

    // Check if role requires being alive but mutaforma is dead
    if (targetRole.actsAtNight === 'alive') {
        const mutaformaPlayer = gameState.players.find((p: any) => p.id === mutaformaPlayerId);
        if (!mutaformaPlayer || !mutaformaPlayer.alive) return false;
    }

    // Check start night restriction
    if (targetRole.startNight && typeof targetRole.startNight === 'number') {
        if (gameState.nightNumber < targetRole.startNight) return false;
    }

    // Check usage limit restriction
    if (targetRole.numberOfUsage !== 'unlimited' && targetRole.numberOfUsage !== undefined) {
        const usedPowers = gameState.usedPowers?.[targetRole.id] || [];
        const timesUsed = usedPowers.filter((playerId: number) => playerId === mutaformaPlayerId).length;
        if (timesUsed >= targetRole.numberOfUsage) return false;
    }

    return true;
}

const mutaforma: RoleDef = {
    id: 'mutaforma',
    name: 'Mutaforma',
    team: 'alieni',
    visibleAsTeam: 'villaggio',
    countAs: 'alieni',
    score: 35,
    description: 'Di notte può copiare il potere di un altro giocatore, solo per quella notte.' +
' Se almeno un'altra fazione perde tutti i suoi membri, lui non può più usare il suo ruolo e la prossima notte morirà',
    color: '#10b981',
    phaseOrder: 2,
    actsAtNight: "alive",
    effectType: 'required',
    numberOfUsage: 'unlimited',
    getPromptComponent: componentFactory('Mutaforma', "prompt"),
    getResolveDetailsComponent: componentFactory('Mutaforma', "details"),
    
    resolve(gameState: any, action: any) {
        
        const targetId = Number(action?.data?.targetId || action?.targetId);
        if (!Number.isFinite(targetId) || targetId <= 0) return;
        
        const targetPlayer = gameState.players.find((p: any) => p.id === targetId);
        if (!targetPlayer) return;
        
        const targetRoleId = targetPlayer.roleId;
        const targetRole = ROLES[targetRoleId];
        
        if (!targetRole) return;
        
        // Check if the target role can be used by the mutaforma
        const canUseRole = checkMutaformaCanUseTargetRole(targetRole, gameState, action.playerId);
        
        if (!canUseRole) {
            return {
                type: 'mutaforma_action',
                nightNumber: gameState.nightNumber,
                roleId: 'mutaforma',
                playerIds: action.playerIds || [],
                targetId: targetId,
                targetRoleId: targetRoleId,
                targetPlayerName: targetPlayer.name,
                canUseRole: false,
                reason: 'Role cannot be used by Mutaforma',
                data: action.data
            };
        }
        
        // Create the mutaforma action
        const mutaformaAction = {
            type: 'mutaforma_action',
            nightNumber: gameState.nightNumber,
            roleId: 'mutaforma',
            playerIds: action.playerIds || [],
            targetId: targetId,
            targetRoleId: targetRoleId,
            targetPlayerName: targetPlayer.name,
            canUseRole: canUseRole,
            data: {
                ...action.data,
                targetId: targetId,
                targetRoleId: targetRoleId,
                targetRoleResult: action.data?.targetRoleResult
            }
        };
        
        // Store the target role info in the data
        mutaformaAction.data = {
            ...mutaformaAction.data,
            targetRole: {
                id: targetRoleId,
                name: targetRole.name,
                team: targetRole.team,
                actsAtNight: targetRole.actsAtNight,
                startNight: targetRole.startNight
            }
        };
        
        return mutaformaAction;
    },
    


    checkWin(gameState: any) {
        return alieniWin(gameState);
    },

    checkWinConstraint(gameState: any) {
        const mutaformaAlive = gameState.players.some((p: any) => 
            p.roleId === 'mutaforma' && p.alive
        );
        
        if (!mutaformaAlive) return false;
        
        const villageWins = villageWin(gameState);
        const wolvesWins = wolvesWin(gameState);
        
        return villageWins || wolvesWins;
    },

    passiveEffect(gameState: any, player: any) {
        const teams = new Set<string>();
        const alivePlayers = gameState.players.filter((p: any) => p.alive);
        
        for (const alivePlayer of alivePlayers) {
            const roleDef = ROLES[alivePlayer.roleId];
            if (!roleDef) continue;
            
            const team = roleDef.countAs || roleDef.team;
            teams.add(team);
        }
        
        const allTeams = new Set<string>();
        for (const gamePlayer of gameState.players) {
            const roleDef = ROLES[gamePlayer.roleId];
            if (!roleDef) continue;
            
            const team = roleDef.countAs || roleDef.team;
            allTeams.add(team);
        }
        
        const teamsWithNoAlivePlayers = Array.from(allTeams).filter(team => !teams.has(team));
        
        if (teamsWithNoAlivePlayers.length > 0) {
            const mutaformaPlayers = gameState.players.filter((p: any) => 
                p.roleId === 'mutaforma' && p.alive
            );
            
            // Add mutaforma players to pending kills instead of directly killing them
            if (mutaformaPlayers.length > 0) {
                if (!gameState.night?.context) {
                    gameState.night = { ...gameState.night, context: {} };
                }
                if (!gameState.night.context.pendingKills) {
                    gameState.night.context.pendingKills = {};
                }
                
                for (const mutaformaPlayer of mutaformaPlayers) {
                    if (!gameState.night.context.pendingKills[mutaformaPlayer.id]) {
                        gameState.night.context.pendingKills[mutaformaPlayer.id] = [];
                    }
                    gameState.night.context.pendingKills[mutaformaPlayer.id].push({
                        role: 'mutaforma'
                    });
                }
            }
        }
        
        return null;
    },
};

export default mutaforma;
