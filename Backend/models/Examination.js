import mongoose from "mongoose";

const ExaminationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    batch: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', required: true },
    date: { type: Date, required: true },
    duration: { type: Number, required: true },
    totalMarks: { type: Number, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },
});

export const Examination = mongoose.model('Examination', ExaminationSchema);
