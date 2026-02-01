const transporter = require('../config/email');

const sendEmailNotification = async (to, subject, text) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER || 'placement@egsbridge.edu',
      to,
      subject,
      text
    };

    await transporter.sendMail(mailOptions);
    console.log(`📧 Email sent to ${to}`);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

const sendBulkEmails = async (recipients, subject, text) => {
  const results = [];
  
  for (const recipient of recipients) {
    try {
      await sendEmailNotification(recipient.email, subject, text);
      results.push({ email: recipient.email, status: 'success' });
    } catch (error) {
      results.push({ email: recipient.email, status: 'failed', error: error.message });
    }
  }
  
  return results;
};

module.exports = {
  sendEmailNotification,
  sendBulkEmails
};