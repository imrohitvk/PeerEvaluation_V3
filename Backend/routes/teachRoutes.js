import express from 'express';
import { protect, adminOrTeacherOnly } from '../middleware/authMiddleware.js';
import { getTeacherCoursesAndBatches } from '../controllers/teacherController.js';

const router = express.Router();

router.get('/teacher-courses-batches', protect, adminOrTeacherOnly, getTeacherCoursesAndBatches);

export default router;