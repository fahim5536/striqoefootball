import fs from 'fs';
let code = fs.readFileSync('server.ts', 'utf8');

const postStart = `app.post("/api/:collection", requireAuth, async (req, res) => {`;
if (code.includes(postStart)) {
    console.log("has requireAuth in post collection");
} else {
    console.log("NO requireAuth in post collection??");
}
