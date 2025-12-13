import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from '../common/entities';
import { UserAccessToken } from './entities/user-access-token.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserAccessToken])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
