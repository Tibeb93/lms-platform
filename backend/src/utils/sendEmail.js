const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_PORT == 465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const sendEmail = async ({ to, subject, html, text }) => {
  const transporter = createTransporter();
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
    text,
  };
  await transporter.sendMail(mailOptions);
};

// Email templates
exports.sendVerificationEmail = async (user, token) => {
  const verifyUrl = `${process.env.CLIENT_URL}/verify-email/${token}`;
  await sendEmail({
    to: user.email,
    subject: 'Verify Your Email - LMS Platform',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to LMS Platform!</h1>
        </div>
        <div style="background: #f9f9f9; padding: 40px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333;">Hi ${user.name},</h2>
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            Thank you for registering! Please verify your email address to get started.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verifyUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold;">
              Verify Email Address
            </a>
          </div>
          <p style="color: #999; font-size: 14px;">This link expires in 24 hours.</p>
          <p style="color: #999; font-size: 12px;">If you didn't create an account, please ignore this email.</p>
        </div>
      </div>
    `,
  });
};

exports.sendPasswordResetEmail = async (user, token) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;
  await sendEmail({
    to: user.email,
    subject: 'Password Reset Request - LMS Platform',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 40px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">Reset Your Password</h1>
        </div>
        <div style="background: #f9f9f9; padding: 40px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333;">Hi ${user.name},</h2>
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            You requested a password reset. Click the button below to set a new password.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold;">
              Reset Password
            </a>
          </div>
          <p style="color: #999; font-size: 14px;">This link expires in 1 hour.</p>
          <p style="color: #999; font-size: 12px;">If you didn't request this, please ignore this email and your password will remain unchanged.</p>
        </div>
      </div>
    `,
  });
};

exports.sendEnrollmentEmail = async (user, course) => {
  await sendEmail({
    to: user.email,
    subject: `You're enrolled in ${course.title}!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 40px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">Enrollment Confirmed!</h1>
        </div>
        <div style="background: #f9f9f9; padding: 40px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333;">Hi ${user.name},</h2>
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            You've successfully enrolled in <strong>${course.title}</strong>. Start learning today!
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.CLIENT_URL}/learn/${course.slug}" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold;">
              Start Learning
            </a>
          </div>
        </div>
      </div>
    `,
  });
};

exports.sendCertificateEmail = async (user, course, certificate) => {
  await sendEmail({
    to: user.email,
    subject: `Congratulations! You've completed ${course.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #f6d365 0%, #fda085 100%); padding: 40px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">🎉 Course Completed!</h1>
        </div>
        <div style="background: #f9f9f9; padding: 40px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333;">Congratulations, ${user.name}!</h2>
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            You've successfully completed <strong>${course.title}</strong>. Your certificate is ready!
          </p>
          <p style="color: #666;">Certificate ID: <strong>${certificate.verificationId}</strong></p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.CLIENT_URL}/certificates/${certificate._id}" style="background: linear-gradient(135deg, #f6d365 0%, #fda085 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold;">
              View Certificate
            </a>
          </div>
        </div>
      </div>
    `,
  });
};
