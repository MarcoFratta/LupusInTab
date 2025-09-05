import { describe, it, expect, beforeEach } from 'vitest';
import bugiardo from '../../roles/bugiardo';
import { setMockGameState } from '../setup';

describe('Bugiardo Role', () => {
  let mockGameState: any;

  beforeEach(() => {
    mockGameState = {
      nightNumber: 2,
      settings: { difficolta: false },
      groupings: [],
      custom: {
        bugiardo: {
          usedPowers: {}
        }
      },
      players: [
        { id: 1, name: 'Bugiardo Player', roleId: 'bugiardo', alive: true, roleState: { visibleAsTeam: 'villaggio', realTeam: 'lupi' } },
        { id: 2, name: 'Dead Lupo', roleId: 'lupo', alive: false, roleState: { visibleAsTeam: 'lupi', realTeam: 'lupi' } },
        { id: 3, name: 'Dead Villico', roleId: 'villico', alive: false, roleState: { visibleAsTeam: 'villaggio', realTeam: 'villaggio' } },
        { id: 4, name: 'Alive Player', roleId: 'massone', alive: true, roleState: { visibleAsTeam: 'villaggio', realTeam: 'villaggio' } }
      ]
    };
    setMockGameState(mockGameState);
  });

  describe('Role Definition', () => {
    it('should have correct basic properties', () => {
      expect(bugiardo.id).toBe('bugiardo');
      expect(bugiardo.name).toBe('Bugiardo');
      expect(bugiardo.team).toBe('lupi');
      expect(bugiardo.icon).toBe('BugiardoIcon');
      expect(bugiardo.score).toBe(8);
      expect(bugiardo.visibleAsTeam).toBe('villaggio');
      expect(bugiardo.countAs).toBe('villaggio');
      expect(bugiardo.description).toBe('Scopre il ruolo di un morto una volta per partita');
      expect(bugiardo.color).toBe('#dc2626');
      expect(bugiardo.phaseOrder).toBe('any');
      expect(bugiardo.actsAtNight).toBe('alive');
      expect(bugiardo.effectType).toBe('optional');
      expect(bugiardo.numberOfUsage).toBe(1);
      expect(bugiardo.startNight).toBe(2);
      expect(bugiardo.canTargetDead).toBe(true);
    });

    it('should have prompt and resolve details components', () => {
      expect(bugiardo.getPromptComponent).toBeDefined();
      expect(bugiardo.getResolveDetailsComponent).toBeDefined();
    });
  });

  describe('Resolve Function', () => {
    it('should investigate dead player and return correct result', () => {
      const action = { playerIds: [1], data: { targetId: 2 } };
      const result = bugiardo.resolve(mockGameState, action);
      
      expect(result).toBeDefined();
      expect(result.type).toBe('bugiardo_action');
      expect(result.targetId).toBe(2);
      expect(result.discoveredRole).toBe('lupo');
      expect(result.discoveredRealTeam).toBe('lupi');
      expect(result.nightNumber).toBe(2);
      expect(result.roleId).toBe('bugiardo');
      expect(result.playerIds).toEqual([1]);
    });

    it('should handle different dead player roles', () => {
      const action = { playerIds: [1], data: { targetId: 3 } };
      const result = bugiardo.resolve(mockGameState, action);
      
      expect(result.discoveredRole).toBe('villico');
      expect(result.discoveredRealTeam).toBe('villaggio');
    });

    it('should return undefined for invalid target ID', () => {
      const action = { playerIds: [1], data: { targetId: 'invalid' } };
      const result = bugiardo.resolve(mockGameState, action);
      
      expect(result).toBeUndefined();
    });

    it('should return undefined for non-existent target', () => {
      const action = { playerIds: [1], data: { targetId: 999 } };
      const result = bugiardo.resolve(mockGameState, action);
      
      expect(result).toBeUndefined();
    });

    it('should handle action with result instead of data', () => {
      const action = { playerIds: [1], result: { targetId: 2 } };
      const result = bugiardo.resolve(mockGameState, action);
      
      expect(result).toBeDefined();
      expect(result.targetId).toBe(2);
    });

    it('should handle empty action', () => {
      const result = bugiardo.resolve(mockGameState, {});
      
      expect(result).toBeUndefined();
    });
  });

  describe('Win Condition', () => {
    it('should use wolf win condition', () => {
      expect(bugiardo.checkWin).toBeDefined();
      expect(typeof bugiardo.checkWin).toBe('function');
    });
  });

  describe('Role Constraints', () => {
    it('should not be able to act before night 2', () => {
      mockGameState.nightNumber = 1;
      const action = { playerIds: [1], data: { targetId: 2 } };
      const result = bugiardo.resolve(mockGameState, action);
      
      expect(result).toBeUndefined();
    });

    it('should be able to target dead players', () => {
      expect(bugiardo.canTargetDead).toBe(true);
    });

    it('should have limited usage', () => {
      expect(bugiardo.numberOfUsage).toBe(1);
    });

    it('should be optional effect', () => {
      expect(bugiardo.effectType).toBe('optional');
    });
  });
});
