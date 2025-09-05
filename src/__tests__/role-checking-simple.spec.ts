import { describe, it, expect, beforeEach } from 'vitest';
import { checkPlayerRole } from '../utils/roleChecking';

describe('Role Checking Function with Difficoltà Massima Setting', () => {
  let mockGameState: any;

  beforeEach(() => {
    mockGameState = {
      players: [
        { id: 1, name: 'Boia', roleId: 'boia', alive: true },
        { id: 2, name: 'Lupo Mannaro', roleId: 'lupomannaro', alive: true },
        { id: 3, name: 'Lupo', roleId: 'lupo', alive: true },
        { id: 4, name: 'Lupo Ciccione', roleId: 'lupoCiccione', alive: true },
        { id: 5, name: 'Veggente', roleId: 'veggente', alive: true },
        { id: 6, name: 'Medium', roleId: 'medium', alive: true },
        { id: 7, name: 'Ammaestratore', roleId: 'ammaestratore', alive: true }
      ],
      groupings: [
        { fromRole: 'lupo', toRole: 'lupoCiccione' }
      ],
      settings: { difficolta: true }
    };
  });

  describe('Direct Role Checking Tests', () => {
    it('should work correctly with difficolta enabled', () => {
      // Test direct role checking with difficolta enabled
      expect(checkPlayerRole(3, 'lupo', mockGameState)).toBe(true); // lupo is lupo
      expect(checkPlayerRole(4, 'lupo', mockGameState)).toBe(true); // lupoCiccione is lupo (via grouping)
      expect(checkPlayerRole(1, 'lupo', mockGameState)).toBe(false); // boia is not lupo
      expect(checkPlayerRole(2, 'lupomannaro', mockGameState)).toBe(true); // lupomannaro is lupomannaro
      expect(checkPlayerRole(5, 'veggente', mockGameState)).toBe(true); // veggente is veggente
    });

    it('should work correctly with difficolta disabled', () => {
      mockGameState.settings.difficolta = false;

      // Test direct role checking with difficolta disabled
      expect(checkPlayerRole(3, 'lupo', mockGameState)).toBe(true); // lupo is lupo
      expect(checkPlayerRole(4, 'lupo', mockGameState)).toBe(false); // lupoCiccione is NOT lupo (grouping ignored)
      expect(checkPlayerRole(1, 'lupo', mockGameState)).toBe(false); // boia is not lupo
      expect(checkPlayerRole(2, 'lupomannaro', mockGameState)).toBe(true); // lupomannaro is lupomannaro
      expect(checkPlayerRole(5, 'veggente', mockGameState)).toBe(true); // veggente is veggente
    });

    it('should handle edge cases correctly', () => {
      // Test with non-existent player
      expect(checkPlayerRole(999, 'lupo', mockGameState)).toBe(false);
      
      // Test with empty role
      expect(checkPlayerRole(3, '', mockGameState)).toBe(false);
      
      // Test with null/undefined values
      expect(checkPlayerRole(3, null as any, mockGameState)).toBe(false);
      expect(checkPlayerRole(3, undefined as any, mockGameState)).toBe(false);
    });

    it('should work with multiple groupings', () => {
      // Add more groupings to test
      mockGameState.groupings = [
        { fromRole: 'lupo', toRole: 'lupoCiccione' },
        { fromRole: 'villaggio', toRole: 'veggente' }
      ];

      // Test with difficolta enabled
      expect(checkPlayerRole(4, 'lupo', mockGameState)).toBe(true); // lupoCiccione is lupo
      expect(checkPlayerRole(5, 'villaggio', mockGameState)).toBe(true); // veggente is villaggio
      
      // Test with difficolta disabled
      mockGameState.settings.difficolta = false;
      expect(checkPlayerRole(4, 'lupo', mockGameState)).toBe(false); // lupoCiccione is NOT lupo
      expect(checkPlayerRole(5, 'villaggio', mockGameState)).toBe(false); // veggente is NOT villaggio
    });
  });

  describe('Role Checking Scenarios', () => {
    it('should correctly identify lupo-related roles when difficolta is enabled', () => {
      // All these should be considered "lupo" when difficolta is enabled
      expect(checkPlayerRole(3, 'lupo', mockGameState)).toBe(true); // lupo
      expect(checkPlayerRole(4, 'lupo', mockGameState)).toBe(true); // lupoCiccione (grouped)
      
      // These should not be considered "lupo"
      expect(checkPlayerRole(1, 'lupo', mockGameState)).toBe(false); // boia
      expect(checkPlayerRole(2, 'lupo', mockGameState)).toBe(false); // lupomannaro
      expect(checkPlayerRole(5, 'lupo', mockGameState)).toBe(false); // veggente
    });

    it('should correctly identify lupo-related roles when difficolta is disabled', () => {
      mockGameState.settings.difficolta = false;

      // Only actual lupo should be considered "lupo" when difficolta is disabled
      expect(checkPlayerRole(3, 'lupo', mockGameState)).toBe(true); // lupo
      expect(checkPlayerRole(4, 'lupo', mockGameState)).toBe(false); // lupoCiccione (grouping ignored)
      
      // These should not be considered "lupo"
      expect(checkPlayerRole(1, 'lupo', mockGameState)).toBe(false); // boia
      expect(checkPlayerRole(2, 'lupo', mockGameState)).toBe(false); // lupomannaro
      expect(checkPlayerRole(5, 'lupo', mockGameState)).toBe(false); // veggente
    });
  });
});
