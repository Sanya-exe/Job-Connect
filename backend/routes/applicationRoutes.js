import  express from "express";
import { isAuthenticated } from "../middleware/authMiddleware.js";
import { postApplication, jobseekerGetAllApplications, jobseekerDeleteApplication } from "../controllers/applicationController.js";

const router = express.Router();

// No file upload needed here — resume is taken from the user's profile automatically
router.post("/post", isAuthenticated, postApplication)
router.get("/jobseeker/getall", isAuthenticated, jobseekerGetAllApplications);
router.delete("/delete/:id", isAuthenticated, jobseekerDeleteApplication);

export default router;