import fs from 'fs';
let code = fs.readFileSync('server.ts', 'utf8');

// The reason could be that the requireAuth middleware sends 401 Unauthorized if no token is provided.
// But the response is 404 "Not found".
// Why 404? Because `if (!model) return res.status(404).json({ error: "Not found" });`
// Which means getModel is returning undefined!
// But wait, getModel returns map[collection].
// Wait, is it possible that `featureFlags` isn't in the map?
// Our previous check `code.includes(mapEnd)` was true.
// Oh!
// The map has `featureFlags: prisma.featureFlag`
// And `map['featureFlags']` would return that.
// But maybe the curl request is going to `/api/featureFlags` and `req.params.collection` is `featureFlags`.
// So why does getModel("featureFlags") return undefined?
// Ah! In `dist/server.cjs`, did the getModel get updated?
// Let's check `dist/server.cjs`!

const getModelRegex = /const getModel = \(collection\) => \{\n  const map = \{/;
console.log("Checking dist/server.cjs");
