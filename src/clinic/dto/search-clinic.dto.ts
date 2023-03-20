import { IsString, IsOptional, ValidateIf } from 'class-validator';

export class SearchClinicDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @ValidateIf((o) => o.from || o.to)
  @IsString()
  from?: string;

  @ValidateIf((o) => o.from || o.to)
  @IsString()
  to?: string;
}
