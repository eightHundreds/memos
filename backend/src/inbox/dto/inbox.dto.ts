import { IsString, IsEnum, IsOptional } from 'class-validator';
import { InboxStatus } from '../../common/entities/inbox.entity';

export class CreateInboxDto {
  @IsString()
  type: string;

  @IsString()
  @IsOptional()
  message?: string;

  @IsString()
  @IsOptional()
  link?: string;
}

export class UpdateInboxDto {
  @IsEnum(InboxStatus)
  @IsOptional()
  status?: InboxStatus;
}
