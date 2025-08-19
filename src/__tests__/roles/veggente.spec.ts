import { describe, it, expect, beforeEach } from 'vitest';
import medium from '../../roles/veggente';
import { createTestState } from '../../core/engine';

describe('Veggente Role', () => {
    let mockGameState: any;

    beforeEach(() => {
        mockGameState = createTestState();
    });

    it('should have correct properties', () => {
        expect(medium.id).toBe('medium');
        expect(medium.name).toBe('Veggente');
        expect(medium.team).toBe('villaggio');
        expect(medium.visibleAsTeam).toBe('villaggio');
        expect(medium.phaseOrder).toBe('any');
        expect(medium.usage).toBe('unlimited');
        expect(medium.minCount).toBeUndefined();
        expect(medium.maxCount).toBeUndefined();
    });

    it('should add investigation event to history when target is valid', () => {
        const entry = {
            result: { targetId: 2 },
            playerId: 1
        };

        medium.resolve(mockGameState, entry);

        expect(mockGameState.history[1]).toBeDefined();
        expect(mockGameState.history[1][1]).toEqual({
            type: 'veggente_investigation',
            nightNumber: 1,
            playerId: 1,
            data: {
                target: 2,
                targetName: 'Giocatore 2',
                targetRole: 'wolf',
                discoveredFaction: 'lupi',
                answer: 'lupi'
            }
        });
    });

    it('should handle missing target gracefully', () => {
        const entry = {
            result: { targetId: 999 },
            playerId: 1
        };

        medium.resolve(mockGameState, entry);

        expect(mockGameState.history[1]).toBeDefined();
        expect(mockGameState.history[1][1].data.discoveredFaction).toBeUndefined();
    });

    it('should handle multiple investigations correctly', () => {
        const entry1 = {
            result: { targetId: 2 },
            playerId: 1
        };
        const entry2 = {
            result: { targetId: 3 },
            playerId: 2
        };

        medium.resolve(mockGameState, entry1);
        medium.resolve(mockGameState, entry2);

        expect(mockGameState.history[1]).toBeDefined();
        expect(mockGameState.history[1][1].data.target).toBe(2);
        expect(mockGameState.history[1][2].data.target).toBe(3);
    });

    it('should use visibleAsTeam from role state when available', () => {
        const targetPlayer = mockGameState.players.find((p: any) => p.id === 3);
        targetPlayer.roleState.visibleAsTeam = 'lupi';

        const entry = {
            result: { targetId: 3 },
            playerId: 1
        };

        medium.resolve(mockGameState, entry);

        expect(mockGameState.history[1][1].data.discoveredFaction).toBe('lupi');
    });

    it('should fallback to realTeam when visibleAsTeam is not available', () => {
        const targetPlayer = mockGameState.players.find((p: any) => p.id === 3);
        targetPlayer.roleState.visibleAsTeam = undefined;

        const entry = {
            result: { targetId: 3 },
            playerId: 1
        };

        medium.resolve(mockGameState, entry);

        expect(mockGameState.history[1][1].data.discoveredFaction).toBe('villaggio');
    });

    it('should handle missing role state gracefully', () => {
        const targetPlayer = mockGameState.players.find((p: any) => p.id === 3);
        targetPlayer.roleState = undefined;

        const entry = {
            result: { targetId: 3 },
            playerId: 1
        };

        medium.resolve(mockGameState, entry);

        expect(mockGameState.history[1][1].data.discoveredFaction).toBeUndefined();
    });
});
