import { IsString, IsNotEmpty, IsEnum, IsOptional, IsBoolean } from 'class-validator';
import { Visibility } from '../../common/entities/memo.entity';

export class CreateMemoDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsEnum(Visibility)
  @IsOptional()
  visibility?: Visibility;

  @IsBoolean()
  @IsOptional()
  pinned?: boolean;
}

export class UpdateMemoDto {
  @IsString()
  @IsOptional()
  content?: string;

  @IsEnum(Visibility)
  @IsOptional()
  visibility?: Visibility;

  @IsBoolean()
  @IsOptional()
  pinned?: boolean;
}

export class QueryMemoDto {
  @IsOptional()
  @IsString()
  visibility?: string;

  @IsOptional()
  @IsString()
  creatorId?: string;

  @IsOptional()
  @IsString()
  tag?: string;

  @IsOptional()
  @IsString()
  limit?: string;

  @IsOptional()
  @IsString()
  offset?: string;
}
