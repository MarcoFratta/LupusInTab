const fs = require('fs');
const results = JSON.parse(fs.readFileSync('vitest-results.json', 'utf8'));

const failingFiles = new Set();
const failingTests = [];

results.testResults.forEach(file => {
    if (file.status === 'failed') {
        failingFiles.add(file.name);
        file.assertionResults.forEach(test => {
            if (test.status === 'failed') {
                failingTests.push(`${file.name} - ${test.title}`);
            }
        });
    }
});

console.log('Failing files:', Array.from(failingFiles));
console.log(`Total failing tests: ${failingTests.length}`);
