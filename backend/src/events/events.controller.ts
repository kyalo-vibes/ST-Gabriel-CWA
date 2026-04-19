import { Controller, Get, Post, Patch, Body, Param, UseGuards, Request } from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { MarkPaidDto } from './dto/mark-paid.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.eventsService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Administrator')
  @Post()
  create(@Body() dto: CreateEventDto) {
    return this.eventsService.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Administrator')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateEventDto) {
    return this.eventsService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/payments')
  getPayments(@Param('id') id: string, @Request() req) {
    return this.eventsService.getPayments(id, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Administrator')
  @Patch(':eventId/payments/:memberId/pay')
  markAsPaid(
    @Param('eventId') eventId: string,
    @Param('memberId') memberId: string,
    @Body() dto: MarkPaidDto,
  ) {
    return this.eventsService.markAsPaid(eventId, memberId, dto);
  }
}
