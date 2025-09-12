import { describe, it, expect, beforeEach } from 'vitest';
import { checkPlayerRole } from '../../utils/roleChecking';

describe('Boia Multiple Players', () => {
    let mockGameState: any;

    // Custom resolve function that doesn't use RoleAPI for testing
    function testBoiaResolve(gameState: any, action: any) {
        const id = Number(action?.data?.targetId);
        const declaredRoleId = action?.data?.roleId ? String(action.data.roleId) : '';
        if (!Number.isFinite(id)) return;
        
        const targetPlayer = gameState.players.find((p: any) => p.id === id);
        if (!targetPlayer) return;
        
        const isCorrect = checkPlayerRole(id, declaredRoleId, gameState);
        
        if (isCorrect) {
            // Add kill to target
            if (!gameState.night.context.pendingKills[id]) {
                gameState.night.context.pendingKills[id] = [];
            }
            gameState.night.context.pendingKills[id].push({ role: 'boia', notSavable: true });
        } else {
            // When multiple Boia players act together and make wrong guess, ALL Boia players die
            const boiaPlayerIds = action.playerIds || [];
            for (const boiaId of boiaPlayerIds) {
                if (!gameState.night.context.pendingKills[boiaId]) {
                    gameState.night.context.pendingKills[boiaId] = [];
                }
                gameState.night.context.pendingKills[boiaId].push({ role: 'boia', notSavable: true });
            }
        }

        return {
            type: 'boia_action',
            nightNumber: gameState.nightNumber,
            roleId: 'boia',
            playerIds: action.playerIds || [],
            targetId: id,
            declaredRoleId: declaredRoleId,
            correct: isCorrect,
            data: action.data
        };
    }

    beforeEach(() => {
        mockGameState = {
            setup: {
                rolesEnabled: {
                    lupo: true,
                    villico: true,
                    boia: true
                }
            },
            nightNumber: 1,
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
                    roleId: 'boia',
                    name: 'Boia Player 1',
                    alive: true
                },
                { 
                    id: 2, 
                    roleId: 'boia',
                    name: 'Boia Player 2',
                    alive: true
                },
                { 
                    id: 3, 
                    roleId: 'lupo',
                    name: 'Lupo Player',
                    alive: true
                },
                { 
                    id: 4, 
                    roleId: 'villico',
                    name: 'Villico Player',
                    alive: true
                }
            ]
        };
    });

    describe('Multiple Boia Players', () => {
        it('should kill all Boia players when they make wrong guess together', () => {
            const action = {
                playerId: 1, // First Boia player ID
                playerIds: [1, 2], // Both Boia players
                data: { targetId: 4, roleId: 'lupo' }, // Wrong guess (target is villico, not lupo)
                used: true
            };

            const result = testBoiaResolve(mockGameState, action);

            // Both Boia players should be killed for wrong guess
            expect(mockGameState.night.context.pendingKills[1]).toBeDefined();
            expect(mockGameState.night.context.pendingKills[1]).toHaveLength(1);
            expect(mockGameState.night.context.pendingKills[1][0].role).toBe('boia');
            
            expect(mockGameState.night.context.pendingKills[2]).toBeDefined();
            expect(mockGameState.night.context.pendingKills[2]).toHaveLength(1);
            expect(mockGameState.night.context.pendingKills[2][0].role).toBe('boia');

            // Target should not be killed
            expect(mockGameState.night.context.pendingKills[4]).toBeUndefined();

            expect(result).toBeDefined();
            expect(result.type).toBe('boia_action');
            expect(result.targetId).toBe(4);
            expect(result.correct).toBe(false);
        });

        it('should kill target when Boia players make correct guess together', () => {
            const action = {
                playerId: 1, // First Boia player ID
                playerIds: [1, 2], // Both Boia players
                data: { targetId: 3, roleId: 'lupo' }, // Correct guess (target is lupo)
                used: true
            };

            const result = testBoiaResolve(mockGameState, action);

            // Target should be killed for correct guess
            expect(mockGameState.night.context.pendingKills[3]).toBeDefined();
            expect(mockGameState.night.context.pendingKills[3]).toHaveLength(1);
            expect(mockGameState.night.context.pendingKills[3][0].role).toBe('boia');

            // Boia players should not be killed
            expect(mockGameState.night.context.pendingKills[1]).toBeUndefined();
            expect(mockGameState.night.context.pendingKills[2]).toBeUndefined();

            expect(result).toBeDefined();
            expect(result.type).toBe('boia_action');
            expect(result.targetId).toBe(3);
            expect(result.correct).toBe(true);
        });

        it('should handle single Boia player correctly (backward compatibility)', () => {
            const action = {
                playerId: 1, // Single Boia player
                playerIds: [1], // Only one Boia player
                data: { targetId: 4, roleId: 'lupo' }, // Wrong guess
                used: true
            };

            const result = testBoiaResolve(mockGameState, action);

            // Only the single Boia player should be killed for wrong guess
            expect(mockGameState.night.context.pendingKills[1]).toBeDefined();
            expect(mockGameState.night.context.pendingKills[1]).toHaveLength(1);
            expect(mockGameState.night.context.pendingKills[1][0].role).toBe('boia');

            // Target should not be killed
            expect(mockGameState.night.context.pendingKills[4]).toBeUndefined();

            expect(result).toBeDefined();
            expect(result.type).toBe('boia_action');
            expect(result.targetId).toBe(4);
            expect(result.correct).toBe(false);
        });

        it('should handle empty playerIds array gracefully', () => {
            const action = {
                playerId: 1,
                playerIds: [], // Empty array
                data: { targetId: 4, roleId: 'lupo' },
                used: true
            };

            const result = testBoiaResolve(mockGameState, action);

            // Should not crash and should not kill anyone
            expect(mockGameState.night.context.pendingKills).toEqual({});
            expect(result).toBeDefined();
        });

        it('should handle undefined playerIds gracefully', () => {
            const action = {
                playerId: 1,
                // playerIds is undefined
                data: { targetId: 4, roleId: 'lupo' },
                used: true
            };

            const result = testBoiaResolve(mockGameState, action);

            // Should not crash and should not kill anyone
            expect(mockGameState.night.context.pendingKills).toEqual({});
            expect(result).toBeDefined();
        });
    });
});
