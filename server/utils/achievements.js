const User = require('../models/User');

const addUserBadge = async (userId, badgeName) => {
  if (!badgeName) return null;

  const user = await User.findById(userId);
  if (!user) return null;

  if (!Array.isArray(user.badges)) {
    user.badges = [];
  }

  if (!user.badges.includes(badgeName)) {
    user.badges.push(badgeName);
    await user.save();
  }

  return user;
};

const awardThresholdBadges = async (userId, previousProgress, currentProgress) => {
  const thresholds = [25, 50, 75, 100];
  for (const threshold of thresholds) {
    if (previousProgress < threshold && currentProgress >= threshold) {
      await addUserBadge(userId, `${threshold}% Roadmap Complete`);
    }
  }
};

module.exports = {
  addUserBadge,
  awardThresholdBadges,
};
