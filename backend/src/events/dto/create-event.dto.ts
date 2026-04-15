import { IsString, IsNumber, IsDateString, IsEnum, IsOptional } from 'class-validator';

enum EventType {
  BEREAVEMENT = 'BEREAVEMENT',
  WEDDING = 'WEDDING',
  SCHOOL_FEES = 'SCHOOL_FEES',
  MONTHLY = 'MONTHLY',
  HARAMBEE = 'HARAMBEE',
  SPECIAL = 'SPECIAL',
}

export class CreateEventDto {
  @IsString() title: string;
  @IsEnum(EventType) type: EventType;
  @IsNumber() amountPerMember: number;
  @IsDateString() dueDate: string;
  @IsOptional() @IsString() targetJumuia?: string;
  @IsOptional() @IsString() description?: string;
}
