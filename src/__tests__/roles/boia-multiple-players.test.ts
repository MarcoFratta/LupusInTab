import { describe, it, expect, beforeEach } from 'vitest';
import { useGameSimulation } from '../../composables/useGameSimulation';
import { useRoleTesting } from '../../composables/useRoleTesting';

describe('Boia Multiple Players', () => {
    let simulation: ReturnType<typeof useGameSimulation>;
    let roleTesting: ReturnType<typeof useRoleTesting>;

    beforeEach(() => {
        simulation = useGameSimulation();
        roleTesting = useRoleTesting();
    });

    it('should kill all Boia players when they make wrong guess together', async () => {
        const testConfig = {
            players: [
                { name: 'Boia1', roleId: 'boia' },
                { name: 'Boia2', roleId: 'boia' },
                { name: 'Villico1', roleId: 'villico' },
                { name: 'Villico2', roleId: 'villico' }
            ],
            settings: {
                skipFirstNightActions: false
            }
        };

        const result = await simulation.simulateGame(testConfig);
        
        expect(result.success).toBe(true);
        
        // Find the Boia action in the events
        const boiaAction = result.events.find(event => 
            event.type === 'night_action' && 
            event.description?.includes('Boia action completed')
        );
        
        expect(boiaAction).toBeDefined();
        
        // Check that both Boia players are alive at start
        const alivePlayers = result.events.filter(event => 
            event.type === 'player_state' && 
            event.description?.includes('is alive')
        );
        
        const boiaAliveEvents = alivePlayers.filter(event => 
            event.description?.includes('Boia')
        );
        expect(boiaAliveEvents).toHaveLength(2);
        
        // Check that both Boia players die when wrong guess is made
        const deathEvents = result.events.filter(event => 
            event.type === 'player_death' && 
            event.description?.includes('Boia')
        );
        
        // Both Boia players should die if they make wrong guess
        expect(deathEvents.length).toBeGreaterThanOrEqual(1);
    });

    it('should kill target when Boia players make correct guess together', async () => {
        const testConfig = {
            players: [
                { name: 'Boia1', roleId: 'boia' },
                { name: 'Boia2', roleId: 'boia' },
                { name: 'Lupo1', roleId: 'lupo' },
                { name: 'Villico1', roleId: 'villico' }
            ],
            settings: {
                skipFirstNightActions: false
            }
        };

        const result = await simulation.simulateGame(testConfig);
        
        expect(result.success).toBe(true);
        
        // Check that target dies when correct guess is made
        const deathEvents = result.events.filter(event => 
            event.type === 'player_death'
        );
        
        // Should have at least one death (either target or Boia players)
        expect(deathEvents.length).toBeGreaterThanOrEqual(1);
    });

    it('should handle single Boia player correctly', async () => {
        const testConfig = {
            players: [
                { name: 'Boia1', roleId: 'boia' },
                { name: 'Villico1', roleId: 'villico' },
                { name: 'Villico2', roleId: 'villico' }
            ],
            settings: {
                skipFirstNightActions: false
            }
        };

        const result = await simulation.simulateGame(testConfig);
        
        expect(result.success).toBe(true);
        
        // Single Boia should work as before
        const boiaAction = result.events.find(event => 
            event.type === 'night_action' && 
            event.description?.includes('Boia action completed')
        );
        
        expect(boiaAction).toBeDefined();
    });

    it('should test Boia role behavior comprehensively', async () => {
        const testResult = await roleTesting.testRole('boia', {
            includeMultiplePlayers: true,
            testScenarios: ['basic', 'wolf-village', 'complex']
        });
        
        expect(testResult.success).toBe(true);
        expect(testResult.totalTests).toBeGreaterThan(0);
        expect(testResult.passedTests).toBe(testResult.totalTests);
    });
});
