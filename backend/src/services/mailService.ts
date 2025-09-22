import nodemailer from 'nodemailer';
import { logerror } from '../utils/logger';

// Function to send an email using nodemailer
export const sendEmail = async (to: string, subject: string, text: string, html?: string) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: `"Cinephoria <no-reply>" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text,
      html,
    });
    return info;
  } catch (error) {
    logerror('Error sending email:', error);
    throw error;
  }
};
