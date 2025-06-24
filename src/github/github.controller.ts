// src/github/github.controller.ts
import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GithubService, GitHubRepository } from './github.service';

@ApiTags('GitHub')
@Controller('github')
export class GithubController {
  constructor(private readonly githubService: GithubService) {}

  @Get('repositories')
  @ApiOperation({ summary: '获取当前用户的所有仓库' })
  @ApiResponse({ 
    status: 200, 
    description: '成功获取所有仓库列表',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number' },
          name: { type: 'string' },
          full_name: { type: 'string' },
          description: { type: 'string' },
          private: { type: 'boolean' },
          html_url: { type: 'string' },
          language: { type: 'string' },
          stargazers_count: { type: 'number' },
          forks_count: { type: 'number' },
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'GitHub token未配置' })
  @ApiResponse({ status: 400, description: '请求失败' })
  async getUserRepositories(): Promise<GitHubRepository[]> {
    return this.githubService.getUserRepositories();
  }
}