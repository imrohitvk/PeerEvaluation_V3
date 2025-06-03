import express from 'express';
import { registerUser, loginUser, getProfile, forgotPassword, resetPassword, changePassword, updateRole, addCourse, getTeachers, getCourses } from '../controllers/authController.js';
import { protect, adminOrTeacherOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected route
router.get('/profile', protect, getProfile);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.post('/change-password', protect, changePassword);
router.post('/update-role', protect, adminOrTeacherOnly, updateRole);
router.post('/add-course', protect, addCourse);
router.get('/teachers', protect, getTeachers);
router.get('/courses', protect, getCourses)

export default router;
