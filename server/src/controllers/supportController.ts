import { Request, Response } from 'express';
import nodemailer from 'nodemailer';
import appInsights from '../utils/appInsights';

let transporter: nodemailer.Transporter | null = null;
const getEmailTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }
  return transporter;
};

export const submitTicket = async (req: Request, res: Response) => {
  const { email, query } = req.body;

  if (!email || !query) {
    return res.status(400).json({ message: 'Email and query are required.' });
  }

  const transporter = getEmailTransporter();

  const mailOptions = {
    from: email,
    to: process.env.EMAIL_TO,
    subject: `Support Ticket from ${email}`,
    text: query,
    html: `<p><strong>Email:</strong> ${email}</p><p><strong>Query:</strong> ${query}</p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res
      .status(200)
      .json({ success: true, message: 'Support ticket sent successfully!' });
  } catch (error) {
    appInsights.trackException({ exception: error });
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Failed to send support ticket.' });
  }
};
