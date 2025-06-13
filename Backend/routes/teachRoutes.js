import express from 'express';
import { protect, adminOrTeacherOnly } from '../middleware/authMiddleware.js';
import { deleteExam, getEnrolledStudents, getExamsForTeacher, getTeacherCoursesAndBatches, scheduleExam, studentsEnroll } from '../controllers/teacherController.js';
// import multer from 'multer';
import upload from '../utils/fileUpload.js'; // Assuming you have a fileUpload.js for handling file uploads

const router = express.Router();
// const upload = multer({ dest: 'uploads/' });

router.get('/teacher-courses-batches', protect, adminOrTeacherOnly, getTeacherCoursesAndBatches);
router.post('/students-enroll', protect, adminOrTeacherOnly, upload.single('file'), studentsEnroll);
router.get('/enrolled-students', protect, adminOrTeacherOnly, getEnrolledStudents);
router.post('/exam-schedule', protect, adminOrTeacherOnly, upload.single('solutions'), scheduleExam);
router.get('/teacher-exams', protect, adminOrTeacherOnly, getExamsForTeacher);
router.delete('/delete-exam/:id', protect, adminOrTeacherOnly, deleteExam);

export default router;