import express from 'express';
import { protect, adminOrTeacherOnly } from '../middleware/authMiddleware.js';
import { getTeacherCoursesAndBatches, studentsEnroll } from '../controllers/teacherController.js';
import multer from 'multer';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.get('/teacher-courses-batches', protect, adminOrTeacherOnly, getTeacherCoursesAndBatches);
router.post('/students-enroll', protect, adminOrTeacherOnly, upload.single('file'), studentsEnroll);

export default router;