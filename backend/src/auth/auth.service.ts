import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../common/entities';
import { SignInDto, SignUpDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async signIn(signInDto: SignInDto) {
    const user = await this.userRepository.findOne({
      where: { username: signInDto.username },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      signInDto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, username: user.username, role: user.role };
    const accessToken = await this.jwtService.signAsync(payload);

    return {
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        email: user.email,
        nickname: user.nickname,
        avatarUrl: user.avatarUrl,
      },
      accessToken,
    };
  }

  async signUp(signUpDto: SignUpDto) {
    const existingUser = await this.userRepository.findOne({
      where: { username: signUpDto.username },
    });

    if (existingUser) {
      throw new UnauthorizedException('Username already exists');
    }

    const passwordHash = await bcrypt.hash(signUpDto.password, 10);

    const user = this.userRepository.create({
      username: signUpDto.username,
      passwordHash,
      nickname: signUpDto.nickname || signUpDto.username,
      createdTs: Date.now(),
      updatedTs: Date.now(),
    });

    await this.userRepository.save(user);

    const payload = { sub: user.id, username: user.username, role: user.role };
    const accessToken = await this.jwtService.signAsync(payload);

    return {
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        email: user.email,
        nickname: user.nickname,
        avatarUrl: user.avatarUrl,
      },
      accessToken,
    };
  }

  async getMe(userId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

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
}
