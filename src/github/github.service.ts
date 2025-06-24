// src/github/github.service.ts
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  private: boolean;
  html_url: string;
  clone_url: string;
  ssh_url: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  created_at: string;
  updated_at: string;
  pushed_at: string;
}

@Injectable()
export class GithubService {
  private readonly baseUrl = 'https://api.github.com';

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * 获取当前用户的所有仓库
   */
  async getUserRepositories(): Promise<GitHubRepository[]> {
    const token = this.configService.get<string>('GITHUB_TOKEN');
    
    if (!token) {
      throw new HttpException(
        'GitHub token not configured',
        HttpStatus.UNAUTHORIZED,
      );
    }

    try {
      let allRepositories: GitHubRepository[] = [];
      let page = 1;
      const perPage = 100; // GitHub API最大值

      while (true) {
        const response = await firstValueFrom(
          this.httpService.get(`${this.baseUrl}/user/repos`, {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: 'application/vnd.github.v3+json',
            },
            params: {
              page,
              per_page: perPage,
              sort: 'updated',
              direction: 'desc',
            },
          }),
        );

        const repositories = response.data;
        
        if (repositories.length === 0) {
          break; // 没有更多数据了
        }

        allRepositories = [...allRepositories, ...repositories];
        
        // 如果返回的数据少于每页数量，说明是最后一页
        if (repositories.length < perPage) {
          break;
        }

        page++;
      }

      return allRepositories;
    } catch (error) {
      throw new HttpException(
        `Failed to fetch repositories: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}