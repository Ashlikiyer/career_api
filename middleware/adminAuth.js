/**
 * Admin Authorization Middleware
 * 
 * Ensures that only users with admin role can access protected routes.
 * Must be used AFTER the auth middleware (which sets req.user).
 */

const adminAuth = (req, res, next) => {
  try {
    // Check if user exists (auth middleware should have set this)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Check if user has admin role
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    // User is admin, proceed to next middleware/route handler
    next();
  } catch (error) {
    console.error('Admin auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during authorization'
    });
  }
};

module.exports = adminAuth;
