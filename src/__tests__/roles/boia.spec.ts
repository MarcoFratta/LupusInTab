import { describe, it, expect, beforeEach, vi } from 'vitest';
import hangman from '../../roles/boia';
import { useWinConditions } from '../../utils/winConditions';

// Mock the addToHistory function
vi.mock('../../utils/roleUtils', () => ({
    addToHistory: vi.fn()
}));

describe('Boia (Hangman) Role', () => {
    let mockGameState: any;

    beforeEach(() => {
        mockGameState = {
            players: [
                { id: 1, roleId: 'hangman', alive: true },
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
            expect(hangman.id).toBe('hangman');
            expect(hangman.name).toBe('Boia');
            expect(hangman.team).toBe('lupi');
            expect(hangman.visibleAsTeam).toBe('lupi');
            expect(hangman.countAs).toBe('villaggio');
            expect(hangman.color).toBe('#7c3aed');
            expect(hangman.phaseOrder).toBe(2);
            expect(hangman.group).toBe(false);
            		expect(hangman.actsAtNight).toBe('alive');
        });

        it('should have correct usage and count constraints', () => {
            expect(hangman.effectType).toBe('optional');
            expect(hangman.numberOfUsage).toBe(1);
            expect(hangman.minCount).toBe(1);
            expect(typeof hangman.maxCount).toBe('function');
        });

        it('should have correct component references', () => {
            expect(typeof hangman.getPromptComponent).toBe('function');
            expect(typeof hangman.getResolveDetailsComponent).toBe('function');
        });
    });

    describe('Resolve Function', () => {
        it('should kill target when guess is correct', () => {
            const action = {
                playerId: 1,
                data: { targetId: 2, roleId: 'wolf' }
            };

            hangman.resolve(mockGameState, action);

            expect(mockGameState.night.context.pendingKills[2]).toBeDefined();
            expect(mockGameState.night.context.pendingKills[2]).toHaveLength(1);
            expect(mockGameState.night.context.pendingKills[2][0]).toEqual({
                role: 'hangman'
            });
        });

        it('should kill Boia when guess is incorrect', () => {
            const action = {
                playerId: 1,
                data: { targetId: 2, roleId: 'villager' } // Wrong guess
            };

            hangman.resolve(mockGameState, action);

            expect(mockGameState.night.context.pendingKills[1]).toBeDefined(); // Boia kills himself
            expect(mockGameState.night.context.pendingKills[1]).toHaveLength(1);
            expect(mockGameState.night.context.pendingKills[1][0]).toEqual({
                role: 'hangman'
            });
            expect(mockGameState.night.context.pendingKills[2]).toBeUndefined(); // Target survives
        });

        it('should not add kill when targetId is invalid', () => {
            const action = {
                playerId: 1,
                data: { targetId: 'invalid', roleId: 'wolf' }
            };

            hangman.resolve(mockGameState, action);

            expect(Object.keys(mockGameState.night.context.pendingKills)).toHaveLength(0);
        });

        it('should not add kill when targetId is undefined', () => {
            const action = {
                playerId: 1,
                data: { roleId: 'wolf' }
            };

            hangman.resolve(mockGameState, action);

            expect(Object.keys(mockGameState.night.context.pendingKills)).toHaveLength(0);
        });


    });

    describe('Win Condition', () => {
        it('should have a checkWin function', () => {
            expect(typeof hangman.checkWin).toBe('function');
        });
    });

    describe('Max Count Calculation', () => {
        it('should calculate max count based on player count', () => {
            const stateWith5Players = { setup: { numPlayers: 5 } };
            const stateWith10Players = { setup: { numPlayers: 10 } };

            expect(typeof hangman.maxCount).toBe('function');
            const maxCountFn = hangman.maxCount as (state: any) => number;
            expect(maxCountFn(stateWith5Players)).toBe(5);
            expect(maxCountFn(stateWith10Players)).toBe(10);
        });

        it('should handle undefined state gracefully', () => {
            expect(typeof hangman.maxCount).toBe('function');
            const maxCountFn = hangman.maxCount as (state: any) => number;
            expect(maxCountFn(undefined)).toBe(0);
        });
    });
});
