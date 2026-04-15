import { IsString, IsEmail, IsDateString, IsEnum } from 'class-validator';

enum Jumuia {
  ST_PETER = 'ST_PETER',
  ST_PAUL = 'ST_PAUL',
  ST_JOSEPH = 'ST_JOSEPH',
  ST_MARY = 'ST_MARY',
}

export class CreateMemberDto {
  @IsString() name: string;
  @IsString() phone: string;
  @IsEmail() email: string;
  @IsDateString() joinDate: string;
  @IsEnum(Jumuia) jumuia: Jumuia;
}
