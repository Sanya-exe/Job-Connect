import  express from "express";
import { isAuthenticated } from "../middleware/authMiddleware.js";
import { uploadResume } from "../middleware/uploadMiddleware.js";
import { postApplication, jobseekerGetAllApplications, jobseekerDeleteApplication } from "../controllers/applicationController.js";

const router = express.Router();

router.post("/post", isAuthenticated, uploadResume, postApplication)
router.get("/jobseeker/getall", isAuthenticated, jobseekerGetAllApplications);
router.delete("/delete/:id", isAuthenticated, jobseekerDeleteApplication);

export default router;