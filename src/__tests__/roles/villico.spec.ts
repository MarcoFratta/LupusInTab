import { describe, it, expect } from 'vitest';
import villico from '../../roles/villico';

describe('Villico (Villager) Role', () => {
	describe('Role Properties', () => {
		it('should have correct basic properties', () => {
			expect(villico.id).toBe('villico');
			expect(villico.name).toBe('Villico');
			expect(villico.team).toBe('villaggio');
			expect(villico.visibleAsTeam).toBe('villaggio');
			expect(villico.countAs).toBe('villaggio');
			expect(villico.color).toBe('#6b7280');
			expect(villico.phaseOrder).toBe('any');
			
			expect(villico.actsAtNight).toBe('never');
		});

		it('should have correct usage and count constraints', () => {
			expect(villico.effectType).toBe('optional');
			expect(villico.numberOfUsage).toBe('unlimited');
			expect(villico.minCount).toBeUndefined();
			expect(villico.maxCount).toBeUndefined();
		});
	});

	describe('Resolve Function', () => {
		it('should do nothing when called', () => {
			const mockGameState = {};
			const mockEntry = {};

			expect(() => villico.resolve(mockGameState, mockEntry)).not.toThrow();
		});
	});

	describe('Win Condition', () => {
		it('should use village win condition', () => {
			expect(typeof villico.checkWin).toBe('function');
		});
	});

	describe('Count Constraints', () => {
		it('should have no max count limit', () => {
			expect(villico.maxCount).toBeUndefined();
		});

		it('should have no min count limit', () => {
			expect(villico.minCount).toBeUndefined();
		});
	});

	describe('Team vs CountAs', () => {
		it('should play for villaggio team and count as villaggio for wins', () => {
			expect(villico.team).toBe('villaggio');
			expect(villico.countAs).toBe('villaggio');
		});
	});
});
