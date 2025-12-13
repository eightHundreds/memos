import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShortcutService } from './shortcut.service';
import { ShortcutController } from './shortcut.controller';
import { Shortcut } from '../common/entities/shortcut.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Shortcut])],
  controllers: [ShortcutController],
  providers: [ShortcutService],
  exports: [ShortcutService],
})
export class ShortcutModule {}
