import { Enrollment } from '../models/Enrollment.js';
import { Examination } from '../models/Examination.js';
import { Document } from '../models/Document.js';
import { Batch } from '../models/Batch.js';
import { Course } from '../models/Course.js';

export const getStudentDashboardStats = async (req, res) => {
//   console.log('Fetching student dashboard stats for user:', req.user._id);
  try {
    const studentId = req.user._id;

    const coursesEnrolled = await Enrollment.countDocuments({ student: studentId , status: 'active' });

    const pendingEvaluations = await Document.countDocuments({
      uniqueId: studentId,
      evaluationStatus: 'pending'
    });

    const now = new Date();
    const activeExams = await Examination.countDocuments({
      startTime: { $lte: now },
      endTime: { $gte: now },
      'enrolledStudents': studentId
    });

    res.json({
      coursesEnrolled,
      pendingEvaluations,
      activeExams
    });
  } catch (error) {
    console.error('Error fetching student dashboard stats:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard stats' });
  }
};

export const getEnrolledCourses = async (req, res) => {
  try {
    const studentId = req.user._id;

    const enrollments = await Enrollment.find({ student: studentId, status: 'active' })
      .populate({
        path: 'course',
        select: 'courseName'
      })
      .populate({
        path: 'batch',
        select: 'batchId'
      });

    // Format the response
    const result = enrollments.map(enrollment => ({
      courseName: enrollment.course?.courseName || 'Unknown Course',
      batchName: enrollment.batch?.batchId || 'Unknown Batch'
    }));

    res.json(result);
  } catch (error) {
    console.error('Error fetching enrolled courses:', error);
    res.status(500).json({ message: 'Failed to fetch enrolled courses' });
  }
};

export const getAvailableCourses = async (req, res) => {
  try {
    const courses = await Course.find({});
    res.json(courses);
  } catch (error) {
    console.error('Error fetching available courses:', error);
    res.status(500).json({ message: 'Failed to fetch available courses' });
  }
};

export const getBatchesForCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const batches = await Batch.find({ course: courseId });
    res.json(batches);
  } catch (error) {
    console.error('Error fetching batches for course:', error);
    res.status(500).json({ message: 'Failed to fetch batches for course' });
  }
};

export const requestEnrollment = async (req, res) => {
  try {
    const { courseId, batchId } = req.body;
    const studentId = req.user._id;

    const existingEnrollment = await Enrollment.findOne({
      student: studentId,
      batch: batchId,
      course: courseId,
      status: { $in: ['pending', 'active'] }
    });

    if (existingEnrollment && existingEnrollment.status === 'active') {
      return res.status(400).json({ message: 'Already enrolled in this course!' });
    }
    else if (existingEnrollment && existingEnrollment.status === 'pending') {
      return res.status(400).json({ message: 'You have a pending enrollment request for this course!' });
    }

    const newEnrollment = new Enrollment({
      student: studentId,
      course: courseId,
      batch: batchId,
      status: 'pending'
    });

    await newEnrollment.save();
    res.status(200).json({ message: 'Enrollment request submitted successfully!' });
  } catch (error) {
    console.error('Error requesting enrollment:', error);
    res.status(500).json({ message: 'Failed to request enrollment!' });
  }
};
