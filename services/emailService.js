const nodemailer = require('nodemailer');

// Create transporter with Gmail SMTP
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

/**
 * Generate a 6-digit verification code
 */
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Send verification email with code
 * @param {string} email - Recipient email address
 * @param {string} code - 6-digit verification code
 * @returns {Promise<boolean>} - Success status
 */
const sendVerificationEmail = async (email, code) => {
  try {
    const transporter = createTransporter();

    // Split code into individual digits for styling
    const digits = code.split('');

    const mailOptions = {
      from: process.env.SMTP_FROM || `PathFinder <${process.env.SMTP_USER}>`,
      to: email,
      subject: '🔐 Your PathFinder Verification Code',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Email</title>
          <!--[if mso]>
          <noscript>
            <xml>
              <o:OfficeDocumentSettings>
                <o:PixelsPerInch>96</o:PixelsPerInch>
              </o:OfficeDocumentSettings>
            </xml>
          </noscript>
          <![endif]-->
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%); min-height: 100vh;">
          <table role="presentation" style="width: 100%; border-collapse: collapse; background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);">
            <tr>
              <td align="center" style="padding: 40px 20px;">
                
                <!-- Main Card -->
                <table role="presentation" style="max-width: 500px; width: 100%; background: #ffffff; border-radius: 24px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); overflow: hidden;">
                  
                  <!-- Hero Section with Illustration -->
                  <tr>
                    <td style="padding: 48px 40px 32px 40px; text-align: center;">
                      <!-- Animated Lock Icon -->
                      <div style="width: 100px; height: 100px; margin: 0 auto 24px auto; background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #D946EF 100%); border-radius: 28px; display: flex; align-items: center; justify-content: center; box-shadow: 0 20px 40px -8px rgba(99, 102, 241, 0.5);">
                        <table role="presentation" style="width: 100px; height: 100px;">
                          <tr>
                            <td align="center" valign="middle">
                              <!-- Shield Icon SVG as inline -->
                              <img src="https://img.icons8.com/fluency/96/security-checked.png" alt="Secure" style="width: 56px; height: 56px;" />
                            </td>
                          </tr>
                        </table>
                      </div>
                      
                      <!-- Logo Text -->
                      <h1 style="margin: 0 0 8px 0; font-size: 28px; font-weight: 800; background: linear-gradient(135deg, #6366F1, #D946EF); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">PathFinder</h1>
                      <p style="margin: 0; color: #64748B; font-size: 14px; font-weight: 500;">Career Navigator</p>
                    </td>
                  </tr>
                  
                  <!-- Divider -->
                  <tr>
                    <td style="padding: 0 40px;">
                      <div style="height: 1px; background: linear-gradient(90deg, transparent, #E2E8F0, transparent);"></div>
                    </td>
                  </tr>
                  
                  <!-- Content Section -->
                  <tr>
                    <td style="padding: 32px 40px;">
                      <h2 style="margin: 0 0 12px 0; color: #1E293B; font-size: 24px; font-weight: 700; text-align: center;">Verify Your Email</h2>
                      <p style="margin: 0 0 32px 0; color: #64748B; font-size: 15px; line-height: 1.6; text-align: center;">
                        Hey there! 👋 Welcome to PathFinder.<br>
                        Enter this code to complete your registration:
                      </p>
                      
                      <!-- Code Display - Modern Style -->
                      <div style="background: linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%); border-radius: 16px; padding: 24px 16px; margin: 0 0 24px 0; border: 2px solid #E2E8F0;">
                        <p style="margin: 0 0 12px 0; color: #94A3B8; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; text-align: center; font-weight: 600;">Your Verification Code</p>
                        
                        <!-- Individual Code Digits -->
                        <table role="presentation" style="width: 100%; max-width: 320px; margin: 0 auto;">
                          <tr>
                            ${digits.map(digit => `
                              <td align="center" style="padding: 4px;">
                                <div style="width: 44px; height: 56px; background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%); border-radius: 12px; display: inline-block; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);">
                                  <table role="presentation" style="width: 44px; height: 56px;">
                                    <tr>
                                      <td align="center" valign="middle" style="color: #ffffff; font-size: 24px; font-weight: 700; font-family: 'SF Mono', 'Fira Code', monospace, sans-serif;">${digit}</td>
                                    </tr>
                                  </table>
                                </div>
                              </td>
                            `).join('')}
                          </tr>
                        </table>
                      </div>
                      
                      <!-- Timer Badge -->
                      <div style="text-align: center; margin-bottom: 24px;">
                        <span style="display: inline-block; background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%); color: #92400E; font-size: 13px; font-weight: 600; padding: 8px 16px; border-radius: 100px; border: 1px solid #FCD34D;">
                          ⏱️ Expires in 10 minutes
                        </span>
                      </div>
                    </td>
                  </tr>
                  
                  <!-- Tips Section -->
                  <tr>
                    <td style="padding: 0 40px 32px 40px;">
                      <div style="background: linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%); border-radius: 12px; padding: 16px 20px; border-left: 4px solid #10B981;">
                        <p style="margin: 0; color: #065F46; font-size: 13px; line-height: 1.5;">
                          <strong>💡 Pro Tip:</strong> After verification, you can take our AI-powered career assessment to discover your perfect tech career path!
                        </p>
                      </div>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%); padding: 24px 40px; border-top: 1px solid #E2E8F0;">
                      <p style="margin: 0 0 8px 0; color: #64748B; font-size: 12px; text-align: center; line-height: 1.5;">
                        Didn't request this? You can safely ignore this email.
                      </p>
                      <p style="margin: 0; color: #94A3B8; font-size: 11px; text-align: center;">
                        © 2025 PathFinder • Made with ❤️ for CCS Students
                      </p>
                    </td>
                  </tr>
                  
                </table>
                
                <!-- Bottom Links -->
                <table role="presentation" style="max-width: 500px; width: 100%; margin-top: 24px;">
                  <tr>
                    <td align="center">
                      <p style="margin: 0; color: rgba(255, 255, 255, 0.8); font-size: 12px;">
                        <a href="#" style="color: #ffffff; text-decoration: none;">Help</a>
                        &nbsp;•&nbsp;
                        <a href="#" style="color: #ffffff; text-decoration: none;">Privacy</a>
                        &nbsp;•&nbsp;
                        <a href="#" style="color: #ffffff; text-decoration: none;">Terms</a>
                      </p>
                    </td>
                  </tr>
                </table>
                
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
      text: `Your PathFinder verification code is: ${code}\n\nThis code will expire in 10 minutes.\n\nIf you didn't request this, please ignore this email.`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✉️ Verification email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Error sending verification email:', error);
    return false;
  }
};

/**
 * Send welcome email after successful verification
 * @param {string} email - Recipient email address
 * @param {string} name - User's name (optional)
 */
const sendWelcomeEmail = async (email, name = '') => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.SMTP_FROM || `PathFinder <${process.env.SMTP_USER}>`,
      to: email,
      subject: '🎉 Welcome to PathFinder!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f7fa;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td align="center" style="padding: 40px 20px;">
                <table role="presentation" style="max-width: 480px; width: 100%; background: white; border-radius: 16px; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); padding: 32px 40px; border-radius: 16px 16px 0 0; text-align: center;">
                      <h1 style="margin: 0; color: white; font-size: 28px; font-weight: 700;">🎉 Welcome!</h1>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px;">
                      <h2 style="margin: 0 0 16px 0; color: #1F2937; font-size: 22px; font-weight: 600;">
                        ${name ? `Hey ${name}!` : 'Hey there!'}
                      </h2>
                      <p style="margin: 0 0 24px 0; color: #6B7280; font-size: 15px; line-height: 1.6;">
                        Your email has been verified and your PathFinder account is now active! 🚀
                      </p>
                      
                      <p style="margin: 0 0 16px 0; color: #374151; font-size: 15px; font-weight: 500;">
                        Here's what you can do next:
                      </p>
                      
                      <ul style="margin: 0 0 24px 0; padding-left: 20px; color: #6B7280; font-size: 14px; line-height: 1.8;">
                        <li>Take the career assessment</li>
                        <li>Discover personalized career paths</li>
                        <li>Follow your learning roadmap</li>
                        <li>Track your progress</li>
                      </ul>
                      
                      <p style="margin: 0; color: #6B7280; font-size: 15px;">
                        We're excited to help you discover your perfect career path in tech!
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 24px 40px; background: #F9FAFB; border-radius: 0 0 16px 16px; text-align: center;">
                      <p style="margin: 0; color: #9CA3AF; font-size: 12px;">
                        © 2025 PathFinder. Made with ❤️ for CCS students.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('✉️ Welcome email sent to:', email);
    return true;
  } catch (error) {
    console.error('❌ Error sending welcome email:', error);
    return false;
  }
};

module.exports = {
  generateVerificationCode,
  sendVerificationEmail,
  sendWelcomeEmail,
};
