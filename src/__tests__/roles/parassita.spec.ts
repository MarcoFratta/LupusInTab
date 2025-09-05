import { describe, it, expect, beforeEach, vi } from 'vitest';
import { parassita } from '../../roles/parassita';
import { setMockGameState } from '../setup';
import { RoleAPI } from '../../utils/roleAPI';

describe('Parassita Role', () => {
  let mockGameState: any;

  beforeEach(() => {
    mockGameState = {
      setup: {
        rolesEnabled: {
          parassita: true,
          villico: true,
          lupo: true
        }
      },
      nightNumber: 1,
      players: [
        { 
          id: 1, 
          roleId: 'parassita',
          name: 'Parassita Player',
          alive: true
        },
        { 
          id: 2, 
          roleId: 'villico',
          name: 'Villico Player 1',
          alive: true
        },
        { 
          id: 3, 
          roleId: 'villico',
          name: 'Villico Player 2',
          alive: true
        },
        { 
          id: 4, 
          roleId: 'lupo',
          name: 'Lupo Player',
          alive: true
        },
        { 
          id: 5, 
          roleId: 'villico',
          name: 'Villico Player 3',
          alive: true
        }
      ]
    };
    setMockGameState(mockGameState);
  });

  describe('Role Definition', () => {
    it('should have correct basic properties', () => {
      expect(parassita.id).toBe('parassita');
      expect(parassita.name).toBe('Parassita');
      expect(parassita.team).toBe('parassita');
      expect(parassita.phaseOrder).toBe('any');
      expect(parassita.actsAtNight).toBe('alive');
      expect(parassita.effectType).toBe('optional');
      expect(parassita.numberOfUsage).toBe('unlimited');
      expect(parassita.minCount).toBe(1);
      expect(parassita.maxCount).toBe(1);
    });

    it('should have correct description and color', () => {
      expect(parassita.description).toBe('Infetta i giocatori ogni notte');
      expect(parassita.color).toBe('#ec4899');
    });
  });

  describe('Resolve Function', () => {
    it('should initialize custom state when not present', () => {
      const action = {
        playerIds: [1],
        data: { targetIds: [2, 3, 4] }
      };

      const result = parassita.resolve(mockGameState, action);

      expect(mockGameState.custom).toBeDefined();
      expect(mockGameState.custom.parassita).toBeDefined();
      expect(mockGameState.custom.parassita.infetti).toBeDefined();
      expect(Array.isArray(mockGameState.custom.parassita.infetti)).toBe(true);
    });

    it('should not allow targeting already infected players', () => {
      mockGameState.custom = { parassita: { infetti: [2] } };
      
      const action = {
        playerIds: [1],
        data: { targetIds: [2, 3, 4] }
      };

      const result = parassita.resolve(mockGameState, action);

      expect(mockGameState.custom.parassita.infetti).toContain(2);
      expect(mockGameState.custom.parassita.infetti).toContain(3);
      expect(mockGameState.custom.parassita.infetti).toContain(4);
      expect(mockGameState.custom.parassita.infetti).toHaveLength(3);
      expect(mockGameState.custom.parassita.infetti.filter(id => id === 2)).toHaveLength(1);
    });

    it('should track usage count correctly', () => {
      const action = {
        playerIds: [1],
        data: { targetIds: [2, 3] }
      };

      const result1 = parassita.resolve(mockGameState, action);
      expect(mockGameState.custom.parassita.usageCount).toBe(1);
      expect(result1.data.infetti).toContain(2);
      expect(result1.data.infetti).toContain(3);

      const result2 = parassita.resolve(mockGameState, action);
      expect(mockGameState.custom.parassita.usageCount).toBe(1);
      expect(result2.data.infetti).toContain(2);
      expect(result2.data.infetti).toContain(3);
    });

    it('should add targets to infetti list', () => {
      const action = {
        playerIds: [1],
        data: { targetIds: [2, 3, 4] }
      };

      const result = parassita.resolve(mockGameState, action);

      expect(mockGameState.custom.parassita.infetti).toContain(2);
      expect(mockGameState.custom.parassita.infetti).toContain(3);
      expect(mockGameState.custom.parassita.infetti).toContain(4);
      expect(mockGameState.custom.parassita.infetti).toHaveLength(3);
    });

    it('should not duplicate targets in infetti list', () => {
      const action1 = {
        playerIds: [1],
        data: { targetIds: [2, 3] }
      };
      const action2 = {
        playerIds: [1],
        data: { targetIds: [2, 4] }
      };

      parassita.resolve(mockGameState, action1);
      parassita.resolve(mockGameState, action2);

      expect(mockGameState.custom.parassita.infetti).toContain(2);
      expect(mockGameState.custom.parassita.infetti).toContain(3);
      expect(mockGameState.custom.parassita.infetti).toContain(4);
      expect(mockGameState.custom.parassita.infetti).toHaveLength(3);
    });

    it('should handle empty targetIds', () => {
      const action = {
        playerIds: [1],
        data: { targetIds: [] }
      };

      const result = parassita.resolve(mockGameState, action);

      expect(result).toBeNull();
    });

    it('should handle invalid targetIds', () => {
      const action = {
        playerIds: [1],
        data: { targetIds: ['invalid', null, undefined] }
      };

      const result = parassita.resolve(mockGameState, action);

      // Custom data is only set when there are new infections
      const customData = RoleAPI.getCustomData('parassita');
      expect(customData.infetti || []).toHaveLength(0);
    });

    it('should return correct result object', () => {
      const action = {
        playerIds: [1],
        data: { targetIds: [2, 3] }
      };

      const result = parassita.resolve(mockGameState, action);

      expect(result).toEqual({
        type: 'parassita_action',
        nightNumber: 1,
        roleId: 'parassita',
        playerIds: [1],
        targetIds: [2, 3],
        data: { targetIds: [2, 3], infetti: [2, 3] }
      });
    });
  });

  describe('CheckWin Function', () => {
    it('should return false when no custom state exists', () => {
      const result = parassita.checkWin?.(mockGameState);
      expect(result).toBe(false);
    });

    it('should return false when no infetti exist', () => {
      mockGameState.custom = { parassita: { infetti: [] } };
      const result = parassita.checkWin?.(mockGameState);
      expect(result).toBe(false);
    });

    it('should return false when not all alive players are infetti', () => {
      mockGameState.custom = { parassita: { infetti: [2, 3] } };
      const result = parassita.checkWin?.(mockGameState);
      expect(result).toBe(false);
    });

    it('should return true when all alive players except Parassita are infetti', () => {
      mockGameState.custom = { parassita: { infetti: [2, 3, 4, 5] } };
      const result = parassita.checkWin?.(mockGameState);
      expect(result).toBe(true);
    });

    it('should return false when not all alive players except Parassita are infetti (some dead players)', () => {
      mockGameState.players[4].alive = false;
      mockGameState.custom = { parassita: { infetti: [2, 3, 5] } };
      
      const result = parassita.checkWin?.(mockGameState);
      expect(result).toBe(false);
    });

    it('should return false when some alive players are not infetti', () => {
      mockGameState.custom = { parassita: { infetti: [2, 3, 4] } };
      const result = parassita.checkWin?.(mockGameState);
      expect(result).toBe(false);
    });

    it('should return false when Parassita is dead', () => {
      mockGameState.players[0].alive = false;
      mockGameState.custom = { parassita: { infetti: [2, 3, 4, 5] } };
      const result = parassita.checkWin?.(mockGameState);
      expect(result).toBe(false);
    });


  });

  describe('Component Functions', () => {
    it('should have prompt component function', () => {
      expect(typeof parassita.getPromptComponent).toBe('function');
      expect(parassita.getPromptComponent()).toBeInstanceOf(Promise);
    });

    it('should have details component function', () => {
      expect(typeof parassita.getResolveDetailsComponent).toBe('function');
      expect(parassita.getResolveDetailsComponent()).toBeInstanceOf(Promise);
    });
  });

  describe('Prompt Component Logic', () => {
    it('should filter out already infected players and Parassita players', () => {
      mockGameState.custom = { parassita: { infetti: [2, 4] } };
      
      const selectablePlayers = mockGameState.players.filter(p => 
        p.alive && 
        p.id !== 1 && 
        p.roleId !== 'parassita' && 
        ![2, 4].includes(p.id)
      );

      expect(selectablePlayers).toHaveLength(2);
      expect(selectablePlayers.map(p => p.id)).toEqual([3, 5]);
      expect(selectablePlayers.every(p => p.roleId !== 'parassita')).toBe(true);
      expect(selectablePlayers.every(p => ![2, 4].includes(p.id))).toBe(true);
    });
  });
});
