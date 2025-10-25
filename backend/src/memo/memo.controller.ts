import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { MemoService } from './memo.service';
import { CreateMemoDto, UpdateMemoDto, QueryMemoDto } from './dto/memo.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('api/v1/memos')
export class MemoController {
  constructor(private memoService: MemoService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createMemoDto: CreateMemoDto, @Request() req) {
    return this.memoService.create(createMemoDto, req.user.sub);
  }

  @Get()
  findAll(@Query() queryDto: QueryMemoDto, @Request() req) {
    const userId = req.user?.sub;
    return this.memoService.findAll(queryDto, userId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const userId = req.user?.sub;
    return this.memoService.findOne(id, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMemoDto: UpdateMemoDto,
    @Request() req,
  ) {
    return this.memoService.update(id, updateMemoDto, req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.memoService.delete(id, req.user.sub);
  }
}
