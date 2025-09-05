import { describe, it, expect, beforeEach, vi } from 'vitest';
import guardia from '../../roles/guardia';
import { setMockGameState } from '../setup';

describe('Guardia (Doctor) Role', () => {
  let mockGameState: any;

  beforeEach(() => {
    mockGameState = {
      setup: {
        rolesEnabled: {
          lupo: true,
          villico: true,
          guardia: true
        }
      },
      nightNumber: 1,
      night: {
        context: {
          pendingKills: {},
          saves: [],
          savesBy: []
        }
      },
      players: [
        { 
          id: 1, 
          roleId: 'guardia',
          name: 'Guardia Player',
          alive: true
        },
        { 
          id: 2, 
          roleId: 'lupo',
          name: 'Lupo Player',
          alive: true
        },
        { 
          id: 3, 
          roleId: 'villico',
          name: 'Villico Player',
          alive: true
        }
      ]
    };
    setMockGameState(mockGameState);
  });

  describe('Resolve Function', () => {
    it('should protect target from lupo kills', () => {
      const action = {
        playerId: 1,
        playerIds: [1],
        data: { targetId: 3 },
        used: true
      };

      // Simulate lupo trying to kill villico
      mockGameState.night.context.pendingKills[3] = [{ role: 'lupo' }];

      const result = guardia.resolve(mockGameState, action);

      // The role should remove lupo kills and record the save
      expect(mockGameState.night.context.pendingKills[3]).toBeUndefined();
      expect(mockGameState.night.context.savesBy).toHaveLength(1);
      expect(mockGameState.night.context.savesBy[0].target).toBe(3);
      expect(mockGameState.night.context.savesBy[0].fromRoles).toEqual(['lupo']);
      expect(result).toBeDefined();
      expect(result.type).toBe('guardia_action');
    });

    it('should not affect kills from other roles', () => {
      const action = {
        playerId: 1,
        playerIds: [1],
        data: { targetId: 3 },
        used: true
      };

      // Simulate kills from other roles
      mockGameState.night.context.pendingKills[3] = [
        { role: 'boia' },
        { role: 'lupo' },
        { role: 'giustiziere' }
      ];

      const result = guardia.resolve(mockGameState, action);

      // Only lupo kill should be removed
      expect(mockGameState.night.context.pendingKills[3]).toHaveLength(2);
      expect(mockGameState.night.context.pendingKills[3]).toEqual([
        { role: 'boia' },
        { role: 'giustiziere' }
      ]);
    });

    it('should handle invalid target ID', () => {
      const action = {
        playerId: 1,
        playerIds: [1],
        data: { targetId: 'invalid' },
        used: true
      };

      const result = guardia.resolve(mockGameState, action);

      expect(result).toBeUndefined();
      expect(mockGameState.night.context.savesBy).toHaveLength(0);
    });

    it('should handle missing target ID', () => {
      const action = {
        playerId: 1,
        playerIds: [1],
        data: {},
        used: true
      };

      const result = guardia.resolve(mockGameState, action);

      expect(result).toBeUndefined();
      expect(mockGameState.night.context.savesBy).toHaveLength(0);
    });

    it('should handle non-existent target', () => {
      const action = {
        playerId: 1,
        playerIds: [1],
        data: { targetId: 999 },
        used: true
      };

      // Simulate lupo trying to kill the non-existent target
      mockGameState.night.context.pendingKills[999] = [{ role: 'lupo' }];

      const result = guardia.resolve(mockGameState, action);

      expect(result).toBeDefined();
      expect(mockGameState.night.context.savesBy).toHaveLength(1);
    });

    it('should record save action in history', () => {
      const action = {
        playerId: 1,
        playerIds: [1],
        data: { targetId: 3 },
        used: true
      };

      // Simulate lupo trying to kill the target
      mockGameState.night.context.pendingKills[3] = [{ role: 'lupo' }];

      guardia.resolve(mockGameState, action);

      expect(mockGameState.night.context.savesBy).toHaveLength(1);
      expect(mockGameState.night.context.savesBy[0].by).toBe(1);
      expect(mockGameState.night.context.savesBy[0].target).toBe(3);
      expect(mockGameState.night.context.savesBy[0].fromRoles).toEqual(['lupo']);
    });
  });

  describe('Win Condition', () => {
    it('should use village win condition', () => {
      expect(typeof guardia.checkWin).toBe('function');
    });
  });
});
