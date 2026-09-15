import fs from 'fs';
let code = fs.readFileSync('dist/server.cjs', 'utf8');

// The response is {"error":"Not found"}
// But in server.ts we replaced `Not found` with `Collection not found in getModel` in POST and GET.
// Did esbuild somehow cache it? Or did PM2 NOT RESTART with the new dist/server.cjs because of an error?
