import { describe, it, expect, beforeEach } from 'vitest';
import { useRoleTesting } from '../../composables/useRoleTesting';

/**
 * Behavioral test for Lupo role
 * Tests the actual game behavior and interactions, not just properties
 */
describe('Lupo Role Behavioral Tests', () => {
    let roleTesting: ReturnType<typeof useRoleTesting>;

    beforeEach(() => {
        roleTesting = useRoleTesting();
    });

    it('should be able to kill villagers in basic scenario', async () => {
        const results = await roleTesting.testRoleComprehensive('lupo');
        
        // Check that at least one test passed
        const basicTest = results.find(r => r.scenario === 'Basic Functionality');
        expect(basicTest).toBeDefined();
        expect(basicTest?.success).toBe(true);
        
        // Check that the game had some deaths
        expect(basicTest?.actualOutcome?.events).toContain(
            expect.stringMatching(/died|killed|eliminated/i)
        );
    });

    it('should work with other wolf roles', async () => {
        const results = await roleTesting.testRoleInteractions('lupo', ['lupoCiccione', 'insinuo']);
        
        // All interaction tests should pass
        results.forEach(result => {
            expect(result.success).toBe(true);
        });
    });

    it('should be countered by guardia', async () => {
        const scenario = roleTesting.createWolfVillageScenario('lupo');
        scenario.players.push({ name: 'Guardia', roleId: 'guardia' });
        
        const { simulateGame } = useGameSimulation();
        const result = await simulateGame(scenario);
        
        expect(result.success).toBe(true);
        
        // Check that guardia saved someone
        const saveEvents = result.events.filter(e => 
            e.description.includes('saved') || e.description.includes('protect')
        );
        expect(saveEvents.length).toBeGreaterThan(0);
    });

    it('should be detected by veggente', async () => {
        const scenario = roleTesting.createWolfVillageScenario('lupo');
        scenario.players.push({ name: 'Veggente', roleId: 'veggente' });
        
        const { simulateGame } = useGameSimulation();
        const result = await simulateGame(scenario);
        
        expect(result.success).toBe(true);
        
        // Check that veggente investigated someone
        const investigateEvents = result.events.filter(e => 
            e.description.includes('investigate') || e.description.includes('discover')
        );
        expect(investigateEvents.length).toBeGreaterThan(0);
    });

    it('should win when reaching parity with villagers', async () => {
        const scenario = {
            players: [
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
        expect(result.winner).toContain('lupi');
    });

    it('should work with lupoCiccione grouping', async () => {
        const scenario = {
            players: [
                { name: 'Lupo', roleId: 'lupo' },
                { name: 'LupoCiccione', roleId: 'lupoCiccione' },
                { name: 'Villico1', roleId: 'villico' },
                { name: 'Villico2', roleId: 'villico' },
                { name: 'Villico3', roleId: 'villico' }
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
        
        // Check that both lupo and lupoCiccione acted
        const lupoEvents = result.events.filter(e => 
            e.description.includes('lupo') || e.description.includes('Lupo')
        );
        expect(lupoEvents.length).toBeGreaterThan(0);
    });

    it('should be affected by illusionista blocking', async () => {
        const scenario = {
            players: [
                { name: 'Lupo', roleId: 'lupo' },
                { name: 'Illusionista', roleId: 'illusionista' },
                { name: 'Villico1', roleId: 'villico' },
                { name: 'Villico2', roleId: 'villico' },
                { name: 'Villico3', roleId: 'villico' }
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
        
        // Check that illusionista blocked someone
        const blockEvents = result.events.filter(e => 
            e.description.includes('block') || e.description.includes('Illusionista')
        );
        expect(blockEvents.length).toBeGreaterThan(0);
    });

    it('should handle complex multi-role scenarios', async () => {
        const results = await roleTesting.testRoleComprehensive('lupo');
        
        const complexTest = results.find(r => r.scenario === 'Complex Interactions');
        expect(complexTest).toBeDefined();
        expect(complexTest?.success).toBe(true);
        
        // Complex scenarios should have more events
        expect(complexTest?.actualOutcome?.events.length).toBeGreaterThan(5);
    });
});
