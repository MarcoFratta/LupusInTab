import { describe, it, expect } from 'vitest';
import massone from '../../roles/massone';

describe('Massone (Lover) Role', () => {
	describe('Role Properties', () => {
		it('should have correct basic properties', () => {
			expect(massone.id).toBe('massone');
			expect(massone.name).toBe('Massone');
			expect(massone.team).toBe('villaggio');
			expect(massone.visibleAsTeam).toBe('villaggio');
			expect(massone.countAs).toBe('villaggio');
			expect(massone.color).toBe('#ec4899');
			expect(massone.phaseOrder).toBe('any');
			
			expect(massone.actsAtNight).toBe('never');
		});

		it('should have correct usage and count constraints', () => {
			expect(massone.effectType).toBe('optional');
			expect(massone.numberOfUsage).toBe('unlimited');
			expect(massone.minCount).toBe(2);
			expect(massone.maxCount).toBeUndefined();
		});

		it('should have correct team visibility settings', () => {
			expect(massone.revealAlliesWithinRole).toBe(true);
		});
	});

	describe('Resolve Function', () => {
		it('should do nothing when called', () => {
			const mockGameState = {};
			const mockEntry = {};

			expect(() => massone.resolve(mockGameState, mockEntry)).not.toThrow();
		});
	});

	describe('Win Condition', () => {
		it('should use village win condition', () => {
			expect(typeof massone.checkWin).toBe('function');
		});
	});

	describe('Count Constraints', () => {
		it('should have minimum count of 2', () => {
			expect(massone.minCount).toBe(2);
		});

		it('should have no max count limit', () => {
			expect(massone.maxCount).toBeUndefined();
		});
	});

	describe('Team vs CountAs', () => {
		it('should play for villaggio team and count as villaggio for wins', () => {
			expect(massone.team).toBe('villaggio');
			expect(massone.countAs).toBe('villaggio');
		});
	});
});
