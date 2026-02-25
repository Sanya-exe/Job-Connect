import express from 'express';
import { login, logout, register, updateUser, uploadProfileResume } from '../controllers/authController.js';
import { isAuthenticated } from '../middleware/authMiddleware.js';
import { uploadResume } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.get('/me', isAuthenticated, (req, res) => {
  res.status(200).json({
    status: 'success',
    user: req.user,
  });
});


// Public routes
router.post('/register', register);
router.post('/login', login);
router.get("/logout", logout);
router.patch('/update/:id', isAuthenticated, updateUser);
// Upload resume to profile (Job Seekers only)
// uploadResume is the multer middleware that reads the file from the request
router.post('/upload-resume', isAuthenticated, uploadResume, uploadProfileResume);

export default router;