#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

// List of resolve components to update (excluding the ones we already updated)
const resolveComponents = [
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

  // Check if already updated (no representativePlayer pattern)
  if (!content.includes('representative' + roleName)) {
    console.log(`Already updated: ${filePath}`);
    return;
  }

  let updatedContent = content;

  // Remove useRepresentativePlayer import if it exists
  updatedContent = updatedContent.replace(
    /import { useRepresentativePlayer } from '\.\.\/\.\.\/\.\.\/composables\/useRepresentativePlayer';\n/g,
    ''
  );

  // Remove the representative player computed property
  const representativePattern = new RegExp(
    `const representative${roleName} = computed\\(\\(\\) => \\{[\\s\\S]*?roleId: '${roleId}'\\s*\\}\\);`,
    'g'
  );
  updatedContent = updatedContent.replace(representativePattern, '');

  // Update hasAction computed to use players array length
  const hasActionPattern = new RegExp(
    `const hasAction = computed\\(\\(\\) => .* && representative${roleName}\\.value\\);`,
    'g'
  );
  updatedContent = updatedContent.replace(hasActionPattern, 
    `const hasAction = computed(() => target.value && ${roleId}Players.value.length > 0);`
  );

  // Update RoleComparisonCard left-player prop
  const leftPlayerPattern = new RegExp(
    `:left-player="representative${roleName}"`,
    'g'
  );
  updatedContent = updatedContent.replace(leftPlayerPattern, `:left-player="${roleId}Players"`);

  // Clean up any extra empty lines
  updatedContent = updatedContent.replace(/\n\s*\n\s*\n/g, '\n\n');

  // Write the updated content
  fs.writeFileSync(filePath, updatedContent);
  console.log(`Updated: ${filePath}`);
}

// Update all components
resolveComponents.forEach(updateComponent);

console.log('All resolve components refactored!');
