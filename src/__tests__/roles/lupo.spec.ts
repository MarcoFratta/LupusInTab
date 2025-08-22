import { describe, it, expect, beforeEach, vi } from 'vitest';
import lupo from '../../roles/lupo';

vi.mock('../../utils/winConditions', () => ({
    useWinConditions: vi.fn()
}));

describe('Wolf Role', () => {
    let mockGameState: any;

    beforeEach(() => {
        mockGameState = {
            players: [
                { id: 1, roleId: 'lupo', alive: true },
                            { id: 2, roleId: 'villico', alive: true },
            { id: 3, roleId: 'villico', alive: true }
            ],
            night: {
                context: {
                    pendingKills: {}
                }
            }
        };
    });

    describe('Role Properties', () => {
        it('should have correct basic properties', () => {
            expect(lupo.id).toBe('lupo');
            expect(lupo.name).toBe('Lupi');
            expect(lupo.team).toBe('lupi');
            expect(lupo.visibleAsTeam).toBe('lupi');
            expect(lupo.countAs).toBe('lupi');
            expect(lupo.color).toBe('#ef4444');
            expect(lupo.phaseOrder).toBe(1);
            
            		expect(lupo.actsAtNight).toBe('alive');
        });

        it('should have correct usage and count constraints', () => {
            expect(lupo.effectType).toBe('required');
            expect(lupo.numberOfUsage).toBe('unlimited');
            expect(lupo.minCount).toBe(1);
            expect(typeof lupo.maxCount).toBe('function');
        });
    });

    describe('Resolve Function', () => {
        it('should add lupo kill to pendingKills when target is valid', () => {
            const entry = {
                result: { targetId: 2 }
            };

            lupo.resolve(mockGameState, entry);

            expect(mockGameState.night.context.pendingKills[2]).toBeDefined();
            expect(mockGameState.night.context.pendingKills[2]).toHaveLength(1);
            expect(mockGameState.night.context.pendingKills[2][0]).toEqual({
                role: 'lupo'
            });
        });

        it('should not add kill when targetId is invalid', () => {
            const entry = {
                result: { targetId: 'invalid' }
            };

            lupo.resolve(mockGameState, entry);

            expect(Object.keys(mockGameState.night.context.pendingKills)).toHaveLength(0);
        });

        it('should not add duplicate lupo kills to same target', () => {
            const entry1 = { result: { targetId: 2 } };
            const entry2 = { result: { targetId: 2 } };

            lupo.resolve(mockGameState, entry1);
            lupo.resolve(mockGameState, entry2);

            expect(mockGameState.night.context.pendingKills[2]).toHaveLength(1);
        });

        it('should handle multiple targets correctly', () => {
            const entry1 = { result: { targetId: 2 } };
            const entry2 = { result: { targetId: 3 } };

            lupo.resolve(mockGameState, entry1);
            lupo.resolve(mockGameState, entry2);

            expect(mockGameState.night.context.pendingKills[2]).toBeDefined();
            expect(mockGameState.night.context.pendingKills[3]).toBeDefined();
        });
    });

    describe('Win Condition', () => {
        it('should have a checkWin function', () => {
            expect(typeof lupo.checkWin).toBe('function');
        });
    });

    describe('Max Count Calculation', () => {
        it('should calculate max count based on player count', () => {
            const stateWith5Players = { setup: { numPlayers: 5 } };
            const stateWith10Players = { setup: { numPlayers: 10 } };

            expect(lupo.maxCount(stateWith5Players)).toBe(2);
            expect(lupo.maxCount(stateWith10Players)).toBe(4);
        });

        it('should handle undefined state gracefully', () => {
            expect(lupo.maxCount(undefined)).toBe(1);
        });
    });
});
