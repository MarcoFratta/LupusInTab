import { describe, it, expect, beforeEach, vi } from 'vitest';
import { lupoCiccione } from '../../roles/lupoCiccione';
import { NightPhaseManager } from '../../core/managers/NightPhaseManager';
import { ROLES } from '../../roles';
import { RoleAPI } from '../../utils/roleAPI';

describe('Lupo Ciccione Role', () => {
  let mockGameState: any;

  beforeEach(() => {
    mockGameState = {
      setup: {
        rolesEnabled: {
          lupo: true,
          villico: true,
          lupoCiccione: true
        }
      },
      nightNumber: 1,
      players: [
        { 
          id: 1, 
          roleId: 'villico',
          name: 'Villico Player 1',
          alive: true,
          roleState: {
            visibleAsTeam: 'villaggio',
            realTeam: 'villaggio'
          }
        },
        { 
          id: 2, 
          roleId: 'lupoCiccione',
          name: 'Lupo Ciccione Player',
          alive: true,
          roleState: {
            visibleAsTeam: 'lupi',
            realTeam: 'lupi'
          }
        },
        { 
          id: 3, 
          roleId: 'villico',
          name: 'Villico Player 2',
          alive: true,
          roleState: {
            visibleAsTeam: 'villaggio',
            realTeam: 'villaggio'
          }
        },
        { 
          id: 4, 
          roleId: 'lupo',
          name: 'Lupo Player',
          alive: true,
          roleState: {
            visibleAsTeam: 'lupi',
            realTeam: 'lupi'
          }
        }
      ],
      custom: {}
    };

    // Mock RoleAPI functions
    vi.spyOn(RoleAPI, 'getAlivePlayers').mockReturnValue(mockGameState.players.filter((p: any) => p.alive));
    vi.spyOn(RoleAPI, 'setPlayerVisibleTeam').mockImplementation((playerId: number, team: string) => {
      const player = mockGameState.players.find((p: any) => p.id === playerId);
      if (player) {
        player.roleState.visibleAsTeam = team;
      }
    });
    vi.spyOn(RoleAPI, 'getCustomData').mockImplementation((roleId: string) => {
      return mockGameState.custom[roleId] || {};
    });
    vi.spyOn(RoleAPI, 'setCustomData').mockImplementation((roleId: string, data: any) => {
      mockGameState.custom[roleId] = data;
    });
    vi.spyOn(RoleAPI, 'clearCustomData').mockImplementation((roleId: string) => {
      delete mockGameState.custom[roleId];
    });
    vi.spyOn(RoleAPI, 'getPlayer').mockImplementation((playerId: number) => {
      return mockGameState.players.find((p: any) => p.id === playerId);
    });
  });

  describe('Role Properties', () => {
    it('should have correct basic properties', () => {
      expect(lupoCiccione.id).toBe('lupoCiccione');
      expect(lupoCiccione.name).toBe('Lupo Ciccione');
      expect(lupoCiccione.team).toBe('lupi');
      expect(lupoCiccione.visibleAsTeam).toBe('lupi');
      expect(lupoCiccione.countAs).toBe('lupi');
      expect(lupoCiccione.actsAtNight).toBe('never');
      expect(lupoCiccione.phaseOrder).toBe(4);
    });

    it('should have passive effect function', () => {
      expect(typeof lupoCiccione.passiveEffect).toBe('function');
    });

    it('should have restore function', () => {
      expect(typeof lupoCiccione.restoreFunction).toBe('function');
    });
  });

  describe('Passive Effect', () => {
    it('should affect left and right alive players', () => {
      const lupoCiccionePlayer = mockGameState.players[1];
      
      lupoCiccione.passiveEffect(mockGameState, lupoCiccionePlayer);

      const leftPlayer = mockGameState.players[0];
      const rightPlayer = mockGameState.players[2];

      expect(leftPlayer.roleState.visibleAsTeam).toBe('lupi');
      expect(rightPlayer.roleState.visibleAsTeam).toBe('lupi');
    });

    it('should skip dead players when finding left and right', () => {
      mockGameState.players[0].alive = false;
      mockGameState.players[3].alive = false;
      
      const lupoCiccionePlayer = mockGameState.players[1];
      
      lupoCiccione.passiveEffect(mockGameState, lupoCiccionePlayer);

      const rightPlayer = mockGameState.players[2];
      expect(rightPlayer.roleState.visibleAsTeam).toBe('lupi');
    });

    it('should not affect players if lupo ciccione is dead', () => {
      mockGameState.players[1].alive = false;
      
      const lupoCiccionePlayer = mockGameState.players[1];
      
      lupoCiccione.passiveEffect(mockGameState, lupoCiccionePlayer);

      const leftPlayer = mockGameState.players[0];
      const rightPlayer = mockGameState.players[2];

      expect(leftPlayer.roleState.visibleAsTeam).toBe('villaggio');
      expect(rightPlayer.roleState.visibleAsTeam).toBe('villaggio');
    });

    it('should store original visibleAsTeam values', () => {
      const lupoCiccionePlayer = mockGameState.players[1];
      
      lupoCiccione.passiveEffect(mockGameState, lupoCiccionePlayer);

      expect(mockGameState.custom.lupoCiccione.affectedPlayers).toBeDefined();
      expect(mockGameState.custom.lupoCiccione.affectedPlayers).toHaveLength(2);
      
      const leftPlayerData = mockGameState.custom.lupoCiccione.affectedPlayers.find((p: any) => p.position === 'left');
      const rightPlayerData = mockGameState.custom.lupoCiccione.affectedPlayers.find((p: any) => p.position === 'right');
      
      expect(leftPlayerData.originalVisibleAsTeam).toBe('villaggio');
      expect(rightPlayerData.originalVisibleAsTeam).toBe('villaggio');
    });

    it('should handle circular seating correctly', () => {
      const lupoCiccionePlayer = mockGameState.players[1];
      
      lupoCiccione.passiveEffect(mockGameState, lupoCiccionePlayer);

      const leftPlayer = mockGameState.players[0];
      const rightPlayer = mockGameState.players[2];

      expect(leftPlayer.roleState.visibleAsTeam).toBe('lupi');
      expect(rightPlayer.roleState.visibleAsTeam).toBe('lupi');
    });

    it('should handle circular seating when lupo ciccione is last player', () => {
      // Move lupo ciccione to last position (id 4)
      const lupoCiccionePlayer = mockGameState.players[3];
      lupoCiccionePlayer.roleId = 'lupoCiccione';
      
      lupoCiccione.passiveEffect(mockGameState, lupoCiccionePlayer);

      // Should affect the first player (id 1) as right neighbor
      const rightPlayer = mockGameState.players[0];
      // Should affect the third player (id 3) as left neighbor  
      const leftPlayer = mockGameState.players[2];

      expect(leftPlayer.roleState.visibleAsTeam).toBe('lupi');
      expect(rightPlayer.roleState.visibleAsTeam).toBe('lupi');
    });

    it('should handle circular seating when lupo ciccione is first player', () => {
      // Move lupo ciccione to first position (id 1)
      const lupoCiccionePlayer = mockGameState.players[0];
      lupoCiccionePlayer.roleId = 'lupoCiccione';
      
      lupoCiccione.passiveEffect(mockGameState, lupoCiccionePlayer);

      // Should affect the last player (id 4) as left neighbor
      const leftPlayer = mockGameState.players[3];
      // Should affect the second player (id 2) as right neighbor
      const rightPlayer = mockGameState.players[1];

      expect(leftPlayer.roleState.visibleAsTeam).toBe('lupi');
      expect(rightPlayer.roleState.visibleAsTeam).toBe('lupi');
    });
  });

  describe('Restore Function', () => {
    it('should restore original visibleAsTeam values', () => {
      const lupoCiccionePlayer = mockGameState.players[1];
      
      lupoCiccione.passiveEffect(mockGameState, lupoCiccionePlayer);
      
      const leftPlayer = mockGameState.players[0];
      const rightPlayer = mockGameState.players[2];
      
      expect(leftPlayer.roleState.visibleAsTeam).toBe('lupi');
      expect(rightPlayer.roleState.visibleAsTeam).toBe('lupi');

      lupoCiccione.restoreFunction(mockGameState);

      expect(leftPlayer.roleState.visibleAsTeam).toBe('villaggio');
      expect(rightPlayer.roleState.visibleAsTeam).toBe('villaggio');
    });

    it('should clear custom data after restore', () => {
      const lupoCiccionePlayer = mockGameState.players[1];
      
      lupoCiccione.passiveEffect(mockGameState, lupoCiccionePlayer);
      expect(mockGameState.custom.lupoCiccione).toBeDefined();

      lupoCiccione.restoreFunction(mockGameState);
      expect(mockGameState.custom.lupoCiccione).toBeUndefined();
    });

    it('should handle restore with no affected players', () => {
      expect(() => {
        lupoCiccione.restoreFunction(mockGameState);
      }).not.toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('should handle single player game', () => {
      mockGameState.players = [mockGameState.players[1]];
      
      const lupoCiccionePlayer = mockGameState.players[0];
      
      expect(() => {
        lupoCiccione.passiveEffect(mockGameState, lupoCiccionePlayer);
      }).not.toThrow();
    });

    it('should handle all players dead except lupo ciccione', () => {
      mockGameState.players[0].alive = false;
      mockGameState.players[2].alive = false;
      mockGameState.players[3].alive = false;
      
      const lupoCiccionePlayer = mockGameState.players[1];
      
      lupoCiccione.passiveEffect(mockGameState, lupoCiccionePlayer);

      expect(mockGameState.custom.lupoCiccione.affectedPlayers).toHaveLength(0);
    });
  });

});
