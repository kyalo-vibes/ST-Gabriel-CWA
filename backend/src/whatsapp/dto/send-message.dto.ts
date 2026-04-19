import { Type } from 'class-transformer';
import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class RecipientDto {
  @IsString() @IsNotEmpty() name: string;
  @IsString() @IsNotEmpty() phone: string;
  @IsOptional() @IsNumber() balance?: number;
}

export type Recipient = RecipientDto;

export class SendMessageDto {
  @IsIn(['group', 'individual']) mode: 'group' | 'individual';
  @IsOptional() @IsString() groupId?: string;
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => RecipientDto)
  recipients?: RecipientDto[];
  @IsString() @IsNotEmpty() message: string;
  @IsOptional() @IsString() notificationType?: string;
  @IsOptional() @IsString() targetGroup?: string;
}
