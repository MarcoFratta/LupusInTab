import { describe, it, expect, beforeEach } from 'vitest';
import { useTeamBalance } from '../composables/useTeamBalance';
import { ROLES } from '../roles';

// Mock the game store for testing
const mockGameStore = {
  state: {
    setup: {
      rolesCounts: {},
      numPlayers: 0
    }
  }
};

// Mock the useGameStore function
vi.mock('../stores/game', () => ({
  useGameStore: () => mockGameStore
}));

describe('Team Balance System - Power-Based Balance', () => {
  beforeEach(() => {
    // Reset mock data before each test
    mockGameStore.state.setup.rolesCounts = {};
    mockGameStore.state.setup.numPlayers = 0;
  });

  describe('Perfect Balance Scenarios', () => {
    it('should give realistic fairness for imbalanced power distribution', () => {
      mockGameStore.state.setup.rolesCounts = {
        lupo: 2,      // 2 × 10 = 20 power
        villico: 6,   // 6 × 1 = 6 power  
        veggente: 1   // 1 × 7 = 7 power
      };
      mockGameStore.state.setup.numPlayers = 9;

      const { teamBalance } = useTeamBalance();
      
      // This is actually imbalanced: lupi (20) vs villaggio (13)
      // Should give moderate fairness, not 100%
      expect(teamBalance.value.fairness).toBeGreaterThan(50);
      expect(teamBalance.value.fairness).toBeLessThan(70);
      expect(teamBalance.value.teamData.lupi.power).toBe(20);
      expect(teamBalance.value.teamData.lupi.players).toBe(2);
      expect(teamBalance.value.teamData.villaggio.power).toBe(13);
      expect(teamBalance.value.teamData.villaggio.players).toBe(7);
    });

    it('should give 100% fairness for equal power teams', () => {
      mockGameStore.state.setup.rolesCounts = {
        lupo: 1,      // 1 × 10 = 10 power
        villico: 10   // 10 × 1 = 10 power
      };
      mockGameStore.state.setup.numPlayers = 11;

      const { teamBalance } = useTeamBalance();
      
      expect(teamBalance.value.fairness).toBe(100);
      expect(teamBalance.value.teamData.lupi.power).toBe(10);
      expect(teamBalance.value.teamData.villaggio.power).toBe(10);
    });
  });

  describe('Imbalanced Scenarios', () => {
    it('should give lower fairness for power imbalance', () => {
      mockGameStore.state.setup.rolesCounts = {
        lupo: 3,      // 3 × 10 = 30 power
        villico: 3    // 3 × 1 = 3 power
      };
      mockGameStore.state.setup.numPlayers = 6;

      const { teamBalance } = useTeamBalance();
      
      expect(teamBalance.value.fairness).toBeLessThan(100);
      expect(teamBalance.value.teamData.lupi.power).toBe(30);
      expect(teamBalance.value.teamData.villaggio.power).toBe(3);
    });

    it('should give very low fairness for major power imbalance', () => {
      mockGameStore.state.setup.rolesCounts = {
        lupo: 4,      // 4 × 5 = 20 power
        villico: 2    // 2 × 1 = 2 power
      };
      mockGameStore.state.setup.numPlayers = 6;

      const { teamBalance } = useTeamBalance();
      
      expect(teamBalance.value.fairness).toBeLessThan(90);
      expect(teamBalance.value.baseFairness).toBeLessThan(90);
    });
  });

  describe('Multi-Team Scenarios', () => {
    it('should give variety bonus for 3+ teams', () => {
      mockGameStore.state.setup.rolesCounts = {
        lupo: 2,          // 2 × 10 = 20 power
        villico: 4,       // 4 × 1 = 4 power
        lupomannaro: 1    // 1 × 33 = 33 power
      };
      mockGameStore.state.setup.numPlayers = 7;

      const { teamBalance } = useTeamBalance();
      
      expect(teamBalance.value.varietyBonus).toBe(5);
      expect(teamBalance.value.teamData.mannari).toBeDefined();
      expect(teamBalance.value.teamData.mannari.power).toBe(30);
    });

    it('should not give variety bonus for 2 teams', () => {
      mockGameStore.state.setup.rolesCounts = {
        lupo: 2,      // 2 × 5 = 10 power
        villico: 4    // 4 × 1 = 4 power
      };
      mockGameStore.state.setup.numPlayers = 6;

      const { teamBalance } = useTeamBalance();
      
      expect(teamBalance.value.varietyBonus).toBe(0);
    });
  });

  describe('Equal Team Contribution', () => {
    it('should treat all teams equally regardless of player count', () => {
      mockGameStore.state.setup.rolesCounts = {
        lupo: 1,          // 1 × 10 = 10 power, 1 player
        villico: 5,       // 5 × 1 = 5 power, 5 players
        matto: 1          // 1 × 10 = 10 power, 1 player
      };
      mockGameStore.state.setup.numPlayers = 7;

      const { teamBalance } = useTeamBalance();
      
      // All teams contribute equally to balance calculation
      expect(teamBalance.value.teamData.lupi.power).toBe(10);
      expect(teamBalance.value.teamData.villaggio.power).toBe(5);
      expect(teamBalance.value.teamData.matti.power).toBe(10);
    });

    it('should calculate balance based on power, not player count', () => {
      mockGameStore.state.setup.rolesCounts = {
        lupo: 1,          // 1 × 5 = 5 power
        villico: 5,       // 5 × 1 = 5 power
        matto: 1          // 1 × 10 = 10 power
      };
      mockGameStore.state.setup.numPlayers = 7;

      const { teamBalance } = useTeamBalance();
      
      // Balance should be based on power distribution, not player count
      expect(teamBalance.value.teamData.matti.players).toBe(1);
      expect(teamBalance.value.teamData.matti.power).toBe(10);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty role counts', () => {
      mockGameStore.state.setup.rolesCounts = {};
      mockGameStore.state.setup.numPlayers = 0;

      const { teamBalance } = useTeamBalance();
      
      expect(teamBalance.value.fairness).toBe(0);
      expect(teamBalance.value.totalPlayers).toBe(0);
      expect(teamBalance.value.totalPower).toBe(0);
    });

    it('should handle single team', () => {
      mockGameStore.state.setup.rolesCounts = {
        villico: 5    // 5 × 1 = 5 power
      };
      mockGameStore.state.setup.numPlayers = 5;

      const { teamBalance } = useTeamBalance();
      
      expect(teamBalance.value.fairness).toBe(100);
      expect(teamBalance.value.teamData.villaggio.power).toBe(5);
    });

    it('should handle roles without scores (default to 1)', () => {
      // Mock a role without score property
      const originalLupo = ROLES.lupo;
      (ROLES as any).lupo = { ...originalLupo, score: undefined };
      
      mockGameStore.state.setup.rolesCounts = {
        lupo: 2,      // 2 × 1 = 2 power (default score)
        villico: 2    // 2 × 1 = 2 power
      };
      mockGameStore.state.setup.numPlayers = 4;

      const { teamBalance } = useTeamBalance();
      
      expect(teamBalance.value.fairness).toBe(100);
      expect(teamBalance.value.teamData.lupi.power).toBe(2);
      
      // Restore original role
      (ROLES as any).lupo = originalLupo;
    });
  });


});
