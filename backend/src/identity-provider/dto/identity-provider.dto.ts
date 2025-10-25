import { IsNotEmpty, IsOptional, IsString, IsObject } from 'class-validator';

export class CreateIdentityProviderDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  type: string;

  @IsOptional()
  @IsString()
  identifierFilter?: string;

  @IsOptional()
  @IsObject()
  config?: any;
}

export class UpdateIdentityProviderDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  identifierFilter?: string;

  @IsOptional()
  @IsObject()
  config?: any;
}
