#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

// List of components that still have unused representative computed properties
const components = [
  'src/components/roles/Veggente/VeggenteResolveDetails.vue',
  'src/components/roles/Parassita/ParassitaResolveDetails.vue',
  'src/components/roles/Medium/MediumResolveDetails.vue',
  'src/components/roles/Insinuo/InsinuoResolveDetails.vue',
  'src/components/roles/Lupomannaro/LupomannaroResolveDetails.vue',
  'src/components/roles/LupoCieco/LupoCiecoResolveDetails.vue',
  'src/components/roles/Guardia/GuardiaResolveDetails.vue',
  'src/components/roles/Illusionista/IllusionistaResolveDetails.vue',
  'src/components/roles/Bugiardo/BugiardoResolveDetails.vue',
  'src/components/roles/Ammaestratore/AmmaestratoreResolveDetails.vue'
];

// Role name mapping
const roleNameMap = {
  'Veggente': 'veggente',
  'Parassita': 'parassita',
  'Medium': 'medium',
  'Insinuo': 'insinuo',
  'Lupomannaro': 'lupomannaro',
  'LupoCieco': 'lupoCieco',
  'Guardia': 'guardia',
  'Illusionista': 'illusionista',
  'Bugiardo': 'bugiardo',
  'Ammaestratore': 'ammaestratore'
};

function cleanupComponent(filePath) {
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

  let updatedContent = content;

  // Remove the representative player computed property
  const representativePattern = new RegExp(
    `const representative${roleName} = computed\\(\\(\\) => \\{[\\s\\S]*?roleId: '${roleId}'\\s*\\}\\);`,
    'g'
  );
  updatedContent = updatedContent.replace(representativePattern, '');

  // Clean up any extra empty lines
  updatedContent = updatedContent.replace(/\n\s*\n\s*\n/g, '\n\n');

  // Write the updated content
  fs.writeFileSync(filePath, updatedContent);
  console.log(`Cleaned up: ${filePath}`);
}

// Clean up all components
components.forEach(cleanupComponent);

console.log('All unused representative computed properties cleaned up!');
