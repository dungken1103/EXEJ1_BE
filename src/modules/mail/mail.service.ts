import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { PrismaService } from '../../database/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class MailService implements OnModuleInit {
  private transporter;
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly prisma: PrismaService) {
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST || 'smtp-relay.brevo.com',
      port: parseInt(process.env.MAIL_PORT || "587") || 587,
      secure: false, // true for 465, false for other ports (Brevo usually uses 587 with STARTTLS)
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
  }

  async onModuleInit() {
    this.logger.log(`Initializing MailService with Brevo...`);
    this.logger.debug(`Env MAIL_HOST: ${process.env.MAIL_HOST}`);
    this.logger.debug(`Env MAIL_PORT: ${process.env.MAIL_PORT}`);
    this.logger.debug(`Env MAIL_USER: ${process.env.MAIL_USER ? 'Present' : 'MISSING'}`);
    this.logger.debug(`Env MAIL_PASS: ${process.env.MAIL_PASS ? 'Present' : 'MISSING'}`);
    this.logger.debug(`Env MAIL_FROM: ${process.env.MAIL_FROM}`);

    try {
      await this.transporter.verify();
      this.logger.log('✅ Mail server (Brevo) is ready to take our messages (Connection Verified)');
    } catch (error) {
      this.logger.error('❌ Mail server configuration error', error);
      if (error.code === 'EAUTH') {
        this.logger.error('Details: Authentication failed. Check MAIL_USER/MAIL_PASS.');
      } else if (error.code === 'ESOCKET') {
        this.logger.error('Details: Connection failed. Check network/port blocking.');
      }
    }
  }

  private async getAdminEmails(): Promise<string[]> {
    const admins = await this.prisma.user.findMany({
      where: { role: Role.ADMIN },
      select: { email: true },
    });
    return admins.map((admin) => admin.email);
  }

  private formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  }

  private getTemplateHtml(title: string, content: string): string {
    const brandGreen = '#2d5a27';
    const brandBrown = '#5D4E37';
    const cream = '#f8f5f0';
    const year = new Date().getFullYear();

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - Waste To Worth</title>
</head>
<body style="margin:0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: ${cream}; padding: 24px;">
  <div style="max-width: 600px; margin: 0 auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
    <div style="background: ${brandGreen}; padding: 32px 24px; text-align: center;">
      <h1 style="margin: 0; color: #fff; font-size: 26px; font-weight: 700; letter-spacing: 1px;">Waste To Worth</h1>
      <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">${title}</p>
    </div>
    <div style="padding: 40px 32px; color: #4B5563; font-size: 16px; line-height: 1.6;">
      ${content}
    </div>
    <div style="padding: 24px; background-color: #f9fafb; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="margin: 0; color: ${brandBrown}; font-size: 14px; font-weight: 600;">Waste To Worth</p>
      <p style="margin: 4px 0 0; color: #9CA3AF; font-size: 12px;">Trao vòng đời mới cho những mảnh gỗ offcut.</p>
      <p style="margin: 12px 0 0; color: #9CA3AF; font-size: 12px;">© ${year} Waste To Worth. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;
  }

  async sendOtpEmail(email: string, otp: string) {
    try {
      const content = `
      <h2 style="color: #1F2937; margin-top: 0;">Yêu cầu đặt lại mật khẩu</h2>
      <p>Xin chào,</p>
      <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Để tiếp tục, vui lòng sử dụng mã xác thực (OTP) bên dưới:</p>
      
      <div style="text-align: center; margin: 32px 0;">
        <span style="display: inline-block; padding: 16px 32px; background: #2d5a27; color: #fff; font-size: 32px; font-weight: 700; letter-spacing: 8px; border-radius: 12px;">${otp}</span>
      </div>
      
      <p>Mã OTP này sẽ hết hạn sau <strong>5 phút</strong>.</p>
      <p style="color: #6B7280; font-size: 14px; margin-top: 24px;">Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này. Tài khoản của bạn vẫn an toàn.</p>
    `;

      const html = this.getTemplateHtml('Đặt lại mật khẩu', content);

      await this.transporter.sendMail({
        from: process.env.MAIL_FROM || process.env.MAIL_USER,
        to: email,
        subject: 'Mã xác thực đặt lại mật khẩu',
        html,
      });
      this.logger.log(`OTP email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send OTP email to ${email}`, error);
    }
  }

  async sendOrderCreatedEmail(to: string, order: any) {
    try {
      const adminEmails = await this.getAdminEmails();
      if (adminEmails.length === 0) return;

      const itemsHtml = order.items.map(item => `
      <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
        <span>${item.product?.name || 'Sản phẩm'} (x${item.quantity}) </span>
        <span style="font-weight: 600;">${this.formatPrice(item.price * item.quantity)}</span>
      </div>
    `).join('');

      const content = `
      <h2 style="color: #1F2937; margin-top: 0;">Đơn hàng mới #${order.id}</h2>
      <p>Có một đơn hàng mới vừa được tạo trên hệ thống.</p>
      
      <div style="background: #f3f4f6; border-radius: 8px; padding: 20px; margin: 24px 0;">
        <h3 style="margin: 0 0 16px; color: #2d5a27; font-size: 18px;">Thông tin đơn hàng</h3>
        <p style="margin: 4px 0;"><strong>Khách hàng:</strong> ${order.userAddress?.fullName || 'Khách vãng lai'}</p>
        <p style="margin: 4px 0;"><strong>SĐT:</strong> ${order.userAddress?.phone || 'N/A'}</p>
        <p style="margin: 4px 0;"><strong>Địa chỉ:</strong> ${order.userAddress ? `${order.userAddress.addressDetail}, ${order.userAddress.ward}, ${order.userAddress.district}, ${order.userAddress.province}` : 'N/A'}</p>
        <p style="margin: 4px 0;"><strong>Tổng tiền:</strong> <span style="color: #DC2626; font-weight: 700;">${this.formatPrice(order.total)}</span></p>
      </div>

      <div style="margin-bottom: 24px;">
        <h3 style="margin: 0 0 12px; color: #2d5a27; font-size: 18px;">Chi tiết sản phẩm</h3>
        ${itemsHtml}
      </div>


    `;

      const html = this.getTemplateHtml('Thông báo đơn hàng mới', content);

      // Send to all admins
      await this.transporter.sendMail({
        from: process.env.MAIL_FROM || process.env.MAIL_USER,
        to: adminEmails, // Nodemailer supports array of strings
        subject: `[Đơn hàng mới] #${order.id} - ${this.formatPrice(order.total)}`,
        html,
      });
      this.logger.log(`Order created email sent to admins for order #${order.id}`);
    } catch (error) {
      this.logger.error(`Failed to send order created email for order #${order.id}`, error);
    }
  }

  async sendOrderStatusUpdateEmail(to: string, order: any, status: string, reason?: string) {
    try {
      let statusText = '';
      let message = '';

      switch (status) {
        case 'CONFIRMED':
          statusText = 'Đã xác nhận';
          message = 'Đơn hàng của bạn đã được xác nhận và đang được chuẩn bị.';
          break;
        case 'SHIPPING':
          statusText = 'Đang giao hàng';
          message = 'Đơn hàng của bạn đã được bàn giao cho đơn vị vận chuyển.';
          break;
        case 'DELIVERED':
          statusText = 'Đã giao hàng';
          message = 'Đơn hàng đã được giao thành công. Cảm ơn bạn đã mua sắm tại Waste To Worth!';
          break;
        case 'CANCELLED':
          statusText = 'Đã hủy';
          message = `Đơn hàng của bạn đã bị hủy.${reason ? `<br><strong>Lý do:</strong> ${reason}` : ''}`;
          break;
        default:
          statusText = status;
          message = 'Trạng thái đơn hàng đã được cập nhật.';
      }

      const itemsHtml = order.items.map(item => `
        <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
          <span>${item.product?.name || 'Sản phẩm'} (x${item.quantity}) </span>
          <span style="font-weight: 600;">${this.formatPrice(item.price * item.quantity)}</span>
        </div>
      `).join('');

      const content = `
      <h2 style="color: #1F2937; margin-top: 0;">Cập nhật đơn hàng #${order.id}</h2>
      <div style="text-align: center; margin: 24px 0;">
         <span style="display: inline-block; padding: 8px 16px; background: #FEF3C7; color: #92400E; border-radius: 20px; font-weight: 600;">${statusText}</span>
      </div>
      <p>${message}</p>
      
       <div style="margin: 24px 0;">
        <h3 style="margin: 0 0 12px; color: #2d5a27; font-size: 18px;">Chi tiết đơn hàng</h3>
        ${itemsHtml}
        <div style="display: flex; justify-content: space-between; padding: 12px 0; font-weight: 700; color: #1F2937; font-size: 18px;">
            <span>Tổng cộng</span>
            <span>${this.formatPrice(order.total)}</span>
        </div>
      </div>
    `;

      const html = this.getTemplateHtml('Cập nhật trạng thái đơn hàng', content);

      await this.transporter.sendMail({
        from: process.env.MAIL_FROM || process.env.MAIL_USER,
        to,
        subject: `[Cập nhật đơn hàng] #${order.id}: ${statusText}`,
        html,
      });
      this.logger.log(`Order status update email sent to ${to} for order #${order.id}`);
    } catch (error) {
      this.logger.error(`Failed to send order status update email for order #${order.id}`, error);
    }
  }

  async sendOrderCancelledEmail(to: string, order: any, reason?: string) {
    try {
      const adminEmails = await this.getAdminEmails();
      if (adminEmails.length === 0) return;

      const content = `
       <h2 style="color: #DC2626; margin-top: 0;">Đơn hàng #${order.id} đã bị hủy</h2>
       <p>Người dùng đã hủy đơn hàng này.</p>
       ${reason ? `<p><strong>Lý do:</strong> ${reason}</p>` : ''}
       
       <div style="background: #f3f4f6; border-radius: 8px; padding: 20px; margin: 24px 0;">
        <h3 style="margin: 0 0 16px; color: #2d5a27; font-size: 18px;">Thông tin đơn hàng</h3>
        <p style="margin: 4px 0;"><strong>Khách hàng:</strong> ${order.userAddress?.fullName || 'N/A'}</p>
        <p style="margin: 4px 0;"><strong>Tổng tiền:</strong> <span style="color: #DC2626; font-weight: 700;">${this.formatPrice(order.total)}</span></p>
      </div>

      `;

      const html = this.getTemplateHtml('Thông báo hủy đơn hàng', content);

      await this.transporter.sendMail({
        from: process.env.MAIL_FROM || process.env.MAIL_USER,
        to: adminEmails,
        subject: `[Đơn hàng bị hủy] #${order.id}`,
        html,
      });
      this.logger.log(`Order cancelled email sent to admins for order #${order.id}`);
    } catch (error) {
      this.logger.error(`Failed to send order cancelled email for order #${order.id}`, error);
    }
  }

  async sendContactEmail(data: { name: string; email: string; phone: string; content: string }) {
    try {
      const adminEmails = await this.getAdminEmails();
      if (adminEmails.length === 0) return;

      const content = `
      <h2 style="color: #1F2937; margin-top: 0;">Liên hệ mới từ khách hàng</h2>
      <p>Bạn nhận được một tin nhắn liên hệ mới từ website.</p>
      
      <div style="background: #f9fafb; border-left: 4px solid #2d5a27; padding: 20px; margin: 24px 0;">
        <p style="margin: 8px 0;"><strong>Họ tên:</strong> ${data.name}</p>
        <p style="margin: 8px 0;"><strong>Email:</strong> <a href="mailto:${data.email}" style="color: #2563EB;">${data.email}</a></p>
        <p style="margin: 8px 0;"><strong>SĐT:</strong> ${data.phone}</p>
        <div style="margin-top: 16px; padding-top: 16px; border-top: 1px dashed #e5e7eb;">
          <strong>Nội dung:</strong><br/>
          <p style="white-space: pre-wrap; margin-top: 8px;">${data.content}</p>
        </div>
      </div>

      <div style="text-align: center; margin-top: 32px;">
        <a href="mailto:${data.email}" style="display: inline-block; padding: 12px 24px; background: #2d5a27; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600;">Trả lời qua Email</a>
      </div>
    `;

      const html = this.getTemplateHtml('Liên hệ mới', content);

      await this.transporter.sendMail({
        from: process.env.MAIL_FROM || process.env.MAIL_USER,
        to: adminEmails,
        subject: `[Liên hệ] Tin nhắn mới từ ${data.name}`,
        html,
      });
      this.logger.log(`Contact email sent from ${data.email}`);
    } catch (error) {
      this.logger.error(`Failed to send contact email from ${data.email}`, error);
    }
  }
}
