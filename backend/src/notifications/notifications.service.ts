import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.notification.findMany({
      orderBy: { sentAt: 'desc' },
      include: { member: { select: { name: true } } },
    });
  }

  create(dto: CreateNotificationDto) {
    return this.prisma.notification.create({ data: dto });
  }
}
