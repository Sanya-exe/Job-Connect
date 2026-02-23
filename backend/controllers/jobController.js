import Job from '../models/job.js';

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

    const totalJobs = await Job.countDocuments();
    console.log('Total Jobs:', totalJobs);

    const jobs = await Job.find()
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
  const { id } = req.params;
  const job = await Job.findById(id);

  if (!job) {
      return res.status(404).json({
    success: false,
    message: 'Job not found.',
  });
  }

  res.status(200).json({
    success: true,
    job,
  });
} catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve job.',
    });
  }
};
