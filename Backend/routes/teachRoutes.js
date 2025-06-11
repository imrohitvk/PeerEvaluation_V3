import express from 'express';
import { protect, adminOrTeacherOnly } from '../middleware/authMiddleware.js';
import { getEnrolledStudents, getTeacherCoursesAndBatches, scheduleExam, studentsEnroll } from '../controllers/teacherController.js';
import multer from 'multer';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.get('/teacher-courses-batches', protect, adminOrTeacherOnly, getTeacherCoursesAndBatches);
router.post('/students-enroll', protect, adminOrTeacherOnly, upload.single('file'), studentsEnroll);
router.get('/enrolled-students', protect, adminOrTeacherOnly, getEnrolledStudents);
router.post('/exam-schedule', protect, adminOrTeacherOnly, upload.single('solutions'), scheduleExam);

export default router;