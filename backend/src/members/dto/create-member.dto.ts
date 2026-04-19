import { IsString, IsEmail, IsDateString, IsEnum, IsOptional, MinLength, IsNotEmpty, Matches } from 'class-validator';

enum Jumuia {
  ST_PETER = 'ST_PETER',
  ST_PAUL = 'ST_PAUL',
  ST_JOSEPH = 'ST_JOSEPH',
  ST_MARY = 'ST_MARY',
}

export class CreateMemberDto {
  @IsString() @IsNotEmpty() name: string;
  @IsString() @IsNotEmpty() @Matches(/^\+254\d{9}$/, { message: 'Phone must be in format +254XXXXXXXXX' }) phone: string;
  @IsEmail() email: string;
  @IsDateString() joinDate: string;
  @IsEnum(Jumuia) jumuia: Jumuia;
  @IsOptional() @IsString() @MinLength(8) password?: string;
}
