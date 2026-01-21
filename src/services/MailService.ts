/**
 * Mail Service
 * Handles email sending functionality using Resend as the provider
 * Implements SOLID principles with dependency injection
 */

// We'll need to install these packages: npm install resend ejs
// import { Resend } from 'resend';
import * as fs from 'fs';
import * as path from 'path';
import * as ejs from 'ejs';
import { logger } from '@/src/utils/logger';
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
    // Mock implementation until Resend package is installed
    this.resend  = new Resend(process.env.RESEND_API_KEY);
    this.fromEmail = process.env.FROM_EMAIL || 'noreply@paymyfees.com';
    this.appName = process.env.APP_NAME || 'PayMyFees';
    this.appUrl = process.env.APP_URL || 'http://localhost:3000';
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
      const templateName = mode === 'otp' ? 'verification-otp' : 'verification-link';
      const subject = `${this.appName} - Verify Your Email`;
      
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
        templateData['verificationUrl'] = `${this.appUrl}/auth/verify?token=${verificationData.token}`;
      }

      // Render email template
      const html = await this.renderTemplate(templateName, templateData);

      // Send email
      const { error } = await this.resend.emails.send({
        from: `${this.appName} <${this.fromEmail}>`,
        to: [to],
        subject,
        html,
      });

      if (error) {
        logger.error(`Failed to send verification email to ${to} using ${mode} mode`);
        return false;
      }

      logger.info(`Verification email sent successfully to ${to} using ${mode} mode`);
      return true;
    } catch (error) {
      logger.error(`Error sending verification email to ${to} using ${mode} mode`);
      return false;
    }
  }

  /**
   * Send welcome email after successful verification
   */
  async sendWelcomeEmail(to: string, fullName: string): Promise<boolean> {
    try {
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

      // Send email
      const { error } = await this.resend.emails.send({
        from: `${this.appName} <${this.fromEmail}>`,
        to: [to],
        subject,
        html,
      });

      if (error) {
        logger.error(`Failed to send welcome email to ${to}`);
        return false;
      }

      logger.info(`Welcome email sent successfully to ${to}`);
      return true;
    } catch (error) {
      logger.error(`Error sending welcome email to ${to}`);
      return false;
    }
  }

  /**
   * Render EJS template with provided data
   */
  private async renderTemplate(templateName: string, data: Record<string, any>): Promise<string> {
    try {
      const templatePath = path.join(process.cwd(), 'views', 'emails', `${templateName}.ejs`);
      
      // Read template file
      const template = fs.readFileSync(templatePath, 'utf-8');
      
      // Mock EJS rendering until package is installed
      // In real implementation, this would be: 
      return ejs.render(template, data);

    } catch (error: any) {
      logger.error(`Error rendering email template ${templateName}: ${error.message}`);
      throw new Error(`Failed to render email template: ${error.message}`);
    }
  }
}