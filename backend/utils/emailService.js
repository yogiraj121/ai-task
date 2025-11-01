const nodemailer = require('nodemailer');
const ejs = require('ejs');
const path = require('path');
const fs = require('fs').promises;
const config = require('../config/config');

// Email templates directory
const TEMPLATES_DIR = path.join(__dirname, '../templates/emails');

// Email templates with default data
const emailTemplates = {
  LEAVE_APPROVAL: 'leave-approval',
  PASSWORD_RESET: 'password-reset',
  ACCOUNT_ACTIVATION: 'account-activation',
  PASSWORD_CHANGED: 'password-changed',
  LEAVE_REJECTED: 'leave-rejected',
  LEAVE_REQUEST: 'leave-request',
  WELCOME: 'welcome',
};

// Create reusable transporter object using the default SMTP transport
const createTransporter = () => {
  return nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    secure: config.email.port === 465, // true for 465, false for other ports
    auth: {
      user: config.email.user,
      pass: config.email.pass
    },
    tls: {
      // Do not fail on invalid certs
      rejectUnauthorized: process.env.NODE_ENV === 'production'
    },
    // Debugging and logging
    logger: process.env.NODE_ENV === 'development',
    debug: process.env.NODE_ENV === 'development'
  });
};

// Global transporter instance
let transporter;

// Verify SMTP connection
const verifySMTP = async () => {
  try {
    if (!transporter) {
      transporter = createTransporter();
    }
    
    await transporter.verify();
    console.log('✅ SMTP server connection verified');
    return true;
  } catch (error) {
    console.error('❌ SMTP connection error:', error);
    throw new Error(`SMTP connection failed: ${error.message}`);
  }
};

// Test email service
const testEmailService = async () => {
  try {
    await verifySMTP();
    
    const testEmail = process.env.TEST_EMAIL || 'test@example.com';
    
    console.log('🧪 Testing email service...');
    
    const result = await sendEmail(
      testEmail,
      '✅ HRMS Email Service Test',
      emailTemplates.WELCOME,
      {
        name: 'Test User',
        email: testEmail,
        loginUrl: 'http://localhost:3000/login',
        supportEmail: 'support@hrms.com',
        year: new Date().getFullYear()
      }
    );
    
    console.log('📧 Test email sent successfully!', result);
    return result;
  } catch (error) {
    console.error('❌ Email test failed:', error);
    throw error;
  }
};

/**
 * Send an email using EJS templates
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} template - Template name (without extension)
 * @param {Object} data - Data to pass to the template
 * @returns {Promise<Object>} - Result of the sendMail operation
 */
const sendEmail = async (to, subject, template, data = {}) => {
  try {
    if (!transporter) {
      transporter = createTransporter();
    }

    // Ensure template exists
    const templatePath = path.join(TEMPLATES_DIR, `${template}.ejs`);
    try {
      await fs.access(templatePath);
    } catch (error) {
      throw new Error(`Email template not found: ${template}.ejs`);
    }

    // Read and render the template
    const templateContent = await fs.readFile(templatePath, 'utf-8');
    const html = ejs.render(templateContent, { 
      ...data,
      // Default variables available in all templates
      appName: 'HRMS',
      supportEmail: process.env.EMAIL_SUPPORT || 'support@hrms.com',
      year: new Date().getFullYear(),
      currentDate: new Date().toLocaleDateString(),
      // Add more default variables as needed
    });

    // Email options
    const mailOptions = {
      from: config.email.from,
      to: Array.isArray(to) ? to : [to],
      subject: subject,
      html: html,
      // Generate text version from HTML for better deliverability
      text: html.replace(/<[^>]*>?/gm, '').replace(/\s+/g, ' ').trim(),
      // Add headers for tracking (if using an ESP like SendGrid, Mailgun, etc.)
      headers: {
        'X-Mailer': 'HRMS Email Service',
        'X-Auto-Response-Suppress': 'OOF, AutoReply',
        'Precedence': 'bulk'
      },
      // Add priority
      priority: 'high',
      // Add message ID for tracking
      messageId: `<${Date.now()}@${config.email.from.split('@')[1] || 'hrms.com'}>`
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    
    // Log success
    console.log(`📧 Email sent to ${to}: ${info.messageId}`);
    
    return { 
      success: true, 
      messageId: info.messageId,
      previewUrl: nodemailer.getTestMessageUrl(info) // For testing with ethereal.email
    };
    
  } catch (error) {
    console.error('❌ Error sending email:', error);
    // Don't expose sensitive error details in production
    const errorMessage = process.env.NODE_ENV === 'production'
      ? 'Failed to send email. Please try again later.'
      : error.message;
      
    throw new Error(errorMessage);
  }
};

module.exports = {
  sendEmail,
  emailTemplates
};
