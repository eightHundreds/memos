import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IdentityProvider } from '../common/entities/identity-provider.entity';
import { CreateIdentityProviderDto, UpdateIdentityProviderDto } from './dto/identity-provider.dto';

@Injectable()
export class IdentityProviderService {
  constructor(
    @InjectRepository(IdentityProvider)
    private idpRepository: Repository<IdentityProvider>,
  ) {}

  async create(createDto: CreateIdentityProviderDto): Promise<IdentityProvider> {
    const existing = await this.idpRepository.findOne({
      where: { name: createDto.name, rowStatus: 'NORMAL' },
    });

    if (existing) {
      throw new ConflictException('Identity provider with this name already exists');
    }

    const idp = this.idpRepository.create(createDto);
    return this.idpRepository.save(idp);
  }

  async findAll(): Promise<IdentityProvider[]> {
    return this.idpRepository.find({
      where: { rowStatus: 'NORMAL' },
      order: { createdTs: 'DESC' },
    });
  }

  async findOne(id: number): Promise<IdentityProvider> {
    const idp = await this.idpRepository.findOne({
      where: { id, rowStatus: 'NORMAL' },
    });

    if (!idp) {
      throw new NotFoundException('Identity provider not found');
    }

    return idp;
  }

  async update(id: number, updateDto: UpdateIdentityProviderDto): Promise<IdentityProvider> {
    const idp = await this.findOne(id);
    
    if (updateDto.name && updateDto.name !== idp.name) {
      const existing = await this.idpRepository.findOne({
        where: { name: updateDto.name, rowStatus: 'NORMAL' },
      });
      
      if (existing) {
        throw new ConflictException('Identity provider with this name already exists');
      }
    }

    Object.assign(idp, updateDto);
    return this.idpRepository.save(idp);
  }

  async remove(id: number): Promise<void> {
    const idp = await this.findOne(id);
    idp.rowStatus = 'ARCHIVED';
    await this.idpRepository.save(idp);
  }
}
