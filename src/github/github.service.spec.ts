// src/github/github.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { HttpException, HttpStatus } from '@nestjs/common';
import { GithubService } from './github.service';
import { of, throwError } from 'rxjs';

describe('GithubService', () => {
  let service: GithubService;
  let httpService: HttpService;
  let configService: ConfigService;

  // Mock数据
  const mockRepositories = [
    {
      id: 1,
      name: 'test-repo',
      full_name: 'user/test-repo',
      description: 'Test repository',
      private: false,
      html_url: 'https://github.com/user/test-repo',
      clone_url: 'https://github.com/user/test-repo.git',
      ssh_url: 'git@github.com:user/test-repo.git',
      language: 'TypeScript',
      stargazers_count: 10,
      forks_count: 2,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-06-01T00:00:00Z',
      pushed_at: '2024-06-01T00:00:00Z',
    },
    {
      id: 2,
      name: 'another-repo',
      full_name: 'user/another-repo',
      description: 'Another test repository',
      private: true,
      html_url: 'https://github.com/user/another-repo',
      clone_url: 'https://github.com/user/another-repo.git',
      ssh_url: 'git@github.com:user/another-repo.git',
      language: 'JavaScript',
      stargazers_count: 5,
      forks_count: 1,
      created_at: '2024-02-01T00:00:00Z',
      updated_at: '2024-05-01T00:00:00Z',
      pushed_at: '2024-05-01T00:00:00Z',
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GithubService,
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<GithubService>(GithubService);
    httpService = module.get<HttpService>(HttpService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getUserRepositories', () => {
    it('should return user repositories successfully', async () => {
      // Arrange
      const mockToken = 'ghp_test_token';
      jest.spyOn(configService, 'get').mockReturnValue(mockToken);
      jest.spyOn(httpService, 'get').mockReturnValue(
        of({
          data: mockRepositories,
          status: 200,
          statusText: 'OK',
          headers: {},
          config: {},
        } as any)
      );

      // Act
      const result = await service.getUserRepositories();

      // Assert
      expect(result).toEqual(mockRepositories);
      expect(configService.get).toHaveBeenCalledWith('GITHUB_TOKEN');
      expect(httpService.get).toHaveBeenCalledWith(
        'https://api.github.com/user/repos',
        {
          headers: {
            Authorization: `Bearer ${mockToken}`,
            Accept: 'application/vnd.github.v3+json',
          },
          params: {
            page: 1,
            per_page: 100,
            sort: 'updated',
            direction: 'desc',
          },
        }
      );
    });

    it('should handle pagination and return all repositories', async () => {
      // Arrange
      const mockToken = 'ghp_test_token';
      const firstPageRepos = new Array(100).fill(null).map((_, index) => ({
        ...mockRepositories[0],
        id: index + 1,
        name: `repo-${index + 1}`,
      }));
      const secondPageRepos = [mockRepositories[1]];

      jest.spyOn(configService, 'get').mockReturnValue(mockToken);
      jest.spyOn(httpService, 'get')
        .mockReturnValueOnce(
          of({
            data: firstPageRepos,
            status: 200,
            statusText: 'OK',
            headers: {},
            config: {},
          } as any)
        )
        .mockReturnValueOnce(
          of({
            data: secondPageRepos,
            status: 200,
            statusText: 'OK',
            headers: {},
            config: {},
          } as any)
        );

      // Act
      const result = await service.getUserRepositories();

      // Assert
      expect(result).toHaveLength(101);
      expect(httpService.get).toHaveBeenCalledTimes(2);
      expect(httpService.get).toHaveBeenNthCalledWith(1, 
        'https://api.github.com/user/repos',
        expect.objectContaining({
          params: expect.objectContaining({ page: 1 })
        })
      );
      expect(httpService.get).toHaveBeenNthCalledWith(2,
        'https://api.github.com/user/repos',
        expect.objectContaining({
          params: expect.objectContaining({ page: 2 })
        })
      );
    });

    it('should throw HttpException when GitHub token is not configured', async () => {
      // Arrange
      jest.spyOn(configService, 'get').mockReturnValue(undefined);

      // Act & Assert
      await expect(service.getUserRepositories()).rejects.toThrow(
        new HttpException(
          'GitHub token not configured',
          HttpStatus.UNAUTHORIZED
        )
      );
      expect(httpService.get).not.toHaveBeenCalled();
    });

    it('should throw HttpException when API request fails', async () => {
      // Arrange
      const mockToken = 'ghp_test_token';
      const errorMessage = 'API rate limit exceeded';
      jest.spyOn(configService, 'get').mockReturnValue(mockToken);
      jest.spyOn(httpService, 'get').mockReturnValue(
        throwError(() => new Error(errorMessage))
      );

      // Act & Assert
      await expect(service.getUserRepositories()).rejects.toThrow(
        new HttpException(
          `Failed to fetch repositories: ${errorMessage}`,
          HttpStatus.BAD_REQUEST
        )
      );
    });

    it('should handle empty response from GitHub API', async () => {
      // Arrange
      const mockToken = 'ghp_test_token';
      jest.spyOn(configService, 'get').mockReturnValue(mockToken);
      jest.spyOn(httpService, 'get').mockReturnValue(
        of({
          data: [],
          status: 200,
          statusText: 'OK',
          headers: {},
          config: {},
        } as any)
      );

      // Act
      const result = await service.getUserRepositories();

      // Assert
      expect(result).toEqual([]);
      expect(httpService.get).toHaveBeenCalledTimes(1);
    });

    it('should handle GitHub API authentication error', async () => {
      // Arrange
      const mockToken = 'invalid_token';
      jest.spyOn(configService, 'get').mockReturnValue(mockToken);
      jest.spyOn(httpService, 'get').mockReturnValue(
        throwError(() => ({
          response: {
            status: 401,
            data: { message: 'Bad credentials' }
          }
        }))
      );

      // Act & Assert
      await expect(service.getUserRepositories()).rejects.toThrow(HttpException);
    });
  });
});