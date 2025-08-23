import { computed } from 'vue';
import { useGameStore } from '../stores/game';
import { ROLES } from '../roles/index';

export function useTeamBalance() {
  const store = useGameStore();
  const state = store.state as any;

  const teamBalance = computed(() => {
    const roleCounts = state.setup.rolesCounts || {};
    const numPlayers = state.setup.numPlayers || 0;
    
    let lupiCount = 0;
    let villaggioCount = 0;
    let otherRolesCount = 0;
    let otherRolesBonus = 0;
    
    Object.entries(roleCounts).forEach(([roleId, count]) => {
      const role = ROLES[roleId] || {};
      const countAs = role.countAs || role.team;
      
      // Count ALL players with team "lupi" as lupi for balance calculation
      if (role.team === 'lupi') {
        lupiCount += Number(count) || 0;
      } else if (role.team === 'villaggio') {
        villaggioCount += Number(count) || 0;
      } else {
        otherRolesCount += Number(count) || 0;
        // Small bonus/malus for other roles based on their team
        if (role.team === 'mannari') {
          otherRolesBonus += (Number(count) || 0) * 0.02; // Small positive for mannari
        } else if (role.team === 'matti') {
          otherRolesBonus += (Number(count) || 0) * 0.01; // Very small positive for matti
        }
      }
    });
    
    const coreTotalCount = lupiCount + villaggioCount;
    
    if (coreTotalCount === 0) {
      return {
        fairness: 0,
        lupiCount,
        villaggioCount,
        otherRolesCount,
        totalCount: coreTotalCount + otherRolesCount,
        idealLupiCount: 0,
        actualLupiCount: 0,
        varietyBonus: 0,
        otherRolesBonus: 0
      };
    }
    
    // Simple logic: lupi should be 1/3 of villaggio players (based on selected roles only)
    const idealLupiCount = villaggioCount / 3;
    const actualLupiCount = lupiCount;
    
    let baseFairness = 0;
    if (villaggioCount === 0) {
      // No villaggio players selected, can't calculate ratio
      baseFairness = lupiCount === 0 ? 1 : 0;
    } else {
      // Calculate how close we are to the ideal ratio
      const deviation = Math.abs(actualLupiCount - idealLupiCount) / Math.max(idealLupiCount, actualLupiCount, 1);
      baseFairness = Math.max(0, 1 - deviation);
    }
    
    // Small bonus for other roles variety
    let varietyBonus = otherRolesCount > 0 ? 0.02 : 0;
    
    const finalFairness = Math.min(1, Math.max(0, baseFairness + varietyBonus + otherRolesBonus));
    
    return {
      fairness: Math.round(finalFairness * 100),
      lupiCount,
      villaggioCount,
      otherRolesCount,
      totalCount: coreTotalCount + otherRolesCount,
      idealLupiCount: Math.round(idealLupiCount * 10) / 10,
      actualLupiCount: actualLupiCount,
      varietyBonus: Math.round(varietyBonus * 100),
      otherRolesBonus: Math.round(otherRolesBonus * 100)
    };
  });

  return {
    teamBalance
  };
}
