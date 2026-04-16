import { IsBoolean, IsInt, IsOptional, Max, Min } from 'class-validator';

export class UpdateScheduleConfigDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(23)
  hour?: number;

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
}
