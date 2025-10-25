import { IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';

export class CreateAttachmentDto {
  @IsNotEmpty()
  @IsString()
  filename: string;

  @IsNotEmpty()
  @IsString()
  type: string;

  @IsNotEmpty()
  @IsNumber()
  size: number;

  @IsOptional()
  @IsString()
  path?: string;

  @IsOptional()
  @IsString()
  externalLink?: string;
}

export class UpdateAttachmentDto {
  @IsOptional()
  @IsString()
  filename?: string;
}
