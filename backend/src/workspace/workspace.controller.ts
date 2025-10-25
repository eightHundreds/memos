import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { WorkspaceService } from './workspace.service';
import { UpdateWorkspaceSettingDto } from './dto/workspace.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('api/v1/workspace')
export class WorkspaceController {
  constructor(private workspaceService: WorkspaceService) {}

  @Get('profile')
  getWorkspaceProfile() {
    return this.workspaceService.getWorkspaceProfile();
  }

  @UseGuards(JwtAuthGuard)
  @Patch('setting')
  updateWorkspaceSetting(@Body() updateDto: UpdateWorkspaceSettingDto) {
    return this.workspaceService.updateWorkspaceSetting(updateDto);
  }
}
