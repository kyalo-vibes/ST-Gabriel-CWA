import { IsString, IsNumber, IsDateString, IsIn, IsNotEmpty, Min } from 'class-validator';

export class CreateExpenseDto {
  @IsString() @IsNotEmpty() description: string;
  @IsNumber() @Min(0) amount: number;
  @IsIn(['Welfare', 'Development', 'Project', 'Administrative', 'Event', 'Other'])
  category: string;
  @IsDateString() date: string;
  @IsString() @IsNotEmpty() reference: string;
}
