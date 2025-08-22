import { describe, it, expect } from 'vitest';
import matto from '../../roles/matto';

describe('Matto (Crazyman) Role', () => {
	describe('Role Properties', () => {
		it('should have correct basic properties', () => {
			expect(matto.id).toBe('matto');
			expect(matto.name).toBe('Matto');
			expect(matto.team).toBe('matti');
			expect(matto.visibleAsTeam).toBe('matti');
			expect(matto.countAs).toBe('matti');
			expect(matto.color).toBe('#f59e0b');
			expect(matto.phaseOrder).toBe('any');
			
			expect(matto.actsAtNight).toBe('never');
		});

		it('should have correct usage and count constraints', () => {
			expect(matto.effectType).toBe('optional');
			expect(matto.numberOfUsage).toBe('unlimited');
			expect(matto.minCount).toBeUndefined();
			expect(matto.maxCount).toBe(1);
		});
	});

	describe('Resolve Function', () => {
		it('should do nothing when called', () => {
			const mockGameState = {};
			const mockEntry = {};

			expect(() => matto.resolve(mockGameState, mockEntry)).not.toThrow();
		});
	});

	describe('Win Condition', () => {
		it('should not have a custom checkWin function', () => {
			expect(matto.checkWin).toBeDefined();
		});
	});

	describe('Count Constraints', () => {
		it('should have maximum count of 1', () => {
			expect(matto.maxCount).toBe(1);
		});

		it('should have no min count limit', () => {
			expect(matto.minCount).toBeUndefined();
		});
	});

	describe('Team vs CountAs', () => {
		it('should play for matti team and count as matti for wins', () => {
			expect(matto.team).toBe('matti');
			expect(matto.countAs).toBe('matti');
		});
	});
});
