import { Controller, Post, Body } from '@nestjs/common';
import { MarkdownService } from './markdown.service';
import { ParseMarkdownDto } from './dto/markdown.dto';

@Controller('api/v1/markdown')
export class MarkdownController {
  constructor(private markdownService: MarkdownService) {}

  @Post('parse')
  parseMarkdown(@Body() parseDto: ParseMarkdownDto) {
    return this.markdownService.parseMarkdown(parseDto);
  }
}
