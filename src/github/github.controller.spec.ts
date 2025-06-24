// src/github/github.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { GithubController } from './github.controller';
import { GithubService } from './github.service';

describe('GithubController', () => {
  let controller: GithubController;
  let service: GithubService;

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
      controllers: [GithubController],
      providers: [
        {
          provide: GithubService,
          useValue: {
            getUserRepositories: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<GithubController>(GithubController);
    service = module.get<GithubService>(GithubService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getUserRepositories', () => {
    it('should return an array of repositories', async () => {
      // Arrange
      jest.spyOn(service, 'getUserRepositories').mockResolvedValue(mockRepositories);

      // Act
      const result = await controller.getUserRepositories();

      // Assert
      expect(result).toEqual(mockRepositories);
      expect(service.getUserRepositories).toHaveBeenCalledTimes(1);
      expect(service.getUserRepositories).toHaveBeenCalledWith();
    });

    it('should return empty array when no repositories found', async () => {
      // Arrange
      jest.spyOn(service, 'getUserRepositories').mockResolvedValue([]);

      // Act
      const result = await controller.getUserRepositories();

      // Assert
      expect(result).toEqual([]);
      expect(service.getUserRepositories).toHaveBeenCalledTimes(1);
    });

    it('should throw HttpException when service throws unauthorized error', async () => {
      // Arrange
      const unauthorizedError = new HttpException(
        'GitHub token not configured',
        HttpStatus.UNAUTHORIZED
      );
      jest.spyOn(service, 'getUserRepositories').mockRejectedValue(unauthorizedError);

      // Act & Assert
      await expect(controller.getUserRepositories()).rejects.toThrow(unauthorizedError);
      expect(service.getUserRepositories).toHaveBeenCalledTimes(1);
    });

    it('should throw HttpException when service throws bad request error', async () => {
      // Arrange
      const badRequestError = new HttpException(
        'Failed to fetch repositories: API rate limit exceeded',
        HttpStatus.BAD_REQUEST
      );
      jest.spyOn(service, 'getUserRepositories').mockRejectedValue(badRequestError);

      // Act & Assert
      await expect(controller.getUserRepositories()).rejects.toThrow(badRequestError);
      expect(service.getUserRepositories).toHaveBeenCalledTimes(1);
    });

    it('should handle unexpected errors', async () => {
      // Arrange
      const unexpectedError = new Error('Unexpected error occurred');
      jest.spyOn(service, 'getUserRepositories').mockRejectedValue(unexpectedError);

      // Act & Assert
      await expect(controller.getUserRepositories()).rejects.toThrow(unexpectedError);
      expect(service.getUserRepositories).toHaveBeenCalledTimes(1);
    });

    it('should return repositories with correct structure', async () => {
      // Arrange
      jest.spyOn(service, 'getUserRepositories').mockResolvedValue(mockRepositories);

      // Act
      const result = await controller.getUserRepositories();

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        id: expect.any(Number),
        name: expect.any(String),
        full_name: expect.any(String),
        description: expect.any(String),
        private: expect.any(Boolean),
        html_url: expect.any(String),
        language: expect.any(String),
        stargazers_count: expect.any(Number),
        forks_count: expect.any(Number),
      });
    });

    it('should handle repositories with null values', async () => {
      // Arrange
      const reposWithNulls = [
        {
          ...mockRepositories[0],
          description: null,
          language: null,
        },
      ];
      jest.spyOn(service, 'getUserRepositories').mockResolvedValue(reposWithNulls);

      // Act
      const result = await controller.getUserRepositories();

      // Assert
      expect(result).toEqual(reposWithNulls);
      expect(result[0].description).toBeNull();
      expect(result[0].language).toBeNull();
    });
  });
});