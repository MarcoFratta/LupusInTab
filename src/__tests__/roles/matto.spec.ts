import { describe, it, expect } from 'vitest';
import crazyman from '../../roles/matto';

describe('Matto (Crazyman) Role', () => {
    describe('Role Properties', () => {
        it('should have correct basic properties', () => {
            expect(crazyman.id).toBe('crazyman');
            expect(crazyman.name).toBe('Matto');
            expect(crazyman.team).toBe('matti');
            expect(crazyman.visibleAsTeam).toBe('matti');
            expect(crazyman.countAs).toBe('matti');
            expect(crazyman.color).toBe('#f59e0b');
            expect(crazyman.phaseOrder).toBe('any');
            expect(crazyman.group).toBe(false);
            		expect(crazyman.actsAtNight).toBe('never');
        });

        it('should have correct usage and count constraints', () => {
            expect(crazyman.usage).toBe('unlimited');
            expect(crazyman.minCount).toBeUndefined();
            expect(crazyman.maxCount).toBe(1);
        });

        it('should have correct component references', () => {
            expect(crazyman.getPromptComponent).toBeUndefined();
        });
    });

    describe('Resolve Function', () => {
        it('should do nothing when called', () => {
            const mockGameState = {};
            const mockEntry = {};

            expect(() => crazyman.resolve(mockGameState, mockEntry)).not.toThrow();
        });
    });

    describe('Win Condition', () => {
        it('should return false since win is handled at lynch time', () => {
            const mockGameState = {};

            const result = crazyman.checkWin(mockGameState);

            expect(result).toBe(false);
        });
    });

    describe('Prompt Component', () => {
        it('should not have a prompt component since crazyman has no night actions', () => {
            expect(crazyman.getPromptComponent).toBeUndefined();
        });
    });

    describe('Count Constraints', () => {
        it('should have fixed max count of 1', () => {
            expect(crazyman.maxCount).toBe(1);
        });

        it('should have no min count limit', () => {
            expect(crazyman.minCount).toBeUndefined();
        });
    });
});
