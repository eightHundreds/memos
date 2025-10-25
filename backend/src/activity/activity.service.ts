import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Activity } from '../common/entities/activity.entity';
import { CreateActivityDto } from './dto/activity.dto';

@Injectable()
export class ActivityService {
  constructor(
    @InjectRepository(Activity)
    private activityRepository: Repository<Activity>,
  ) {}

  async create(userId: number, createActivityDto: CreateActivityDto): Promise<Activity> {
    const activity = this.activityRepository.create({
      ...createActivityDto,
      creatorId: userId,
    });
    return this.activityRepository.save(activity);
  }

  async findAll(userId: number, limit?: number): Promise<Activity[]> {
    const query = this.activityRepository
      .createQueryBuilder('activity')
      .where('activity.creatorId = :userId', { userId })
      .orderBy('activity.createdTs', 'DESC');

    if (limit) {
      query.limit(limit);
    }

    return query.getMany();
  }

  async findOne(id: number, userId: number): Promise<Activity> {
    const activity = await this.activityRepository.findOne({
      where: { id },
    });

    if (!activity) {
      throw new NotFoundException('Activity not found');
    }

    if (activity.creatorId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return activity;
  }
}
