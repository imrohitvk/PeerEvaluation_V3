import mongoose from 'mongoose';
// This code defines a Mongoose schema for a Batch model in a Node.js application.

const BatchSchema = new mongoose.Schema({
    batch_id: { type: String, required: true, unique: true },
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    course_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
});

export const Batch = mongoose.model('Batch', BatchSchema);
