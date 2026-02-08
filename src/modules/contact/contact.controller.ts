
import { Body, Controller, Post } from '@nestjs/common';
import { MailService } from '../mail/mail.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Contact')
@Controller('contact')
export class ContactController {
    constructor(private readonly mailService: MailService) { }

    @Post()
    @ApiOperation({ summary: 'Gửi tin nhắn liên hệ' })
    async sendContactMessage(@Body() body: { name: string; email: string; phone: string; content: string }) {
        this.mailService.sendContactEmail(body).catch(err => console.error("Error sending contact email:", err));
        return { message: 'Gửi tin nhắn thành công' };
    }
}
