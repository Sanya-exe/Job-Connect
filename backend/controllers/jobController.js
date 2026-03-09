import Job from '../models/job.js';

// Save or unsave a job (toggle)
export const toggleSaveJob = async (req, res) => {
  try {
    if (req.user.role !== "Job Seeker") {
      return res.status(403).json({
        success: false,
        message: "Only Job Seekers can save jobs.",
      });
    }

    const { id: jobId } = req.params;
    const userId = req.user._id;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found.",
      });
    }

    if (job.expired) {
      return res.status(400).json({
        success: false,
        message: "Expired jobs cannot be saved.",
      });
    }

    const alreadySaved = job.savedByUsers.some(
      (entry) => String(entry.userId) === String(userId)
    );

    if (alreadySaved) {
      job.savedByUsers = job.savedByUsers.filter(
        (entry) => String(entry.userId) !== String(userId)
      );
      await job.save();

      const savedJobsCount = await Job.countDocuments({
        "savedByUsers.userId": userId,
      });

      return res.status(200).json({
        success: true,
        saved: false,
        message: "Job removed from saved list.",
      });
    }

    job.savedByUsers.push({ userId });
    await job.save();

    const savedJobsCount = await Job.countDocuments({
    "savedByUsers.userId": userId,
});
    return res.status(200).json({
      success: true,
      saved: true,
      savedJobsCount,
      message: "Job saved successfully.",
    });
  }catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to save/unsave job.",
    });
  }
};

// Get all jobs saved by current job seeker
export const getMySavedJobs = async (req, res) => {
  try {
    if (req.user.role !== "Job Seeker") {
      return res.status(403).json({
        success: false,
        message: "Only Job Seekers can access saved jobs.",
      });
    }
 
    const userId = req.user._id;
    
    const jobs = await Job.find({
      //expired: false,
      "savedByUsers.userId": req.user._id,
    }).sort({ jobPostedOn: -1 });

    return res.status(200).json({
      success: true,
      total: jobs.length,
      jobs,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch saved jobs.",
    });
  }
};


// Post a new job and notify matched users
export const postJob = async (req, res) => {
  try {
    const job = await Job.create({
      ...req.body,
      postedBy: req.user._id,
    });

    res.status(201).json({
      status: 'success',
      message: 'Job Posted Successfully',
      data: { job },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to post job',
    });
  }
};


// Get all active (non-expired) jobs
export const getAllJobs = async (req, res, next) => {
  try{
    const page = parseInt(req.query.page) || 1; 
    const limit = parseInt(req.query.limit) || 10;

    const skip = (page - 1) * limit; 

    const totalJobs = await Job.countDocuments({ expired: false });

    const jobs = await Job.find({ expired: false })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      currentPage: page,
      totalPages: Math.ceil(totalJobs / limit),
      totalJobs,
      jobs,
    });
} catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve jobs.',
    });
  }
};

// Get jobs posted by the current user
export const getMyJobs = async (req, res, next) => {
  try{
  if (req.user.role === 'Job Seeker') {
    return res.status(403).json({
    success: false,
    message: 'Job Seeker not allowed to access this resource.',
 });
  }
  const myJobs = await Job.find({ postedBy: req.user._id });

  res.status(200).json({
    success: true,
    myJobs,
  });
}catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve jobs.',
    });
  } 
};


// Update a job by its ID
export const updateJob = async (req, res, next) => {
  try{
  if (req.user.role === 'Job Seeker') {
    return res.status(403).json({
     success: false,
     message: 'Job Seeker not allowed to access this resource.',
});
  }

  const { id } = req.params;
  let job = await Job.findById(id);

  if (!job) {
    throw new Error('OOPS! Job not found.');
  }

  job = await Job.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    message: 'Job Updated!',
    job,
  });
  }  catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update job.',
    });
  }
};

// Delete a job by its ID
export const deleteJob = async (req, res, next) => {
  try{
  if (req.user.role === 'Job Seeker') {
    return res.status(403).json({
    success: false,
    message: 'Job Seeker not allowed to access this resource.',
 });
  }

  const { id } = req.params;
  const job = await Job.findById(id);

  if (!job) {
    throw new Error('OOPS! Job not found.');
  }

  await job.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Job Deleted!',
  });
  }catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete job.',
    });
  }
};

// Get a single job by its ID
export const getSingleJob = async (req, res, next) => {
  try{
  // const isSavedByCurrentUser = job.savedByUsers.some(
  // (entry) => String(entry.userId) === String(req.user._id)
  //  );
  const { id } = req.params;
  const job = await Job.findById(id);

  if (!job) {
      return res.status(404).json({
    success: false,
    message: 'Job not found.',
  });
  }
  const isSavedByCurrentUser =
  req.user?.role === 'Job Seeker' &&
  job.savedByUsers.some(
    (entry) => String(entry.userId) === String(req.user._id)
  );

  res.status(200).json({
    success: true,
    job,
    isSavedByCurrentUser,
  });
} catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve job.',
    });
  }
};
