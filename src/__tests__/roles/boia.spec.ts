import { describe, it, expect, beforeEach, vi } from 'vitest';
import boia from '../../roles/boia';
import { useWinConditions } from '../../utils/winConditions';

// Mock the addToHistory function
vi.mock('../../utils/roleUtils', () => ({
    addToHistory: vi.fn(),
    addGroupHistory: vi.fn()
}));

describe('Boia (Hangman) Role', () => {
    let mockGameState: any;

    beforeEach(() => {
        mockGameState = {
            players: [
                { id: 1, roleId: 'boia', alive: true },
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
            expect(boia.id).toBe('boia');
            expect(boia.name).toBe('Boia');
            expect(boia.team).toBe('lupi');
            expect(boia.visibleAsTeam).toBe('lupi');
            expect(boia.countAs).toBe('villaggio');
            expect(boia.color).toBe('#7c3aed');
            expect(boia.phaseOrder).toBe(2);
            
            		expect(boia.actsAtNight).toBe('alive');
        });

        it('should have correct usage and count constraints', () => {
            expect(boia.effectType).toBe('optional');
            expect(boia.numberOfUsage).toBe(1);
        });

    });

    describe('Resolve Function', () => {
        it('should kill target when guess is correct', () => {
            const action = {
                playerId: 1,
                data: { targetId: 2, roleId: 'lupo' }
            };

            boia.resolve(mockGameState, action);

            expect(mockGameState.night.context.pendingKills[2]).toBeDefined();
            expect(mockGameState.night.context.pendingKills[2]).toHaveLength(1);
            expect(mockGameState.night.context.pendingKills[2][0]).toEqual({
                role: 'boia'
            });
        });

        it('should kill Boia when guess is incorrect', () => {
            const action = {
                playerId: 1,
                data: { targetId: 2, roleId: 'villico' } // Wrong guess
            };

            boia.resolve(mockGameState, action);

            expect(mockGameState.night.context.pendingKills[1]).toBeDefined(); // Boia kills himself
            expect(mockGameState.night.context.pendingKills[1]).toHaveLength(1);
            expect(mockGameState.night.context.pendingKills[1][0]).toEqual({
                role: 'boia'
            });
            expect(mockGameState.night.context.pendingKills[2]).toBeUndefined(); // Target survives
        });

        it('should not add kill when targetId is invalid', () => {
            const action = {
                playerId: 1,
                data: { targetId: 'invalid', roleId: 'lupo' }
            };

            boia.resolve(mockGameState, action);

            expect(Object.keys(mockGameState.night.context.pendingKills)).toHaveLength(0);
        });

        it('should not add kill when targetId is undefined', () => {
            const action = {
                playerId: 1,
                data: { roleId: 'lupo' }
            };

            boia.resolve(mockGameState, action);

            expect(Object.keys(mockGameState.night.context.pendingKills)).toHaveLength(0);
        });


    });

    describe('Win Condition', () => {
        it('should have a checkWin function', () => {
            expect(typeof boia.checkWin).toBe('function');
        });
    });


});
