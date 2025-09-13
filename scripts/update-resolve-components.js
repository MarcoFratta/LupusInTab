#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// List of resolve components to update
const resolveComponents = [
  'src/components/roles/Angelo/AngeloResolveDetails.vue',
  'src/components/roles/Ammaestratore/AmmaestratoreResolveDetails.vue',
  'src/components/roles/Bugiardo/BugiardoResolveDetails.vue',
  'src/components/roles/Giustiziere/GiustiziereResolveDetails.vue',
  'src/components/roles/Guardia/GuardiaResolveDetails.vue',
  'src/components/roles/Illusionista/IllusionistaResolveDetails.vue',
  'src/components/roles/Insinuo/InsinuoResolveDetails.vue',
  'src/components/roles/Lupo/LupoResolveDetails.vue',
  'src/components/roles/LupoCieco/LupoCiecoResolveDetails.vue',
  'src/components/roles/Lupomannaro/LupomannaroResolveDetails.vue',
  'src/components/roles/Medium/MediumResolveDetails.vue',
  'src/components/roles/Parassita/ParassitaResolveDetails.vue',
  'src/components/roles/Strega/StregaResolveDetails.vue',
  'src/components/roles/Veggente/VeggenteResolveDetails.vue'
];

// Role name mapping
const roleNameMap = {
  'Angelo': 'angelo',
  'Ammaestratore': 'ammaestratore',
  'Bugiardo': 'bugiardo',
  'Giustiziere': 'giustiziere',
  'Guardia': 'guardia',
  'Illusionista': 'illusionista',
  'Insinuo': 'insinuo',
  'Lupo': 'lupo',
  'LupoCieco': 'lupoCieco',
  'Lupomannaro': 'lupomannaro',
  'Medium': 'medium',
  'Parassita': 'parassita',
  'Strega': 'strega',
  'Veggente': 'veggente'
};

function updateComponent(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  
  // Extract role name from file path
  const roleName = path.basename(path.dirname(filePath));
  const roleId = roleNameMap[roleName];
  
  if (!roleId) {
    console.log(`No role mapping found for: ${roleName}`);
    return;
  }

  // Check if already updated
  if (content.includes('useRepresentativePlayer')) {
    console.log(`Already updated: ${filePath}`);
    return;
  }

  // Add import
  let updatedContent = content.replace(
    /import { computed } from 'vue';/,
    `import { computed } from 'vue';
import { useRepresentativePlayer } from '../../../composables/useRepresentativePlayer';`
  );

  // Find and replace the representative player computed property
  const representativePattern = new RegExp(
    `const representative${roleName} = computed\\(\\(\\) => \\{[\\s\\S]*?roleId: '${roleId}'\\s*\\}\\);`,
    'g'
  );

  const replacement = `// Use the new composable to eliminate code duplication
const { representativePlayer: representative${roleName} } = useRepresentativePlayer(${roleId}Players, '${roleId}');`;

  updatedContent = updatedContent.replace(representativePattern, replacement);

  // Write the updated content
  fs.writeFileSync(filePath, updatedContent);
  console.log(`Updated: ${filePath}`);
}

// Update all components
resolveComponents.forEach(updateComponent);

console.log('All resolve components updated!');
