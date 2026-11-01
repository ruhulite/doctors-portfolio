import { IsEmail, IsISO8601, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';
export class CreateAppointmentDto {
  @IsString() chamberId!: string;
  @IsString() @MinLength(2) @MaxLength(120) patientName!: string;
  @IsString() @Matches(/^(?:\+?88)?01[3-9]\d{8}$/) patientPhone!: string;
  @IsOptional() @IsEmail() patientEmail?: string;
  @IsISO8601({ strict: true }) @Matches(/(?:Z|[+-]\d{2}:\d{2})$/) startsAt!: string;
  @IsOptional() @IsString() @MaxLength(1000) note?: string;
}
export class AppointmentDecisionDto {
  @IsOptional() @IsString() @MaxLength(1000) adminNote?: string;
}
export class RescheduleAppointmentDto extends AppointmentDecisionDto {
  @IsISO8601({ strict: true }) @Matches(/(?:Z|[+-]\d{2}:\d{2})$/) startsAt!: string;
}
