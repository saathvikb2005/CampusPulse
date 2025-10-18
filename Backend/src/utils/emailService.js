const nodemailer = require('nodemailer');

// Create reusable transporter object using SMTP transport
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// Send email verification
const sendVerificationEmail = async (email, token, firstName) => {
  try {
    const transporter = createTransporter();
    const verifyUrl = `${process.env.CLIENT_URL}/verify-email/${token}`;

    const mailOptions = {
      from: `"CampusPulse" <${process.env.FROM_EMAIL}>`,
      to: email,
      subject: 'Verify Your CampusPulse Account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #667eea;">Welcome to CampusPulse, ${firstName}!</h2>
          <p>Thank you for joining our campus community. Please verify your email address to activate your account.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verifyUrl}" style="background-color: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Verify Email Address
            </a>
          </div>
          <p>If you didn't create this account, please ignore this email.</p>
          <p>This link will expire in 24 hours.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">
            CampusPulse Team<br>
            Your Campus Community Platform
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Error sending verification email:', error);
    return { success: false, error: error.message };
  }
};

// Send password reset email
const sendPasswordResetEmail = async (email, token, firstName) => {
  try {
    const transporter = createTransporter();
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;

    const mailOptions = {
      from: `"CampusPulse" <${process.env.FROM_EMAIL}>`,
      to: email,
      subject: 'Reset Your CampusPulse Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #667eea;">Password Reset Request</h2>
          <p>Hi ${firstName},</p>
          <p>We received a request to reset your CampusPulse account password.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #f56565; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p>If you didn't request this password reset, please ignore this email.</p>
          <p>This link will expire in 1 hour for security reasons.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">
            CampusPulse Team<br>
            Your Campus Community Platform
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return { success: false, error: error.message };
  }
};

// Send event notification email
const sendEventNotificationEmail = async (email, eventData, notificationType) => {
  try {
    const transporter = createTransporter();
    let subject, content;

    switch (notificationType) {
      case 'registration_confirmation':
        subject = `Registration Confirmed: ${eventData.title}`;
        content = `
          <h2 style="color: #667eea;">Registration Confirmed!</h2>
          <p>You have successfully registered for <strong>${eventData.title}</strong>.</p>
          <p><strong>Date:</strong> ${new Date(eventData.date).toLocaleDateString()}</p>
          <p><strong>Location:</strong> ${eventData.location}</p>
          <p>We'll send you a reminder closer to the event date.</p>
        `;
        break;
      case 'event_reminder':
        subject = `Reminder: ${eventData.title} is tomorrow`;
        content = `
          <h2 style="color: #667eea;">Event Reminder</h2>
          <p>Don't forget about <strong>${eventData.title}</strong> tomorrow!</p>
          <p><strong>Date:</strong> ${new Date(eventData.date).toLocaleDateString()}</p>
          <p><strong>Time:</strong> ${eventData.startTime}</p>
          <p><strong>Location:</strong> ${eventData.location}</p>
        `;
        break;
      case 'event_update':
        subject = `Update: ${eventData.title}`;
        content = `
          <h2 style="color: #f56565;">Event Update</h2>
          <p>There has been an update to <strong>${eventData.title}</strong>.</p>
          <p>Please check the event details for the latest information.</p>
        `;
        break;
    }

    const mailOptions = {
      from: `"CampusPulse Events" <${process.env.FROM_EMAIL}>`,
      to: email,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          ${content}
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">
            CampusPulse Events Team<br>
            Your Campus Community Platform
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Error sending event notification email:', error);
    return { success: false, error: error.message };
  }
};

// Send bulk notification email
const sendBulkNotificationEmail = async (emails, subject, message) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"CampusPulse Notifications" <${process.env.FROM_EMAIL}>`,
      bcc: emails, // Use BCC for privacy
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #667eea;">Campus Notification</h2>
          <div style="background-color: #f7fafc; padding: 20px; border-radius: 5px; margin: 20px 0;">
            ${message}
          </div>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">
            CampusPulse Notifications<br>
            Your Campus Community Platform
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Error sending bulk notification email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendEventNotificationEmail,
  sendBulkNotificationEmail
};