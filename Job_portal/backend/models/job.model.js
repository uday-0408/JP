// const { application } = require("express");
// const mongoose = require("mongoose");
import mongoose from "mongoose";
import { Application } from "./application.model.js"; // Import Application model

const job = mongoose.Schema(
  {
    title: {  
      type: String,
      required: true,
      trim: true,
    },
    djangoJobId: {
      type: Number,
      default: null
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    isExtracted: {
      type: Boolean,
      default: false
    },
    salary: {
      type: Number, // e.g., "50,000 - 70,000"
      required: true,
    },
    experienceLevel: {
      type: Number, // e.g., "1-3 years"
      required: true,
      min: 0, // Minimum experience in years
    },
    location: {
      type: String, // e.g., "Remote", "On-site", "Hybrid"
      required: true,
    },
    jobType: {
      type: String, // e.g., "Full-time", "Part-time", "Internship"
      required: true,
    },
    requirements: [
      {
        type: String,
      },
    ],
    position: {
      type: Number,
      required: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company", // Reference to the Company model
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the User model
      required: true,
    },
    applications: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Application", // Reference to the User model for applicants
      },
    ],
    bookmarkedBy: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        bookmarkedAt: { type: Date, default: Date.now }
      },
    ],
  },
  { timestamps: true }
);

export const Job = mongoose.model("Job", job);
