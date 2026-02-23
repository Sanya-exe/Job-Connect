import express from 'express';
import { isAuthenticated } from '../middleware/authMiddleware.js';
import { postJob, getAllJobs, getMyJobs, updateJob, deleteJob, getSingleJob } from '../controllers/jobController.js';

const router = express.Router();

router.post("/post", isAuthenticated, postJob);
router.patch("/update/:id", isAuthenticated, updateJob);
router.delete("/delete/:id", isAuthenticated, deleteJob);
router.get("/getmyjobs", isAuthenticated, getMyJobs);
router.get('/getall', getAllJobs);
router.get("/:id", isAuthenticated, getSingleJob);



export default router;