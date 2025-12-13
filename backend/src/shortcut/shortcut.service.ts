import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shortcut } from '../common/entities/shortcut.entity';
import { CreateShortcutDto, UpdateShortcutDto } from './dto/shortcut.dto';

@Injectable()
export class ShortcutService {
  constructor(
    @InjectRepository(Shortcut)
    private shortcutRepository: Repository<Shortcut>,
  ) {}

  async create(userId: number, createShortcutDto: CreateShortcutDto): Promise<Shortcut> {
    const shortcut = this.shortcutRepository.create({
      ...createShortcutDto,
      creatorId: userId,
    });
    return this.shortcutRepository.save(shortcut);
  }

  async findAll(userId: number): Promise<Shortcut[]> {
    return this.shortcutRepository.find({
      where: { creatorId: userId, rowStatus: 0 },
      order: { createdTs: 'DESC' },
    });
  }

  async findOne(id: number, userId: number): Promise<Shortcut> {
    const shortcut = await this.shortcutRepository.findOne({
      where: { id, rowStatus: 0 },
    });

    if (!shortcut) {
      throw new NotFoundException('Shortcut not found');
    }

    if (shortcut.creatorId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return shortcut;
  }

  async update(id: number, userId: number, updateShortcutDto: UpdateShortcutDto): Promise<Shortcut> {
    const shortcut = await this.findOne(id, userId);
    
    Object.assign(shortcut, updateShortcutDto);
    return this.shortcutRepository.save(shortcut);
  }

  async remove(id: number, userId: number): Promise<void> {
    const shortcut = await this.findOne(id, userId);
    shortcut.rowStatus = 1;
    await this.shortcutRepository.save(shortcut);
  }
}
