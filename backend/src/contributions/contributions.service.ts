import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateContributionDto } from './dto/create-contribution.dto';

@Injectable()
export class ContributionsService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.contribution.findMany({
      include: { member: { select: { name: true } } },
      orderBy: { date: 'desc' },
    });
  }

  findByMember(memberId: string) {
    return this.prisma.contribution.findMany({
      where: { memberId },
      orderBy: { date: 'desc' },
    });
  }

  async create(dto: CreateContributionDto) {
    const member = await this.prisma.member.findUnique({ where: { id: dto.memberId } });
    if (!member) throw new NotFoundException(`Member ${dto.memberId} not found`);

    return this.prisma.contribution.create({
      data: { ...dto, date: new Date(dto.date) },
    });
  }
}
