import { ref, computed } from 'vue';
import { useGameStore } from '../stores/game';
import { ROLES } from '../roles';
import { setupGame, beginNight, recordNightResult, resolveNight, continueToDay, lynchPlayer, completeDay } from '../core/engine';
import type { GameState, Player, RoleDef } from '../types';

export interface SimulationResult {
    success: boolean;
    error?: string;
    gameState?: GameState;
    events: GameEvent[];
    winner?: string;
    nightNumber: number;
    dayNumber: number;
}

export interface GameEvent {
    type: 'night_action' | 'day_action' | 'death' | 'win' | 'error';
    description: string;
    data?: any;
    nightNumber?: number;
    dayNumber?: number;
}

export interface SimulationConfig {
    players: Array<{ name: string; roleId: string }>;
    settings?: {
        skipFirstNightActions?: boolean;
        enableSindaco?: boolean;
        discussionTimerEnabled?: boolean;
    };
    maxNights?: number;
    maxDays?: number;
    enableGroupings?: boolean;
}

/**
 * Game Simulation Composable
 * Provides a framework for testing role behaviors and interactions
 * Simulates complete game scenarios to validate role functionality
 */
export function useGameSimulation() {
    const store = useGameStore();
    const state = store.state;

    const isSimulating = ref(false);
    const simulationResults = ref<SimulationResult[]>([]);

    /**
     * Create a test game state with specified players and roles
     */
    const createTestGame = (config: SimulationConfig): GameState => {
        const testState = {
            ...state,
            phase: 'setup' as const,
            nightNumber: 0,
            dayNumber: 0,
            players: [],
            setup: {
                numPlayers: config.players.length,
                players: config.players.map(p => ({ name: p.name })),
                rolesCounts: {},
                rolesEnabled: {}
            },
            settings: {
                skipFirstNightActions: true,
                enableSindaco: false,
                discussionTimerEnabled: false,
                ...config.settings
            },
            custom: {},
            history: {},
            nightDeathsByNight: {},
            lynchedHistoryByDay: {},
            groupings: []
        };

        // Create players with their roles
        config.players.forEach((playerConfig, index) => {
            const player: Player = {
                id: index + 1,
                name: playerConfig.name,
                roleId: playerConfig.roleId,
                alive: true,
                roleState: {} as any
            };

            // Initialize role state
            const roleDef = ROLES[playerConfig.roleId];
            if (roleDef) {
                player.roleState = {
                    visibleAsTeam: roleDef.visibleAsTeam || roleDef.team,
                    actsAtNight: roleDef.actsAtNight || 'never',
                    realTeam: roleDef.team,
                    countAs: roleDef.countAs || roleDef.team,
                    phaseOrder: roleDef.phaseOrder !== undefined ? roleDef.phaseOrder : 'any',
                    usage: roleDef.usage || 'unlimited',
                    effectType: roleDef.effectType || 'optional',
                    numberOfUsage: roleDef.numberOfUsage || 'unlimited',
                    startNight: roleDef.startNight || 1,
                    canTargetDead: roleDef.canTargetDead || false,
                    affectedRoles: roleDef.affectedRoles || [],
                    knownTo: roleDef.knownTo || [],
                    revealPartnersRoleIds: roleDef.revealPartnersRoleIds || [],
                    revealAlliesWithinRole: roleDef.revealAlliesWithinRole || false,
                    revealToAllies: roleDef.revealToAllies || 'team',
                    revealToPartners: roleDef.revealToPartners || 'role'
                };
            }

            testState.players.push(player);
        });

        // Set up role counts
        config.players.forEach(playerConfig => {
            testState.setup.rolesCounts[playerConfig.roleId] = 
                (testState.setup.rolesCounts[playerConfig.roleId] || 0) + 1;
            testState.setup.rolesEnabled[playerConfig.roleId] = true;
        });

        return testState;
    };

    /**
     * Simulate a complete game scenario
     */
    const simulateGame = async (config: SimulationConfig): Promise<SimulationResult> => {
        isSimulating.value = true;
        const events: GameEvent[] = [];
        
        try {
            // Create test game state
            const testState = createTestGame(config);
            
            // Set up the game
            setupGame(testState, ROLES);
            events.push({
                type: 'night_action',
                description: 'Game setup completed',
                data: { players: testState.players.map(p => ({ name: p.name, role: p.roleId })) }
            });

            // Simulate reveal phase (skip for testing)
            testState.phase = 'preNight';
            testState.nightNumber = 1;

            let nightCount = 0;
            let dayCount = 0;
            const maxNights = config.maxNights || 10;
            const maxDays = config.maxDays || 10;

            while (testState.phase !== 'end' && nightCount < maxNights && dayCount < maxDays) {
                // Night phase
                if (testState.phase === 'preNight' || testState.phase === 'night') {
                    await simulateNightPhase(testState, events, config);
                    nightCount++;
                }
                
                // Day phase
                if (testState.phase === 'day') {
                    await simulateDayPhase(testState, events, config);
                    dayCount++;
                }

                // Check for win conditions
                const winners = checkWinConditions(testState);
                if (winners.length > 0) {
                    testState.winner = winners.join(', ');
                    testState.phase = 'end';
                    events.push({
                        type: 'win',
                        description: `Game won by: ${winners.join(', ')}`,
                        data: { winners },
                        nightNumber: testState.nightNumber,
                        dayNumber: testState.dayNumber
                    });
                    break;
                }
            }

            const result: SimulationResult = {
                success: true,
                gameState: testState,
                events,
                winner: testState.winner,
                nightNumber: testState.nightNumber,
                dayNumber: testState.dayNumber
            };

            simulationResults.value.push(result);
            return result;

        } catch (error) {
            const result: SimulationResult = {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                events,
                nightNumber: 0,
                dayNumber: 0
            };
            
            events.push({
                type: 'error',
                description: `Simulation failed: ${result.error}`
            });

            simulationResults.value.push(result);
            return result;
        } finally {
            isSimulating.value = false;
        }
    };

    /**
     * Simulate night phase
     */
    const simulateNightPhase = async (testState: GameState, events: GameEvent[], config: SimulationConfig) => {
        beginNight(testState, ROLES);
        events.push({
            type: 'night_action',
            description: `Night ${testState.nightNumber} begins`,
            nightNumber: testState.nightNumber
        });

        // Simulate role actions
        const alivePlayers = testState.players.filter(p => p.alive);
        const rolesToAct = new Set(alivePlayers.map(p => p.roleId));

        for (const roleId of rolesToAct) {
            const roleDef = ROLES[roleId];
            if (!roleDef || roleDef.actsAtNight === 'never') continue;

            const rolePlayers = alivePlayers.filter(p => p.roleId === roleId);
            if (rolePlayers.length === 0) continue;

            // Simulate role action (simplified - in real implementation, this would be more complex)
            const action = simulateRoleAction(roleId, rolePlayers, testState, config);
            if (action) {
                recordNightResult(testState, action);
                events.push({
                    type: 'night_action',
                    description: `${roleDef.name} action completed`,
                    data: action,
                    nightNumber: testState.nightNumber
                });
            }
        }

        // Resolve night
        resolveNight(testState, ROLES);
        
        // Check for deaths
        const deaths = testState.night?.summary?.died || [];
        if (deaths.length > 0) {
            events.push({
                type: 'death',
                description: `Players died: ${deaths.map(id => testState.players.find(p => p.id === id)?.name).join(', ')}`,
                data: { deaths },
                nightNumber: testState.nightNumber
            });
        }

        continueToDay(testState, ROLES);
    };

    /**
     * Simulate day phase
     */
    const simulateDayPhase = async (testState: GameState, events: GameEvent[], config: SimulationConfig) => {
        events.push({
            type: 'day_action',
            description: `Day ${testState.dayNumber} begins`,
            dayNumber: testState.dayNumber
        });

        // Simple day simulation - randomly lynch someone or skip
        const alivePlayers = testState.players.filter(p => p.alive);
        if (alivePlayers.length > 0) {
            // 70% chance to lynch someone
            if (Math.random() < 0.7) {
                const target = alivePlayers[Math.floor(Math.random() * alivePlayers.length)];
                lynchPlayer(testState, target.id);
                events.push({
                    type: 'death',
                    description: `${target.name} was lynched`,
                    data: { lynched: target.id },
                    dayNumber: testState.dayNumber
                });
            }
        }

        completeDay(testState, ROLES);
    };

    /**
     * Simulate a role action (simplified version)
     */
    const simulateRoleAction = (roleId: string, players: Player[], testState: GameState, config: SimulationConfig) => {
        const roleDef = ROLES[roleId];
        if (!roleDef) return null;

        // Simple simulation - in real implementation, this would be more sophisticated
        const aliveTargets = testState.players.filter(p => p.alive && !players.some(actor => actor.id === p.id));
        
        if (aliveTargets.length === 0) return null;

        // Basic role action simulation
        switch (roleId) {
            case 'lupo':
                const target = aliveTargets[Math.floor(Math.random() * aliveTargets.length)];
                return {
                    targetIds: [target.id],
                    playerIds: players.map(p => p.id)
                };
            
            case 'veggente':
                const investigateTarget = aliveTargets[Math.floor(Math.random() * aliveTargets.length)];
                return {
                    targetId: investigateTarget.id,
                    playerIds: players.map(p => p.id)
                };
            
            case 'guardia':
                const protectTarget = aliveTargets[Math.floor(Math.random() * aliveTargets.length)];
                return {
                    targetId: protectTarget.id,
                    playerIds: players.map(p => p.id)
                };
            
            default:
                // For other roles, return a basic action
                return {
                    playerIds: players.map(p => p.id),
                    data: {}
                };
        }
    };

    /**
     * Check win conditions
     */
    const checkWinConditions = (testState: GameState): string[] => {
        const winners: string[] = [];
        
        // Check each team's win condition
        const teams = new Set(Object.values(ROLES).map(role => role.team));
        
        for (const team of teams) {
            const teamRoles = Object.values(ROLES).filter(role => role.team === team);
            const hasWin = teamRoles.some(role => role.checkWin?.(testState));
            
            if (hasWin) {
                winners.push(team);
            }
        }
        
        return winners;
    };

    /**
     * Test a specific role with various scenarios
     */
    const testRole = async (roleId: string, scenarios: SimulationConfig[]): Promise<SimulationResult[]> => {
        const results: SimulationResult[] = [];
        
        for (const scenario of scenarios) {
            const result = await simulateGame(scenario);
            results.push(result);
        }
        
        return results;
    };

    /**
     * Test role interactions
     */
    const testRoleInteraction = async (role1: string, role2: string, baseScenario: SimulationConfig): Promise<SimulationResult> => {
        const scenario = {
            ...baseScenario,
            players: [
                { name: 'Player1', roleId: role1 },
                { name: 'Player2', roleId: role2 },
                { name: 'Player3', roleId: 'villico' },
                { name: 'Player4', roleId: 'villico' }
            ]
        };
        
        return await simulateGame(scenario);
    };

    /**
     * Clear simulation results
     */
    const clearResults = () => {
        simulationResults.value = [];
    };

    return {
        isSimulating,
        simulationResults,
        simulateGame,
        testRole,
        testRoleInteraction,
        clearResults
    };
}
