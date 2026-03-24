import dotenv from "dotenv";
dotenv.config();
import cors from "cors";

import app from "./app.js";
import connectDB from "./config/db.js";
import { startJobExpiryReminderCron, runJobExpiryWorkflow } from "./cronjobs/jobExpiryReminderCron.js";

const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: "https://job-connect-amber.vercel.app",
  credentials: true
}));

const startServer = async () => {
  await connectDB();

  startJobExpiryReminderCron();

  // Optional: run once on startup if env says true
  if (process.env.RUN_JOB_EXPIRY_ON_STARTUP === "true") {
    await runJobExpiryWorkflow();
  }

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
