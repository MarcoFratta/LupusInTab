import { ref } from 'vue';
import { useGameSimulation, type SimulationConfig, type SimulationResult } from './useGameSimulation';
import { ROLES } from '../roles';

export interface RoleTestScenario {
    name: string;
    description: string;
    config: SimulationConfig;
    expectedOutcome?: {
        winner?: string;
        minNights?: number;
        maxNights?: number;
        shouldHaveEvents?: string[];
        shouldNotHaveEvents?: string[];
    };
}

export interface RoleTestResult {
    roleId: string;
    scenario: string;
    success: boolean;
    error?: string;
    actualOutcome?: {
        winner?: string;
        nights: number;
        days: number;
        events: string[];
    };
    expectedOutcome?: any;
}

/**
 * Role Testing Composable
 * Provides utilities for testing individual roles and their interactions
 * Makes it easy to create comprehensive test suites for each role
 */
export function useRoleTesting() {
    const { simulateGame, testRole, testRoleInteraction } = useGameSimulation();
    
    const testResults = ref<RoleTestResult[]>([]);
    const isTesting = ref(false);

    /**
     * Create a basic test scenario for a role
     */
    const createBasicScenario = (roleId: string, additionalRoles: string[] = []): SimulationConfig => {
        const allRoles = [roleId, ...additionalRoles];
        
        // Ensure we have at least 4 players
        while (allRoles.length < 4) {
            allRoles.push('villico');
        }

        return {
            players: allRoles.map((role, index) => ({
                name: `Player${index + 1}`,
                roleId: role
            })),
            settings: {
                skipFirstNightActions: false,
                enableSindaco: false,
                discussionTimerEnabled: false
            },
            maxNights: 5,
            maxDays: 5,
            enableGroupings: true
        };
    };

    /**
     * Create a wolf vs village scenario
     */
    const createWolfVillageScenario = (roleId: string, isWolf: boolean = false): SimulationConfig => {
        const roles = [roleId];
        
        if (isWolf) {
            roles.push('villico', 'villico', 'villico', 'guardia', 'veggente');
        } else {
            roles.push('lupo', 'villico', 'villico', 'villico', 'guardia');
        }

        return {
            players: roles.map((role, index) => ({
                name: `Player${index + 1}`,
                roleId: role
            })),
            settings: {
                skipFirstNightActions: false,
                enableSindaco: false,
                discussionTimerEnabled: false
            },
            maxNights: 5,
            maxDays: 5,
            enableGroupings: true
        };
    };

    /**
     * Create a complex scenario with multiple special roles
     */
    const createComplexScenario = (roleId: string): SimulationConfig => {
        const roles = [
            roleId,
            'lupo',
            'lupo',
            'villico',
            'villico',
            'guardia',
            'veggente',
            'insinuo',
            'illusionista'
        ];

        return {
            players: roles.map((role, index) => ({
                name: `Player${index + 1}`,
                roleId: role
            })),
            settings: {
                skipFirstNightActions: false,
                enableSindaco: false,
                discussionTimerEnabled: false
            },
            maxNights: 8,
            maxDays: 8,
            enableGroupings: true
        };
    };

    /**
     * Test a role with multiple scenarios
     */
    const testRoleComprehensive = async (roleId: string): Promise<RoleTestResult[]> => {
        isTesting.value = true;
        const results: RoleTestResult[] = [];

        try {
            const roleDef = ROLES[roleId];
            if (!roleDef) {
                throw new Error(`Role ${roleId} not found`);
            }

            // Test scenarios
            const scenarios: RoleTestScenario[] = [
                {
                    name: 'Basic Functionality',
                    description: 'Test basic role functionality in a simple game',
                    config: createBasicScenario(roleId),
                    expectedOutcome: {
                        minNights: 1,
                        maxNights: 5
                    }
                },
                {
                    name: 'Wolf vs Village',
                    description: 'Test role in wolf vs village scenario',
                    config: createWolfVillageScenario(roleId, roleDef.team === 'lupi'),
                    expectedOutcome: {
                        minNights: 1,
                        maxNights: 5
                    }
                },
                {
                    name: 'Complex Interactions',
                    description: 'Test role with multiple special roles',
                    config: createComplexScenario(roleId),
                    expectedOutcome: {
                        minNights: 1,
                        maxNights: 8
                    }
                }
            ];

            // Run each scenario
            for (const scenario of scenarios) {
                try {
                    const result = await simulateGame(scenario.config);
                    
                    const testResult: RoleTestResult = {
                        roleId,
                        scenario: scenario.name,
                        success: result.success,
                        error: result.error,
                        actualOutcome: {
                            winner: result.winner,
                            nights: result.nightNumber,
                            days: result.dayNumber,
                            events: result.events.map(e => e.description)
                        },
                        expectedOutcome: scenario.expectedOutcome
                    };

                    // Validate expected outcomes
                    if (scenario.expectedOutcome) {
                        if (scenario.expectedOutcome.minNights && result.nightNumber < scenario.expectedOutcome.minNights) {
                            testResult.success = false;
                            testResult.error = `Expected at least ${scenario.expectedOutcome.minNights} nights, got ${result.nightNumber}`;
                        }
                        
                        if (scenario.expectedOutcome.maxNights && result.nightNumber > scenario.expectedOutcome.maxNights) {
                            testResult.success = false;
                            testResult.error = `Expected at most ${scenario.expectedOutcome.maxNights} nights, got ${result.nightNumber}`;
                        }

                        if (scenario.expectedOutcome.winner && result.winner !== scenario.expectedOutcome.winner) {
                            testResult.success = false;
                            testResult.error = `Expected winner ${scenario.expectedOutcome.winner}, got ${result.winner}`;
                        }
                    }

                    results.push(testResult);
                } catch (error) {
                    results.push({
                        roleId,
                        scenario: scenario.name,
                        success: false,
                        error: error instanceof Error ? error.message : 'Unknown error',
                        expectedOutcome: scenario.expectedOutcome
                    });
                }
            }

        } finally {
            isTesting.value = false;
        }

        testResults.value.push(...results);
        return results;
    };

    /**
     * Test role interactions
     */
    const testRoleInteractions = async (roleId: string, interactionRoles: string[]): Promise<RoleTestResult[]> => {
        const results: RoleTestResult[] = [];

        for (const interactionRole of interactionRoles) {
            try {
                const scenario = createBasicScenario(roleId, [interactionRole]);
                const result = await simulateGame(scenario);
                
                results.push({
                    roleId,
                    scenario: `Interaction with ${interactionRole}`,
                    success: result.success,
                    error: result.error,
                    actualOutcome: {
                        winner: result.winner,
                        nights: result.nightNumber,
                        days: result.dayNumber,
                        events: result.events.map(e => e.description)
                    }
                });
            } catch (error) {
                results.push({
                    roleId,
                    scenario: `Interaction with ${interactionRole}`,
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        }

        return results;
    };

    /**
     * Test all roles
     */
    const testAllRoles = async (): Promise<RoleTestResult[]> => {
        const allResults: RoleTestResult[] = [];
        const roleIds = Object.keys(ROLES);

        for (const roleId of roleIds) {
            const results = await testRoleComprehensive(roleId);
            allResults.push(...results);
        }

        return allResults;
    };

    /**
     * Test specific role combinations
     */
    const testRoleCombinations = async (combinations: Array<{ roles: string[]; name: string }>): Promise<RoleTestResult[]> => {
        const results: RoleTestResult[] = [];

        for (const combination of combinations) {
            try {
                const config: SimulationConfig = {
                    players: combination.roles.map((role, index) => ({
                        name: `Player${index + 1}`,
                        roleId: role
                    })),
                    settings: {
                        skipFirstNightActions: false,
                        enableSindaco: false,
                        discussionTimerEnabled: false
                    },
                    maxNights: 5,
                    maxDays: 5,
                    enableGroupings: true
                };

                const result = await simulateGame(config);
                
                results.push({
                    roleId: combination.roles[0],
                    scenario: combination.name,
                    success: result.success,
                    error: result.error,
                    actualOutcome: {
                        winner: result.winner,
                        nights: result.nightNumber,
                        days: result.dayNumber,
                        events: result.events.map(e => e.description)
                    }
                });
            } catch (error) {
                results.push({
                    roleId: combination.roles[0],
                    scenario: combination.name,
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        }

        return results;
    };

    /**
     * Get test statistics
     */
    const getTestStatistics = () => {
        const total = testResults.value.length;
        const successful = testResults.value.filter(r => r.success).length;
        const failed = total - successful;
        
        const byRole = testResults.value.reduce((acc, result) => {
            if (!acc[result.roleId]) {
                acc[result.roleId] = { total: 0, successful: 0, failed: 0 };
            }
            acc[result.roleId].total++;
            if (result.success) {
                acc[result.roleId].successful++;
            } else {
                acc[result.roleId].failed++;
            }
            return acc;
        }, {} as Record<string, { total: number; successful: number; failed: number }>);

        return {
            total,
            successful,
            failed,
            successRate: total > 0 ? (successful / total) * 100 : 0,
            byRole
        };
    };

    /**
     * Clear test results
     */
    const clearTestResults = () => {
        testResults.value = [];
    };

    return {
        testResults,
        isTesting,
        createBasicScenario,
        createWolfVillageScenario,
        createComplexScenario,
        testRoleComprehensive,
        testRoleInteractions,
        testAllRoles,
        testRoleCombinations,
        getTestStatistics,
        clearTestResults
    };
}
