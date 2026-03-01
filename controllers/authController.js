const { User } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { generateVerificationCode, sendVerificationEmail, sendWelcomeEmail } = require('../services/emailService');

const register = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check if email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      // If user exists but not verified, allow re-registration (resend code)
      if (!existingUser.is_verified) {
        const verificationCode = generateVerificationCode();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        
        await existingUser.update({
          password: await bcrypt.hash(password, 10),
          verification_code: verificationCode,
          verification_code_expires: expiresAt,
        });
        
        await sendVerificationEmail(email, verificationCode);
        
        return res.status(200).json({ 
          message: 'Verification code resent to your email',
          userId: existingUser.user_id,
          requiresVerification: true,
        });
      }
      return res.status(400).json({ error: 'Email already exists' });
    }
    
    // Generate verification code
    const verificationCode = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    // Hash password and create user
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ 
      email, 
      password: hashedPassword,
      is_verified: false,
      verification_code: verificationCode,
      verification_code_expires: expiresAt,
    });
    
    // Send verification email
    const emailSent = await sendVerificationEmail(email, verificationCode);
    
    if (!emailSent) {
      console.error('Failed to send verification email to:', email);
    }
    
    res.status(201).json({ 
      message: 'User registered. Please check your email for verification code.',
      userId: user.user_id,
      requiresVerification: true,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({ error: 'Registration failed. Please try again.' });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;
    
    if (!email || !code) {
      return res.status(400).json({ error: 'Email and verification code are required' });
    }
    
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (user.is_verified) {
      return res.status(400).json({ error: 'Email is already verified' });
    }
    
    // Check if code matches
    if (user.verification_code !== code) {
      return res.status(400).json({ error: 'Invalid verification code' });
    }
    
    // Check if code is expired
    if (new Date() > new Date(user.verification_code_expires)) {
      return res.status(400).json({ error: 'Verification code has expired. Please request a new one.' });
    }
    
    // Mark user as verified
    await user.update({
      is_verified: true,
      verification_code: null,
      verification_code_expires: null,
    });
    
    // Send welcome email (non-blocking)
    sendWelcomeEmail(email);
    
    // Generate token for auto-login after verification
    const token = jwt.sign(
      { id: user.user_id, email: user.email, role: user.role || 'user' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    res.json({ 
      message: 'Email verified successfully!',
      token,
      role: user.role || 'user',
    });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ error: 'Verification failed. Please try again.' });
  }
};

const resendVerificationCode = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (user.is_verified) {
      return res.status(400).json({ error: 'Email is already verified' });
    }
    
    // Generate new verification code
    const verificationCode = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    await user.update({
      verification_code: verificationCode,
      verification_code_expires: expiresAt,
    });
    
    // Send verification email
    const emailSent = await sendVerificationEmail(email, verificationCode);
    
    if (!emailSent) {
      return res.status(500).json({ error: 'Failed to send verification email. Please try again.' });
    }
    
    res.json({ message: 'Verification code sent to your email' });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ error: 'Failed to resend verification code' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Check if email is verified
    if (!user.is_verified) {
      // Generate new verification code and send it
      const verificationCode = generateVerificationCode();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
      
      await user.update({
        verification_code: verificationCode,
        verification_code_expires: expiresAt,
      });
      
      await sendVerificationEmail(email, verificationCode);
      
      return res.status(403).json({ 
        error: 'Please verify your email first. A new verification code has been sent.',
        requiresVerification: true,
        email: user.email,
      });
    }
    
    // Include role in JWT token for admin access control
    const token = jwt.sign(
      { id: user.user_id, email: user.email, role: user.role || 'user' }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1h' }
    );
    res.json({ message: 'Login successful', token, role: user.role || 'user' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

module.exports = { register, login, verifyEmail, resendVerificationCode };