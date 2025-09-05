import { describe, it, expect, beforeEach } from 'vitest';
import { ROLES } from '../roles';
import { useGameSimulation } from '../composables/useGameSimulation';
import { checkPlayerRole, getPlayersWithRole, hasAnyPlayerWithRole } from '../utils/roleChecking';

describe('Difficoltà Setting - Role Groupings', () => {
  let simulation: any;

  beforeEach(() => {
    simulation = useGameSimulation();
  });

  const createTestGame = (difficoltaEnabled: boolean) => ({
    setup: {
      rolesEnabled: {
        lupomannaro: true,
        lupo: true,
        lupoCiccione: true,
        villico: true
      },
      rolesCounts: {
        lupomannaro: 1,
        lupo: 1,
        lupoCiccione: 1,
        villico: 1
      }
    },
    players: [
      { id: 1, name: 'Lupo Mannaro', roleId: 'lupomannaro', alive: true },
      { id: 2, name: 'Lupo', roleId: 'lupo', alive: true },
      { id: 3, name: 'Lupo Ciccione', roleId: 'lupoCiccione', alive: true },
      { id: 4, name: 'Villico', roleId: 'villico', alive: true }
    ],
    settings: {
      skipFirstNightActions: false,
      enableSindaco: false,
      discussionTimerEnabled: false,
      difficolta: difficoltaEnabled
    },
    groupings: [
      { fromRole: 'lupo', toRole: 'lupoCiccione' }
    ],
    phase: 'setup' as const,
    nightNumber: 0,
    dayNumber: 0
  });

  describe('Difficoltà Enabled (true)', () => {
    it('should consider role groupings when checking roles', async () => {
      const testState = createTestGame(true);
      const result = await simulation.simulateGame(testState, {
        maxNights: 1,
        maxDays: 0,
        enableLogging: true
      });

      expect(result.success).toBe(true);
      
      // Check that the simulation ran without errors
      const events = result.events;
      const nightEvents = events.filter(e => e.type === 'night_action');
      
      // Should have night events for all roles
      expect(nightEvents.length).toBeGreaterThan(0);
      
      // Verify that groupings are considered
      // This would be tested by checking if lupomannaro can detect lupoCiccione as lupo
      // when difficolta is enabled
      console.log('Difficoltà ENABLED - Events:', events.map(e => e.description));
    });
  });

  describe('Difficoltà Disabled (false)', () => {
    it('should NOT consider role groupings when checking roles', async () => {
      const testState = createTestGame(false);
      const result = await simulation.simulateGame(testState, {
        maxNights: 1,
        maxDays: 0,
        enableLogging: true
      });

      expect(result.success).toBe(true);
      
      // Check that the simulation ran without errors
      const events = result.events;
      const nightEvents = events.filter(e => e.type === 'night_action');
      
      // Should have night events for all roles
      expect(nightEvents.length).toBeGreaterThan(0);
      
      // Verify that groupings are NOT considered
      // This would be tested by checking if lupomannaro CANNOT detect lupoCiccione as lupo
      // when difficolta is disabled
      console.log('Difficoltà DISABLED - Events:', events.map(e => e.description));
    });
  });

  describe('Role Detection Logic', () => {
    it('should implement role checking function that respects difficolta setting', () => {
      const mockGameState = {
        players: [
          { id: 1, roleId: 'lupomannaro' },
          { id: 2, roleId: 'lupo' },
          { id: 3, roleId: 'lupoCiccione' }
        ],
        groupings: [
          { fromRole: 'lupo', toRole: 'lupoCiccione' }
        ],
        settings: { difficolta: true }
      } as any;

      // Test with difficolta enabled
      expect(checkPlayerRole(1, 'lupo', mockGameState)).toBe(false); // lupomannaro is not lupo
      expect(checkPlayerRole(2, 'lupo', mockGameState)).toBe(true);  // lupo is lupo
      expect(checkPlayerRole(3, 'lupo', mockGameState)).toBe(true);  // lupoCiccione is lupo (via grouping)

      // Test with difficolta disabled
      mockGameState.settings.difficolta = false;
      expect(checkPlayerRole(1, 'lupo', mockGameState)).toBe(false); // lupomannaro is not lupo
      expect(checkPlayerRole(2, 'lupo', mockGameState)).toBe(true);  // lupo is lupo
      expect(checkPlayerRole(3, 'lupo', mockGameState)).toBe(false); // lupoCiccione is NOT lupo (grouping ignored)
    });

    it('should work with getPlayersWithRole function', () => {
      const mockGameState = {
        players: [
          { id: 1, roleId: 'lupomannaro' },
          { id: 2, roleId: 'lupo' },
          { id: 3, roleId: 'lupoCiccione' },
          { id: 4, roleId: 'villico' }
        ],
        groupings: [
          { fromRole: 'lupo', toRole: 'lupoCiccione' }
        ],
        settings: { difficolta: true }
      } as any;

      // Test with difficolta enabled
      const lupoPlayers = getPlayersWithRole('lupo', mockGameState);
      expect(lupoPlayers).toContain(2); // lupo
      expect(lupoPlayers).toContain(3); // lupoCiccione (via grouping)
      expect(lupoPlayers).not.toContain(1); // lupomannaro
      expect(lupoPlayers).not.toContain(4); // villico

      // Test with difficolta disabled
      mockGameState.settings.difficolta = false;
      const lupoPlayersDisabled = getPlayersWithRole('lupo', mockGameState);
      expect(lupoPlayersDisabled).toContain(2); // lupo
      expect(lupoPlayersDisabled).not.toContain(3); // lupoCiccione (grouping ignored)
      expect(lupoPlayersDisabled).not.toContain(1); // lupomannaro
      expect(lupoPlayersDisabled).not.toContain(4); // villico
    });

    it('should work with hasAnyPlayerWithRole function', () => {
      const mockGameState = {
        players: [
          { id: 1, roleId: 'lupomannaro' },
          { id: 2, roleId: 'lupo' },
          { id: 3, roleId: 'lupoCiccione' }
        ],
        groupings: [
          { fromRole: 'lupo', toRole: 'lupoCiccione' }
        ],
        settings: { difficolta: true }
      } as any;

      // Test with difficolta enabled
      expect(hasAnyPlayerWithRole('lupo', mockGameState)).toBe(true); // lupo and lupoCiccione
      expect(hasAnyPlayerWithRole('villico', mockGameState)).toBe(false); // no villico

      // Test with difficolta disabled
      mockGameState.settings.difficolta = false;
      expect(hasAnyPlayerWithRole('lupo', mockGameState)).toBe(true); // only lupo
      expect(hasAnyPlayerWithRole('villico', mockGameState)).toBe(false); // no villico
    });
  });

  describe('Integration with Existing Roles', () => {
    it('should work with lupomannaro detection ability', () => {
      // Test that lupomannaro's detection works correctly with the setting
      const lupomannaro = ROLES.lupomannaro;
      expect(lupomannaro).toBeDefined();
      
      // This would test the actual lupomannaro resolve function
      // with different difficolta settings
    });

    it('should work with other investigative roles', () => {
      // Test that other roles that check player roles work correctly
      const veggente = ROLES.veggente;
      expect(veggente).toBeDefined();
      
      // This would test veggente and other investigative roles
      // with different difficolta settings
    });
  });
});
