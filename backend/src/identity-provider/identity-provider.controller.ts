import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { IdentityProviderService } from './identity-provider.service';
import { CreateIdentityProviderDto, UpdateIdentityProviderDto } from './dto/identity-provider.dto';

@Controller('api/v1/identity-providers')
@UseGuards(JwtAuthGuard)
export class IdentityProviderController {
  constructor(private readonly idpService: IdentityProviderService) {}

  @Post()
  create(@Body() createDto: CreateIdentityProviderDto) {
    return this.idpService.create(createDto);
  }

  @Get()
  findAll() {
    return this.idpService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.idpService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateIdentityProviderDto) {
    return this.idpService.update(+id, updateDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.idpService.remove(+id);
    return { message: 'Identity provider deleted successfully' };
  }
}
