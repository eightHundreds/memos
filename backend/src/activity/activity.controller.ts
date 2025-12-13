import { Controller, Get, Post, Body, Param, UseGuards, Request, Query, ParseIntPipe } from '@nestjs/common';
import { ActivityService } from './activity.service';
import { CreateActivityDto } from './dto/activity.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('api/v1/activities')
@UseGuards(JwtAuthGuard)
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Post()
  create(@Request() req, @Body() createActivityDto: CreateActivityDto) {
    return this.activityService.create(req.user.id, createActivityDto);
  }

  @Get()
  findAll(@Request() req, @Query('limit', ParseIntPipe) limit?: number) {
    return this.activityService.findAll(req.user.id, limit);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.activityService.findOne(+id, req.user.id);
  }
}
