const fs = require('fs');
const path = require('path');

const rolesDir = './src/roles';
const files = fs.readdirSync(rolesDir).filter(f => f.endsWith('.ts') && f !== 'index.ts');

console.log(`Found ${files.length} role files to update:`);

files.forEach(filename => {
  const filePath = path.join(rolesDir, filename);
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Extract role ID from the file
  const roleIdMatch = content.match(/id:\s*['"`]([^'"`]+)['"`]/);
  if (!roleIdMatch) {
    console.log(`⚠️  Skipping ${filename} - no role ID found`);
    return;
  }
  
  const roleId = roleIdMatch[1];
  console.log(`📝 Updating ${filename} (roleId: ${roleId})`);
  
  // Replace hardcoded name with i18n key
  let updatedContent = content.replace(
    /name:\s*['"`][^'"`]+['"`]/,
    `name: 'roleNames.${roleId}'`
  );
  
  // Replace hardcoded description with i18n key
  updatedContent = updatedContent.replace(
    /description:\s*['"`][^'"`]+['"`]/,
    `description: 'roleDescriptions.${roleId}'`
  );
  
  // Replace hardcoded longDescription with i18n key
  // This is more complex because it might be a template literal
  updatedContent = updatedContent.replace(
    /longDescription:\s*`[^`]+`/,
    `longDescription: 'roleDescriptions.${roleId}Long'`
  );
  
  // Also handle single/double quoted longDescription
  updatedContent = updatedContent.replace(
    /longDescription:\s*['"][^'"]*['"]/,
    `longDescription: 'roleDescriptions.${roleId}Long'`
  );
  
  fs.writeFileSync(filePath, updatedContent);
  console.log(`✅ Updated ${filename}`);
});

console.log('\n🎉 All role files updated!');
console.log('\nNext steps:');
console.log('1. Check that all translations exist in en.ts and it.ts');
console.log('2. Test the application to ensure everything works');
console.log('3. Delete this script file');
