import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { InboxService } from './inbox.service';
import { CreateInboxDto, UpdateInboxDto } from './dto/inbox.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { InboxStatus } from '../common/entities/inbox.entity';

@Controller('api/v1/inbox')
@UseGuards(JwtAuthGuard)
export class InboxController {
  constructor(private readonly inboxService: InboxService) {}

  @Post()
  create(@Request() req, @Body() createInboxDto: CreateInboxDto) {
    return this.inboxService.create(req.user.id, createInboxDto);
  }

  @Get()
  findAll(@Request() req, @Query('status') status?: InboxStatus) {
    return this.inboxService.findAll(req.user.id, status);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.inboxService.findOne(+id, req.user.id);
  }

  @Patch(':id')
  update(@Request() req, @Param('id') id: string, @Body() updateInboxDto: UpdateInboxDto) {
    return this.inboxService.update(+id, req.user.id, updateInboxDto);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.inboxService.remove(+id, req.user.id);
  }
}
