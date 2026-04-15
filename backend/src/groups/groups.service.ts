import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGroupDto } from './dto/create-group.dto';

@Injectable()
export class GroupsService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.approvedGroup.findMany({ orderBy: { name: 'asc' } });
  }

  create(dto: CreateGroupDto) {
    return this.prisma.approvedGroup.upsert({
      where: { id: dto.id },
      update: { name: dto.name },
      create: { id: dto.id, name: dto.name },
    });
  }

  async remove(id: string) {
    const group = await this.prisma.approvedGroup.findUnique({ where: { id } });
    if (!group) throw new NotFoundException(`Group ${id} not found`);
    return this.prisma.approvedGroup.delete({ where: { id } });
  }
}
