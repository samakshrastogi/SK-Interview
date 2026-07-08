import nodemailer from 'nodemailer';
import { logger } from '../config/logger';

export class EmailService {
  private transporterPromise: Promise<nodemailer.Transporter>;

  constructor() {
    this.transporterPromise = this.initTransporter();
  }

  private async initTransporter(): Promise<nodemailer.Transporter> {
    const host = process.env.SMTP_HOST || process.env.EMAIL_HOST || 'smtp.ethereal.email';
    const port = parseInt(process.env.SMTP_PORT || process.env.EMAIL_PORT || '587', 10);
    const user = process.env.SMTP_USER || process.env.EMAIL_USER;
    const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
    const secure = process.env.SMTP_SECURE === 'true' || port === 465;

    // If Ethereal defaults or no user/pass provided, create an ethereal test account on the fly
    if (host === 'smtp.ethereal.email' && (!user || user === 'your_ethereal_user_here')) {
      logger.info('Initializing dynamic Ethereal Mail test account...');
      try {
        const testAccount = await nodemailer.createTestAccount();
        logger.info(`Generated Ethereal Mail User: ${testAccount.user}`);
        return nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });
      } catch (err) {
        logger.error('Failed to create Ethereal Mail test account, using dummy logs transport', err);
        return nodemailer.createTransport({
          jsonTransport: true,
        });
      }
    }

    return nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user: user || '',
        pass: pass || '',
      },
    });
  }

  async sendEmail(to: string, subject: string, html: string): Promise<boolean> {
    try {
      const transporter = await this.transporterPromise;
      const mailOptions = {
        from: process.env.MAIL_FROM || process.env.EMAIL_FROM || '"SK CareerHub AI" <no-reply@skcareerhub.in>',
        to,
        subject,
        html,
      };

      const info = await transporter.sendMail(mailOptions);
      logger.info(`Email sent: ${info.messageId}`);
      
      // If using Ethereal mail, log preview URL
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        logger.info(`✉️ Test Email Preview URL: ${previewUrl}`);
        console.log(`\n-----------------------------------------`);
        console.log(`✉️ EMAIL SENT TO: ${to}`);
        console.log(`SUBJECT: ${subject}`);
        console.log(`PREVIEW LINK: ${previewUrl}`);
        console.log(`-----------------------------------------\n`);
      }
      return true;
    } catch (error) {
      logger.error('Error sending email', error);
      return false;
    }
  }

  async sendOTPEmail(to: string, otp: string, type: 'verify-email' | 'reset-password'): Promise<boolean> {
    const isVerification = type === 'verify-email';
    const subject = isVerification ? 'Verify your SK CareerHub AI Account' : 'Reset your SK CareerHub AI Password';
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 8px;">
        <h2 style="color: #0ea5e9; text-align: center;">SK CareerHub AI</h2>
        <p>Hello,</p>
        <p>You requested a verification code for your account. Please use the OTP below to complete the action:</p>
        <div style="background-color: #f0f9ff; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #0284c7;">${otp}</span>
        </div>
        <p style="color: #64748b; font-size: 14px;">This code is valid for 10 minutes. If you did not make this request, please ignore this email.</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="color: #94a3b8; font-size: 12px; text-align: center;">SK CareerHub AI - India's AI-Powered Government Career Platform</p>
      </div>
    `;

    return this.sendEmail(to, subject, html);
  }
}
export const emailService = new EmailService();
