const crypto = require('crypto');
const axios = require('axios');
const User = require('../models/User');
const { generateToken, generateRefreshToken } = require('../middleware/auth');
const sendEmail = require('../utils/email');
const logger = require('../config/logger');

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    const emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    const user = await User.create({
      name,
      email,
      password,
      emailVerificationToken,
      emailVerificationExpire,
    });

    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email/${emailVerificationToken}`;
    const message = `Please verify your email by clicking the link: ${verificationUrl}`;

    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      try {
        await sendEmail({
          email: user.email,
          subject: 'Email Verification',
          message,
        });
      } catch (emailError) {
        logger.error('Failed to send verification email during registration', emailError);
        // In production, treat email failure as fatal. In development, allow registration to proceed.
        if (process.env.NODE_ENV === 'production') {
          await User.findByIdAndDelete(user._id);
          return res.status(500).json({
            message: 'Registration failed while sending verification email. Please try again later.',
          });
        }
        logger.warn('Email failed to send, but continuing in non-production environment.');
      }
    } else {
      logger.warn('SMTP credentials are not configured. Skipping verification email.');
    }

    res.status(201).json({
      message: 'User registered. Please check your email to verify (if configured).',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshTokens.push({ token: refreshToken });
    await user.save();

    res.json({
      token,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        onboardingCompleted: user.onboardingCompleted,
        academicStream: user.academicStream,
        currentEducation: user.currentEducation,
        skills: user.skills,
        interests: user.interests,
        careerGoal: user.careerGoal,
        selectedCareer: user.selectedCareer,
        selectedRoadmapId: user.selectedRoadmapId,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const googleLogin = async (req, res) => {
  try {
    const { tokenId } = req.body;
    if (!tokenId) {
      return res.status(400).json({ message: 'Google token is required' });
    }

    const tokenInfoUrl = `https://oauth2.googleapis.com/tokeninfo?id_token=${tokenId}`;
    const { data } = await axios.get(tokenInfoUrl);
    const { sub: googleId, email, email_verified, name, picture } = data;

    if (!email || !googleId || !email_verified) {
      return res.status(400).json({ message: 'Google authentication failed' });
    }

    let user = await User.findOne({ googleId });
    if (!user) {
      user = await User.findOne({ email });
      if (user) {
        user.googleId = googleId;
        user.avatar = user.avatar || picture;
        user.isEmailVerified = true;
        await user.save();
      } else {
        user = await User.create({
          name,
          email,
          googleId,
          avatar: picture,
          isEmailVerified: true,
        });
      }
    }

    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    user.refreshTokens.push({ token: refreshToken });
    await user.save();

    res.json({
      token,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        onboardingCompleted: user.onboardingCompleted,
        academicStream: user.academicStream,
        currentEducation: user.currentEducation,
        skills: user.skills,
        interests: user.interests,
        careerGoal: user.careerGoal,
        selectedCareer: user.selectedCareer,
        selectedRoadmapId: user.selectedRoadmapId,
      },
    });
  } catch (error) {
    logger.error('Google login failed', error.message || error);
    res.status(500).json({ message: 'Google authentication failed' });
  }
};

const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (refreshToken) {
      await User.findByIdAndUpdate(req.user._id, {
        $pull: { refreshTokens: { token: refreshToken } },
      });
    }

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    const user = await User.findOne({ 'refreshTokens.token': refreshToken });
    if (!user) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const token = generateToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    user.refreshTokens = user.refreshTokens.filter(rt => rt.token !== refreshToken);
    user.refreshTokens.push({ token: newRefreshToken });
    await user.save();

    res.json({
      token,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;
    await user.save();

    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpire = Date.now() + 1 * 60 * 60 * 1000; // 1 hour

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = resetExpire;
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    const message = `You requested a password reset. Click the link to reset: ${resetUrl}`;

    await sendEmail({
      email: user.email,
      subject: 'Password Reset',
      message,
    });

    res.json({ message: 'Password reset email sent' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getGoogleConfig = (req, res) => {
  res.json({
    clientId: process.env.GOOGLE_CLIENT_ID || null,
  });
};

module.exports = {
  register,
  login,
  googleLogin,
  logout,
  refreshToken,
  verifyEmail,
  forgotPassword,
  resetPassword,
  getMe,
  getGoogleConfig,
};
