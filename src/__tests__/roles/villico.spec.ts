import { describe, it, expect, vi } from 'vitest';
import villager from '../../roles/villico';
import { useWinConditions } from '../../utils/winConditions';

describe('Villico (Villager) Role', () => {
    describe('Role Properties', () => {
        it('should have correct basic properties', () => {
            expect(villager.id).toBe('villager');
            expect(villager.name).toBe('Villico');
            expect(villager.team).toBe('villaggio');
            expect(villager.visibleAsTeam).toBe('villaggio');
            expect(villager.countAs).toBe('villaggio');
            expect(villager.color).toBe('#6b7280');
            expect(villager.phaseOrder).toBe('any');
            expect(villager.group).toBe(false);
            		expect(villager.actsAtNight).toBe('never');
        });

        it('should have correct usage and count constraints', () => {
            expect(villager.effectType).toBe('optional');
            expect(villager.numberOfUsage).toBe('unlimited');
            expect(villager.minCount).toBeUndefined();
            expect(villager.maxCount).toBeUndefined();
        });

        it('should have correct component references', () => {
            expect(typeof villager.getPromptComponent).toBe('function');
        });
    });

    describe('Resolve Function', () => {
        it('should do nothing when called', () => {
            const mockGameState = {};
            const mockEntry = {};

            expect(() => villager.resolve(mockGameState, mockEntry)).not.toThrow();
        });
    });

    describe('Win Condition', () => {
        it('should have a checkWin function', () => {
            expect(typeof villager.checkWin).toBe('function');
        });
    });

    describe('Prompt Component', () => {
        it('should return a component function since villager has no night actions', async () => {
            const componentPromise = villager.getPromptComponent();
            const component = await componentPromise;
            
            expect(typeof component).toBe('function');
        });
    });
});
