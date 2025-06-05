import express from 'express';
import { updateRole, addCourse, getTeachers, getCourses, addBatch, getDashboardCounts } from '../controllers/adminController.js';
import { protect, adminOrTeacherOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/update-role', protect, adminOrTeacherOnly, updateRole);
router.post('/add-course', protect, addCourse);
router.get('/teachers', protect, getTeachers);
router.get('/courses', protect, getCourses);
router.post('/add-batch', protect, addBatch);
router.get('/dashboard-counts', protect, getDashboardCounts);

export default router;


// update the whole routes in the admin and teacher dashboard and also add it to server.js