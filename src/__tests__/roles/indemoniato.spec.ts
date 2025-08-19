import { describe, it, expect } from 'vitest';
import indemoniato from '../../roles/indemoniato';

describe('Indemoniato (Demoniac) Role', () => {
    describe('Role Properties', () => {
        it('should have correct basic properties', () => {
            expect(indemoniato.id).toBe('demoniac');
            expect(indemoniato.name).toBe('Indemoniato');
            expect(indemoniato.team).toBe('lupi');
            expect(indemoniato.visibleAsTeam).toBe('lupi');
            expect(indemoniato.countAs).toBe('villaggio');
            expect(indemoniato.color).toBe('#fb7185');
            expect(indemoniato.phaseOrder).toBe('any');
            expect(indemoniato.group).toBe(false);
            		expect(indemoniato.actsAtNight).toBe('never');
        });

        it('should have correct usage and count constraints', () => {
            expect(indemoniato.usage).toBe('unlimited');
            expect(indemoniato.minCount).toBeUndefined();
            expect(indemoniato.maxCount).toBeUndefined();
        });

        it('should have correct component references', () => {
            expect(indemoniato.getPromptComponent).toBeUndefined();
        });
    });

    describe('Resolve Function', () => {
        it('should do nothing when called', () => {
            const mockGameState = {};
            const mockEntry = {};

            expect(() => indemoniato.resolve(mockGameState, mockEntry)).not.toThrow();
        });
    });

    describe('Win Condition', () => {
        it('should not have a custom checkWin function', () => {
            expect(indemoniato.checkWin).toBeUndefined();
        });
    });

    describe('Count Constraints', () => {
        it('should have no max count limit', () => {
            expect(indemoniato.maxCount).toBeUndefined();
        });

        it('should have no min count limit', () => {
            expect(indemoniato.minCount).toBeUndefined();
        });
    });

    describe('Team vs CountAs', () => {
        it('should play for lupi team but count as villaggio for wins', () => {
            expect(indemoniato.team).toBe('lupi');
            expect(indemoniato.countAs).toBe('villaggio');
        });
    });
});
