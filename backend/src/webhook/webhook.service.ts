import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Webhook } from '../common/entities/webhook.entity';
import { CreateWebhookDto, UpdateWebhookDto } from './dto/webhook.dto';

@Injectable()
export class WebhookService {
  constructor(
    @InjectRepository(Webhook)
    private webhookRepository: Repository<Webhook>,
  ) {}

  async create(userId: number, createWebhookDto: CreateWebhookDto): Promise<Webhook> {
    const webhook = this.webhookRepository.create({
      ...createWebhookDto,
      creatorId: userId,
    });
    return this.webhookRepository.save(webhook);
  }

  async findAll(userId: number): Promise<Webhook[]> {
    return this.webhookRepository.find({
      where: { creatorId: userId, rowStatus: 0 },
      order: { createdTs: 'DESC' },
    });
  }

  async findOne(id: number, userId: number): Promise<Webhook> {
    const webhook = await this.webhookRepository.findOne({
      where: { id, rowStatus: 0 },
    });

    if (!webhook) {
      throw new NotFoundException('Webhook not found');
    }

    if (webhook.creatorId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return webhook;
  }

  async update(id: number, userId: number, updateWebhookDto: UpdateWebhookDto): Promise<Webhook> {
    const webhook = await this.findOne(id, userId);
    
    Object.assign(webhook, updateWebhookDto);
    return this.webhookRepository.save(webhook);
  }

  async remove(id: number, userId: number): Promise<void> {
    const webhook = await this.findOne(id, userId);
    webhook.rowStatus = 1;
    await this.webhookRepository.save(webhook);
  }
}
