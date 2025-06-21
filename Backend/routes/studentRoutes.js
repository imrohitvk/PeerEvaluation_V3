import express from 'express';
import { getAvailableCourses, getBatchesForCourse, getEnrolledCourses, getStudentDashboardStats, requestEnrollment } from '../controllers/studentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/dashboard-stats', protect, getStudentDashboardStats);
router.get('/enrolled-courses', protect, getEnrolledCourses);
router.get('/available-courses', protect, getAvailableCourses);
router.get('/course-batches/:courseId', protect, getBatchesForCourse);
router.post('/request-enrollment', protect, requestEnrollment);

export default router;