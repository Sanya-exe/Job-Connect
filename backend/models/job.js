import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
  company: {
    type: String,
    required: [true, 'A job must have a company name.'],
  },
  title: {
    type: String,
    required: [true, 'A job must have a title.'],
  },
  description: {
    type: String,
    required: [true, 'A job must have a description.'],
  },
  skillsRequired: {
    type: [String], // Array of strings for multiple skills
    required: false,
  },
  category: {
    type: String,
    required: [true, 'A job must have a category.'],
  },
  country: {
    type: String,
    required: [true, 'A job must have a country.'],
  },
  city: {
    type: String,
    required: [true, 'A job must have a city.'],
  },
  location: {
    type: String,
    required: [true, 'A job must have a location.'],
  },
  fixedSalary: {
    type: Number,
    required: false,
  },
  salaryFrom: {
    type: Number,
    required: false,
  },
  salaryTo: {
    type: Number,
    required: false,
  },
  experienceLevel: {
    type: String,
    enum: ['Entry Level', 'Mid Level', 'Senior Level'],
    required: [true, 'A job must have an experience level.'],
  },
  jobPostedOn: {
    type: Date,
    default: Date.now,
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'A job must be posted by a user.'],
  },
  // List of users who saved the job with timestamps
  savedByUsers: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      savedAt: {
        type: Date,
        default: Date.now, // Automatically records when saved
      },
    },
  ],
  expired: {
    type: Boolean,
    default: false,
  },
  // Time left before the job expires, in days (can be used for display)
  timeLeftToExpire: {
    type: Number, // Example: 30 days from posting
    required: true,
  },
});

// Middleware to update expired status automatically based on time
  jobSchema.pre('save', function () {
  const currentDate = new Date();
  const jobExpirationDate = new Date(this.jobPostedOn);
  jobExpirationDate.setDate(jobExpirationDate.getDate() + this.timeLeftToExpire);

  // If the current date is past the expiration date, mark the job as expired
  if (currentDate > jobExpirationDate) {
    this.expired = true;
  }
});

const Job = mongoose.model('Job', jobSchema);

export default Job;