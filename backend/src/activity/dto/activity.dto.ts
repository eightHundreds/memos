import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateActivityDto {
  @IsString()
  @IsNotEmpty()
  type: string;

  @IsString()
  @IsNotEmpty()
  level: string;

  @IsString()
  @IsOptional()
  payload?: string;
}
