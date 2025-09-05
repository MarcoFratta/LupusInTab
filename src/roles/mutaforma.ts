import type { RoleDef } from '../types';
import { alieniWin, villageWin, wolvesWin } from '../utils/winConditions';
import { componentFactory } from '../utils/roleUtils';
import { ROLES } from '../roles';
import { RoleAPI } from '../utils/roleAPI';

// Helper function to check if a target role can be used by mutaforma
function checkMutaformaCanUseTargetRole(targetRole: any, gameState: any, mutaformaPlayerId: number) {
    if (!targetRole) return false;

    // Check if role acts at night, considering groupings
    let effectiveRole = targetRole;
    if (targetRole.actsAtNight === 'never') {
        // Check if this role is grouped with a role that can act at night
        const groupings = gameState.groupings || [];
        const grouping = groupings.find((g: any) => g.toRole === targetRole.id); // Pick first grouping found
        
        if (grouping) {
            // Use the grouped role instead
            const groupedRole = ROLES[grouping.fromRole];
            if (groupedRole && groupedRole.actsAtNight !== 'never') {
                effectiveRole = groupedRole;
                console.log(`🔄 [DEBUG] Mutaforma using grouped role: ${groupedRole.id} instead of ${targetRole.id}`);
            } else {
                return false; // No valid grouping found
            }
        } else {
            return false; // No grouping and actsAtNight is never
        }
    }

    // Check if role requires being dead but mutaforma is alive
    if (effectiveRole.actsAtNight === 'dead') return false;

    // Check if role requires being alive but mutaforma is dead
    if (effectiveRole.actsAtNight === 'alive') {
        const mutaformaPlayer = RoleAPI.getPlayer(mutaformaPlayerId);
        if (!mutaformaPlayer || !mutaformaPlayer.alive) return false;
    }

    // Check start night restriction
    if (effectiveRole.startNight && typeof effectiveRole.startNight === 'number') {
        if (RoleAPI.getNightNumber() < effectiveRole.startNight) return false;
    }

    // Check usage limit restriction
    if (effectiveRole.numberOfUsage !== 'unlimited' && effectiveRole.numberOfUsage !== undefined) {
        const timesUsed = RoleAPI.getPowerUsageCount(effectiveRole.id, mutaformaPlayerId);
        if (timesUsed >= effectiveRole.numberOfUsage) return false;
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
    description: 'Copia il potere di un altro giocatore ogni notte',
    longDescription: `La Mutaforma può copiare i poteri di altri giocatori.

COME FUNZIONA:
• Ogni notte può scegliere un giocatore e copiare il suo potere
• Usa il potere del giocatore scelto per quella notte
• Può copiare solo ruoli che possono agire di notte
• L'azione è obbligatoria: deve copiare un potere ogni notte

ATTENZIONE: 
Se almeno una fazione perde tutti i suoi giocatori vivi, il mutaforma 
non potrà usare il suo ruolo e morirà nella notte successiva.
`,
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
        
        const targetPlayer = RoleAPI.getPlayer(targetId);
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
        
        // Determine the effective role to use (considering groupings)
        let effectiveRoleId = targetRoleId;
        let effectiveRole = targetRole;
        if (targetRole.actsAtNight === 'never') {
            const groupings = gameState.groupings || [];
            const grouping = groupings.find((g: any) => g.toRole === targetRoleId);
            if (grouping) {
                effectiveRoleId = grouping.fromRole;
                effectiveRole = ROLES[effectiveRoleId];
                console.log(`🔄 [DEBUG] Mutaforma will use effective role: ${effectiveRoleId} instead of ${targetRoleId}`);
            }
        }
        
        // Create the mutaforma action
        const mutaformaAction = {
            type: 'mutaforma_action',
            nightNumber: gameState.nightNumber,
            roleId: 'mutaforma',
            playerIds: action.playerIds || [],
            targetId: targetId,
            targetRoleId: effectiveRoleId, // Use effective role ID
            targetPlayerName: targetPlayer.name,
            canUseRole: canUseRole,
            data: {
                ...action.data,
                targetId: targetId,
                targetRoleId: effectiveRoleId, // Use effective role ID
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
        const alivePlayers = RoleAPI.getAlivePlayers();
        
        for (const alivePlayer of alivePlayers) {
            const roleDef = ROLES[alivePlayer.roleId];
            if (!roleDef) continue;
            
            const team = roleDef.countAs || roleDef.team;
            teams.add(team);
        }
        
        const allTeams = new Set<string>();
        const allPlayers = [...RoleAPI.getAlivePlayers(), ...RoleAPI.getDeadPlayers()];
        for (const gamePlayer of allPlayers) {
            const roleDef = ROLES[gamePlayer.roleId];
            if (!roleDef) continue;
            
            const team = roleDef.countAs || roleDef.team;
            allTeams.add(team);
        }
        
        const teamsWithNoAlivePlayers = Array.from(allTeams).filter(team => !teams.has(team));
        
        if (teamsWithNoAlivePlayers.length > 0) {
            const mutaformaPlayers = RoleAPI.getAlivePlayersWithRole('mutaforma');
            
            // Add mutaforma players to pending kills instead of directly killing them
            if (mutaformaPlayers.length > 0) {
                for (const mutaformaPlayer of mutaformaPlayers) {
                    RoleAPI.addKill(mutaformaPlayer.id, 'mutaforma');
                }
            }
        }
        
        return null;
    },
};

export default mutaforma;
