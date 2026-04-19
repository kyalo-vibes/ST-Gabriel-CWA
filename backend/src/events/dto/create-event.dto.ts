import { IsString, IsNotEmpty, IsNumber, IsDateString, IsEnum, IsOptional, IsIn, Min } from 'class-validator';

enum EventType {
  BEREAVEMENT = 'BEREAVEMENT',
  WEDDING = 'WEDDING',
  SCHOOL_FEES = 'SCHOOL_FEES',
  MONTHLY = 'MONTHLY',
  HARAMBEE = 'HARAMBEE',
  SPECIAL = 'SPECIAL',
}

export class CreateEventDto {
  @IsString() @IsNotEmpty() title: string;
  @IsEnum(EventType) type: EventType;
  @IsNumber() @Min(0) amountPerMember: number;
  @IsDateString() dueDate: string;
  @IsOptional()
  @IsIn(['All', 'ST_PETER', 'ST_PAUL', 'ST_JOSEPH', 'ST_MARY'])
  targetJumuia?: string;
  @IsOptional() @IsString() description?: string;
}
