import { Injectable } from '@nestjs/common';
import { UpdateWorkspaceSettingDto } from './dto/workspace.dto';

@Injectable()
export class WorkspaceService {
  private workspaceSettings = {
    name: 'Memos',
    description: 'A lightweight, self-hosted note-taking service',
    logoUrl: '',
  };

  async getWorkspaceProfile() {
    return this.workspaceSettings;
  }

  async updateWorkspaceSetting(updateDto: UpdateWorkspaceSettingDto) {
    if (updateDto.name !== undefined) {
      this.workspaceSettings.name = updateDto.name;
    }
    if (updateDto.description !== undefined) {
      this.workspaceSettings.description = updateDto.description;
    }
    if (updateDto.logoUrl !== undefined) {
      this.workspaceSettings.logoUrl = updateDto.logoUrl;
    }
    return this.workspaceSettings;
  }
}
