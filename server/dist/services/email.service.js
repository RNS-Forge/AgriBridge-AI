import nodemailer from 'nodemailer';
import { config } from '../config/index.js';
export class EmailService {
    transporter = null;
    constructor() {
        this.initializeTransporter();
    }
    initializeTransporter() {
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
            this.transporter.verify((error, success) => {
                if (error) {
                    console.error('[Email Service] SMTP connection failed:', error);
                }
                else {
                    console.log('[Email Service] SMTP connection established successfully');
                }
            });
        }
        else {
            console.warn('[Email Service] SMTP credentials not provided. Email sending disabled.');
        }
    }
    async sendEmail(options) {
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
        }
        catch (error) {
            console.error('[Email Service] Failed to send email:', error);
            return false;
        }
    }
    async sendOtpEmail(email, otp, purpose) {
        const subject = purpose === 'verification'
            ? 'AgriBridge - Email Verification OTP'
            : 'AgriBridge - Password Reset OTP';
        const html = buildOtpEmailHtml({ otp, purpose });
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
function buildOtpEmailHtml({ otp, purpose }) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>AgriBridge AI - OTP Verification</title>
</head>
<body style="margin:0; padding:0; background-color:#eef2f1; font-family: Arial, Helvetica, sans-serif;">
  <!-- Outer wrapper -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#eef2f1; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px; width:100%; background-color:#ffffff; border-radius:6px; overflow:hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(16,24,40,0.05);">

          <!-- Hero banner -->
          <tr>
            <td style="position:relative; padding:0;">
              <div style="background: linear-gradient(135deg, #065f46 0%, #0d9488 100%); padding: 36px 32px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td>
                      <table role="presentation" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="background:#ffffff; border-radius:4px; width:36px; height:36px; text-align:center; vertical-align:middle;">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block; vertical-align:middle;">
                              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                              <path d="M9 12l2 2 4-4"/>
                            </svg>
                          </td>
                          <td style="padding-left:12px;">
                            <span style="color:#ffffff; font-size:22px; font-weight:700; letter-spacing:0.3px; font-family: Arial, Helvetica, sans-serif;">AgriBridge AI</span>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-top:14px;">
                      <span style="color:rgba(255,255,255,0.92); font-size:13px; letter-spacing:0.2px;">Connecting Mandi Scales to Global Agricultural Workflows</span>
                    </td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 36px 40px 8px 40px;">
              <h2 style="color:#111827; margin:0 0 12px 0; font-size:20px; font-family: Arial, Helvetica, sans-serif;">Your One-Time Password</h2>
              <p style="color:#4b5563; font-size:15px; line-height:1.6; margin:0;">
                ${purpose === 'verification' ? 'Thank you for registering with AgriBridge. Please use the following OTP to verify your email address:' : 'We received a request to reset your password. Please use the following OTP to proceed:'}
              </p>
            </td>
          </tr>

          <!-- OTP box -->
          <tr>
            <td style="padding: 20px 40px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="background:#f0fdf9; border:2px dashed #10b981; border-radius:4px; padding:24px;">
                    <span style="font-size:34px; font-weight:700; color:#0d9488; letter-spacing:8px; font-family: 'Courier New', monospace;">${otp}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Notice -->
          <tr>
            <td style="padding: 4px 40px 8px 40px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fff7ed; border-radius:4px; border: 1px solid #fed7aa;">
                <tr>
                  <td style="padding:14px 16px; color:#92400e; font-size:13px; line-height:1.6;">
                    <strong>Expires in 10 minutes.</strong> For your security, never share this code with anyone — AgriBridge staff will never ask for it.
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding: 16px 40px 36px 40px;">
              <p style="color:#6b7280; font-size:13px; line-height:1.6; margin:0;">
                If you didn't request this code, you can safely ignore this email — no changes will be made to your account.
              </p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding: 0 40px;">
              <div style="border-top:1px solid #e5e7eb;"></div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px 32px 40px;" align="center">
              <p style="color:#64748b; font-size:12px; margin:0 0 6px 0; font-weight:500;">
                Farm Management &nbsp;·&nbsp; Mandi Benchmarking &nbsp;·&nbsp; Logistics Tracking &nbsp;·&nbsp; Global Trade
              </p>
              <p style="color:#9ca3af; font-size:12px; margin:0;">
                © 2026 AgriBridge AI. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}
export const emailService = new EmailService();
