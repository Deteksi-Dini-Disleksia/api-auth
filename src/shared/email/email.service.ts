import { Injectable, Logger } from '@nestjs/common';
import * as dns from 'dns';
import * as nodemailer from 'nodemailer';

// Force IPv4 DNS resolution — Railway does not support IPv6 outbound connections
dns.setDefaultResultOrder('ipv4first');

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
      },
    });
  }

  async sendVerificationEmail(
    to: string,
    token: string,
    fullname: string,
  ): Promise<void> {
    const baseUrl = process.env.APP_URL || 'http://localhost:3000';
    const verifyUrl = `${baseUrl}/auth/verify-email?token=${token}`;

    const html = `
      <div style="font-family: 'Segoe UI', Tahoma, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px; background: #ffffff; border-radius: 12px; border: 1px solid #e5e7eb;">
        <h2 style="color: #1f2937; margin-bottom: 8px;">Verifikasi Email Anda</h2>
        <p style="color: #6b7280; font-size: 15px; line-height: 1.6;">
          Halo <strong>${fullname}</strong>,
        </p>
        <p style="color: #6b7280; font-size: 15px; line-height: 1.6;">
          Terima kasih telah mendaftar di <strong>Tes Disleksia</strong>. Silakan klik tombol di bawah untuk memverifikasi email Anda:
        </p>
        <div style="text-align: center; margin: 28px 0;">
          <a href="${verifyUrl}"
             style="display: inline-block; padding: 12px 32px; background: #2563eb; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px;">
            Verifikasi Email
          </a>
        </div>
        <p style="color: #9ca3af; font-size: 13px; line-height: 1.5;">
          Link ini berlaku selama <strong>24 jam</strong>. Jika Anda tidak merasa mendaftar, abaikan email ini.
        </p>
        <hr style="border: none; border-top: 1px solid #f3f4f6; margin: 24px 0;" />
        <p style="color: #d1d5db; font-size: 12px; text-align: center;">&copy; Tes Disleksia</p>
      </div>
    `;

    try {
      await this.transporter.sendMail({
        from:
          process.env.SMTP_FROM || `"Tes Disleksia" <${process.env.SMTP_USER}>`,
        to,
        subject: 'Verifikasi Email — Tes Disleksia',
        html,
      });
      this.logger.log(`Verification email sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send verification email to ${to}`, error);
      throw error;
    }
  }
}
