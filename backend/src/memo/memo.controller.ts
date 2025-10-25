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

  // Memo Comments
  @UseGuards(JwtAuthGuard)
  @Post(':id/comments')
  createComment(
    @Param('id', ParseIntPipe) id: number,
    @Body('content') content: string,
    @Request() req,
  ) {
    return this.memoService.createComment(id, content, req.user.sub);
  }

  @Get(':id/comments')
  getComments(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const userId = req.user?.sub;
    return this.memoService.getComments(id, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/comments/:commentId')
  deleteComment(
    @Param('id', ParseIntPipe) id: number,
    @Param('commentId', ParseIntPipe) commentId: number,
    @Request() req,
  ) {
    return this.memoService.deleteComment(commentId, req.user.sub);
  }

  // Memo Reactions
  @UseGuards(JwtAuthGuard)
  @Post(':id/reactions')
  upsertReaction(
    @Param('id', ParseIntPipe) id: number,
    @Body('reactionType') reactionType: string,
    @Request() req,
  ) {
    return this.memoService.upsertReaction(id, reactionType, req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/reactions/:reactionType')
  deleteReaction(
    @Param('id', ParseIntPipe) id: number,
    @Param('reactionType') reactionType: string,
    @Request() req,
  ) {
    return this.memoService.deleteReaction(id, reactionType, req.user.sub);
  }

  @Get(':id/reactions')
  getReactions(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const userId = req.user?.sub;
    return this.memoService.getReactions(id, userId);
  }

  // Memo Tags
  @UseGuards(JwtAuthGuard)
  @Post('tags/rename')
  renameTag(
    @Body('oldName') oldName: string,
    @Body('newName') newName: string,
    @Request() req,
  ) {
    return this.memoService.renameTag(oldName, newName, req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('tags/:tagName')
  deleteTag(@Param('tagName') tagName: string, @Request() req) {
    return this.memoService.deleteTag(tagName, req.user.sub);
  }

  @Get('tags')
  listTags() {
    return this.memoService.listTags();
  }
}
