import { Batch } from '../models/Batch.js';
import { Course } from '../models/Course.js';
import { User } from '../models/User.js';
import { Enrollment } from '../models/Enrollment.js';
import { Examination } from '../models/Examination.js';
import csv from 'csv-parser';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import sendEmail from '../utils/sendEmail.js';
import emailExistence from 'email-existence';
import { Parser } from 'json2csv';


// Generate a strong random password: min 8 chars, at least 1 uppercase, 1 lowercase, 1 number, 1 special char
function generateStrongPassword() {
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  const all = upper + lower + numbers + special;

  let password = '';
  password += upper[Math.floor(Math.random() * upper.length)];
  password += lower[Math.floor(Math.random() * lower.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];

  for (let i = 4; i < 8; i++) {
  password += all[Math.floor(Math.random() * all.length)];
  }

  // Shuffle password to avoid predictable order
  return password.split('').sort(() => 0.5 - Math.random()).join('');
}

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

export const studentsEnroll = async (req, res) => {
  try {
    const { course, batch } = req.body;
    const csvFile = req.file.path; // Assuming the file is uploaded and available at req.file.path

    if (!course || !batch || !csvFile) {
      return res.status(400).json({ message: 'Course, batch, and CSV file are required.' });
    }

    const students = [];

    // Read the CSV file
    fs.createReadStream(csvFile)
    .pipe(csv({
      mapHeaders: ({ header }) => header.trim().toLowerCase(), // normalize
    }))
    .on('data', (row) => {
      if (!row.name || !row.email) {
        console.error('Missing name or email in row:', row);
        return; // Skip rows with missing data
      }
      students.push({
        name: row.name,
        email: row.email.trim(), // Normalize email
      });
    })
    .on('end', async () => {
        for (const student of students) {
          if (!student.name || !student.email) {
            return res.status(400).json({ message: `Missing name or email for one of the students.` });
          }

          const emailIsValid = await new Promise((resolve) => {
            emailExistence.check(student.email, (err, exists) => {
              if (err) resolve(false);
              else resolve(exists);
            });
          });
      
          if (!emailIsValid) {
            return res.status(400).json({ message: 'Email address does not exist or is invalid.' });
          }

          let user = await User.findOne({ email: student.email });

          if (!user) {
            const randomPassword = generateStrongPassword();
            const hashedPassword = await bcrypt.hash(randomPassword, 10);

            user = new User({
              name: student.name,
              email: student.email,
              password: hashedPassword,
              role: 'student',
            });

            // await user.save();

            // Send welcome email
            const htmlcontent = `
            <div style="font-family:Arial,sans-serif; padding:20px;">
              <h2>Welcome to the Peer Evaluation System</h2>
              <p>Hello ${student.name},</p>
              <p>Your account has been successfully created with the following details:</p>
              <ul>
                <li><strong>Email:</strong> ${student.email}</li>
                <li><strong>Password:</strong> ${randomPassword}</li>
              </ul>
              <p>We're excited to have you onboard!</p>
              <p>Please log in and change your password.</p>
              <br/>
              <p>Best regards,<br/>PES Team</p>
            </div>
            `;
            await sendEmail(
              student.email,
              'Welcome to Peer Evaluation System',
              htmlcontent
            );
            await user.save();
          }

          // Check if the student is already enrolled in the course and batch
          const existingEnrollment = await Enrollment.findOne({ student: user._id, course, batch });
          if (existingEnrollment) {
            // Fetch batch and course details to get their names/ids
            const batchDoc = await Batch.findById(batch);
            const courseDoc = await Course.findById(course);
            const batchName = batchDoc ? batchDoc.batchId : batch;
            const courseName = courseDoc ? courseDoc.courseName : course;
            return res.status(409).json({ message: `Student ${student.name} is already enrolled in the batch ${batchName} of course ${courseName}.` });
          }

          // Enroll the student in the course and batch
          const enrollment = new Enrollment({
            student: user._id,
            course,
            batch,
          });

          await enrollment.save();
        }

        res.status(200).json({ message: 'Students enrolled successfully.' });
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while enrolling students.' });
  }
};

export const getEnrolledStudents = async (req, res) => {
  try {
    const { courseId, batchId } = req.query;

    if (!courseId || !batchId) {
      return res.status(400).json({ message: 'Course ID and Batch ID are required.' });
    }

    const enrollments = await Enrollment.find({ course: courseId, batch: batchId }).populate('student').populate('course').populate('batch');

    if (!enrollments || enrollments.length === 0) {
      return res.status(404).json({ message: 'No students found for the specified batch and course.' });
    }

    const students = enrollments.map(enrollment => ({
      name: enrollment.student.name,
      email: enrollment.student.email,
      enrollmentDate: enrollment.enrollmentDate ? new Date(enrollment.enrollmentDate).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : 'N/A',
      batchName: enrollment.batch.batchId, // Assuming batchId is the identifier for the batch
      courseName: enrollment.course.courseName, // Assuming courseName is the identifier for the course
    }));

    const json2csvParser = new Parser();
    const csv = json2csvParser.parse(students);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=students_${batchId}_${courseId}.csv`);
    res.status(200).send(csv);
  } catch (error) {
    console.error('Error fetching enrolled students:', error);
    res.status(500).json({ message: 'An error occurred while fetching enrolled students.' });
  }
};

export const scheduleExam = async (req, res) => {
  try {
    const { name, batch, date, time, number_of_questions, duration, totalMarks, k } = req.body;
    const solutions = req.file ? req.file.path : null;

    if (!name || !batch || !date || !time || !number_of_questions || !duration || !totalMarks || !k) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const exam = new Examination({
      name,
      batch,
      date,
      time,
      number_of_questions,
      duration,
      totalMarks,
      k,
      solutions: solutions || '', // Optional field, can be empty
      total_students: 0, // This will be updated later
      createdBy: req.user._id, // Assuming req.user is set by auth middleware
    });

    await exam.save();

    res.status(201).json({ message: 'Exam scheduled successfully.', exam });
  } catch (error) {
    console.error('Error scheduling exam:', error);
    res.status(500).json({ message: 'An error occurred while scheduling the exam.' });
  }
};