import User from '../models/user.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import promisify from 'util';
import cloudinary from '../config/cloudinary.js';


// Function to sign a JWT token
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// Function to create and send a JWT token
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true, // Prevents client-side scripts from accessing the cookie
  };
  res.cookie('jwt', token, cookieOptions);

  user.password = undefined; // Remove password from the output

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};


// User registration
export const register = async (req, res) => {
  try {
    const { name, email, phone, password, role, skillset } = req.body;

    if (!name || !email || !phone || !password || !role) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide all required fields.',
      });
    }

    if (role === 'Employer' && skillset && skillset.length > 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'Employers should not provide a skillset.',
      });
    }

    if (role === 'Job Seeker' && (!skillset || skillset.length === 0)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Job Seekers must provide at least one skill.',
      });
    }

    const newUser = await User.create({
      name,
      email,
      phone,
      password,
      role,
      skillset: role !== 'Employer' ? skillset : [],
    });

    res.status(201).json({
      status: 'success',
      message: 'Registration successful.',
      data: {
        user: newUser,
      },
    });

  } catch (error) {
    console.error('Register Error:', error);

    res.status(500).json({
      status: 'error',
      message: 'Something went wrong while registering the user.',
    });
  }
};

// User login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check required fields
    if (!email || !password) {
      return res.status(400).json({
        message: 'Please provide email, password.',
      });
    }

    // Find user and explicitly include password
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        message: 'Invalid Email or Password.',
      });
    }

    // Compare passwords using bcrypt
    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: 'Invalid Email or Password.',
      });
    }

     createSendToken(user, 200, res);

  } catch (error) {
    console.error('Login Error:', error);

    res.status(500).json({
      status: 'error',
      message: 'Something went wrong while logging in.',
    });
  }
};

export const logout = async (req, res, next) => {
  res.status(200)
    .cookie('jwt', '', {
      httpOnly: true,
      expires: new Date(Date.now()),
    })
    .json({
      status: 'success',
      message: 'Logged Out Successfully.',
    });
};

// Upload or re-upload resume to the user's profile
export const uploadProfileResume = async (req, res) => {
  try {
    // Check if a file was sent
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please select a resume file to upload.',
      });
    }

    // If user already has a resume saved, delete the old one from Cloudinary first
    if (req.user.resume && req.user.resume.public_id) {
      await cloudinary.uploader.destroy(req.user.resume.public_id, {
        resource_type: 'raw',
      });
    }

    // Upload the new resume file to Cloudinary
    const uploadedFile = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { resource_type: 'raw', folder: 'jobify_profile_resumes' },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });

    // Save the new resume info to the user's profile in database
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        resume: {
          public_id: uploadedFile.public_id,
          url: uploadedFile.secure_url,
        },
      },
      { new: true } // return the updated user
    );

    res.status(200).json({
      success: true,
      message: 'Resume uploaded successfully.',
      user: updatedUser,
    });

  } catch (error) {
    console.error('Resume upload error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload resume. Please try again.',
    });
  }
};

export const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;     // user id from URL
    const updates = req.body;         // data to update

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updates },              // update only provided fields
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      user: updatedUser,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update user',
    });
  }
};