import { IsString, IsOptional } from 'class-validator';

export class UpdateWorkspaceSettingDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  logoUrl?: string;
}
