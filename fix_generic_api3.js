import fs from 'fs';
let code = fs.readFileSync('server.ts', 'utf8');

// The issue is likely requireAdmin was removed or redefined. Let's make sure it's defined.
// Another issue might be `app.get("/api/feedbacks/all", requireAuth, async (req: any, res: any) => {`
// Let's ensure requireAdmin exists or we just replace the call completely in feedbacks/all

const feedbacksTarget = `app.get("/api/feedbacks/all", requireAuth, async (req: any, res: any) => {`;
if(code.includes(feedbacksTarget) && code.includes("if (req.user.role !== 'ADMIN')")) {
    console.log("feedbacks/all looks fine");
}

const requireAdminRegex = /export const requireAdmin =/;
if(!requireAdminRegex.test(code)) {
    console.log("requireAdmin is missing!");
    // We should re-add requireAdmin if it was deleted.
    // wait, earlier grep showed it exists at line 1285.
    // Why did the server fail with `Route.get() requires a callback function but got a [object Undefined]`?
    // It's line 1152 in dist/server.cjs. Let's see what route that is.
}
