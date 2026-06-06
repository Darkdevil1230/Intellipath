const User = require('../models/User');

const updateProfile = async (req, res) => {
  try {
    const { name, avatar, skills, interests, careerGoal } = req.body;

    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (avatar) user.avatar = avatar;
    if (skills) user.skills = skills;
    if (interests) user.interests = interests;
    if (careerGoal) user.careerGoal = careerGoal;

    await user.save();

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateSettings = async (req, res) => {
  try {
    const { darkMode, notificationPreferences } = req.body;

    const user = await User.findById(req.user._id);

    if (darkMode !== undefined) user.darkMode = darkMode;
    if (notificationPreferences) {
      user.notificationPreferences = {
        ...user.notificationPreferences,
        ...notificationPreferences,
      };
    }

    await user.save();

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteAccount = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user._id);
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  updateProfile,
  updateSettings,
  deleteAccount,
};
