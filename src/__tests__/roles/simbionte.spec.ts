import { describe, it, expect, beforeEach, vi } from 'vitest';
import { simbionte } from '../../roles/simbionte';
import { ROLES } from '../../roles';

describe('Simbionte Role', () => {
  let mockGameState: any;

  beforeEach(() => {
    mockGameState = {
      setup: {
        rolesEnabled: {
          lupo: true,
          villico: true,
          guardia: true,
          simbionte: true
        }
      },
      nightNumber: 1,
      players: [
        { 
          id: 1, 
          roleId: 'simbionte',
          name: 'Simbionte Player',
          alive: true,
          roleState: {
            realTeam: 'simbionti',
            team: 'simbionti',
            countAs: 'villaggio',
            visibleAsTeam: 'villaggio'
          }
        },
        { 
          id: 2, 
          roleId: 'villico',
          name: 'Villico Player',
          alive: true,
          roleState: {
            realTeam: 'villaggio',
            team: 'villaggio',
            countAs: 'villaggio',
            visibleAsTeam: 'villaggio'
          }
        },
        { 
          id: 3, 
          roleId: 'lupo',
          name: 'Lupo Player',
          alive: true,
          roleState: {
            realTeam: 'lupi',
            team: 'lupi',
            countAs: 'lupi',
            visibleAsTeam: 'lupi'
          }
        }
      ],
      usedPowers: {}
    };
  });

  describe('Role Definition', () => {
    it('should have correct basic properties', () => {
      expect(simbionte.id).toBe('simbionte');
      expect(simbionte.name).toBe('Simbionte');
      expect(simbionte.team).toBe('simbionti');
      expect(simbionte.countAs).toBe('villaggio');
      expect(simbionte.visibleAsTeam).toBe('villaggio');
      expect(simbionte.actsAtNight).toBe('alive');
      expect(simbionte.effectType).toBe('required');
      expect(simbionte.numberOfUsage).toBe(1);
      expect(simbionte.score).toBe(25);
      expect(simbionte.phaseOrder).toBe(-20);
    });

    it('should have prompt and resolve components', () => {
      expect(typeof simbionte.getPromptComponent).toBe('function');
      expect(typeof simbionte.getResolveDetailsComponent).toBe('function');
    });
  });

  describe('Resolve Function', () => {
    it('should transform simbionte into target player role', () => {
      const action = {
        playerId: 1,
        data: { target: { playerId: 2 } }
      };

      const result = simbionte.resolve(mockGameState, action);

      expect(result).toBeDefined();
      expect(result.type).toBe('simbionte_transform');
      expect(result.oldRoleId).toBe('simbionte');
      expect(result.newRoleId).toBe('villico');
      expect(result.newRoleName).toBe('Villico');
      expect(result.newRoleTeam).toBe('villaggio');
      expect(result.targetPlayerId).toBe(2);
      expect(result.targetPlayerName).toBe('Villico Player');
    });

    it('should handle lupo target correctly', () => {
      const action = {
        playerId: 1,
        data: { target: { playerId: 3 } }
      };

      const result = simbionte.resolve(mockGameState, action);

      expect(result).toBeDefined();
      expect(result.newRoleId).toBe('lupo');
      expect(result.newRoleName).toBe('Lupo');
      expect(result.newRoleTeam).toBe('lupi');
    });

    it('should return null for invalid action', () => {
      const action = {
        playerId: 1,
        data: { target: {} }
      };

      const result = simbionte.resolve(mockGameState, action);
      expect(result).toBeNull();
    });

    it('should return null for missing target player', () => {
      const action = {
        playerId: 1,
        data: { target: { playerId: 999 } }
      };

      const result = simbionte.resolve(mockGameState, action);
      expect(result).toBeNull();
    });

    it('should return null for null action', () => {
      const result = simbionte.resolve(mockGameState, null);
      expect(result).toBeNull();
    });

    it('should return null for undefined action', () => {
      const result = simbionte.resolve(mockGameState, undefined);
      expect(result).toBeNull();
    });
  });

  describe('Player State Changes', () => {
    it('should update player roleId after transformation', () => {
      const action = {
        playerId: 1,
        data: { target: { playerId: 2 } }
      };

      simbionte.resolve(mockGameState, action);
      const simbiontePlayer = mockGameState.players.find(p => p.id === 1);
      
      expect(simbiontePlayer.roleId).toBe('villico');
    });

    it('should update usedPowers after transformation', () => {
      const action = {
        playerId: 1,
        data: { target: { playerId: 2 } }
      };

      mockGameState.usedPowers.villico = [2, 3];
      
      simbionte.resolve(mockGameState, action);
      
      expect(mockGameState.usedPowers.villico).toEqual([2, 3]);
    });
  });
});
