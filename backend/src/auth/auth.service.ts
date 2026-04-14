import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    // Admin path — look up in Admin table
    const admin = await this.prisma.admin.findUnique({ where: { email: dto.email } });
    if (admin) {
      if (!dto.password) {
        throw new UnauthorizedException('Password is required for admin login');
      }
      const valid = await bcrypt.compare(dto.password, admin.passwordHash);
      if (!valid) {
        throw new UnauthorizedException('Invalid credentials');
      }
      const payload = { sub: admin.id, email: admin.email, role: 'Administrator', name: admin.name };
      return {
        access_token: this.jwtService.sign(payload),
        user: { id: admin.id, email: admin.email, role: 'Administrator', name: admin.name },
      };
    }

    // Member path — password required
    const member = await this.prisma.member.findUnique({ where: { email: dto.email } });
    if (!member) {
      throw new UnauthorizedException('No account found with this email');
    }
    if (member.approvalStatus !== 'APPROVED') {
      throw new UnauthorizedException('Your account is pending approval');
    }
    if (!dto.password) {
      throw new UnauthorizedException('Password is required');
    }
    const valid = await bcrypt.compare(dto.password, member.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: member.id, email: member.email, role: 'Member', name: member.name };
    return {
      access_token: this.jwtService.sign(payload),
      user: { id: member.id, email: member.email, role: 'Member', name: member.name },
    };
  }
}
