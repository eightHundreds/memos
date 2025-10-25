import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { CreateWebhookDto, UpdateWebhookDto } from './dto/webhook.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('api/v1/webhooks')
@UseGuards(JwtAuthGuard)
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Post()
  create(@Request() req, @Body() createWebhookDto: CreateWebhookDto) {
    return this.webhookService.create(req.user.id, createWebhookDto);
  }

  @Get()
  findAll(@Request() req) {
    return this.webhookService.findAll(req.user.id);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.webhookService.findOne(+id, req.user.id);
  }

  @Patch(':id')
  update(@Request() req, @Param('id') id: string, @Body() updateWebhookDto: UpdateWebhookDto) {
    return this.webhookService.update(+id, req.user.id, updateWebhookDto);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.webhookService.remove(+id, req.user.id);
  }
}
