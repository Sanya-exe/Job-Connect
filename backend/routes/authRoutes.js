import express from 'express';
import   {login, logout, register, updateUser } from '../controllers/authController.js';
import { isAuthenticated } from '../middleware/authMiddleware.js';

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

export default router;
