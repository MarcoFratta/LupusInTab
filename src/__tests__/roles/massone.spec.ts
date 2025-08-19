import { describe, it, expect, vi } from 'vitest';
import lover from '../../roles/massone';
import { useWinConditions } from '../../utils/winConditions';

describe('Massone (Lover) Role', () => {
    describe('Role Properties', () => {
        it('should have correct basic properties', () => {
            expect(lover.id).toBe('lover');
            expect(lover.name).toBe('Massone');
            expect(lover.team).toBe('villaggio');
            expect(lover.visibleAsTeam).toBe('villaggio');
            expect(lover.countAs).toBe('villaggio');
            expect(lover.color).toBe('#ec4899');
            expect(lover.phaseOrder).toBe('any');
            expect(lover.group).toBe(false);
            		expect(lover.actsAtNight).toBe('never');
        });

        it('should have correct usage and count constraints', () => {
            expect(lover.usage).toBe('unlimited');
            expect(lover.minCount).toBe(2);
            expect(lover.maxCount).toBeUndefined();
        });

        it('should have correct component references', () => {
            expect(lover.getPromptComponent).toBeUndefined();
        });
    });

    describe('Resolve Function', () => {
        it('should do nothing when called', () => {
            const mockGameState = {};
            const mockEntry = {};

            expect(() => lover.resolve(mockGameState, mockEntry)).not.toThrow();
        });
    });

    describe('Win Condition', () => {
        it('should have a checkWin function', () => {
            expect(typeof lover.checkWin).toBe('function');
        });
    });

    describe('Prompt Component', () => {
        it('should not have a prompt component since it never acts at night', () => {
            expect(lover.getPromptComponent).toBeUndefined();
        });
    });
});
