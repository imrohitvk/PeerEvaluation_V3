// import { Course } from '../models/Course.js';
// import { User } from '../models/User.js';

// export const getTeacherCoursesAndBatches = async (req, res) => {
//   try {
//     const teacherId = req.user._id; // Assuming `req.user` contains the logged-in teacher's details
//     console.log('Fetching courses and batches for teacher ID:', teacherId);

//     // Find courses associated with the teacher
//     const courses = await Course.find({ instructor: teacherId }).populate('batches');

//     if (!courses || courses.length === 0) {
//       return res.status(404).json({ message: 'No courses found for the teacher.' });
//     }

//     // Format the response to include courses and their associated batches
//     const coursesAndBatches = courses.map(course => ({
//       id: course._id,
//       name: course.courseName,
//       batches: course.batches.map(batch => ({
//         id: batch._id,
//         name: batch.batchName,
//       })),
//     }));

//     res.status(200).json(coursesAndBatches);
//   } catch (error) {
//     console.error('Error fetching courses and batches for teacher:', error);
//     res.status(500).json({ message: 'Server error. Please try again later.' });
//   }
// };

import { Batch } from '../models/Batch.js';
import { Course } from '../models/Course.js';

export const getTeacherCoursesAndBatches = async (req, res) => {
  try {
    const teacherId = req.user._id; // Assuming authentication middleware sets req.user
    // console.log('Fetching batches and courses for teacher ID:', teacherId);

    // Find all batches assigned to this teacher and populate the course field
    const batches = await Batch.find({ instructor: teacherId }).populate('course');

    if (!batches || batches.length === 0) {
      return res.status(404).json({ message: 'No batches found for this teacher.' });
    }

    // Structure: courseId => { name, batches: [] }
    const courseMap = {};

    batches.forEach(batch => {
      const course = batch.course;
      if (!courseMap[course._id]) {
        courseMap[course._id] = {
          id: course._id,
          name: course.courseName,
          batches: [],
        };
      }
      courseMap[course._id].batches.push({
        id: batch._id,
        name: batch.batchId, // You can also use `batchName` if available
      });
    });

    const result = Object.values(courseMap);

    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching batches and courses for teacher:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};
