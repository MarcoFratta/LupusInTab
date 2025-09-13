#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

// List of all resolve components
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

function cleanupComponent(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  
  // Remove any representative computed properties (multiline pattern)
  const representativePattern = /const representative\w+ = computed\(\(\) => \{[^}]*\}[^}]*\}\);/gs;
  content = content.replace(representativePattern, '');
  
  // Clean up multiple empty lines
  content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
  
  // Write the updated content
  fs.writeFileSync(filePath, content);
  console.log(`Cleaned: ${filePath}`);
}

// Clean up all components
components.forEach(cleanupComponent);

console.log('Final cleanup complete!');
