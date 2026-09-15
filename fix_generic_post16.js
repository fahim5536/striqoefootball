import fs from 'fs';
let code = fs.readFileSync('src/components/Admin.tsx', 'utf8');

const regex = /import AdminFeatureFlags from '\.\/AdminFeatureFlags';/g;
if (regex.test(code)) {
    console.log("Admin.tsx has the beta features imported");
}
