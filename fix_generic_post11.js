// If dist/server.cjs DOES NOT HAVE "Not found" in POST but returns it...
// It means the running server process is stale!
// `pkill -f "node dist/server.cjs"` might not have killed the server started by pm2.
// Let's use `pm2 stop all && pkill -f node` maybe?
// Let's check `ps aux | grep node`
