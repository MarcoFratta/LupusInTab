import { describe, it, expect, beforeEach, vi } from 'vitest';
import muccamannara from '../../roles/muccamannara';
import { NightPhaseManager } from '../../core/managers/NightPhaseManager';
import { GameStateManager } from '../../core/managers/GameStateManager';
import { DayPhaseManager } from '../../core/managers/DayPhaseManager';

describe('MuccaMannara Role', () => {
  let mockGameState: any;

  beforeEach(() => {
    mockGameState = {
      setup: {
        rolesEnabled: {
          lupo: true,
          villico: true,
          muccamannara: true
        }
      },
      nightNumber: 1,
      night: {
        context: {
          pendingKills: {},
          passiveEffectRoles: []
        }
      },
      players: [
        { 
          id: 1, 
          roleId: 'muccamannara',
          name: 'MuccaMannara Player',
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
  });

  describe('Role Properties', () => {
    it('should have correct basic properties', () => {
      expect(muccamannara.id).toBe('muccamannara');
      expect(muccamannara.name).toBe('Mucca Mannara');
      expect(muccamannara.team).toBe('mannari');
      expect(muccamannara.score).toBe(33);
      expect(muccamannara.actsAtNight).toBe('never');
    });

    it('should not act at night', () => {
      expect(muccamannara.actsAtNight).toBe('never');
    });
  });

  describe('Passive Effect Function', () => {
    it('should filter out lupo kills from pendingKills', () => {
      const player = { id: 1, roleId: 'muccamannara' };
      
      mockGameState.night.context.pendingKills[1] = [
        { role: 'lupo' },
        { role: 'veggente' }
      ];

      muccamannara.passiveEffect(mockGameState, player);

      expect(mockGameState.night.context.pendingKills[1]).toHaveLength(1);
      expect(mockGameState.night.context.pendingKills[1][0].role).toBe('veggente');
    });

    it('should remove player from pendingKills if only lupo kills remain', () => {
      const player = { id: 1, roleId: 'muccamannara' };
      
      mockGameState.night.context.pendingKills[1] = [
        { role: 'lupo' }
      ];

      muccamannara.passiveEffect(mockGameState, player);

      expect(mockGameState.night.context.pendingKills[1]).toBeUndefined();
    });

    it('should handle case with no pending kills', () => {
      const player = { id: 1, roleId: 'muccamannara' };
      
      muccamannara.passiveEffect(mockGameState, player);

      expect(mockGameState.night.context.pendingKills[1]).toBeUndefined();
    });

    it('should handle case with mixed kill types', () => {
      const player = { id: 1, roleId: 'muccamannara' };
      
      mockGameState.night.context.pendingKills[1] = [
        { role: 'lupo' },
        { role: 'veggente' },
        { role: 'giustiziere' }
      ];

      muccamannara.passiveEffect(mockGameState, player);

      expect(mockGameState.night.context.pendingKills[1]).toHaveLength(2);
      expect(mockGameState.night.context.pendingKills[1]).toEqual([
        { role: 'veggente' },
        { role: 'giustiziere' }
      ]);
    });
  });

  describe('Night Phase Integration', () => {
    it('should apply passive effect during night phase resolution', () => {
      const gameState = {
        nightNumber: 1,
        night: {
          context: {
            pendingKills: {
              1: [{ role: 'lupo' }]
            },
            calledRoles: []
          }
        },
        players: [
          { 
            id: 1, 
            roleId: 'muccamannara',
            name: 'MuccaMannara Player',
            alive: true
          },
          { 
            id: 2, 
            roleId: 'lupo',
            name: 'Lupo Player',
            alive: true
          }
        ]
      };

      // Simulate the normal turn flow
      let turn = NightPhaseManager.getCurrentTurn(gameState);
      while (turn) {
        // Mark the role as called
        gameState.night.context.calledRoles.push(turn.roleId);
        turn = NightPhaseManager.getCurrentTurn(gameState);
      }

      expect(gameState.night.context.pendingKills[1]).toBeUndefined();
    });

    it('should apply passive effect when no other roles act at night', () => {
      const gameState = {
        nightNumber: 1,
        night: {
          context: {
            pendingKills: {
              1: [{ role: 'lupo' }]
            },
            calledRoles: []
          }
        },
        players: [
          { 
            id: 1, 
            roleId: 'muccamannara',
            name: 'MuccaMannara Player',
            alive: true
          }
        ]
      };

      const turn = NightPhaseManager.getCurrentTurn(gameState);

      expect(turn).toBeNull();
      expect(gameState.night.context.pendingKills[1]).toBeUndefined();
    });

    it('should track roles with passive effects in night context', () => {
      const gameState = {
        nightNumber: 1,
        night: {
          context: {
            pendingKills: {
              1: [{ role: 'lupo' }]
            },
            calledRoles: []
          }
        },
        players: [
          { 
            id: 1, 
            roleId: 'muccamannara',
            name: 'MuccaMannara Player',
            alive: true
          }
        ]
      };

      const turn = NightPhaseManager.getCurrentTurn(gameState);

      expect(turn).toBeNull();
      expect(gameState.night.context.calledRoles).toContain('muccamannara');
    });

    it('should survive lupi attack due to passive effect', () => {
      const gameState = {
        nightNumber: 1,
        night: {
          context: {
            pendingKills: {
              1: [{ role: 'lupo' }]
            },
            calledRoles: []
          }
        },
        players: [
          { 
            id: 1, 
            roleId: 'muccamannara',
            name: 'MuccaMannara Player',
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

      const muccamannaraPlayer = gameState.players[0];
      
      expect(muccamannaraPlayer.alive).toBe(true);
      expect(gameState.night.context.pendingKills[1]).toEqual([{ role: 'lupo' }]);

      // Simulate the normal turn flow
      let turn = NightPhaseManager.getCurrentTurn(gameState);
      while (turn) {
        // Mark the role as called
        gameState.night.context.calledRoles.push(turn.roleId);
        turn = NightPhaseManager.getCurrentTurn(gameState);
      }

      expect(muccamannaraPlayer.alive).toBe(true);
      expect(gameState.night.context.pendingKills[1]).toBeUndefined();
    });

    it('should still die from non-lupi kills', () => {
      const gameState = {
        nightNumber: 1,
        night: {
          context: {
            pendingKills: {
              1: [{ role: 'veggente' }]
            }
          }
        },
        players: [
          { 
            id: 1, 
            roleId: 'muccamannara',
            name: 'MuccaMannara Player',
            alive: true
          },
          { 
            id: 2, 
            roleId: 'veggente',
            name: 'Vegente Player',
            alive: true
          }
        ]
      };

      const muccamannaraPlayer = gameState.players[0];
      
      expect(muccamannaraPlayer.alive).toBe(true);
      expect(gameState.night.context.pendingKills[1]).toEqual([{ role: 'veggente' }]);

      NightPhaseManager.resolveNight(gameState, {});

      expect(muccamannaraPlayer.alive).toBe(false);
      expect(gameState.night.context.pendingKills[1]).toEqual([{ role: 'veggente' }]);
    });
  });

  describe('Day Phase Integration', () => {
    it('should call restore functions for roles that acted during the night', () => {
      const gameState = {
        phase: 'resolve',
        night: {
          turns: [
            { kind: 'group', roleId: 'lupo', playerIds: [1] },
            { kind: 'group', roleId: 'guardia', playerIds: [2] }
          ],
          context: {
            calledRoles: ['lupo', 'guardia'],
            passiveEffectRoles: []
          }
        },
        players: [
          { id: 1, roleId: 'lupo', alive: true },
          { id: 2, roleId: 'guardia', alive: true }
        ]
      };

      const mockRoles = {
        lupo: {
          id: 'lupo',
          name: 'Lupo',
          team: 'lupi',
          score: 5,
          phaseOrder: 1,
          resolve: () => {},
          restoreFunction: vi.fn()
        },
        guardia: {
          id: 'guardia',
          name: 'Guardia',
          team: 'villaggio',
          score: 5,
          phaseOrder: 2,
          resolve: () => {},
          restoreFunction: vi.fn()
        }
      };

      DayPhaseManager.continueToDay(gameState, mockRoles);

      expect(mockRoles.lupo.restoreFunction).toHaveBeenCalled();
      expect(mockRoles.guardia.restoreFunction).toHaveBeenCalled();
    });
  });

  describe('Win Condition', () => {
    it('should win when mannari count >= non-mannari count', () => {
      mockGameState.players[0].roleId = 'muccamannara';
      mockGameState.players[1].roleId = 'lupomannaro';
      mockGameState.players[2].roleId = 'villico';

      const result = muccamannara.checkWin(mockGameState);

      expect(result).toBe(true);
    });

    it('should not win when mannari count < non-mannari count', () => {
      mockGameState.players[0].roleId = 'muccamannara';
      mockGameState.players[1].roleId = 'lupo';
      mockGameState.players[2].roleId = 'villico';

      const result = muccamannara.checkWin(mockGameState);

      expect(result).toBe(false);
    });

    it('should not win when no mannari are alive', () => {
      mockGameState.players[0].alive = false;
      mockGameState.players[1].roleId = 'lupo';
      mockGameState.players[2].roleId = 'villico';

      const result = muccamannara.checkWin(mockGameState);

      expect(result).toBe(false);
    });

    it('should win when mannari count equals non-mannari count', () => {
      mockGameState.players[0].roleId = 'muccamannara';
      mockGameState.players[1].roleId = 'lupo';
      mockGameState.players[2].alive = false;

      const result = muccamannara.checkWin(mockGameState);

      expect(result).toBe(true);
    });
  });
});
