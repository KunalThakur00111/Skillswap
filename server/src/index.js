import dotenv from "dotenv";
import http from "http";
import app from "./app.js";
import connectDB from "./config/db.js";
import { initSocket } from "./socket.js";
import startSessionJobs from "./jobs/sessionJobs.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

// Create HTTP server instead of using express directly for listening
const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

connectDB().then(() => {
    // Start background jobs
    startSessionJobs();

    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});