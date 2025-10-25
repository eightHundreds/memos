import { IsString, IsNotEmpty, IsUrl, IsOptional } from 'class-validator';

export class CreateWebhookDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsUrl()
  @IsNotEmpty()
  url: string;
}

export class UpdateWebhookDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsUrl()
  @IsOptional()
  url?: string;
}
