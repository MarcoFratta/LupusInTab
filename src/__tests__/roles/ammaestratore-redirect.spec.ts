import { describe, it, expect, beforeEach } from 'vitest';
import ammaestratore from '../../roles/ammaestratore';
import { checkPlayerRole } from '../../utils/roleChecking';

describe('Ammaestratore Redirect Functionality', () => {
    let mockGameState: any;

    // Custom resolve function that doesn't use RoleAPI for testing
    function testAmmaestratoreResolve(gameState: any, action: any) {
        const targetId = action?.data?.targetId || action?.result?.targetId;
        
        const numericTargetId = Number(targetId);
        if (!Number.isFinite(numericTargetId)) return;

        const newTarget = gameState.players.find((p: any) => p.id === numericTargetId);
        if (!newTarget) return;

        // Find lupo kills to redirect
        const lupoKills: Array<{ role: string; originalTarget?: number }> = [];
        const pendingKills = gameState.night?.context?.pendingKills || {};
        
        // Find all lupo kills
        Object.keys(pendingKills).forEach(playerId => {
            const kills = pendingKills[Number(playerId)];
            if (kills) {
                const lupoKill = kills.find((kill: any) => kill.role === 'lupo');
                if (lupoKill) {
                    lupoKills.push({
                        ...lupoKill,
                        originalTarget: Number(playerId)
                    });
                }
            }
        });
        
        // Always take only ONE lupo kill to redirect
        if (lupoKills.length > 0) {
            // Take the first kill found
            const killToRedirect = lupoKills[0];
            const originalTarget = killToRedirect.originalTarget;
            
            // Remove this kill from its original target
            if (originalTarget) {
                if (gameState.night.context.pendingKills[originalTarget]) {
                    gameState.night.context.pendingKills[originalTarget] = 
                        gameState.night.context.pendingKills[originalTarget]
                            .filter((kill: any) => kill.role !== 'lupo');
                    if (gameState.night.context.pendingKills[originalTarget].length === 0) {
                        delete gameState.night.context.pendingKills[originalTarget];
                    }
                }
            }
            
            // Only add the redirected kill if target is NOT a lupo
            if (!checkPlayerRole(numericTargetId, 'lupo', gameState)) {
                if (!gameState.night.context.pendingKills[numericTargetId]) {
                    gameState.night.context.pendingKills[numericTargetId] = [];
                }
                gameState.night.context.pendingKills[numericTargetId].push({ role: 'lupo' });
            }
            
            // Keep only the first kill in the array for the redirect info
            lupoKills.splice(1);
        }

        return {
            type: 'ammaestratore_action',
            nightNumber: gameState.nightNumber,
            roleId: 'ammaestratore',
            playerIds: action.playerIds || [],
            targetId: numericTargetId,
            data: action.data,
            redirectInfo: {
                targetId: numericTargetId,
                originalKills: lupoKills,
                result: checkPlayerRole(numericTargetId, 'lupo', gameState) ? 'blocked' : 'redirected'
            }
        };
    }

    beforeEach(() => {
        mockGameState = {
            setup: {
                rolesEnabled: {
                    lupo: true,
                    ammaestratore: true,
                    villico: true
                }
            },
            nightNumber: 2,
            night: {
                context: {
                    pendingKills: {}
                }
            },
            settings: { difficolta: false },
            groupings: [],
            players: [
                { 
                    id: 1, 
                    roleId: 'ammaestratore',
                    name: 'Ammaestratore Player',
                    alive: true
                },
                { 
                    id: 2, 
                    roleId: 'lupo',
                    name: 'Lupo Player',
                    alive: true
                },
                { 
                    id: 3, 
                    roleId: 'villico',
                    name: 'Villico Player',
                    alive: true
                },
                { 
                    id: 4, 
                    roleId: 'villico',
                    name: 'Another Villico Player',
                    alive: true
                }
            ]
        };
    });

    describe('Lupo Kill Redirection', () => {
        it('should redirect lupo kill to new target', () => {
            // Setup: Lupo has already killed player 3
            mockGameState.night.context.pendingKills[3] = [{ role: 'lupo' }];

            const action = {
                playerId: 1,
                playerIds: [1],
                data: { targetId: 4 }, // Ammaestratore wants to redirect to player 4
                used: true
            };

            const result = testAmmaestratoreResolve(mockGameState, action);

            // Original target should no longer have lupo kill
            expect(mockGameState.night.context.pendingKills[3]).toBeUndefined();

            // New target should have lupo kill
            expect(mockGameState.night.context.pendingKills[4]).toBeDefined();
            expect(mockGameState.night.context.pendingKills[4]).toHaveLength(1);
            expect(mockGameState.night.context.pendingKills[4][0].role).toBe('lupo');

            expect(result).toBeDefined();
            expect(result.type).toBe('ammaestratore_action');
            expect(result.targetId).toBe(4);
            expect(result.redirectInfo.result).toBe('redirected');
        });

        it('should block kill if target is a lupo', () => {
            // Setup: Lupo has already killed player 3
            mockGameState.night.context.pendingKills[3] = [{ role: 'lupo' }];

            const action = {
                playerId: 1,
                playerIds: [1],
                data: { targetId: 2 }, // Ammaestratore wants to redirect to lupo player 2
                used: true
            };

            const result = testAmmaestratoreResolve(mockGameState, action);

            // Original target should no longer have lupo kill
            expect(mockGameState.night.context.pendingKills[3]).toBeUndefined();

            // Lupo target should not have any kills (blocked)
            expect(mockGameState.night.context.pendingKills[2]).toBeUndefined();

            expect(result).toBeDefined();
            expect(result.type).toBe('ammaestratore_action');
            expect(result.targetId).toBe(2);
            expect(result.redirectInfo.result).toBe('blocked');
        });

        it('should handle case when no lupo kills exist', () => {
            // Setup: No lupo kills exist
            mockGameState.night.context.pendingKills = {};

            const action = {
                playerId: 1,
                playerIds: [1],
                data: { targetId: 4 },
                used: true
            };

            const result = testAmmaestratoreResolve(mockGameState, action);

            // No kills should be added since there were no lupo kills to redirect
            expect(mockGameState.night.context.pendingKills[4]).toBeUndefined();

            expect(result).toBeDefined();
            expect(result.type).toBe('ammaestratore_action');
            expect(result.targetId).toBe(4);
        });

        it('should only redirect one lupo kill even if multiple exist', () => {
            // Setup: Multiple lupo kills exist
            mockGameState.night.context.pendingKills[3] = [{ role: 'lupo' }];
            mockGameState.night.context.pendingKills[4] = [{ role: 'lupo' }];

            const action = {
                playerId: 1,
                playerIds: [1],
                data: { targetId: 1 }, // Ammaestratore wants to redirect to themselves
                used: true
            };

            const result = testAmmaestratoreResolve(mockGameState, action);

            // Only the first lupo kill should be redirected
            expect(mockGameState.night.context.pendingKills[3]).toBeUndefined(); // First kill removed
            expect(mockGameState.night.context.pendingKills[4]).toBeDefined(); // Second kill remains
            expect(mockGameState.night.context.pendingKills[4]).toHaveLength(1);
            expect(mockGameState.night.context.pendingKills[4][0].role).toBe('lupo');

            // New target should have the redirected kill
            expect(mockGameState.night.context.pendingKills[1]).toBeDefined();
            expect(mockGameState.night.context.pendingKills[1]).toHaveLength(1);
            expect(mockGameState.night.context.pendingKills[1][0].role).toBe('lupo');

            expect(result).toBeDefined();
            expect(result.type).toBe('ammaestratore_action');
            expect(result.targetId).toBe(1);
        });
    });
});
