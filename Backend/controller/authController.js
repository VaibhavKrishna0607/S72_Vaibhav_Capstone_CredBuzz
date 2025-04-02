
const User = require('../model/user');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
      
      res.status(200).json({
        success: true,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          credits: user.credits,
          avatar: user.avatar,
          bio: user.bio,
          skills: user.skills,
          tasksCompleted: user.tasksCompleted,
          tasksCreated: user.tasksCreated,
          joinedDate: user.joinedDate,
          rating: user.rating
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server Error',
        error: error.message
      });
    }
  };