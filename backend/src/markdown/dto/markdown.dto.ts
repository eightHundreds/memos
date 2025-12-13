import { IsString, IsNotEmpty } from 'class-validator';

export class ParseMarkdownDto {
  @IsString()
  @IsNotEmpty()
  content: string;
}
