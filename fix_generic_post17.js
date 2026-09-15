import fs from 'fs';
let code = fs.readFileSync('src/components/Admin.tsx', 'utf8');

const regex2 = /import AdminRemoteConfig from '\.\/AdminRemoteConfig';/g;
if (regex2.test(code)) {
    console.log("Admin.tsx has RemoteConfig imported");
}
