import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../common/entities';
import { UpdateUserDto } from './dto/user.dto';
import { UserAccessToken } from './entities/user-access-token.entity';
import * as crypto from 'crypto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserAccessToken)
    private accessTokenRepository: Repository<UserAccessToken>,
  ) {}

  async findAll() {
    const users = await this.userRepository.find({
      select: ['id', 'username', 'role', 'email', 'nickname', 'avatarUrl', 'description', 'createdTs', 'updatedTs'],
    });
    return { users };
  }

  async findOne(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
      select: ['id', 'username', 'role', 'email', 'nickname', 'avatarUrl', 'description', 'createdTs', 'updatedTs'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (updateUserDto.password) {
      user.passwordHash = await bcrypt.hash(updateUserDto.password, 10);
    }

    if (updateUserDto.nickname !== undefined) {
      user.nickname = updateUserDto.nickname;
    }

    if (updateUserDto.email !== undefined) {
      user.email = updateUserDto.email;
    }

    if (updateUserDto.avatarUrl !== undefined) {
      user.avatarUrl = updateUserDto.avatarUrl;
    }

    if (updateUserDto.description !== undefined) {
      user.description = updateUserDto.description;
    }

    user.updatedTs = Date.now();

    await this.userRepository.save(user);

    return {
      id: user.id,
      username: user.username,
      role: user.role,
      email: user.email,
      nickname: user.nickname,
      avatarUrl: user.avatarUrl,
      description: user.description,
    };
  }

  async delete(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.userRepository.remove(user);

    return { message: 'User deleted successfully' };
  }

  // Access Token Methods
  async createAccessToken(userId: number, description?: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Generate a secure random token
    const token = crypto.randomBytes(32).toString('hex');

    const accessToken = this.accessTokenRepository.create({
      userId,
      token,
      description,
      createdTs: Date.now(),
      expiresTs: null, // No expiration by default
    });

    await this.accessTokenRepository.save(accessToken);

    return accessToken;
  }

  async listAccessTokens(userId: number) {
    const tokens = await this.accessTokenRepository.find({
      where: { userId },
      order: { createdTs: 'DESC' },
    });

    return tokens;
  }

  async deleteAccessToken(userId: number, tokenId: number) {
    const token = await this.accessTokenRepository.findOne({
      where: { id: tokenId, userId },
    });

    if (!token) {
      throw new NotFoundException('Access token not found');
    }

    await this.accessTokenRepository.remove(token);

    return { message: 'Access token deleted successfully' };
  }
}
