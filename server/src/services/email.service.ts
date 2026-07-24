import nodemailer from 'nodemailer';
import { config } from '../config/index.js';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    // Only initialize if SMTP credentials are provided
    if (config.SMTP_USER && config.SMTP_PASS) {
      this.transporter = nodemailer.createTransport({
        host: config.SMTP_HOST,
        port: config.SMTP_PORT,
        secure: false, // true for 465, false for other ports
        auth: {
          user: config.SMTP_USER,
          pass: config.SMTP_PASS,
        },
      });

      // Verify connection
      this.transporter.verify((error: any, success: any) => {
        if (error) {
          console.error('[Email Service] SMTP connection failed:', error);
        } else {
          console.log('[Email Service] SMTP connection established successfully');
        }
      });
    } else {
      console.warn('[Email Service] SMTP credentials not provided. Email sending disabled.');
    }
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.transporter) {
      console.warn('[Email Service] Email transporter not initialized. Skipping email send.');
      return false;
    }

    try {
      const mailOptions = {
        from: config.SMTP_FROM || config.SMTP_USER,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('[Email Service] Email sent successfully:', info.messageId);
      return true;
    } catch (error) {
      console.error('[Email Service] Failed to send email:', error);
      return false;
    }
  }

  async sendOtpEmail(email: string, otp: string, purpose: 'verification' | 'password_reset'): Promise<boolean> {
    const subject = purpose === 'verification' 
      ? 'AgriBridge - Email Verification OTP' 
      : 'AgriBridge - Password Reset OTP';

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #0d9488 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">AgriBridge AI</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Connecting Mandi Scales to Global Workflows</p>
        </div>
        <div style="padding: 30px; background: #f9fafb;">
          <h2 style="color: #1f2937; margin-top: 0;">Your One-Time Password (OTP)</h2>
          <p style="color: #4b5563; line-height: 1.6;">
            ${purpose === 'verification' 
              ? 'Thank you for registering with AgriBridge. Please use the following OTP to verify your email address:' 
              : 'We received a request to reset your password. Please use the following OTP to proceed:'}
          </p>
          <div style="background: white; border: 2px dashed #10b981; border-radius: 8px; padding: 20px; text-align: center; margin: 25px 0;">
            <span style="font-size: 36px; font-weight: bold; color: #10b981; letter-spacing: 5px;">${otp}</span>
          </div>
          <p style="color: #6b7280; font-size: 14px;">
            <strong>Important:</strong> This OTP will expire in 10 minutes. For your security, please do not share this code with anyone.
          </p>
          <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
            If you did not request this OTP, please ignore this email.
          </p>
        </div>
        <div style="background: #1f2937; padding: 20px; text-align: center;">
          <p style="color: #9ca3af; margin: 0; font-size: 12px;">
            © 2024 AgriBridge AI. All rights reserved.
          </p>
        </div>
      </div>
    `;

    const text = `
      AgriBridge AI - ${subject}
      
      Your One-Time Password (OTP): ${otp}
      
      This OTP will expire in 10 minutes. For your security, please do not share this code with anyone.
      
      If you did not request this OTP, please ignore this email.
      
      © 2024 AgriBridge AI. All rights reserved.
    `;

    return this.sendEmail({
      to: email,
      subject,
      html,
      text,
    });
  }
}

export const emailService = new EmailService();
