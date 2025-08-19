import { describe, it, expect, beforeEach, vi } from 'vitest';
import wolf from '../../roles/lupo';

vi.mock('../../utils/winConditions', () => ({
    useWinConditions: vi.fn()
}));

describe('Wolf Role', () => {
    let mockGameState: any;

    beforeEach(() => {
        mockGameState = {
            players: [
                { id: 1, roleId: 'wolf', alive: true },
                { id: 2, roleId: 'villager', alive: true },
                { id: 3, roleId: 'villager', alive: true }
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
            expect(wolf.id).toBe('wolf');
            expect(wolf.name).toBe('Lupo');
            expect(wolf.team).toBe('lupi');
            expect(wolf.visibleAsTeam).toBe('lupi');
            expect(wolf.countAs).toBe('lupi');
            expect(wolf.color).toBe('#ef4444');
            expect(wolf.phaseOrder).toBe(1);
            expect(wolf.group).toBe(true);
            		expect(wolf.actsAtNight).toBe('alive');
        });

        it('should have correct usage and count constraints', () => {
            expect(wolf.usage).toBe('requiredEveryNight');
            expect(wolf.minCount).toBe(1);
            expect(typeof wolf.maxCount).toBe('function');
        });

        it('should have correct component references', () => {
            expect(typeof wolf.getGroupPromptComponent).toBe('function');
            expect(typeof wolf.getGroupResolveDetailsComponent).toBe('function');
        });
    });

    describe('Resolve Function', () => {
        it('should add wolf kill to pendingKills when target is valid', () => {
            const entry = {
                result: { targetId: 2 }
            };

            wolf.resolve(mockGameState, entry);

            expect(mockGameState.night.context.pendingKills[2]).toBeDefined();
            expect(mockGameState.night.context.pendingKills[2]).toHaveLength(1);
            expect(mockGameState.night.context.pendingKills[2][0]).toEqual({
                role: 'wolf',
                notSavable: false
            });
        });

        it('should not add kill when targetId is invalid', () => {
            const entry = {
                result: { targetId: 'invalid' }
            };

            wolf.resolve(mockGameState, entry);

            expect(Object.keys(mockGameState.night.context.pendingKills)).toHaveLength(0);
        });

        it('should not add duplicate wolf kills to same target', () => {
            const entry1 = { result: { targetId: 2 } };
            const entry2 = { result: { targetId: 2 } };

            wolf.resolve(mockGameState, entry1);
            wolf.resolve(mockGameState, entry2);

            expect(mockGameState.night.context.pendingKills[2]).toHaveLength(1);
        });

        it('should handle multiple targets correctly', () => {
            const entry1 = { result: { targetId: 2 } };
            const entry2 = { result: { targetId: 3 } };

            wolf.resolve(mockGameState, entry1);
            wolf.resolve(mockGameState, entry2);

            expect(mockGameState.night.context.pendingKills[2]).toBeDefined();
            expect(mockGameState.night.context.pendingKills[3]).toBeDefined();
        });
    });

    describe('Win Condition', () => {
        it('should have a checkWin function', () => {
            expect(typeof wolf.checkWin).toBe('function');
        });
    });

    describe('Max Count Calculation', () => {
        it('should calculate max count based on player count', () => {
            const stateWith5Players = { setup: { numPlayers: 5 } };
            const stateWith10Players = { setup: { numPlayers: 10 } };

            expect(wolf.maxCount(stateWith5Players)).toBe(2);
            expect(wolf.maxCount(stateWith10Players)).toBe(4);
        });

        it('should handle undefined state gracefully', () => {
            expect(wolf.maxCount(undefined)).toBe(1);
        });
    });
});
