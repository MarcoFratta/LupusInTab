import { describe, it, expect, beforeEach, vi } from 'vitest';
import justicer from '../../roles/giustiziere';
import { useWinConditions } from '../../utils/winConditions';

// Mock the addToHistory function
vi.mock('../../utils/roleUtils', () => ({
    addToHistory: vi.fn()
}));

describe('Giustiziere (Justicer) Role', () => {
    let mockGameState: any;

    beforeEach(() => {
        mockGameState = {
            players: [
                { id: 1, roleId: 'justicer', alive: true },
                { id: 2, roleId: 'wolf', alive: true },
                { id: 3, roleId: 'villager', alive: true }
            ],
            nightNumber: 1,
            night: {
                context: {
                    pendingKills: {}
                }
            }
        };
    });

    describe('Role Properties', () => {
        it('should have correct basic properties', () => {
            expect(justicer.id).toBe('justicer');
            expect(justicer.name).toBe('Giustiziere');
            expect(justicer.team).toBe('villaggio');
            expect(justicer.visibleAsTeam).toBe('villaggio');
            expect(justicer.countAs).toBe('villaggio');
            expect(justicer.color).toBe('#dc2626');
            expect(justicer.phaseOrder).toBe('any');
            expect(justicer.group).toBe(false);
            		expect(justicer.actsAtNight).toBe('alive');
        });

        it('should have correct usage and count constraints', () => {
            expect(justicer.effectType).toBe('optional');
            expect(justicer.numberOfUsage).toBe(1);
            expect(justicer.minCount).toBeUndefined();
            expect(justicer.maxCount).toBeUndefined();
        });

        it('should have correct component references', () => {
            expect(typeof justicer.getPromptComponent).toBe('function');
            expect(typeof justicer.getResolveDetailsComponent).toBe('function');
        });
    });

    describe('Resolve Function', () => {
        it('should add justicer kill to pendingKills when target is valid', () => {
            const action = {
                playerId: 1,
                data: { targetId: 2 }
            };

            justicer.resolve(mockGameState, action);

            expect(mockGameState.night.context.pendingKills[2]).toBeDefined();
            expect(mockGameState.night.context.pendingKills[2]).toHaveLength(1);
            expect(mockGameState.night.context.pendingKills[2][0]).toEqual({
                role: 'justicer'
            });
        });

        it('should not add kill when targetId is invalid', () => {
            const action = {
                playerId: 1,
                data: { targetId: 'invalid' }
            };

            justicer.resolve(mockGameState, action);

            expect(Object.keys(mockGameState.night.context.pendingKills)).toHaveLength(0);
        });

        it('should not add kill when targetId is undefined', () => {
            const action = {
                playerId: 1,
                data: {}
            };

            justicer.resolve(mockGameState, action);

            expect(Object.keys(mockGameState.night.context.pendingKills)).toHaveLength(0);
        });

        it('should handle multiple targets correctly', () => {
            const action1 = { playerId: 1, data: { targetId: 2 } };
            const action2 = { playerId: 1, data: { targetId: 3 } };

            justicer.resolve(mockGameState, action1);
            justicer.resolve(mockGameState, action2);

            expect(mockGameState.night.context.pendingKills[2]).toBeDefined();
            expect(mockGameState.night.context.pendingKills[3]).toBeDefined();
        });


    });

    describe('Win Condition', () => {
        it('should have a checkWin function', () => {
            expect(typeof justicer.checkWin).toBe('function');
        });
    });

    describe('Count Constraints', () => {
        it('should have no max count limit', () => {
            expect(justicer.maxCount).toBeUndefined();
        });

        it('should have no min count limit', () => {
            expect(justicer.minCount).toBeUndefined();
        });
    });
});
