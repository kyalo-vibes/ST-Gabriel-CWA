import { IsString, IsEmail, IsDateString, IsEnum, IsOptional, Matches } from 'class-validator';
import { MemberStatus } from '@prisma/client';

enum Jumuia {
  ST_PETER = 'ST_PETER',
  ST_PAUL = 'ST_PAUL',
  ST_JOSEPH = 'ST_JOSEPH',
  ST_MARY = 'ST_MARY',
}

export class UpdateMemberDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() @Matches(/^\+254\d{9}$/, { message: 'Phone must be in format +254XXXXXXXXX' }) phone?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsDateString() joinDate?: string;
  @IsOptional() @IsEnum(Jumuia) jumuia?: Jumuia;
  @IsOptional() @IsEnum(MemberStatus) status?: MemberStatus;
}
