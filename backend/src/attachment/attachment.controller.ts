import { 
  Controller, 
  Get, 
  Post, 
  Patch, 
  Delete, 
  Body, 
  Param, 
  UseGuards, 
  Request,
  UseInterceptors,
  UploadedFile,
  Res,
  StreamableFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AttachmentService } from './attachment.service';
import { CreateAttachmentDto, UpdateAttachmentDto } from './dto/attachment.dto';
import { Response } from 'express';

@Controller('api/v1/attachments')
@UseGuards(JwtAuthGuard)
export class AttachmentController {
  constructor(private readonly attachmentService: AttachmentService) {}

  @Post()
  create(@Request() req, @Body() createDto: CreateAttachmentDto) {
    return this.attachmentService.create(req.user.id, createDto);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(@Request() req, @UploadedFile() file: Express.Multer.File) {
    return this.attachmentService.uploadFile(req.user.id, file);
  }

  @Get()
  findAll(@Request() req) {
    return this.attachmentService.findAll(req.user.id);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.attachmentService.findOne(+id, req.user.id);
  }

  @Get(':id/download')
  async download(@Request() req, @Param('id') id: string, @Res({ passthrough: true }) res: Response) {
    const { stream, attachment } = await this.attachmentService.getFileStream(+id, req.user.id);
    
    res.set({
      'Content-Type': attachment.type,
      'Content-Disposition': `attachment; filename="${attachment.filename}"`,
    });

    return new StreamableFile(stream);
  }

  @Patch(':id')
  update(@Request() req, @Param('id') id: string, @Body() updateDto: UpdateAttachmentDto) {
    return this.attachmentService.update(+id, req.user.id, updateDto);
  }

  @Delete(':id')
  async remove(@Request() req, @Param('id') id: string) {
    await this.attachmentService.remove(+id, req.user.id);
    return { message: 'Attachment deleted successfully' };
  }
}
