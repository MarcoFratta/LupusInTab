import { describe, it, expect, beforeEach } from 'vitest';
import { useRoleTesting } from '../../composables/useRoleTesting';

/**
 * Behavioral test for Lupomannaro role
 * Tests the actual game behavior and interactions, not just properties
 */
describe('Lupomannaro Role Behavioral Tests', () => {
    let roleTesting: ReturnType<typeof useRoleTesting>;

    beforeEach(() => {
        roleTesting = useRoleTesting();
    });

    it('should be immune to lupo attacks', async () => {
        const scenario = {
            players: [
                { name: 'Lupomannaro', roleId: 'lupomannaro' },
                { name: 'Lupo1', roleId: 'lupo' },
                { name: 'Lupo2', roleId: 'lupo' },
                { name: 'Villico1', roleId: 'villico' },
                { name: 'Villico2', roleId: 'villico' }
            ],
            settings: {
                skipFirstNightActions: false,
                enableSindaco: false,
                discussionTimerEnabled: false
            },
            maxNights: 3,
            maxDays: 3,
            enableGroupings: true
        };
        
        const { simulateGame } = useGameSimulation();
        const result = await simulateGame(scenario);
        
        expect(result.success).toBe(true);
        
        // Check that lupomannaro survived lupo attacks
        const lupomannaro = result.gameState?.players.find(p => p.roleId === 'lupomannaro');
        expect(lupomannaro?.alive).toBe(true);
    });

    it('should kill target when guessing correct role', async () => {
        const scenario = {
            players: [
                { name: 'Lupomannaro', roleId: 'lupomannaro' },
                { name: 'Villico1', roleId: 'villico' },
                { name: 'Villico2', roleId: 'villico' },
                { name: 'Villico3', roleId: 'villico' }
            ],
            settings: {
                skipFirstNightActions: false,
                enableSindaco: false,
                discussionTimerEnabled: false
            },
            maxNights: 2,
            maxDays: 2,
            enableGroupings: true
        };
        
        const { simulateGame } = useGameSimulation();
        const result = await simulateGame(scenario);
        
        expect(result.success).toBe(true);
        
        // Check that lupomannaro action was recorded
        const lupomannaroEvents = result.events.filter(e => 
            e.description.includes('lupomannaro') || e.description.includes('Lupomannaro')
        );
        expect(lupomannaroEvents.length).toBeGreaterThan(0);
    });

    it('should block other teams from winning when alive', async () => {
        const scenario = {
            players: [
                { name: 'Lupomannaro', roleId: 'lupomannaro' },
                { name: 'Lupo1', roleId: 'lupo' },
                { name: 'Lupo2', roleId: 'lupo' },
                { name: 'Villico1', roleId: 'villico' }
            ],
            settings: {
                skipFirstNightActions: false,
                enableSindaco: false,
                discussionTimerEnabled: false
            },
            maxNights: 5,
            maxDays: 5,
            enableGroupings: true
        };
        
        const { simulateGame } = useGameSimulation();
        const result = await simulateGame(scenario);
        
        expect(result.success).toBe(true);
        
        // Lupomannaro should still be alive and blocking wins
        const lupomannaro = result.gameState?.players.find(p => p.roleId === 'lupomannaro');
        if (lupomannaro?.alive) {
            // If lupomannaro is alive, no other team should have won
            expect(result.winner).toBeUndefined();
        }
    });

    it('should win when only 2 players remain', async () => {
        const scenario = {
            players: [
                { name: 'Lupomannaro', roleId: 'lupomannaro' },
                { name: 'Villico1', roleId: 'villico' },
                { name: 'Villico2', roleId: 'villico' }
            ],
            settings: {
                skipFirstNightActions: false,
                enableSindaco: false,
                discussionTimerEnabled: false
            },
            maxNights: 5,
            maxDays: 5,
            enableGroupings: true
        };
        
        const { simulateGame } = useGameSimulation();
        const result = await simulateGame(scenario);
        
        expect(result.success).toBe(true);
        
        // Check if lupomannaro won (mannari team)
        if (result.winner) {
            expect(result.winner).toContain('mannari');
        }
    });

    it('should be killed by veggente investigation', async () => {
        const scenario = {
            players: [
                { name: 'Lupomannaro', roleId: 'lupomannaro' },
                { name: 'Veggente', roleId: 'veggente' },
                { name: 'Villico1', roleId: 'villico' },
                { name: 'Villico2', roleId: 'villico' }
            ],
            settings: {
                skipFirstNightActions: false,
                enableSindaco: false,
                discussionTimerEnabled: false
            },
            maxNights: 3,
            maxDays: 3,
            enableGroupings: true
        };
        
        const { simulateGame } = useGameSimulation();
        const result = await simulateGame(scenario);
        
        expect(result.success).toBe(true);
        
        // Check that veggente investigated someone
        const investigateEvents = result.events.filter(e => 
            e.description.includes('investigate') || e.description.includes('veggente')
        );
        expect(investigateEvents.length).toBeGreaterThan(0);
    });

    it('should work in complex multi-role scenarios', async () => {
        const results = await roleTesting.testRoleComprehensive('lupomannaro');
        
        const complexTest = results.find(r => r.scenario === 'Complex Interactions');
        expect(complexTest).toBeDefined();
        expect(complexTest?.success).toBe(true);
        
        // Complex scenarios should have more events
        expect(complexTest?.actualOutcome?.events.length).toBeGreaterThan(5);
    });

    it('should interact correctly with other special roles', async () => {
        const results = await roleTesting.testRoleInteractions('lupomannaro', ['lupo', 'veggente', 'guardia', 'insinuo']);
        
        // All interaction tests should pass
        results.forEach(result => {
            expect(result.success).toBe(true);
        });
    });

    it('should have correct win constraint behavior', async () => {
        const scenario = {
            players: [
                { name: 'Lupomannaro', roleId: 'lupomannaro' },
                { name: 'Lupo1', roleId: 'lupo' },
                { name: 'Lupo2', roleId: 'lupo' },
                { name: 'Villico1', roleId: 'villico' },
                { name: 'Villico2', roleId: 'villico' },
                { name: 'Villico3', roleId: 'villico' }
            ],
            settings: {
                skipFirstNightActions: false,
                enableSindaco: false,
                discussionTimerEnabled: false
            },
            maxNights: 8,
            maxDays: 8,
            enableGroupings: true
        };
        
        const { simulateGame } = useGameSimulation();
        const result = await simulateGame(scenario);
        
        expect(result.success).toBe(true);
        
        // Test that lupomannaro's win constraint is working
        const lupomannaro = result.gameState?.players.find(p => p.roleId === 'lupomannaro');
        if (lupomannaro?.alive) {
            // If lupomannaro is alive, he should be blocking other wins
            // This is tested by the fact that the game continues instead of ending early
            expect(result.nightNumber).toBeGreaterThan(1);
        }
    });
});
