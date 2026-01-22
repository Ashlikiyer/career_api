const { User } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
  try {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashedPassword });
    res.status(201).json({ message: 'User registered', userId: user.user_id });
  } catch (error) {
    res.status(400).json({ error: 'Email already exists or invalid data' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    // Include role in JWT token for admin access control
    const token = jwt.sign(
      { id: user.user_id, email: user.email, role: user.role || 'user' }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1h' }
    );
    res.json({ message: 'Login successful', token, role: user.role || 'user' });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
};

module.exports = { register, login };