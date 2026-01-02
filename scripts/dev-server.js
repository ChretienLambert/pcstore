const app = require('../backend/server');
const http = require('http');
const server = http.createServer(app);
const PORT = 9001;
server.listen(PORT, () => console.log(`Dev server listening on ${PORT}`));
