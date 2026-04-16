import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class MembersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const members = await this.prisma.member.findMany({
      include: {
        contributions: { select: { amount: true } },
        eventPayments: {
          where: { status: 'PENDING', event: { status: 'ACTIVE' } },
          select: { amountDue: true, amountPaid: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    return members.map(({ joinDate, contributions, eventPayments, passwordHash, ...m }) => ({
      ...m,
      join_date: joinDate.toISOString(),
      total_contributed: contributions.reduce((s, c) => s + c.amount, 0),
      balance: eventPayments.reduce((s, p) => s + (p.amountDue - p.amountPaid), 0),
    }));
  }

  async findOne(id: string) {
    const member = await this.prisma.member.findUnique({
      where: { id },
      include: {
        contributions: { select: { amount: true } },
        eventPayments: {
          where: { status: 'PENDING', event: { status: 'ACTIVE' } },
          select: { amountDue: true, amountPaid: true },
        },
      },
    });
    if (!member) throw new NotFoundException(`Member ${id} not found`);
    const { joinDate, contributions, eventPayments, passwordHash, ...m } = member;
    return {
      ...m,
      join_date: joinDate.toISOString(),
      total_contributed: contributions.reduce((s, c) => s + c.amount, 0),
      balance: eventPayments.reduce((s, p) => s + (p.amountDue - p.amountPaid), 0),
    };
  }

  async create(dto: CreateMemberDto) {
    const existing = await this.prisma.member.findFirst({
      where: { OR: [{ phone: dto.phone }, { email: dto.email }] },
    });
    if (existing) throw new BadRequestException('Phone or email already registered');

    const passwordHash = await bcrypt.hash('CWA2026', 10);
    return this.prisma.member.create({
      data: {
        ...dto,
        joinDate: new Date(dto.joinDate),
        passwordHash,
        approvalStatus: 'PENDING',
        status: 'PENDING',
      },
    });
  }

  async update(id: string, dto: UpdateMemberDto) {
    await this.findOne(id);
    const data: any = { ...dto };
    if (dto.joinDate) data.joinDate = new Date(dto.joinDate);
    return this.prisma.member.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.member.delete({ where: { id } });
  }

  async approve(id: string) {
    await this.findOne(id);
    return this.prisma.member.update({
      where: { id },
      data: { approvalStatus: 'APPROVED', status: 'ACTIVE' },
    });
  }

  async resetPassword(id: string) {
    await this.findOne(id);
    const passwordHash = await bcrypt.hash('CWA2026', 10);
    return this.prisma.member.update({ where: { id }, data: { passwordHash } });
  }

  async changePassword(id: string, dto: ChangePasswordDto) {
    const member = await this.prisma.member.findUnique({ where: { id } });
    if (!member) throw new NotFoundException(`Member ${id} not found`);
    const valid = await bcrypt.compare(dto.currentPassword, member.passwordHash);
    if (!valid) throw new UnauthorizedException('Current password is incorrect');
    const passwordHash = await bcrypt.hash(dto.newPassword, 10);
    return this.prisma.member.update({ where: { id }, data: { passwordHash } });
  }
}
