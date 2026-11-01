import { IsBoolean, IsInt, IsOptional, IsString, Matches, Max, Min } from 'class-validator';
export class UpsertScheduleDto {
  @IsInt() @Min(0) @Max(6) dayOfWeek!: number;
  @IsString() @Matches(/^([01]\d|2[0-3]):[0-5]\d$/) startTime!: string;
  @IsString() @Matches(/^([01]\d|2[0-3]):[0-5]\d$/) endTime!: string;
  @IsInt() @Min(5) @Max(240) slotDurationMinutes!: number;
  @IsOptional() @IsBoolean() active?: boolean;
}
