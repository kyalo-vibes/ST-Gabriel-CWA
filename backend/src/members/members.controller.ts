import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { MembersService } from './members.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('members')
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @SkipThrottle()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Administrator')
  @Get()
  findAll() {
    return this.membersService.findAll();
  }

  @Post()
  create(@Body() dto: CreateMemberDto) {
    return this.membersService.create(dto);
  }

  @SkipThrottle()
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    if (req.user.role === 'Member' && req.user.id !== id) {
      throw new ForbiddenException('Access denied');
    }
    return this.membersService.findOne(id);
  }

  @SkipThrottle()
  @UseGuards(JwtAuthGuard)
  @Patch('me/password')
  changePassword(@Request() req, @Body() dto: ChangePasswordDto) {
    return this.membersService.changePassword(req.user.id, dto);
  }

  @SkipThrottle()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Administrator')
  @Patch(':id/approve')
  approve(@Param('id') id: string) {
    return this.membersService.approve(id);
  }

  @SkipThrottle()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Administrator')
  @Patch(':id/reset-password')
  resetPassword(@Param('id') id: string) {
    return this.membersService.resetPassword(id);
  }

  @SkipThrottle()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Administrator')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateMemberDto) {
    return this.membersService.update(id, dto);
  }

  @SkipThrottle()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Administrator')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.membersService.remove(id);
  }
}
