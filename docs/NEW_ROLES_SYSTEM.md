# New Roles Popup System

This system automatically shows a popup to users when they visit your site and there's a new version with updated roles.

## How It Works

1. **Version Check**: When a user visits the site, the system compares the current version with what the user has already seen
2. **Popup Display**: If the version is different, a popup appears showing all current roles
3. **Storage**: When the user closes the popup, the current version is saved to their local storage
4. **No More Popups**: The popup won't appear again until you update the version number

## How to Update for New Releases

When you want to add new roles or make any changes to your game:

1. **Add the new role** to your roles system (in `src/roles/`)
2. **Update the configuration** in `src/config/newRoles.ts`:
   ```typescript
   export const NEW_ROLES_CONFIG = {
     currentRoles: [
       // ... all your current roles ...
       'your-new-role-id'  // Add the new role here
     ],
     version: '1.1.0'  // Increment this version number
   };
   ```

## Files Involved

- `src/components/ui/NewRolesPopup.vue` - The popup component
- `src/composables/useNewRolesPopup.ts` - Logic for managing the popup
- `src/config/newRoles.ts` - Configuration file (update this for new versions)
- `src/utils/storage.ts` - Storage functions for tracking seen versions
- `src/App.vue` - Main app integration

## Storage Key

The system uses the localStorage key `lupus_new_roles_version_v1` to track which version the user has already seen.

## Example Workflow

1. User visits site for first time → sees popup with all current roles
2. User closes popup → version "1.0.0" saved to storage
3. You add new role "ninja" to the game
4. You update `newRoles.ts` to include "ninja" in the array AND change version to "1.1.0"
5. User visits site again → sees popup with all current roles (including "ninja")
6. User closes popup → version "1.1.0" saved to storage
7. User visits again → no popup (same version has been seen)

## Benefits of Version-Based Approach

- ✅ **Simpler management** - just change version number
- ✅ **Always shows popup** when version changes
- ✅ **No need to track individual roles** in storage
- ✅ **Works for any changes** (new roles, removed roles, role updates)
