import { IsString } from 'class-validator';

export class CreateGroupDto {
  @IsString() id: string;
  @IsString() name: string;
}
