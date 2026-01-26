import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });
  }

  private getOtpEmailHtml(otp: string): string {
    const brandGreen = '#2d5a27';
    const brandBrown = '#5D4E37';
    const cream = '#f8f5f0';
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Đặt lại mật khẩu - Waste To Worth</title>
</head>
<body style="margin:0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: ${cream}; padding: 24px;">
  <div style="max-width: 480px; margin: 0 auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
    <div style="background: ${brandGreen}; padding: 24px; text-align: center;">
      <h1 style="margin: 0; color: #fff; font-size: 22px; font-weight: 700;">Waste To Worth</h1>
      <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Đặt lại mật khẩu</p>
    </div>
    <div style="padding: 28px 24px;">
      <p style="margin: 0 0 16px 0; color: #333; line-height: 1.6;">Xin chào,</p>
      <p style="margin: 0 0 20px 0; color: #555; line-height: 1.6;">Bạn đã yêu cầu đặt lại mật khẩu. Sử dụng mã OTP bên dưới để tiếp tục. Mã có hiệu lực trong <strong>5 phút</strong>.</p>
      <div style="text-align: center; margin: 24px 0;">
        <span style="display: inline-block; padding: 14px 28px; background: ${brandGreen}; color: #fff; font-size: 26px; font-weight: 700; letter-spacing: 6px; border-radius: 12px;">${otp}</span>
      </div>
      <p style="margin: 20px 0 0 0; color: #777; font-size: 13px; line-height: 1.5;">Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này. Mã OTP sẽ tự hết hạn.</p>
    </div>
    <div style="padding: 16px 24px; border-top: 1px solid #eee; text-align: center;">
      <p style="margin: 0; color: ${brandBrown}; font-size: 12px;">&copy; Waste To Worth</p>
    </div>
  </div>
</body>
</html>`;
  }

  async sendOtpEmail(email: string, otp: string) {
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: 'Mã OTP đặt lại mật khẩu - Waste To Worth',
      text: `Mã OTP đặt lại mật khẩu của bạn là: ${otp}. Mã này có hiệu lực trong 5 phút.`,
      html: this.getOtpEmailHtml(otp),
    };

    await this.transporter.sendMail(mailOptions);
  }
}
