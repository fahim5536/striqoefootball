// Wait! If the POST hits /api/:collection, and req.params.collection is "featureFlags", getModel SHOULD return prisma5.featureFlag.
// BUT earlier we printed `Collection not found in getModel: featureFlags`? NO!
// Earlier the response was `{"error":"Not found"}` from the CURL request.
// Wait! `Collection not found in getModel:` was what we replaced it with. We DID run curl after replacing.
// AND IT RETURNED `{"error":"Not found"}`!! NOT `"Collection not found in getModel..."` !!
// This means the CURL request was NOT hitting `app.post("/api/:collection"`!
// What was it hitting? 
// If it wasn't hitting `/api/:collection`, maybe it was hitting `app.post("/api/featureFlags"` but there is no such thing!
// OR maybe it was hitting the generic 404 handler?
// Yes! Look at the curl command:
// `curl -X POST -H "Content-Type: application/json" -d '{"key": "test_flag", "name": "Test", "isEnabled": false}' http://localhost:3000/api/featureFlags`
// BUT wait, is there an `app.all("/api/*", ...)` that catches it before?
// Or maybe `requireAuth` throws 401. But the response was 404!
// Wait. Is the express app using `app.use('/api', apiRouter)`?
