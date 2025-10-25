import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attachment } from '../common/entities/attachment.entity';
import { CreateAttachmentDto, UpdateAttachmentDto } from './dto/attachment.dto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class AttachmentService {
  private readonly uploadPath = path.join(process.cwd(), 'uploads');

  constructor(
    @InjectRepository(Attachment)
    private attachmentRepository: Repository<Attachment>,
  ) {
    // Ensure upload directory exists
    if (!fs.existsSync(this.uploadPath)) {
      fs.mkdirSync(this.uploadPath, { recursive: true });
    }
  }

  async create(userId: number, createDto: CreateAttachmentDto): Promise<Attachment> {
    const attachment = this.attachmentRepository.create({
      ...createDto,
      creatorId: userId,
    });
    return this.attachmentRepository.save(attachment);
  }

  async uploadFile(userId: number, file: Express.Multer.File): Promise<Attachment> {
    const filename = `${Date.now()}-${file.originalname}`;
    const filePath = path.join(this.uploadPath, filename);
    
    fs.writeFileSync(filePath, file.buffer);

    const attachment = this.attachmentRepository.create({
      creatorId: userId,
      filename: file.originalname,
      type: file.mimetype,
      size: file.size,
      path: filePath,
    });

    return this.attachmentRepository.save(attachment);
  }

  async findAll(userId: number): Promise<Attachment[]> {
    return this.attachmentRepository.find({
      where: { creatorId: userId, rowStatus: 'NORMAL' },
      order: { createdTs: 'DESC' },
    });
  }

  async findOne(id: number, userId: number): Promise<Attachment> {
    const attachment = await this.attachmentRepository.findOne({
      where: { id, creatorId: userId, rowStatus: 'NORMAL' },
    });

    if (!attachment) {
      throw new NotFoundException('Attachment not found');
    }

    return attachment;
  }

  async update(id: number, userId: number, updateDto: UpdateAttachmentDto): Promise<Attachment> {
    const attachment = await this.findOne(id, userId);
    Object.assign(attachment, updateDto);
    return this.attachmentRepository.save(attachment);
  }

  async remove(id: number, userId: number): Promise<void> {
    const attachment = await this.findOne(id, userId);
    attachment.rowStatus = 'ARCHIVED';
    await this.attachmentRepository.save(attachment);
  }

  async getFileStream(id: number, userId: number): Promise<{ stream: fs.ReadStream; attachment: Attachment }> {
    const attachment = await this.findOne(id, userId);
    
    if (!attachment.path || !fs.existsSync(attachment.path)) {
      throw new NotFoundException('File not found');
    }

    const stream = fs.createReadStream(attachment.path);
    return { stream, attachment };
  }
}
