/**
 * Mail Service
 * Handles email sending functionality using Resend as the provider
 * Implements SOLID principles with dependency injection
 */

// We'll need to install these packages: npm install resend ejs
// import { Resend } from 'resend';
import * as fs from 'fs';
import path from "path";
import ejs from "ejs";
import { Resend } from "resend";


/**
 * Mail Service Interface
 */
export interface IMailService {
  sendVerificationEmail(
    to: string,
    fullName: string,
    mode: 'otp' | 'link',
    verificationData: { token?: string; otp?: string; expiresAt: Date }
  ): Promise<boolean>;
  sendWelcomeEmail(to: string, fullName: string): Promise<boolean>;
  sendResetPasswordEmail(
    to: string,
    fullName: string,
    verificationData: { token?: string; expiresAt: Date }
  ): Promise<boolean>;
  // Loan lifecycle emails
  sendLoanAppliedEmail(to: string, fullName: string, loanNumber: string, amount: number): Promise<boolean>;
  sendLoanApprovedEmail(to: string, fullName: string, loanNumber: string, amount: number): Promise<boolean>;
  sendLoanRejectedEmail(to: string, fullName: string, loanNumber: string, reason?: string): Promise<boolean>;
  sendLoanDisbursedEmail(to: string, fullName: string, loanNumber: string, amount: number, schoolName: string): Promise<boolean>;
  sendLoanCompletedEmail(to: string, fullName: string, loanNumber: string): Promise<boolean>;
  sendWalletFundedEmail(to: string, fullName: string, amount: number): Promise<boolean>;
  sendRepaymentReminderEmail(to: string, fullName: string, amount: number, dueDate: string, loanNumber: string): Promise<boolean>;
  sendOverduePaymentEmail(to: string, fullName: string, amount: number, daysOverdue: number, loanNumber: string): Promise<boolean>;
  sendDocumentRequestEmail(to: string, fullName: string, documentType: string, instructions: string): Promise<boolean>;
}

/**
 * Mail Service Implementation
 */
export class MailService implements IMailService {
  private resend: Resend;
  private fromEmail: string;
  private appName: string;
  private appUrl: string;

  constructor() {
    try {
      // Initialize Resend with API key
      const resendApiKey = process.env.RESEND_API_KEY;
      if (!resendApiKey) {
        console.warn('RESEND_API_KEY is not set. Email functionality may not work properly.');
      }
      this.resend = new Resend(resendApiKey || '');

      // Set other configuration values with fallbacks
      this.fromEmail = process.env.FROM_EMAIL || 'noreply@paymyfees.co';
      this.appName = process.env.APP_NAME || 'PayMyFees';
      this.appUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || 'http://localhost:3000';
    } catch (error) {
      console.error('Error initializing MailService:', error);
      // Initialize with defaults to prevent undefined errors
      this.resend = new Resend('');
      this.fromEmail = 'noreply@paymyfees.co';
      this.appName = 'PayMyFees';
      this.appUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || 'http://localhost:3000';
    }
  }

  /**
   * Send verification email based on mode (OTP or link)
   */
  async sendVerificationEmail(
    to: string,
    fullName: string,
    mode: 'otp' | 'link',
    verificationData: { token?: string; otp?: string; expiresAt: Date }
  ): Promise<boolean> {
    try {
      // Validate inputs
      if (!to || typeof to !== 'string') {
        console.error('Invalid email address for verification email');
        return false;
      }

      if (!fullName || typeof fullName !== 'string') {
        console.error('Invalid fullName for verification email');
        fullName = 'User'; // Fallback to generic name
      }

      if (mode !== 'otp' && mode !== 'link') {
        console.error(`Invalid verification mode: ${mode}`);
        return false;
      }

      if (!verificationData || !verificationData.expiresAt) {
        console.error('Invalid verification data');
        return false;
      }

      const templateName = mode === 'otp' ? 'verification-otp' : 'verification-link';
      const subject = `${this.appName} - Verify Your Email`;

      console.log(`Template name is ${templateName} using ${mode} mode`);
      
      // Prepare template data
      const templateData: Record<string, any> = {
        fullName,
        appName: this.appName,
        appUrl: this.appUrl,
        ...verificationData
      };

      if (mode === 'link' && !verificationData.token) {
        throw new Error('Token is required for link verification mode');
      }

      if (mode === 'otp' && !verificationData.otp) {
        throw new Error('OTP is required for OTP verification mode');
      }

      // Add verification URL for link mode
      if (mode === 'link') {
        templateData['verificationUrl'] = `${this.appUrl}/auth/verify/link?token=${verificationData.token}`;
      }

      // Render email template
      const html = await this.renderTemplate(templateName, templateData);

      // Send email (with retry on transient network errors)
      const result = await this.sendWithRetry({
        from: `${this.appName} <${this.fromEmail}>`,
        to: [to],
        subject,
        html,
      });
      
      // Check if result exists and has an error
      if (!result || result.error) {
        const errorMsg = result?.error || 'Unknown error occurred';
        console.error(`Failed to send verification email to ${to} using ${mode} mode:`, errorMsg);
        return false;
      }

      console.log(`Verification email sent successfully to ${to} using ${mode} mode`);
      return true;
    } catch (error) {
      console.error(`Error sending verification email to ${to} using ${mode} mode: ${error}`);
      return false;
    }
  }

  /**
   * Send welcome email after successful verification
   */
  async sendWelcomeEmail(to: string, fullName: string): Promise<boolean> {
    try {
      // Validate inputs
      if (!to || typeof to !== 'string') {
        console.error('Invalid email address for welcome email');
        return false;
      }

      if (!fullName || typeof fullName !== 'string') {
        console.error('Invalid fullName for welcome email');
        fullName = 'User'; // Fallback to generic name
      }

      const subject = `Welcome to ${this.appName}!`;
      
      // Prepare template data
      const templateData = {
        fullName,
        appName: this.appName,
        appUrl: this.appUrl,
        loginUrl: `${this.appUrl}/auth/login`
      };

      // Render email template
      const html = await this.renderTemplate('welcome', templateData);

      // Send email (with retry on transient network errors)
      const result = await this.sendWithRetry({
        from: `${this.appName} <${this.fromEmail}>`,
        to: [to],
        subject,
        html,
      });

      // Check if result exists and has an error
      if (!result || result.error) {
        const errorMsg = result?.error || 'Unknown error occurred';
        console.error(`Failed to send welcome email to ${to}:`, errorMsg);
        return false;
      }

      console.log(`Welcome email sent successfully to ${to}`);
      return true;
    } catch (error) {
      console.error(`Error sending welcome email to ${to}:`, error);
      return false;
    }
  }

   /**
   * Send verification email based on mode (OTP or link)
   */
  async sendResetPasswordEmail(
    to: string,
    fullName: string,
    verificationData: { token?: string; expiresAt: Date }
  ): Promise<boolean> {
    try {
      // Validate inputs
      if (!to || typeof to !== 'string') {
        console.error('Invalid email address for verification email');
        return false;
      }

      if (!fullName || typeof fullName !== 'string') {
        console.error('Invalid fullName for verification email');
        fullName = 'User'; // Fallback to generic name
      }


      if (!verificationData || !verificationData.expiresAt) {
        console.error('Invalid verification data');
        return false;
      }

      const templateName = 'reset-password';
      const subject = `${this.appName} - Reset Your Password`;

      console.log(`Template name is ${templateName} `);
      
      // Prepare template data
      const templateData: Record<string, any> = {
        fullName,
        appName: this.appName,
        appUrl: this.appUrl,
        ...verificationData
      };

      if (!verificationData.token) {
        throw new Error('Token is required for link verification mode');
      }

      
      templateData['verificationUrl'] = `${this.appUrl}/auth/reset?token=${verificationData.token}`;

      // Render email template
      const html = await this.renderTemplate(templateName, templateData);

      // Send email (with retry on transient network errors)
      const result = await this.sendWithRetry({
        from: `${this.appName} <${this.fromEmail}>`,
        to: [to],
        subject,
        html,
      });
      
      // Check if result exists and has an error
      if (!result || result.error) {
        const errorMsg = result?.error || 'Unknown error occurred';
        console.error(`Failed to send verification email to ${to}:`, errorMsg);
        return false;
      }

      console.log(`Verification email sent successfully to ${to}`);
      return true;
    } catch (error) {
      console.error(`Error sending verification email to ${to} : ${error}`);
      return false;
    }
  }

  // ─── Loan lifecycle emails ─────────────────────────────────────────────────

  private async sendSimple(to: string, subject: string, templateName: string, data: Record<string, any>): Promise<boolean> {
    try {
      const html = await this.renderTemplate(templateName, { appName: this.appName, appUrl: this.appUrl, ...data });
      const result = await this.sendWithRetry({ from: `${this.appName} <${this.fromEmail}>`, to: [to], subject, html });
      return !result?.error;
    } catch (err) {
      console.error(`[MailService] ${templateName} error`, err);
      return false;
    }
  }

  async sendLoanAppliedEmail(to: string, fullName: string, loanNumber: string, amount: number): Promise<boolean> {
    return this.sendSimple(to, `${this.appName} — Loan Application Received`, 'loan-applied', {
      fullName, loanNumber,
      amount: `₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`,
      dashboardUrl: `${this.appUrl}/dashboard`,
    });
  }

  async sendLoanApprovedEmail(to: string, fullName: string, loanNumber: string, amount: number): Promise<boolean> {
    return this.sendSimple(to, `${this.appName} — Your Loan Has Been Approved 🎉`, 'loan-approved', {
      fullName, loanNumber,
      amount: `₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`,
      dashboardUrl: `${this.appUrl}/dashboard`,
    });
  }

  async sendLoanRejectedEmail(to: string, fullName: string, loanNumber: string, reason?: string): Promise<boolean> {
    return this.sendSimple(to, `${this.appName} — Loan Application Update`, 'loan-rejected', {
      fullName, loanNumber,
      reason: reason || 'Please contact support for more information.',
      dashboardUrl: `${this.appUrl}/dashboard`,
    });
  }

  async sendLoanDisbursedEmail(to: string, fullName: string, loanNumber: string, amount: number, schoolName: string): Promise<boolean> {
    return this.sendSimple(to, `${this.appName} — Your Funds Have Been Disbursed`, 'loan-disbursed', {
      fullName, loanNumber, schoolName,
      amount: `₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`,
      dashboardUrl: `${this.appUrl}/dashboard`,
    });
  }

  async sendLoanCompletedEmail(to: string, fullName: string, loanNumber: string): Promise<boolean> {
    return this.sendSimple(to, `${this.appName} — Loan Fully Repaid 🎊`, 'loan-completed', {
      fullName, loanNumber,
      dashboardUrl: `${this.appUrl}/dashboard`,
    });
  }

  async sendWalletFundedEmail(to: string, fullName: string, amount: number): Promise<boolean> {
    return this.sendSimple(to, `${this.appName} — Wallet Funded Successfully`, 'funding-approved', {
      fullName,
      amount: `₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`,
      dashboardUrl: `${this.appUrl}/dashboard/wallet`,
    });
  }

  async sendRepaymentReminderEmail(to: string, fullName: string, amount: number, dueDate: string, loanNumber: string): Promise<boolean> {
    return this.sendSimple(to, `${this.appName} — Upcoming Repayment Reminder`, 'repayment-reminder', {
      fullName, loanNumber, dueDate,
      amount: `₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`,
      dashboardUrl: `${this.appUrl}/dashboard/wallet`,
    });
  }

  async sendOverduePaymentEmail(to: string, fullName: string, amount: number, daysOverdue: number, loanNumber: string): Promise<boolean> {
    try {
      const html = `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
          <h2 style="color:#DC2626">Overdue Payment Notice</h2>
          <p>Hi ${fullName},</p>
          <p>Your repayment for loan <strong>${loanNumber}</strong> is <strong>${daysOverdue} day${daysOverdue !== 1 ? 's' : ''} overdue</strong>.</p>
          <table style="width:100%;border-collapse:collapse;margin:16px 0">
            <tr style="background:#FEF2F2">
              <td style="padding:12px;border:1px solid #FECACA;font-weight:bold;color:#DC2626">Amount Due</td>
              <td style="padding:12px;border:1px solid #FECACA;font-weight:bold;color:#DC2626">₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</td>
            </tr>
            <tr>
              <td style="padding:12px;border:1px solid #e5e7eb">Days Overdue</td>
              <td style="padding:12px;border:1px solid #e5e7eb">${daysOverdue} day${daysOverdue !== 1 ? 's' : ''}</td>
            </tr>
            <tr>
              <td style="padding:12px;border:1px solid #e5e7eb">Loan Reference</td>
              <td style="padding:12px;border:1px solid #e5e7eb">${loanNumber}</td>
            </tr>
          </table>
          <p style="color:#DC2626;font-size:14px">⚠️ Late payment charges may apply. Please make payment immediately to avoid further penalties.</p>
          <a href="${this.appUrl}/dashboard/wallet" style="display:inline-block;background:#DC2626;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;margin-top:12px;font-weight:bold">Pay Now</a>
          <p style="margin-top:24px;color:#888;font-size:12px">If you believe this is an error, please contact our support team immediately.</p>
          <p style="color:#888;font-size:12px">— The ${this.appName} Team</p>
        </div>`;
      const result = await this.sendWithRetry({
        from: `${this.appName} <${this.fromEmail}>`,
        to: [to],
        subject: `${this.appName} — Overdue Payment Notice (${daysOverdue} day${daysOverdue !== 1 ? 's' : ''})`,
        html,
      });
      return !result?.error;
    } catch {
      return false;
    }
  }

  async sendDocumentRequestEmail(to: string, fullName: string, documentType: string, instructions: string): Promise<boolean> {
    try {
      const html = `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
          <h2 style="color:#00296B">Additional Documents Required</h2>
          <p>Hi ${fullName},</p>
          <p>Our team has reviewed your application and requires the following additional document:</p>
          <p style="background:#f5f5f5;padding:12px;border-radius:8px;font-weight:bold">${documentType}</p>
          ${instructions ? `<p><strong>Instructions:</strong> ${instructions}</p>` : ''}
          <p>Please upload the requested document via your dashboard as soon as possible.</p>
          <a href="${this.appUrl}/dashboard/school-verification" style="display:inline-block;background:#00296B;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;margin-top:12px">Go to Dashboard</a>
          <p style="margin-top:24px;color:#888;font-size:12px">— The ${this.appName} Team</p>
        </div>`;
      const result = await this.sendWithRetry({
        from: `${this.appName} <${this.fromEmail}>`,
        to: [to],
        subject: `${this.appName} — Additional Documents Required`,
        html,
      });
      return !result?.error;
    } catch {
      return false;
    }
  }

  /**
   * Send a Resend email with automatic retry on transient network errors (ETIMEDOUT).
   * The Resend SDK wraps all fetch exceptions as application_error/statusCode:null — we
   * retry those up to maxAttempts times with a short delay before giving up.
   */
  private async sendWithRetry(
    payload: Parameters<typeof this.resend.emails.send>[0],
    maxAttempts = 3,
    delayMs = 500
  ): Promise<Awaited<ReturnType<typeof this.resend.emails.send>>> {
    let lastResult: Awaited<ReturnType<typeof this.resend.emails.send>> | null = null;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const result = await this.resend.emails.send(payload);
      // statusCode:null means the fetch itself threw (e.g. ETIMEDOUT) — retry
      if (result.error?.statusCode === null) {
        console.warn(`Email send attempt ${attempt}/${maxAttempts} failed with network error: ${result.error.message}`);
        lastResult = result;
        if (attempt < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
        }
        continue;
      }
      return result;
    }
    return lastResult!;
  }

  /**
   * Render EJS template with provided data
   */
  private async renderTemplate(templateName: string, data: Record<string, any>): Promise<string> {
    try {
      // Validate inputs
      if (!templateName || typeof templateName !== 'string') {
        console.error('Invalid template name');
        templateName = 'default';
      }

      if (!data || typeof data !== 'object') {
        console.error('Invalid template data');
        data = {
          fullName: 'User',
          appName: this.appName,
          appUrl: this.appUrl,
          message: 'Notification from our service'
        };
      }

      // Ensure required data fields exist with fallbacks
      const safeData: Record<string, any> = {
        ...data,
        fullName: data.fullName || 'User',
        appName: data.appName || this.appName,
        appUrl: data.appUrl || this.appUrl,
        otp: data.otp || 'CODE_MISSING',
        verificationUrl: data.verificationUrl || `${data.appUrl || this.appUrl}/auth/verify`,
        loginUrl: data.loginUrl || `${data.appUrl || this.appUrl}/auth/login`,
        subject: data.subject || 'Notification',
        message: data.message || 'This is a notification from our service',
      };

      // For development, we'll use a simple HTML template if the EJS file doesn't exist
      const templatePath = path.join(process.cwd(), 'views', 'emails', `${templateName}.ejs`);
      
      // Check if the template file exists
      try {
        await fs.promises.access(templatePath);
        // If file exists, render with EJS
        return await ejs.renderFile(templatePath, safeData);
      } catch (fileError) {
        // File doesn't exist, use fallback template
        console.warn(`Template file ${templateName}.ejs not found, using fallback template`);
        
        // Create a simple HTML template based on the mode
        if (templateName === 'verification-otp') {
          return `
            <html>
              <body>
                <h1>Verify Your Email</h1>
                <p>Hello ${safeData.fullName},</p>
                <p>Your verification code is: <strong>${safeData.otp || 'CODE_MISSING'}</strong></p>
                <p>This code will expire in 10 minutes.</p>
                <p>Thank you for using ${safeData.appName}!</p>
              </body>
            </html>
          `;
        } else if (templateName === 'verification-link') {
          const verificationUrl = safeData.verificationUrl || `${safeData.appUrl}/auth/verify`;
          return `
            <html>
              <body>
                <h1>Verify Your Email</h1>
                <p>Hello ${safeData.fullName},</p>
                <p>Please click the link below to verify your email address:</p>
                <p><a href="${verificationUrl}">Verify Email</a></p>
                <p>This link will expire in 24 hours.</p>
                <p>Thank you for using ${safeData.appName}!</p>
              </body>
            </html>
          `;
        } else if (templateName === 'welcome') {
          const loginUrl = safeData.loginUrl || `${safeData.appUrl}/auth/login`;
          return `
            <html>
              <body>
                <h1>Welcome to ${safeData.appName}!</h1>
                <p>Hello ${safeData.fullName},</p>
                <p>Thank you for verifying your email address. Your account is now active.</p>
                <p>You can now <a href="${loginUrl}">login to your account</a>.</p>
                <p>Thank you for using ${safeData.appName}!</p>
              </body>
            </html>
          `;
        } else {
          return `
            <html>
              <body>
                <h1>${safeData.subject || 'Notification'}</h1>
                <p>Hello ${safeData.fullName},</p>
                <p>${safeData.message || 'This is a notification from ' + safeData.appName}</p>
              </body>
            </html>
          `;
        }
      }
    } catch (error: any) {
      console.error(`Error rendering email template ${templateName}: ${error.message}`);
      // Return a basic fallback template instead of throwing
      return `
        <html>
          <body>
            <h1>Notification</h1>
            <p>Hello,</p>
            <p>This is a notification from ${this.appName}.</p>
          </body>
        </html>
      `;
    }
  }
}