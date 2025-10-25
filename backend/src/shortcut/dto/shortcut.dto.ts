import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateShortcutDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  payload: string;
}

export class UpdateShortcutDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  payload?: string;
}
