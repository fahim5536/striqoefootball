import fs from 'fs';
let code = fs.readFileSync('server.ts', 'utf8');

// The issue might be that in fix_generic_api.js we did this:
// const getAuthNew = \`app.get("/api/:collection", async (req, res, next) => {
// ...
//     return requireAuth(req, res, () => {
// ...
// This modified app.get("/api/:collection"... but wait, there is no requireAuth available because it was replaced?
// Or maybe requireAuth is an async function that we pass into app.get, but in the previous fix we created:
// app.get("/api/:collection", async (req, res, next) => { ... }, async (req: any, res: any) => {

// Let's check the exact signature of the /api/:collection get route in server.ts
// Wait, the error is \`Route.get() requires a callback function but got a [object Undefined]\`
// Which means app.get("/api/feedbacks/all", requireAuth, async ...) where requireAuth is undefined?
// Let's check where requireAuth is defined.

if(code.indexOf('export const requireAuth') === -line) {
    console.log("requireAuth is undefined? Wait, earlier grep showed requireAdmin, not requireAuth.");
}
