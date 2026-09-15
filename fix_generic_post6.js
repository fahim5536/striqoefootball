import fs from 'fs';
let code = fs.readFileSync('server.ts', 'utf8');

// The reason it returns `{"error":"Not found"}` is because it says exactly that: `res.status(404).json({ error: "Not found" })`.
// Wait, my replacement didn't work??
// Let's check `code.includes('error: "Collection not found in getModel: "')`

if (code.includes('Collection not found in getModel')) {
    console.log("REPLACEMENT WORKED in server.ts");
} else {
    console.log("REPLACEMENT FAILED in server.ts!");
}
