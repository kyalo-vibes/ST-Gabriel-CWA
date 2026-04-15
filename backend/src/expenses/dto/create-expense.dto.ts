import { IsString, IsNumber, IsDateString } from 'class-validator';

export class CreateExpenseDto {
  @IsString() description: string;
  @IsNumber() amount: number;
  @IsString() category: string;
  @IsDateString() date: string;
  @IsString() reference: string;
}
