import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IdentityProviderController } from './identity-provider.controller';
import { IdentityProviderService } from './identity-provider.service';
import { IdentityProvider } from '../common/entities/identity-provider.entity';

@Module({
  imports: [TypeOrmModule.forFeature([IdentityProvider])],
  controllers: [IdentityProviderController],
  providers: [IdentityProviderService],
  exports: [IdentityProviderService],
})
export class IdentityProviderModule {}
