import mongoose from 'mongoose';

const BatchSchema = new mongoose.Schema({
    batchId: { type: String, required: true },
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
});

// Compound unique index on batchId and course
BatchSchema.index({ batchId: 1, course: 1 }, { unique: true });

export const Batch = mongoose.model('Batch', BatchSchema);
