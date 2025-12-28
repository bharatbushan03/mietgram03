
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.NODEMAILER_USER,
    pass: process.env.NODEMAILER_PASS // Gmail app password
  }
});

export const sendVerificationEmail = async (email, token) => {
  const url = `${process.env.CLIENT_URL}/verify/${token}`;
  
  const mailOptions = {
    from: '"mietGram Admin" <admin@mietjammu.in>',
    to: email,
    subject: 'Welcome to mietGram - Verify your account',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h1 style="color: #4f46e5;">Welcome to mietGram!</h1>
        <p>Your exclusive campus social network at MIET Jammu is ready.</p>
        <p>Please click the button below to verify your student email:</p>
        <a href="${url}" style="background: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a>
        <p>If the button doesn't work, copy and paste this link: ${url}</p>
      </div>
    `
  };

  try {
    // In dev, we might just log the link
    console.log(`Verification Email sent to ${email}: ${url}`);
    if (process.env.NODE_ENV === 'production') {
      await transporter.sendMail(mailOptions);
    }
  } catch (error) {
    console.error('Email error:', error);
  }
};
