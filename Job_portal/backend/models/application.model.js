// const mongoose = require('mongoose');
import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
    job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job', // Reference to the Job model
        required: true,
    },
    applicant:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the User model
        required: true,
    }],
    status: {
        type: String,
        enum: ['pending', 'offered', 'rejected'],
        default: 'pending', // Default status is 'pending'
    },
},{ timestamps: true });

export const Application = mongoose.model('Application', applicationSchema);