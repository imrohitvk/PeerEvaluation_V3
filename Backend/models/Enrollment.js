import mongoose from 'mongoose';

const EnrollmentSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    enrollmentDate: { type: Date, default: Date.now },
    status: { type: String, enum: ['active', 'completed', 'dropped'], default: 'active' },
    grade: { type: String, default: 'N/A' },
});

export const Enrollment = mongoose.model('Enrollment', EnrollmentSchema);
