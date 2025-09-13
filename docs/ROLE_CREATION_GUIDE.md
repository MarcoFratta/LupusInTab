# Role Creation Guide

This guide explains how to create new roles for LupusInTab. It covers the complete process from role definition to testing.

## Table of Contents

- [Overview](#overview)
- [Role Definition Structure](#role-definition-structure)
- [Step-by-Step Guide](#step-by-step-guide)
- [Game API Reference](#game-api-reference)
- [Component Creation](#component-creation)
- [Testing Your Role](#testing-your-role)
- [Common Patterns](#common-patterns)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Overview

Creating a new role in LupusInTab requires three main files:

1. **Role Definition** (`src/roles/yourRole.ts`) - Defines the role's behavior and properties
2. **Prompt Component** (`src/components/roles/YourRole/YourRolePrompt.vue`) - UI for role actions
3. **Resolve Component** (`src/components/roles/YourRole/YourRoleResolveDetails.vue`) - UI for showing results

## Role Definition Structure

### Basic Role Definition

```typescript
import type { RoleDef } from '../types';
import { componentFactory } from "../utils/roleUtils";
import { RoleAPI } from '../utils/roleAPI';

export const yourRole: RoleDef = {
    // Required properties
    id: 'yourRole',
    name: 'Your Role',
    team: 'villaggio', // or 'lupi', 'alieni', 'mannari', 'matti', 'parassita'
    score: 5, // Power score for team balance
    
    // Descriptions
    description: 'Short description shown during reveal',
    longDescription: `Detailed description shown in role details.

COME FUNZIONA:
• First mechanic
• Second mechanic
• Third mechanic`,
    
    // Visual properties
    color: '#8b5cf6', // Hex color for UI
    icon: 'YourRoleIcon', // Optional icon name
    
    // Game mechanics
    phaseOrder: 1, // When this role acts (lower = earlier, "any" = any time)
    actsAtNight: 'alive', // 'always', 'alive', 'dead', 'never', 'blocked'
    effectType: 'optional', // 'optional' or 'required'
    numberOfUsage: 1, // Number of times it can be used, or 'unlimited'
    startNight: 1, // First night it can act (default: 1)
    
    // Targeting
    canTargetDead: false, // Can target dead players
    
    // Faction properties
    visibleAsTeam: 'villaggio', // How it appears to investigators
    countAs: 'villaggio', // Which team it counts as for win conditions
    revealAlliesWithinRole: true, // Show other players with same role during reveal
    
    // Role interactions
    affectedRoles: ['lupo'], // Roles affected by this role's power
    knownTo: ['lupo'], // Roles that know this role's identity
    revealPartnersRoleIds: ['massone'], // Roles that see each other during reveal
    
    // Setup constraints
    minCount: 1, // Minimum number of this role
    maxCount: 2, // Maximum number of this role
    
    // Core function - what happens when role acts
    resolve(gameState: any, action: any) {
        // Your role logic here
        return {
            type: 'yourRole_action',
            nightNumber: gameState.nightNumber,
            // ... other data
        };
    },
    
    // Optional functions
    passiveEffect: (gameState: any, player: any) => {
        // Runs every night automatically
    },
    
    restoreFunction: (gameState: any) => {
        // Restores temporary changes during day phase
    },
    
    groups: (gameState: any) => {
        // Defines role groupings
        return [{ fromRole: 'lupo', toRole: 'yourRole' }];
    },
    
    checkWin: (gameState: any) => {
        // Custom win condition check
        return false;
    },
    
    checkWinConstraint: (gameState: any) => {
        // Blocks other teams from winning
        return false;
    },
    
    // Component references
    getPromptComponent: componentFactory('YourRole', "prompt"),
    getResolveDetailsComponent: componentFactory('YourRole', "details")
};
```

## Step-by-Step Guide

### Step 1: Create Role Definition

1. Create `src/roles/yourRole.ts`
2. Define the role with all required properties
3. Implement the `resolve` function with your role's logic

### Step 2: Create Prompt Component

1. Create directory `src/components/roles/YourRole/`
2. Create `YourRolePrompt.vue`:

```vue
<template>
  <div class="role-prompt">
    <h3>{{ role.name }}</h3>
    <p>{{ role.description }}</p>
    
    <!-- Your role-specific UI here -->
    <div v-if="needsTarget">
      <GenericTargetSelectPrompt
        :choices="targetChoices"
        @select="handleTargetSelect"
      />
    </div>
    
    <div v-if="needsConfirmation">
      <GenericYesNoPrompt
        :question="confirmationQuestion"
        @select="handleConfirmation"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useGameStore } from '@/stores/game';
import { RoleAPI } from '@/utils/roleAPI';
import GenericTargetSelectPrompt from '@/components/ui/GenericTargetSelectPrompt.vue';
import GenericYesNoPrompt from '@/components/ui/GenericYesNoPrompt.vue';

interface Props {
  playerIds: number[];
}

const props = defineProps<Props>();
const store = useGameStore();
const gameState = store.state;

// Get the role definition
const role = computed(() => {
  const player = RoleAPI.getPlayer(props.playerIds[0]);
  return player ? RoleAPI.getRole(player.roleId) : null;
});

// Define who can be targeted
const targetChoices = computed(() => {
  return RoleAPI.getAlivePlayers().map(player => ({
    id: player.id,
    name: player.name,
    disabled: false // Add any restrictions here
  }));
});

// Handle target selection
const handleTargetSelect = (targetId: number) => {
  // Emit the action data
  emit('action', {
    type: 'yourRole_action',
    data: { targetId }
  });
};

// Handle confirmation
const handleConfirmation = (confirmed: boolean) => {
  if (confirmed) {
    // Proceed with action
    emit('action', {
      type: 'yourRole_action',
      data: { confirmed: true }
    });
  } else {
    // Cancel action
    emit('action', null);
  }
};

const emit = defineEmits<{
  action: [data: any | null]
}>();
</script>
```

### Step 3: Create Resolve Component

1. Create `YourRoleResolveDetails.vue`:

```vue
<template>
  <div class="resolve-details">
    <h3>{{ role.name }}</h3>
    
    <div v-if="actionData">
      <p>Action performed: {{ actionData.description }}</p>
      
      <!-- Show results based on action data -->
      <div v-if="actionData.targetId">
        <p>Target: {{ getPlayerName(actionData.targetId) }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { RoleAPI } from '@/utils/roleAPI';

interface Props {
  action: any;
  playerIds: number[];
}

const props = defineProps<Props>();

const role = computed(() => {
  const player = RoleAPI.getPlayer(props.playerIds[0]);
  return player ? RoleAPI.getRole(player.roleId) : null;
});

const actionData = computed(() => props.action?.data);

const getPlayerName = (playerId: number) => {
  const player = RoleAPI.getPlayer(playerId);
  return player?.name || 'Unknown';
};
</script>
```

### Step 4: Add to Roles Index

1. Open `src/roles/index.ts`
2. Add your role:

```typescript
export { yourRole } from './yourRole';
```

3. Add to the ROLES object:

```typescript
export const ROLES: RolesRegistry = {
  // ... existing roles
  yourRole,
};
```

### Step 5: Test Your Role

1. Create `src/__tests__/roles/yourRole.test.ts`
2. Write tests for your role's behavior
3. Test in the browser

## Game API Reference

The Game API provides a clean interface for role interactions. Use `RoleAPI` in your role definitions and components.

### Player Queries

```typescript
// Get players
RoleAPI.getAlivePlayers()           // All alive players
RoleAPI.getDeadPlayers()            // All dead players
RoleAPI.getPlayer(id)               // Specific player by ID
RoleAPI.getPlayersByRole(roleId)    // Players with specific role
RoleAPI.getAlivePlayersByRole(roleId) // Alive players with specific role
RoleAPI.getPlayersByTeam(team)      // Players by team
RoleAPI.getAlivePlayersByTeam(team) // Alive players by team
```

### Role Queries

```typescript
// Check roles
RoleAPI.hasRole(playerId, roleId, considerGroupings?)     // Player has specific role
RoleAPI.hasAnyRole(playerId, roleIds, considerGroupings?) // Player has any of these roles
RoleAPI.getPlayersWithRole(roleId, considerGroupings?)    // All players with role
RoleAPI.getAlivePlayersWithRole(roleId, considerGroupings?) // Alive players with role
```

### Game State

```typescript
// Game state
RoleAPI.getNightNumber()      // Current night number
RoleAPI.getDayNumber()        // Current day number
RoleAPI.getPhase()            // Current phase ('setup', 'reveal', 'night', 'day')
RoleAPI.isFirstNight()        // Is this the first night?
RoleAPI.isFirstNightSkipped() // Is first night skipped?
```

### Night Context

```typescript
// Night actions
RoleAPI.getPendingKills(playerId)  // Kills targeting player
RoleAPI.hasPendingKills(playerId)  // Player has pending kills
RoleAPI.getSaves(playerId)         // Saves protecting player
RoleAPI.wasSaved(playerId)         // Player was saved this night
RoleAPI.getChecks()                // All investigation results
```

### Role Actions

```typescript
// Actions
RoleAPI.addKill(targetId, killerRole, data?)           // Add kill
RoleAPI.removeKills(targetId, killerRole)              // Remove kills
RoleAPI.addSave(targetId, saverId, fromRoles)          // Add save
RoleAPI.addCheck(investigatorId, targetId, team)       // Add investigation
RoleAPI.setPlayerVisibleTeam(playerId, team)           // Change visible team
RoleAPI.blockPlayer(playerId)                          // Block player
RoleAPI.unblockPlayer(playerId, originalActsAtNight)   // Unblock player
```

### Usage Tracking

```typescript
// Power usage
RoleAPI.recordPowerUsage(roleId, playerId)  // Record power usage
RoleAPI.getPowerUsageCount(roleId, playerId) // Get usage count
RoleAPI.canUsePower(playerId)               // Can player use power?
```

### Win Conditions

```typescript
// Win conditions
RoleAPI.checkTeamWin(team)    // Check if team won
RoleAPI.getWinningTeams()     // Get all winning teams
```

### Custom Data

```typescript
// Custom data storage
RoleAPI.getCustomData(roleId)     // Get role's custom data
RoleAPI.setCustomData(roleId, data) // Set role's custom data
RoleAPI.clearCustomData(roleId)   // Clear role's custom data
```

## Component Creation

### Generic Components

Use these pre-built components for common UI patterns:

- `GenericTargetSelectPrompt` - Select a single target
- `GenericMultiTargetSelectPrompt` - Select multiple targets
- `GenericRoleSelectPrompt` - Select a role
- `GenericYesNoPrompt` - Yes/No confirmation

### Component Props

All role prompt components receive:
- `playerIds: number[]` - IDs of players acting with this role

### Component Events

Emit these events:
- `action: [data: any | null]` - Action data or null to cancel

## Testing Your Role

### Unit Tests

```typescript
import { describe, it, expect } from 'vitest';
import { yourRole } from '../../roles/yourRole';

describe('YourRole', () => {
  it('should have correct properties', () => {
    expect(yourRole.id).toBe('yourRole');
    expect(yourRole.team).toBe('villaggio');
    expect(yourRole.actsAtNight).toBe('alive');
  });

  it('should resolve correctly', () => {
    const gameState = {
      // Mock game state
    };
    const action = {
      data: { targetId: 1 }
    };
    
    const result = yourRole.resolve(gameState, action);
    expect(result).toBeDefined();
    expect(result.type).toBe('yourRole_action');
  });
});
```

### Integration Tests

```typescript
import { describe, it, expect } from 'vitest';
import { useGameSimulation } from '../../composables/useGameSimulation';

describe('YourRole Integration', () => {
  it('should work in complete game scenario', async () => {
    const simulation = useGameSimulation();
    
    const scenario = {
      players: [
        { name: 'Player 1', roleId: 'yourRole' },
        { name: 'Player 2', roleId: 'lupo' }
      ],
      // ... other scenario data
    };
    
    const result = await simulation.runScenario(scenario);
    expect(result.success).toBe(true);
  });
});
```

## Common Patterns

### Killing Roles

```typescript
resolve(gameState: any, action: any) {
  const targetId = action?.data?.targetId;
  if (!targetId) return;
  
  RoleAPI.addKill(targetId, 'yourRole');
  
  return {
    type: 'yourRole_kill',
    nightNumber: gameState.nightNumber,
    targetId,
    message: `Player ${targetId} was killed by Your Role`
  };
}
```

### Investigation Roles

```typescript
resolve(gameState: any, action: any) {
  const targetId = action?.data?.targetId;
  if (!targetId) return;
  
  const target = RoleAPI.getPlayer(targetId);
  const visibleTeam = target?.roleState?.visibleAsTeam || target?.roleState?.realTeam;
  
  RoleAPI.addCheck(action.playerId, targetId, visibleTeam);
  
  return {
    type: 'yourRole_investigate',
    nightNumber: gameState.nightNumber,
    targetId,
    discoveredTeam: visibleTeam
  };
}
```

### Protection Roles

```typescript
resolve(gameState: any, action: any) {
  const targetId = action?.data?.targetId;
  if (!targetId) return;
  
  RoleAPI.addSave(targetId, action.playerId, ['yourRole']);
  
  return {
    type: 'yourRole_protect',
    nightNumber: gameState.nightNumber,
    targetId,
    message: `Player ${targetId} was protected by Your Role`
  };
}
```

### Custom Data Storage

```typescript
resolve(gameState: any, action: any) {
  const customData = RoleAPI.getCustomData('yourRole');
  
  // Update custom data
  customData.someValue = action.data.value;
  RoleAPI.setCustomData('yourRole', customData);
  
  return {
    type: 'yourRole_custom',
    nightNumber: gameState.nightNumber,
    data: customData
  };
}
```

## Best Practices

### Role Design

1. **Clear Purpose**: Each role should have a clear, unique purpose
2. **Balanced Power**: Consider the role's power level and team balance
3. **Interesting Interactions**: Create roles that interact meaningfully with others
4. **Clear Descriptions**: Write clear, accurate descriptions

### Code Quality

1. **Type Safety**: Use proper TypeScript types
2. **Error Handling**: Handle edge cases and invalid inputs
3. **Performance**: Avoid expensive operations in resolve functions
4. **Testing**: Write comprehensive tests

### UI/UX

1. **Clear Interface**: Make the role's actions clear to players
2. **Consistent Design**: Follow existing UI patterns
3. **Responsive**: Ensure components work on all screen sizes
4. **Accessible**: Consider accessibility in your components

## Troubleshooting

### Common Issues

1. **Role not appearing**: Check if it's added to `src/roles/index.ts`
2. **Component not loading**: Verify component file paths and exports
3. **API not working**: Ensure you're using `RoleAPI` correctly
4. **Type errors**: Check TypeScript types and imports

### Debug Tips

1. **Console Logging**: Add `console.log` statements to debug
2. **Browser DevTools**: Use Vue DevTools to inspect component state
3. **Test Scenarios**: Create simple test scenarios to verify behavior
4. **Check Examples**: Look at existing roles for reference

### Getting Help

1. **Check Documentation**: Review this guide and existing code
2. **Look at Examples**: Study similar existing roles
3. **Ask Questions**: Create an issue or discussion
4. **Test Thoroughly**: Test your role in various scenarios

## Conclusion

Creating roles in LupusInTab is a rewarding experience that allows you to add unique gameplay elements. Follow this guide, use the provided APIs, and don't hesitate to ask for help when needed.

Happy role creating! 🎭