const { Resend } = require('resend');

class EmailService {
  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY || 'your-resend-api-key');
  }

  async sendOTP(email, otp, role) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@neuropath.com',
        to: email,
        subject: 'NeuroPath - Email Verification Code',
        html: this.generateOTPEmailTemplate(otp, role)
      };

      const result = await this.resend.emails.send(mailOptions);
      console.log('OTP email sent successfully:', result.id);
      return { success: true, messageId: result.id };
    } catch (error) {
      console.error('Error sending OTP email:', error);
      return { success: false, error: error.message };
    }
  }

  generateOTPEmailTemplate(otp, role) {
    const roleText = role === 'patient' ? 'Patient' : 
                    role === 'neurologist' ? 'Neurologist' : 'Admin';
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>NeuroPath - Email Verification</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .otp-code { background: #fff; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
          .otp-number { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🧠 NeuroPath</h1>
            <p>Email Verification Code</p>
          </div>
          <div class="content">
            <h2>Hello!</h2>
            <p>You're attempting to log in to your <strong>${roleText}</strong> account on NeuroPath. Please use the verification code below to complete your login:</p>
            
            <div class="otp-code">
              <div class="otp-number">${otp}</div>
            </div>
            
            <div class="warning">
              <strong>⚠️ Important:</strong>
              <ul>
                <li>This code will expire in <strong>10 minutes</strong></li>
                <li>Do not share this code with anyone</li>
                <li>If you didn't request this code, please ignore this email</li>
              </ul>
            </div>
            
            <p>If you're having trouble logging in, please contact our support team.</p>
            
            <div class="footer">
              <p>Best regards,<br>The NeuroPath Team</p>
              <p>This is an automated message. Please do not reply to this email.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  async testConnection() {
    try {
      // Resend doesn't have a direct verify method, so we check if API key is set
      if (!process.env.RESEND_API_KEY) {
        throw new Error('RESEND_API_KEY not set');
      }
      console.log('Email service API key verified');
      return true;
    } catch (error) {
      console.error('Email service connection failed:', error);
      return false;
    }
  }
}

module.exports = new EmailService();
