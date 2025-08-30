# Winning System Refactor

## Overview

The winning system has been refactored to ensure that only one team can win at a time, while maintaining the ability for roles to block other teams from winning through their `checkWinConstraint` function.

## What Changed

### Before (Old System)
- The `evaluateWinner` function would check ALL roles' `checkWinConstraint` functions first
- If ANY role returned `true` from `checkWinConstraint`, ALL wins were blocked (returned `null`)
- This meant that roles like `mutaforma` or `lupomannaro` could prevent their own team from winning

### After (New System)
- The `evaluateWinner` function first collects all teams that could potentially win
- Then it applies `checkWinConstraint` functions, but only to block OTHER teams from winning
- A role's `checkWinConstraint` cannot block its own team from winning
- Only one team can win at a time (the first team that meets all conditions)

## How It Works Now

1. **Collect Potential Winners**: All roles declare their team's win condition via `checkWin`
2. **Apply Constraints**: Each role's `checkWinConstraint` is checked against OTHER teams only
3. **Single Winner**: If multiple teams could win, only the first one (in the order they're processed) wins

## Example: Parassita

```typescript
// Parassita can win when all other players are infected
checkWin(gameState: any) {
    // ... check if all other players are infected
    return allInfected;
}

// Parassita blocks village from winning when alive
checkWinConstraint(gameState: any) {
    // This only blocks OTHER teams (like village) from winning
    // It cannot block parassita's own team from winning
    const parassitaAlive = gameState.players.some(p => p.roleId === 'parassita' && p.alive);
    if (!parassitaAlive) return false;
    
    // Check if village would win and block it
    return villageWouldWin;
}
```

## Benefits

1. **Team-Specific Blocking**: Roles can block other teams without blocking themselves
2. **Single Winner**: Only one team can win at a time, preventing ties
3. **Maintains Balance**: The existing game balance is preserved
4. **Clear Logic**: The win condition logic is more intuitive and predictable

## Testing

The refactor includes comprehensive tests that verify:
- Parassita can win while blocking village from winning
- Only one team wins at a time
- Existing functionality (like lupomannaro blocking wins) still works
- The system correctly handles team-specific constraints

## Files Modified

- `src/core/managers/WinConditionManager.ts` - Core win condition logic
- `src/types.ts` - Added `roleMeta` property for tests
- `src/__tests__/engine.spec.ts` - Added new test cases
- `src/utils/winConditions.ts` - Added common mannari constraint function
- `src/roles/lupomannaro.ts` - Added checkWinConstraint
- `src/roles/muccamannara.ts` - Added checkWinConstraint

## New Mannari Constraint System

### Common Function
A new utility function `mannariBlocksOtherWins()` has been added to `src/utils/winConditions.ts` that:
- Checks if any mannari role (lupomannaro or muccamannara) is alive
- Returns `true` if any mannari is alive, blocking other teams from winning
- Is used by both lupomannaro and muccamannara roles

### Role Updates
Both `lupomannaro` and `muccamannara` now have `checkWinConstraint` functions that:
- Use the common `mannariBlocksOtherWins()` function
- Block other teams from winning when any mannari role is alive
- Cannot block their own team (mannari) from winning

### Example Usage
```typescript
// In lupomannaro.ts and muccamannara.ts
checkWinConstraint(gameState: any) {
    return mannariBlocksOtherWins(gameState);
}
```

## Migration Notes

- Existing roles with `checkWinConstraint` will continue to work
- The behavior is now more intuitive: constraints only block other teams
- No changes needed to existing role definitions
- New mannari constraint system automatically blocks other teams when any mannari role is alive
