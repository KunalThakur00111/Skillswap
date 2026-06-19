import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import healthRoutes from "./routes/health.routes.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import sessionRoutes from "./routes/session.routes.js";
import creditRoutes from "./routes/credit.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import devRoutes from "./routes/dev.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import doubtRoutes from "./routes/doubt.routes.js";
import availabilityRoutes from "./routes/availability.routes.js";
import publicRoutes from "./routes/public.routes.js";
import { notFound, errorHandler } from "./middleware/error.middleware.js";

const app = express();

// Security Middleware
app.use(helmet());
app.use(
    cors({
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        credentials: true
    })
);

// Logging
if (process.env.NODE_ENV !== "production") {
    app.use(morgan("dev"));
}

app.use(express.json({ limit: "10kb" })); // Body parser with size limit

// Data Sanitization handled by Zod schemas at route level

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "SkillSwap Campus API is running"
    });
});

app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/credits", creditRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/doubts", doubtRoutes);
app.use("/api/availability", availabilityRoutes);
app.use("/api/public", publicRoutes);

if (process.env.NODE_ENV !== "production") {
    app.use("/api/dev", devRoutes);
}

app.use(notFound);
app.use(errorHandler);

export default app;