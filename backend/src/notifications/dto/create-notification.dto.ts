import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateNotificationDto {
  @IsOptional() @IsString() memberId?: string;
  @IsString() message: string;
  @IsString() type: string;
  @IsOptional() @IsString() targetGroup?: string;
  @IsOptional() @IsString() contributionType?: string;
  @IsOptional() @IsNumber() recipientCount?: number;
}
