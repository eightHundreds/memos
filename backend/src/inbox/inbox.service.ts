import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inbox, InboxStatus } from '../common/entities/inbox.entity';
import { CreateInboxDto, UpdateInboxDto } from './dto/inbox.dto';

@Injectable()
export class InboxService {
  constructor(
    @InjectRepository(Inbox)
    private inboxRepository: Repository<Inbox>,
  ) {}

  async create(receiverId: number, createInboxDto: CreateInboxDto): Promise<Inbox> {
    const inbox = this.inboxRepository.create({
      ...createInboxDto,
      receiverId,
    });
    return this.inboxRepository.save(inbox);
  }

  async findAll(userId: number, status?: InboxStatus): Promise<Inbox[]> {
    const where: any = { receiverId: userId };
    
    if (status) {
      where.status = status;
    }
    
    return this.inboxRepository.find({
      where,
      order: { createdTs: 'DESC' },
    });
  }

  async findOne(id: number, userId: number): Promise<Inbox> {
    const inbox = await this.inboxRepository.findOne({
      where: { id },
    });

    if (!inbox) {
      throw new NotFoundException('Inbox item not found');
    }

    if (inbox.receiverId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return inbox;
  }

  async update(id: number, userId: number, updateInboxDto: UpdateInboxDto): Promise<Inbox> {
    const inbox = await this.findOne(id, userId);
    
    Object.assign(inbox, updateInboxDto);
    return this.inboxRepository.save(inbox);
  }

  async remove(id: number, userId: number): Promise<void> {
    const inbox = await this.findOne(id, userId);
    await this.inboxRepository.remove(inbox);
  }
}
