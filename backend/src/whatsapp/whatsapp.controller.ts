import { Controller, Get, Post, Body, NotFoundException, UseGuards } from '@nestjs/common';
import { WhatsAppService } from './whatsapp.service';
import { SendMessageDto } from './dto/send-message.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('whatsapp')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Administrator')
export class WhatsAppController {
  constructor(private readonly whatsAppService: WhatsAppService) {}

  @Get('status')
  getStatus() {
    return { status: this.whatsAppService.getStatus() };
  }

  @Get('qr')
  getQr() {
    const qr = this.whatsAppService.getQrCode();
    if (!qr) {
      throw new NotFoundException('No QR code available. WhatsApp may already be connected.');
    }
    return { qr };
  }

  @Get('groups')
  async getGroups() {
    return this.whatsAppService.getGroups();
  }

  @Post('send')
  async send(@Body() dto: SendMessageDto) {
    if (dto.mode === 'group') {
      if (!dto.groupId) {
        return { success: false, error: 'groupId is required for group mode' };
      }
      await this.whatsAppService.sendGroupMessage(dto.groupId, dto.message);
      return { success: true, sent: 1, failed: 0 };
    }

    if (dto.mode === 'individual') {
      if (!dto.recipients || dto.recipients.length === 0) {
        return { success: false, error: 'recipients array is required for individual mode' };
      }
      const result = await this.whatsAppService.sendIndividualMessages(
        dto.recipients,
        dto.message,
      );
      return { success: result.failed === 0, ...result };
    }

    return { success: false, error: 'Invalid mode. Use "group" or "individual".' };
  }
}
