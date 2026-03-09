import cron from "node-cron";
import Job from "../models/job.js";
import { sendEmail } from "../utils/sendEmail.js";

const DAY_MS = 24 * 60 * 60 * 1000;

const getExpiryDate = (job) => {
  const expiry = new Date(job.jobPostedOn);
  expiry.setDate(expiry.getDate() + job.timeLeftToExpire);
  return expiry;
};

const expirationExpr = {
  $add: ["$jobPostedOn", { $multiply: ["$timeLeftToExpire", DAY_MS] }],
};

export const runJobExpiryWorkflow = async () => {
  const now = new Date();
  const threeDaysFromNow = new Date(now.getTime() + 3 * DAY_MS);

  try {
    // 1) Jobs expiring soon (within next 3 days), but not yet expired
    const jobsExpiringSoon = await Job.find({
      expired: false,
      $expr: {
        $and: [
          { $gt: [expirationExpr, now] },
          { $lte: [expirationExpr, threeDaysFromNow] },
        ],
      },
    }).populate("savedByUsers.userId", "name email");

    for (const job of jobsExpiringSoon) {
      const uniqueEmails = [
        ...new Set(
          job.savedByUsers.map((row) => row.userId?.email).filter(Boolean)
        ),
      ];

      if (!uniqueEmails.length) continue;

      const expiryDate = getExpiryDate(job).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      await Promise.allSettled(
        uniqueEmails.map((to) =>
          sendEmail({
            to,
            subject: `Reminder: ${job.title} is expiring soon`,
            text: `The job "${job.title}" at ${job.company} will expire on ${expiryDate}. Apply before deadline.`,
            html: `
              <p>Hello,</p>
              <p>The job <strong>${job.title}</strong> at <strong>${job.company}</strong> will expire on <strong>${expiryDate}</strong>.</p>
              <p>Apply before the deadline.</p>
              <p>Regards,<br/>Job Connect Team</p>
            `,
          }) 
        )
      );
    }

    // 2) Mark already expired jobs
    const updateResult = await Job.updateMany(
      {
        expired: false,
        $expr: { $lt: [expirationExpr, now] },
      },
      { $set: { expired: true } } 
    );

    console.log(
      `[CRON] Checked expiring jobs: ${jobsExpiringSoon.length}, Marked expired: ${updateResult.modifiedCount}`
    );
  } catch (error) {
    console.error("[CRON] Job expiry workflow failed:", error.message);
  }
};

export const startJobExpiryReminderCron = () => {
  const schedule = process.env.JOB_EXPIRY_CRON || "0 0 * * *"; // daily midnight
  const timezone = process.env.CRON_TIMEZONE || "Asia/Kolkata";

  cron.schedule(
    schedule,
    async () => {   
      await runJobExpiryWorkflow();
    },
    { timezone }
  );

  console.log(`[CRON] Job expiry reminder started: ${schedule} (${timezone})`);
};
