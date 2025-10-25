import { Injectable } from '@nestjs/common';
import { ParseMarkdownDto } from './dto/markdown.dto';

@Injectable()
export class MarkdownService {
  async parseMarkdown(parseDto: ParseMarkdownDto) {
    // Simple markdown parsing - in production, you'd use a library like marked or markdown-it
    const content = parseDto.content;
    
    // Basic HTML escaping for security
    const escaped = content
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');

    return {
      content: escaped,
      html: escaped, // In production, this would be actual rendered HTML
    };
  }
}
