import { describe, it, expect, beforeEach, vi } from 'vitest';
import giustiziere from '../../roles/giustiziere';
import { useWinConditions } from '../../utils/winConditions';

// Mock the addToHistory function
vi.mock('../../utils/roleUtils', () => ({
    addToHistory: vi.fn(),
    addGroupHistory: vi.fn()
}));

describe('Giustiziere (Justicer) Role', () => {
    let mockGameState: any;

    beforeEach(() => {
        mockGameState = {
            players: [
                { id: 1, roleId: 'giustiziere', alive: true },
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
            expect(giustiziere.id).toBe('giustiziere');
            expect(giustiziere.name).toBe('Giustiziere');
            expect(giustiziere.team).toBe('villaggio');
            expect(giustiziere.visibleAsTeam).toBe('villaggio');
            expect(giustiziere.countAs).toBe('villaggio');
            expect(giustiziere.color).toBe('#dc2626');
            expect(giustiziere.phaseOrder).toBe('any');
            
            		expect(giustiziere.actsAtNight).toBe('alive');
        });

        it('should have correct usage and count constraints', () => {
            expect(giustiziere.effectType).toBe('optional');
            expect(giustiziere.numberOfUsage).toBe(1);
            expect(giustiziere.minCount).toBeUndefined();
            expect(giustiziere.maxCount).toBeUndefined();
        });

    });

    describe('Resolve Function', () => {
        it('should add giustiziere kill to pendingKills when target is valid', () => {
            const action = {
                data: { targetId: 2 },
                playerId: 1
            };

            giustiziere.resolve(mockGameState, action);

            expect(mockGameState.night.context.pendingKills[2]).toHaveLength(1);
            expect(mockGameState.night.context.pendingKills[2][0]).toEqual({
                role: 'giustiziere'
            });
        });

        it('should not add kill when targetId is invalid', () => {
            const action = {
                data: { targetId: 'invalid' },
                playerId: 1
            };

            giustiziere.resolve(mockGameState, action);

            expect(mockGameState.night.context.pendingKills[2]).toBeUndefined();
        });

        it('should initialize pendingKills array if it does not exist', () => {
            delete mockGameState.night.context.pendingKills;

            const action = {
                data: { targetId: 2 },
                playerId: 1
            };

            giustiziere.resolve(mockGameState, action);

            expect(Array.isArray(mockGameState.night.context.pendingKills[2])).toBe(true);
        });

        it('should handle multiple kills correctly', () => {
            const action1 = { data: { targetId: 2 }, playerId: 1 };
            const action2 = { data: { targetId: 3 }, playerId: 1 };

            giustiziere.resolve(mockGameState, action1);
            giustiziere.resolve(mockGameState, action2);

            expect(mockGameState.night.context.pendingKills[2]).toHaveLength(1);
            expect(mockGameState.night.context.pendingKills[3]).toHaveLength(1);
        });


    });

    describe('Win Condition', () => {
        it('should use village win condition', () => {
            expect(typeof giustiziere.checkWin).toBe('function');
        });
    });

    describe('Count Constraints', () => {
        it('should have no max count limit', () => {
            expect(giustiziere.maxCount).toBeUndefined();
        });

        it('should have no min count limit', () => {
            expect(giustiziere.minCount).toBeUndefined();
        });
    });

    describe('Team vs CountAs', () => {
        it('should play for villaggio team and count as villaggio for wins', () => {
            expect(giustiziere.team).toBe('villaggio');
            expect(giustiziere.countAs).toBe('villaggio');
        });
    });
});
