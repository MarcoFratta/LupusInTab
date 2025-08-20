import { describe, it, expect, beforeEach, vi } from 'vitest';
import angelo from '../../roles/angelo';
import { useWinConditions } from '../../utils/winConditions';

vi.mock('../../utils/roleUtils', () => ({
    addToHistory: vi.fn()
}));

describe('Angelo Role', () => {
    let mockGameState: any;

    beforeEach(() => {
        mockGameState = {
            players: [
                { id: 1, roleId: 'angelo', alive: true },
                { id: 2, roleId: 'wolf', alive: false },
                { id: 3, roleId: 'villager', alive: false }
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
            expect(angelo.id).toBe('angelo');
            expect(angelo.name).toBe('Angelo');
            expect(angelo.team).toBe('villaggio');
            expect(angelo.visibleAsTeam).toBe('villaggio');
            expect(angelo.countAs).toBe('villaggio');
            expect(angelo.color).toBe('#fbbf24');
            expect(angelo.phaseOrder).toBe('any');
            expect(angelo.group).toBe(false);
            expect(angelo.actsAtNight).toBe('alive');
        });

        it('should have correct usage and count constraints', () => {
            expect(angelo.effectType).toBe('optional');
            expect(angelo.numberOfUsage).toBe(1);
            expect(angelo.startNight).toBeUndefined();
            expect(angelo.minCount).toBeUndefined();
            expect(angelo.maxCount).toBeUndefined();
        });

        it('should have correct component references', () => {
            expect(typeof angelo.getPromptComponent).toBe('function');
            expect(typeof angelo.getResolveDetailsComponent).toBe('function');
        });
    });

    describe('Resolve Function', () => {
        it('should resurrect dead player when target is valid', () => {
            const action = {
                playerId: 1,
                data: { targetId: 2 }
            };

            const targetBefore = mockGameState.players.find(p => p.id === 2);
            expect(targetBefore.alive).toBe(false);

            angelo.resolve(mockGameState, action);

            const targetAfter = mockGameState.players.find(p => p.id === 2);
            expect(targetAfter.alive).toBe(true);
        });

        it('should not resurrect when targetId is invalid', () => {
            const action = {
                playerId: 1,
                data: { targetId: 'invalid' }
            };

            const targetBefore = mockGameState.players.find(p => p.id === 2);
            expect(targetBefore.alive).toBe(false);

            angelo.resolve(mockGameState, action);

            const targetAfter = mockGameState.players.find(p => p.id === 2);
            expect(targetAfter.alive).toBe(false);
        });

        it('should not resurrect when targetId is undefined', () => {
            const action = {
                playerId: 1,
                data: {}
            };

            const targetBefore = mockGameState.players.find(p => p.id === 2);
            expect(targetBefore.alive).toBe(false);

            angelo.resolve(mockGameState, action);

            const targetAfter = mockGameState.players.find(p => p.id === 2);
            expect(targetAfter.alive).toBe(false);
        });

        it('should not resurrect already alive players', () => {
            const action = {
                playerId: 1,
                data: { targetId: 1 }
            };

            const targetBefore = mockGameState.players.find(p => p.id === 1);
            expect(targetBefore.alive).toBe(true);

            angelo.resolve(mockGameState, action);

            const targetAfter = mockGameState.players.find(p => p.id === 1);
            expect(targetAfter.alive).toBe(true);
        });


    });

    describe('Win Condition', () => {
        it('should have a checkWin function', () => {
            expect(typeof angelo.checkWin).toBe('function');
        });
    });

    describe('Count Constraints', () => {
        it('should have no max count limit', () => {
            expect(angelo.maxCount).toBeUndefined();
        });

        it('should have no min count limit', () => {
            expect(angelo.minCount).toBeUndefined();
        });
    });
});
