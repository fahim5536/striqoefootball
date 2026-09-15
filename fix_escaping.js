import fs from 'fs';

function fixFile(file) {
    if (!fs.existsSync(file)) return;
    let code = fs.readFileSync(file, 'utf8');
    // Replace escaped template literals that might have caused issues
    code = code.replace(/\\`/g, '`');
    code = code.replace(/\\\${/g, '${');
    fs.writeFileSync(file, code);
    console.log(`Fixed ${file}`);
}

['src/components/FeedbackModal.tsx', 'src/components/AdminFeatureFlags.tsx', 'src/components/AdminFeedback.tsx', 'src/components/AdminExperiments.tsx'].forEach(fixFile);
