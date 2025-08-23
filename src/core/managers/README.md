# Game Engine Managers

This directory contains the refactored game engine components, organized by responsibility following SOLID principles.

## Architecture Overview

The game engine has been split into focused managers, each handling a specific aspect of the game logic:

### 🎮 GameStateManager
**Responsibility**: Core game state operations and data management

- `createEmptyState()` - Initialize empty game state
- `getAlivePlayers()` - Get all living players
- `getAliveTeams()` - Get unique teams of alive players
- `initializeNightTracking()` - Setup night tracking data
- `recordPowerUsage()` - Track power usage
- `setSindaco()` - Set the mayor
- `getPlayerRealTimeVisibleTeam()` - Get player's visible team

### 🏆 WinConditionManager
**Responsibility**: All win condition logic and game end detection

- `computeWinner()` - Basic team-based win calculation
- `evaluateWinner()` - Custom role-based win conditions
- `checkGameEndCondition()` - Check if game should end
- `checkImmediateWinOnLynch()` - Handle immediate wins (like Matto)
- `validateGameContinuation()` - Validate if game can continue

### 👥 PlayerManager
**Responsibility**: Player-related operations and lifecycle management

- `initializePlayerRoleState()` - Setup player role state
- `createPlayersFromRoleCounts()` - Create players from role configuration
- `lynchPlayer()` - Handle player lynching
- `killPlayer()` / `resurrectPlayer()` - Player death/revival
- `getPlayersByRole()` - Filter players by role
- `findPlayer()` - Find specific player
- `adjustStartNightForFirstNightSkip()` - Handle first night skip logic

### 🔒 RoleConstraintManager
**Responsibility**: Role constraint validation and usage limits

- `checkRoleConstraints()` - Validate if role can act
- `isRoleUsed()` - Check if role result indicates usage
- `canPlayerActAtNight()` - Check if player can act
- `hasPlayerExceededUsageLimit()` - Check usage limits
- `getRoleUsage()` - Get role usage type

### ⚙️ SetupManager
**Responsibility**: Game setup and initialization logic

- `initSetupPlayers()` - Initialize setup phase players
- `initDefaultRolesCounts()` - Calculate default role distribution
- `resizePlayers()` - Adjust player count
- `normalizeRoleCounts()` - Validate and normalize role counts
- `updateRoleCount()` - Update specific role count
- `setRoleEnabled()` - Enable/disable roles
- `beginReveal()` - Start role reveal phase
- `setupGame()` - Initialize game with role counts

### 🌙 NightPhaseManager
**Responsibility**: Night phase execution and logic

- `beginNight()` - Initialize night phase
- `recordNightResult()` - Process night action results
- `resolveNight()` - Create night summary
- `startNextNight()` - Begin next night phase
- `applyPassiveEffects()` - Handle passive role effects
- `createNightSummary()` - Generate night summary

### ☀️ DayPhaseManager
**Responsibility**: Day phase execution and logic

- `continueToDay()` - Transition from night to day
- `lynchPlayer()` - Handle day phase lynching
- `completeDay()` - End day phase
- `processVote()` - Handle voting logic
- `getVotingPower()` - Calculate player voting power
- `getEligibleVoters()` / `getEligibleTargets()` - Get voting participants

## Benefits of This Architecture

### 🎯 Single Responsibility Principle
Each manager has one clear purpose and responsibility.

### 🔧 Maintainability
- Easier to find and modify specific functionality
- Isolated concerns reduce side effects
- Clear separation of game phases

### 🧪 Testability
- Each manager can be unit tested independently
- Mocking dependencies is straightforward
- Easier to test specific game scenarios

### 🔄 Reusability
- Managers can be reused across different parts of the application
- Functionality is modular and composable

### 📖 Readability
- Code is organized by domain concept
- Function names clearly indicate their purpose
- Easier onboarding for new developers

## Usage Example

```typescript
import { 
  GameStateManager, 
  WinConditionManager, 
  NightPhaseManager 
} from './managers';

// Create new game
const state = GameStateManager.createEmptyState();

// Start night phase
NightPhaseManager.beginNight(state, roles);

// Check win conditions
const winner = WinConditionManager.evaluateWinner(state, roles);
```

## Migration Notes

The main `engine.ts` file now acts as a facade, re-exporting functions from the managers for backward compatibility. This ensures existing code continues to work while providing access to the new modular architecture.

All function signatures remain the same, so no changes are required in calling code.
