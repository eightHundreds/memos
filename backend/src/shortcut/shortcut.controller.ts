import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ShortcutService } from './shortcut.service';
import { CreateShortcutDto, UpdateShortcutDto } from './dto/shortcut.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('api/v1/shortcuts')
@UseGuards(JwtAuthGuard)
export class ShortcutController {
  constructor(private readonly shortcutService: ShortcutService) {}

  @Post()
  create(@Request() req, @Body() createShortcutDto: CreateShortcutDto) {
    return this.shortcutService.create(req.user.id, createShortcutDto);
  }

  @Get()
  findAll(@Request() req) {
    return this.shortcutService.findAll(req.user.id);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.shortcutService.findOne(+id, req.user.id);
  }

  @Patch(':id')
  update(@Request() req, @Param('id') id: string, @Body() updateShortcutDto: UpdateShortcutDto) {
    return this.shortcutService.update(+id, req.user.id, updateShortcutDto);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.shortcutService.remove(+id, req.user.id);
  }
}
