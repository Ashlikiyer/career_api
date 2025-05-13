const { Profile } = require('../models');

const getProfile = async (req, res) => {
  try {
    const user_id = req.user.id; // From authMiddleware
    const profile = await Profile.findOne({ where: { user_id } });

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.json(profile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const user_id = req.user.id; // From authMiddleware
    const { username, email } = req.body;

    let profile = await Profile.findOne({ where: { user_id } });

    if (!profile) {
      // Create a new profile if it doesn't exist
      if (!username || !email) {
        return res.status(400).json({ message: 'Username and email are required to create a profile' });
      }
      profile = await Profile.create({
        user_id,
        username,
        email,
      });
      return res.status(201).json({ message: 'Profile created', profile });
    }

    // Update the existing profile
    await profile.update({
      username: username || profile.username,
      email: email || profile.email,
    });

    res.json({ message: 'Profile updated', profile });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

module.exports = { getProfile, updateProfile };