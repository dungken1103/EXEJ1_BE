
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
        await this.mailService.sendContactEmail(body);
        return { message: 'Gửi tin nhắn thành công' };
    }
}
