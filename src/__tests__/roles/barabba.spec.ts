import { describe, it, expect, beforeEach, vi } from 'vitest';
import barabba from '../../roles/barabba';
import { useWinConditions } from '../../utils/winConditions';

vi.mock('../../utils/roleUtils', () => ({
    addToHistory: vi.fn(),
    addGroupHistory: vi.fn()
}));

describe('Barabba Role', () => {
    let mockGameState: any;

    beforeEach(() => {
        mockGameState = {
            players: [
                { id: 1, roleId: 'barabba', alive: true },
                { id: 2, roleId: 'lupo', alive: true },
                { id: 3, roleId: 'villico', alive: true }
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
            expect(barabba.id).toBe('barabba');
            expect(barabba.name).toBe('Barabba');
            expect(barabba.team).toBe('villaggio');
            expect(barabba.visibleAsTeam).toBe('villaggio');
            expect(barabba.countAs).toBe('villaggio');
            expect(barabba.color).toBe('#29bb46');
            expect(barabba.phaseOrder).toBe('any');
            
            expect(barabba.actsAtNight).toBe('dead');
        });

        it('should have correct usage and count constraints', () => {
            expect(barabba.effectType).toBe('optional');
            expect(barabba.numberOfUsage).toBe(1);
            expect(barabba.startNight).toBeUndefined();
            expect(barabba.minCount).toBeUndefined();
            expect(barabba.maxCount).toBeUndefined();
        });

    });

    describe('Resolve Function', () => {
        it('should add barabba kill to pendingKills when target is valid', () => {
            const action = {
                playerId: 1,
                data: { targetId: 2 }
            };

            barabba.resolve(mockGameState, action);

            expect(mockGameState.night.context.pendingKills[2]).toBeDefined();
            expect(mockGameState.night.context.pendingKills[2]).toHaveLength(1);
            expect(mockGameState.night.context.pendingKills[2][0]).toEqual({
                role: 'barabba'
            });
        });

        it('should not add kill when targetId is invalid', () => {
            const action = {
                playerId: 1,
                data: { targetId: 'invalid' }
            };

            barabba.resolve(mockGameState, action);

            expect(Object.keys(mockGameState.night.context.pendingKills)).toHaveLength(0);
        });

        it('should not add kill when targetId is undefined', () => {
            const action = {
                playerId: 1,
                data: {}
            };

            barabba.resolve(mockGameState, action);

            expect(Object.keys(mockGameState.night.context.pendingKills)).toHaveLength(0);
        });

        it('should handle multiple targets correctly', () => {
            const action1 = { playerId: 1, data: { targetId: 2 } };
            const action2 = { playerId: 1, data: { targetId: 3 } };

            barabba.resolve(mockGameState, action1);
            barabba.resolve(mockGameState, action2);

            expect(mockGameState.night.context.pendingKills[2]).toBeDefined();
            expect(mockGameState.night.context.pendingKills[3]).toBeDefined();
        });


    });

    describe('Win Condition', () => {
        it('should have a checkWin function', () => {
            expect(typeof barabba.checkWin).toBe('function');
        });
    });

    describe('Count Constraints', () => {
        it('should have no max count limit', () => {
            expect(barabba.maxCount).toBeUndefined();
        });

        it('should have no min count limit', () => {
            expect(barabba.minCount).toBeUndefined();
        });
    });
});
