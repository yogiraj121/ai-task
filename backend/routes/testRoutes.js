const express = require('express');
const router = express.Router();
const { sendEmail, emailTemplates } = require('../utils/emailService');

/**
 * @route   GET /api/test/email
 * @desc    Test email sending
 * @access  Public
 */
router.get('/email', async (req, res) => {
  try {
    const testEmail = 'recipient@example.com'; // Replace with your test email
    
    await sendEmail(
      testEmail,
      'HRMS Test Email',
      emailTemplates.LEAVE_APPROVAL,
      {
        name: 'Test User',
        leaveType: 'Annual Leave',
        startDate: new Date().toDateString(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toDateString(),
        duration: 5,
        dashboardUrl: 'http://localhost:3000/dashboard/leaves',
        notes: 'This is a test email from HRMS.'
      }
    );

    res.json({
      success: true,
      message: 'Test email sent successfully!',
      email: testEmail
    });
  } catch (error) {
    console.error('Email test failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send test email',
      error: error.message
    });
  }
});

module.exports = router;
