import express from "express";
import cors from "cors";
import path from "path";

import authController from "./controllers/authController";
import userController from "./controllers/userController";
import eventController from "./controllers/eventController";
import registrationController from "./controllers/registrationController";
import fileController from "./controllers/fileController";
import { seedDemoData } from "./database/seed";

const app = express();
const PORT = process.env.PORT || 3452;

// ── Middleware ──
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

// ── API Routes ──
app.use("/api/auth", authController);
app.use("/api/users", userController);
app.use("/api/events", eventController);
app.use("/api/registrations", registrationController);
app.use("/api/files", fileController);

// ── Health check ──
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── Global error handler ──
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    status: 500,
    message: "Internal server error",
  });
});

// ── Start server ──
async function start() {
  try {
    await seedDemoData();
    app.listen(PORT, () => {
      console.log(`\n🚀 TaraTulong API running at http://localhost:${PORT}`);
      console.log(`   Health check: http://localhost:${PORT}/api/health\n`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

start();
