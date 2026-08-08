# Creating New Roles Guide

This guide explains how to add new roles to the game engine, using the `Sonnambulo` role as an example.

## 1. Role Definition (`src/roles/[roleId].ts`)

Each role must implement the `RoleDef` interface. This file defines the core logic for the role.

```typescript
import type { RoleDef } from '../types';
import { villageWin } from '../utils/winConditions';
import { componentFactory } from "../utils/roleUtils";

const sonnambulo: RoleDef = {
    id: 'sonnambulo', // Unique identifier
    name: 'roleNames.sonnambulo', // Translation key for display name
    team: 'villaggio', // The real team the role belongs to (e.g. 'villaggio', 'lupi')
    icon: 'SonnambuloIcon', // Name of the Vue icon component
    score: 1, // Impact score for team balance (1 for weak, 10 for strong)
    visibleAsTeam: 'villaggio', // How role initially appears to Veggente
    countAs: 'villaggio', // How role counts towards win conditions
    description: 'roleDescriptions.sonnambulo', // Short description translation key
    longDescription: 'roleDescriptions.sonnambuloLong', // Long description translation key
    color: '#3b82f6', // Color used in the UI
    phaseOrder: "any", // Execution order during the night. Numbers execute first (e.g. 1), then "any" (alphabetical).
    actsAtNight: "alive", // When can act: "always", "alive", "dead", "never"
    effectType: 'required', // 'optional' or 'required'
    numberOfUsage: 'unlimited', // Number of usages per game
    
    // UI component getters
    getPromptComponent: componentFactory('Sonnambulo', "prompt"),
    getResolveDetailsComponent: componentFactory('Sonnambulo', "details"),
    
    // Core night action logic
    resolve(gameState: any, action: any) {
        // ALWAYS iterate over `action.playerIds` instead of assuming a single `action.playerId`.
        // The engine groups players with the same role together.
        const sIds = action.playerIds && action.playerIds.length > 0 ? action.playerIds : [action.playerId];
        const targetId = Number(action?.data?.targetId || action?.result?.targetId);
        
        // Ensure pending kills object exists
        if (!gameState.night.context.pendingKills) gameState.night.context.pendingKills = {};
        const pk = gameState.night.context.pendingKills;
        
        for (const sId of sIds) {
            if (!pk[sId]) pk[sId] = [];
            // Modify gameState.night.context based on what this role does!
            // Example: pk[sId].push({ role: 'sonnambulo', reason: 'Died sleepwalking' });
        }

        // Return a history event of what happened
        return {
            type: 'sonnambulo_action',
            nightNumber: gameState.nightNumber,
            roleId: 'sonnambulo',
            playerIds: action.playerIds || [],
            targetId: targetId,
            data: action.data
        };
    },
    
    // Optional: Runs every night regardless of blocks. Useful for automatic/passive protections.
    passiveEffect(gameState: any, player: any) {
        // e.g., LupoCiccione makes neighbors appear as wolves here
    },

    // Optional: Runs during the day phase to cleanup/restore any temporary state modifications.
    restoreFunction(gameState: any) {
        // e.g., Remove the temporary visibleAsTeam modifications applied by Insinuo or LupoCiccione
    },
    
    // The win condition function for this role's faction
    checkWin(gameState: any) {
        return villageWin(gameState);
    }
};

export default sonnambulo;
```

### Night Action Modifiers (`resolve` function)

The `resolve()` function is the heart of any active role. It runs during `NightPhaseManager.resolveNight()`.
Common tasks you can perform here:
- **Killing**: Push a kill object to `gameState.night.context.pendingKills[targetId]`. (e.g. `{ role: 'lupo' }`).
- **Saving**: Remove kill objects from `pendingKills[targetId]`.
- **Checking**: Add elements to `gameState.night.context.checks`.

Order matters! Roles with `phaseOrder: 1` execute before `phaseOrder: 2`, which execute before `"any"`. Roles with `"any"` execute alphabetically.

### Passive Effects and Cleanup (`passiveEffect` & `restoreFunction`)

Some roles don't need a prompt, or they apply temporary effects that need to be reversed the next day. You can use these two optional properties in `RoleDef`:

1. **`passiveEffect(gameState, player)`**
   - **Use Case:** Runs automatically during the night (following `phaseOrder`) without showing a prompt to the user. Runs even if the role is blocked.
   - **Example:** *Lupo Ciccione* uses this to automatically change the `visibleAsTeam` of the players sitting next to him every night.

2. **`restoreFunction(gameState)`**
   - **Use Case:** Called at the end of the night / start of the day phase to clean up any temporary state changes.
   - **Example:** *Insinuo* uses this to reset the `visibleAsTeam` of the player they framed, so that the frame only lasts for that specific night.

### Checking Player Roles (CRITICAL)

When inspecting a target player in your `resolve` logic, NEVER use the static `team` property directly on the player object because it does not exist (it's inside `roleState`). Instead, use the `roleState` property which reflects runtime changes.

There are three distinct properties for checking a player's affiliation. Use them correctly based on the context:

1. **`player.roleState.realTeam` (The true team)**
   - **Use Case:** Use this for mechanical logic like determining who the wolves can hunt, who survives a specific team-based attack, or any "absolute" truth check.
   - **Example:** `if (targetPlayer?.roleState?.realTeam === 'lupi') { ... }`

2. **`player.roleState.visibleAsTeam` (The seen team)**
   - **Use Case:** Use this **ONLY** for investigative roles (like the Veggente) or UI hints that rely on appearances. Roles like *Insinuo* or *Illusionista* modify this property.
   - **Example:** The Veggente sees a Villager as a Wolf if the Insinuo framed them. Do NOT use this for kill logic, otherwise wolves might accidentally kill a Villager thinking they are a fellow wolf!

3. **`player.roleState.countAs` (The win condition team)**
   - **Use Case:** Used internally by the game engine to determine win conditions. For example, the *Indemoniato* has a `realTeam` of `lupi` (he wins with the wolves) but a `countAs` of `villaggio` (meaning he doesn't count as a living wolf for the game-ending condition).

### Handling Multiple Instances of a Role

If there are multiple players with the same role (e.g. multiple Sleepwalkers or multiple Wolves), the `NightPhaseManager` automatically groups them together. 
- **Prompt:** The UI Prompt component receives an array `playerIds` containing all players of this role.
- **Resolve:** The `resolve` function's `action` object contains an array `action.playerIds`. 
- **Rule:** **Always iterate over `action.playerIds`** in your `resolve` function. Do not assume `action.playerId` is the only acting player, otherwise you will leave the other players with that role at home doing nothing!

## 2. Frontend Components (`src/components/roles/[RoleName]/`)

For a role to be playable, you need to provide Vue components for its night prompt and its resolve details. We use a factory function (`componentFactory`) in the role definition to dynamically load these, meaning they must be defined and exported in `src/components/roles/index.ts`.

1. **`[RoleName]Prompt.vue`**: Displayed to the player during the night when it's their turn.
   - **Props received:** `gameState` (the full game state), `playerIds` (array of player IDs sharing this role who are acting), `onComplete` (callback to submit action).
   - **Action:** Must emit `props.onComplete({ targetId: targetId.value })` or a similar data structure holding the player's choices. Make sure to filter out the acting players (`!props.playerIds.includes(p.id)`) if they shouldn't target themselves!

2. **`[RoleName]ResolveDetails.vue`**: Displayed in the recap/history.
   - **Props received:** `entry` (the exact object returned by your `resolve()` function), `gameState`.
   - **Action:** Formats the action for the recap screen. Ensure this elegantly handles multiple actors if `entry.playerIds.length > 1` (e.g. "Marco, Luca hanno investigato Giovanni").

3. **`[RoleName]Icon.vue`** (in `src/components/roles/icons/`): The SVG icon used for this role in the UI.

## 3. Registering the Role

You must add the role and its components to the application indices:

1. **`src/roles/index.ts`**: Import your role definition and add it to `rolesArray`.
2. **`src/components/roles/icons/index.ts`**: Export your Icon component.
3. **`src/components/roles/index.ts`**: Export your Prompt and ResolveDetails components.

## 4. Automated Tests (`src/__tests__/roles/[roleId].spec.ts`)

Always create tests to ensure your role's `resolve()` logic works correctly with the game state. Use `createTestState()` to mock the `gameState`, simulate an `action` object, and verify `pendingKills` or other context properties are updated properly.
Ensure you add properties like `roleState: { realTeam: 'lupi' }` to your mocked players if your logic depends on team checks!
