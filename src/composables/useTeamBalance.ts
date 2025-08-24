import { computed } from 'vue';
import { useGameStore } from '../stores/game';
import { ROLES } from '../roles/index';

export function useTeamBalance() {
  const store = useGameStore();
  const state = store.state as any;

  const teamBalance = computed(() => {
    const roleCounts = state.setup.rolesCounts || {};
    
    // Calculate team power sums and player counts
    const teamData: Record<string, { power: number; players: number }> = {};
    
    Object.entries(roleCounts).forEach(([roleId, count]) => {
      const role = ROLES[roleId] || {};
      const team = role.team;
      const rolePower = (role.score || 1) * (Number(count) || 0);
      
      if (!teamData[team]) {
        teamData[team] = { power: 0, players: 0 };
      }
      
      teamData[team].power += rolePower;
      teamData[team].players += Number(count) || 0;
    });
    
    // Calculate total players and power
    const totalPlayers = Object.values(teamData).reduce((sum, team) => sum + team.players, 0);
    const totalPower = Object.values(teamData).reduce((sum, team) => sum + team.power, 0);
    
    if (totalPlayers === 0 || totalPower === 0) {
      return {
        fairness: 0,
        teamData: {},
        totalPlayers: 0,
        totalPower: 0,
        weightedVariance: 0
      };
    }
    
    // Calculate ideal power distribution: each team should have equal power (not percentage)
    // Only count teams that actually have players (selected roles)
    const activeTeams = Object.values(teamData).filter(team => team.players > 0);
    const numActiveTeams = activeTeams.length;
    
    // Calculate total power for active teams only
    const totalActivePower = activeTeams.reduce((sum, team) => sum + team.power, 0);
    
    // Special case: if there's only one team, it's perfectly balanced
    if (numActiveTeams <= 1) {
      return {
        fairness: 100,
        teamData,
        totalPlayers,
        totalPower,
        totalDeviation: 0,
        totalWeightedDeviation: 0,
        idealPowerPerTeam: totalActivePower,
        baseFairness: 100,
        varietyBonus: 0,
        finalFairness: 100,
        weightedVariance: 0
      };
    }
    
    // Ideal power per team (total power / number of teams)
    const idealPowerPerTeam = totalActivePower / numActiveTeams;
    
    let totalDeviation = 0;
    let totalWeightedDeviation = 0;
    let weightedVariance = 0;
    
    Object.entries(teamData).forEach(([teamName, team]) => {
      if (team.players === 0) return; // Skip disabled teams
      
      // Calculate deviation from ideal power (not percentage)
      const powerDeviation = Math.abs(team.power - idealPowerPerTeam);
      
      // Convert to percentage deviation for fairness calculation
      const percentageDeviation = (powerDeviation / idealPowerPerTeam) * 100;
      
      // Weight by player count - teams with more players have more impact
      const weight = team.players / totalPlayers;
      const weightedDeviation = percentageDeviation * weight;
      
      totalDeviation += percentageDeviation;
      totalWeightedDeviation += weightedDeviation;
      
      // Calculate weighted variance contribution
      weightedVariance += weight * Math.pow(powerDeviation, 2);
    });
    
    // Convert deviation to fairness (0 deviation = 100% fairness)
    // Use a very low sensitivity factor to make the system more lenient
    const sensitivityFactor = 0.1; // Very low sensitivity for more lenient fairness
    const adjustedDeviation = totalWeightedDeviation * sensitivityFactor;
    
    // Maximum possible deviation is when one team has 100% and others have 0%
    const maxPossibleDeviation = 100 * (numActiveTeams - 1) / numActiveTeams;
    const normalizedDeviation = adjustedDeviation / maxPossibleDeviation;
    const baseFairness = Math.max(0, 1 - normalizedDeviation);
    
    // Small bonus for having multiple teams (variety)
    const varietyBonus = Object.keys(teamData).length > 2 ? 0.05 : 0;
    
    // Large bonus for reasonably balanced scenarios (deviation < 50%)
    const balanceBonus = totalWeightedDeviation < 50 ? 0.4 : 0;
    
    // Special case: if teams have reasonable power ratios (within 3x), give 100% fairness
    const maxPower = Math.max(...Object.values(teamData).map(team => team.power));
    const minPower = Math.min(...Object.values(teamData).map(team => team.power));
    const powerRatio = maxPower / minPower;
    const reasonableRatioBonus = powerRatio <= 3 ? 0.5 : 0;
    
    const finalFairness = Math.min(1, Math.max(0, baseFairness + varietyBonus + balanceBonus + reasonableRatioBonus));
    
    return {
      fairness: Math.round(finalFairness * 100),
      teamData,
      totalPlayers,
      totalPower,
      totalDeviation: Math.round(totalDeviation * 100) / 100,
      totalWeightedDeviation: Math.round(totalWeightedDeviation * 100) / 100,
      idealPowerPerTeam: Math.round(idealPowerPerTeam * 100) / 100,
      baseFairness: Math.round(baseFairness * 100),
      varietyBonus: Math.round(varietyBonus * 100),
      finalFairness: Math.round(finalFairness * 100),
      weightedVariance: Math.round(weightedVariance * 100) / 100
    };
  });

  return {
    teamBalance
  };
}
