import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('api/v1/users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.userService.delete(id);
  }

  // Access Token Routes
  @Post(':id/access-tokens')
  createAccessToken(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { description?: string },
  ) {
    return this.userService.createAccessToken(id, body.description);
  }

  @Get(':id/access-tokens')
  listAccessTokens(@Param('id', ParseIntPipe) id: number) {
    return this.userService.listAccessTokens(id);
  }

  @Delete(':id/access-tokens/:tokenId')
  deleteAccessToken(
    @Param('id', ParseIntPipe) id: number,
    @Param('tokenId', ParseIntPipe) tokenId: number,
  ) {
    return this.userService.deleteAccessToken(id, tokenId);
  }
}
