import app from './app.js';
import { initializeWebSockets } from './websocket/index.js';
const PORT = process.env.PORT || 8000;
const server = app.listen(PORT, () => {
    console.log(`[Server] AgriBridge-AI backend listening on port ${PORT}`);
});
initializeWebSockets(server);
