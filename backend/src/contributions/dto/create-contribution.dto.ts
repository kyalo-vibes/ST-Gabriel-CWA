import { IsString, IsNumber, IsDateString, IsIn, IsNotEmpty, Min } from 'class-validator';

export class CreateContributionDto {
  @IsString() @IsNotEmpty() memberId: string;
  @IsNumber() @Min(0) amount: number;
  @IsIn(['Monthly Contribution', 'Development', 'Welfare', 'Project', 'Special Contribution', 'Fundraising'])
  type: string;
  @IsDateString() date: string;
  @IsString() @IsNotEmpty() reference: string;
}
