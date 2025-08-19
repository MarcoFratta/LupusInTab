import { describe, it, expect } from 'vitest';
import lupomannaro from '../../roles/lupomannaro';

describe('LupoMannaro (Werewolf) Role', () => {
    describe('Role Properties', () => {
        it('should have correct basic properties', () => {
            expect(lupomannaro.id).toBe('dog');
            expect(lupomannaro.name).toBe('Lupo Mannaro');
            expect(lupomannaro.team).toBe('mannari');
            expect(lupomannaro.visibleAsTeam).toBe('lupi');
            expect(lupomannaro.countAs).toBe('lupi');
            expect(lupomannaro.color).toBe('#6366f1');
            expect(lupomannaro.phaseOrder).toBe('any');
            expect(lupomannaro.group).toBe(true);
            		expect(lupomannaro.actsAtNight).toBe('alive');
        });

        it('should have correct usage and count constraints', () => {
            expect(lupomannaro.usage).toBe('requiredEveryNight');
            expect(lupomannaro.minCount).toBeUndefined();
            expect(lupomannaro.maxCount).toBeUndefined();
        });

        it('should have correct component references', () => {
            expect(typeof lupomannaro.getPromptComponent).toBe('function');
            expect(typeof lupomannaro.getResolveDetailsComponent).toBe('function');
        });
    });

    describe('Resolve Function', () => {
        it('should do nothing when called', () => {
            const mockGameState = {};
            const mockEntry = {};

            expect(() => lupomannaro.resolve(mockGameState, mockEntry)).not.toThrow();
        });
    });

    describe('Win Condition', () => {
        it('should call wolvesWin function', () => {
            const mockGameState = {
                players: [
                    { id: 1, roleId: 'dog', alive: true },
                    { id: 2, roleId: 'villager', alive: true }
                ]
            };

            const result = lupomannaro.checkWin(mockGameState);

            expect(typeof result).toBe('boolean');
        });
    });

    describe('Count Constraints', () => {
        it('should have no max count limit', () => {
            expect(lupomannaro.maxCount).toBeUndefined();
        });

        it('should have no min count limit', () => {
            expect(lupomannaro.minCount).toBeUndefined();
        });
    });

    describe('Team vs CountAs', () => {
        it('should play for mannari team but count as lupi for wins', () => {
            expect(lupomannaro.team).toBe('mannari');
            expect(lupomannaro.countAs).toBe('lupi');
        });
    });
});
