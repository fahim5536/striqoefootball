import fs from 'fs';
let code = fs.readFileSync('server.ts', 'utf8');

const oldDisconnect = `  socket.on("disconnect", () => {
    const userId = connectedUsers.get(socket.id);
    if (userId) {
      connectedUsers.delete(socket.id);
      userSockets.delete(userId);
      io.emit("presence:update", { userId, status: "offline", lastSeen: Date.now() });
    }
    logger.info(\`Client disconnected: \${socket.id}\`);
  });`;

const newDisconnect = `  socket.on("disconnect", async () => {
    const userId = connectedUsers.get(socket.id);
    if (userId) {
      connectedUsers.delete(socket.id);
      
      // Check if user still has other active sockets
      const sockets = await io.in(\`user:\${userId}\`).fetchSockets();
      if (sockets.length === 0) {
        io.emit("presence:update", { userId, status: "offline", lastSeen: Date.now() });
      }
    }
    logger.info(\`Client disconnected: \${socket.id}\`);
  });`;

code = code.replace(oldDisconnect, newDisconnect);
code = code.replace("const userSockets = new Map<string, string>(); // userId -> socketId\n", "");
code = code.replace("userSockets.set(userId, socket.id);\n", "");
code = code.replace("userSockets.delete(userId);\n", "");

fs.writeFileSync('server.ts', code);
console.log('Socket presence fixed');
