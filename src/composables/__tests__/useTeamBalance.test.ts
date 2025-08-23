import { describe, it, expect } from 'vitest';
import { useTeamBalance } from '../useTeamBalance';

describe('useTeamBalance', () => {
  it('should calculate perfect balance for 8 players with 1/3 lupi ratio', () => {
    const mockState = {
      setup: {
        numPlayers: 8,
        rolesCounts: {
          lupo: 2,
          villico: 6
        }
      }
    };

    const { teamBalance } = useTeamBalance();
    
    expect(teamBalance.value.fairness).toBeGreaterThan(80);
    expect(teamBalance.value.lupiCount).toBe(2);
    expect(teamBalance.value.villaggioCount).toBe(6);
    expect(teamBalance.value.actualLupiRatio).toBe(25);
  });

  it('should give bonus for 8 players', () => {
    const mockState = {
      setup: {
        numPlayers: 8,
        rolesCounts: {
          lupo: 1,
          villico: 7
        }
      }
    };

    const { teamBalance } = useTeamBalance();
    
    expect(teamBalance.value.playerCountBonus).toBe(50);
  });

  it('should handle edge cases with no players', () => {
    const mockState = {
      setup: {
        numPlayers: 0,
        rolesCounts: {}
      }
    };

    const { teamBalance } = useTeamBalance();
    
    expect(teamBalance.value.fairness).toBe(0);
    expect(teamBalance.value.lupiCount).toBe(0);
    expect(teamBalance.value.villaggioCount).toBe(0);
  });
});
