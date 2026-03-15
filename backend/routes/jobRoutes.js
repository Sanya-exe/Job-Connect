import express from 'express';
import { isAuthenticated } from '../middleware/authMiddleware.js';
import { postJob, getAllJobs, getMyJobs, searchJobs, updateJob, deleteJob, getSingleJob,toggleSaveJob, getMySavedJobs } from '../controllers/jobController.js';

const router = express.Router();

router.post("/post", isAuthenticated, postJob);
router.patch("/update/:id", isAuthenticated, updateJob);
router.get('/search', searchJobs);
router.delete("/delete/:id", isAuthenticated, deleteJob);
router.get("/getmyjobs", isAuthenticated, getMyJobs);
router.get('/getall', getAllJobs);
router.patch("/save/:id", isAuthenticated, toggleSaveJob);
router.get("/saved/me", isAuthenticated, getMySavedJobs);
router.get("/:id", isAuthenticated, getSingleJob);



export default router;