import { IsString, IsNumber, IsDateString } from 'class-validator';

export class CreateContributionDto {
  @IsString() memberId: string;
  @IsNumber() amount: number;
  @IsString() type: string;
  @IsDateString() date: string;
  @IsString() reference: string;
}
