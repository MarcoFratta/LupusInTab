import { describe, it, expect, beforeEach, vi } from 'vitest';
import illusionista from '../../roles/illusionista';

// Mock the addToHistory function
vi.mock('../../utils/roleUtils', () => ({
    addToHistory: vi.fn()
}));

describe('Illusionista Role', () => {
    let mockGameState: any;

    beforeEach(() => {
        mockGameState = {
            players: [
                { id: 1, roleId: 'illusionista', alive: true, roleState: { actsAtNight: 'alive' } },
                { id: 2, roleId: 'wolf', alive: true, roleState: { actsAtNight: 'alive' } },
                { id: 3, roleId: 'villager', alive: true, roleState: { actsAtNight: 'alive' } }
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
            expect(illusionista.id).toBe('illusionista');
            expect(illusionista.name).toBe('Illusionista');
            expect(illusionista.team).toBe('lupi');
            expect(illusionista.visibleAsTeam).toBe('villaggio');
            expect(illusionista.countAs).toBe('villaggio');
            expect(illusionista.color).toBe('#06b6d4');
            expect(illusionista.phaseOrder).toBe(0);
            expect(illusionista.group).toBe(false);
            expect(illusionista.actsAtNight).toBe('alive');
        });

        it('should be a wolf that appears as village', () => {
            expect(illusionista.team).toBe('lupi');
            expect(illusionista.visibleAsTeam).toBe('villaggio');
            expect(illusionista.countAs).toBe('villaggio');
        });

        it('should have correct usage and count constraints', () => {
            expect(illusionista.effectType).toBe('optional');
            expect(illusionista.numberOfUsage).toBe(1);
            expect(illusionista.startNight).toBe(2);
        });

        it('should have correct component references', () => {
            expect(typeof illusionista.getPromptComponent).toBe('function');
            expect(typeof illusionista.getResolveDetailsComponent).toBe('function');
        });
    });

    describe('Resolve Function', () => {
        it('should block target player when target is valid', () => {
            const action = {
                playerId: 1,
                data: { targetId: 2 }
            };

            illusionista.resolve(mockGameState, action);

            expect(mockGameState.players[1].roleState.actsAtNight).toBe('blocked');
        });

        it('should not block when targetId is invalid', () => {
            const action = {
                playerId: 1,
                data: { targetId: 'invalid' }
            };

            illusionista.resolve(mockGameState, action);

            expect(mockGameState.players[1].roleState.actsAtNight).toBe('alive');
        });

        it('should not block when targetId is undefined', () => {
            const action = {
                playerId: 1,
                data: {}
            };

            illusionista.resolve(mockGameState, action);

            expect(mockGameState.players[1].roleState.actsAtNight).toBe('alive');
        });

        it('should handle multiple blocks correctly', () => {
            const action1 = { playerId: 1, data: { targetId: 2 } };
            const action2 = { playerId: 1, data: { targetId: 3 } };

            illusionista.resolve(mockGameState, action1);
            illusionista.resolve(mockGameState, action2);

            expect(mockGameState.players[1].roleState.actsAtNight).toBe('blocked');
            expect(mockGameState.players[2].roleState.actsAtNight).toBe('blocked');
        });
    });

    describe('Win Condition', () => {
        it('should have a checkWin function', () => {
            expect(typeof illusionista.checkWin).toBe('function');
        });
    });
});
