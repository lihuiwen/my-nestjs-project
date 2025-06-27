// src/database/database.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaReadWriteService } from './prisma-read-write.service';
import { User, Post, Prisma } from '@prisma/client';

@Injectable()
export class DatabaseService {
  constructor(private readonly prisma: PrismaReadWriteService) {}

  // 用户相关操作
  async createUser(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.write.user.create({
      data,
    });
  }

  async findAllUsers(): Promise<User[]> {
    return this.prisma.read.user.findMany({
      include: {
        posts: true,
      },
    });
  }

  async findUserById(id: number): Promise<User | null> {
    return this.prisma.read.user.findUnique({
      where: { id },
      include: {
        posts: true,
      },
    });
  }

  // 批量创建用户和帖子
  async createUsersWithPosts(userData: {
    name: string;
    email: string;
    posts: { title: string; content: string; published?: boolean }[];
  }[]): Promise<User[]> {
    const results: User[] = [];

    for (const user of userData) {
      const createdUser = await this.prisma.write.user.create({
        data: {
          name: user.name,
          email: user.email,
          posts: {
            create: user.posts,
          },
        },
        include: {
          posts: true,
        },
      });
      results.push(createdUser);
    }

    return results;
  }

  // 为特定用户批量创建帖子
  async createPostsForUser(
    userId: number,
    posts: { title: string; content: string; published?: boolean }[],
  ): Promise<Post[]> {
    const results: Post[] = [];

    for (const post of posts) {
      const createdPost = await this.prisma.write.post.create({
        data: {
          ...post,
          authorId: userId,
        },
      });
      results.push(createdPost);
    }

    return results;
  }

  // 帖子相关操作
  async createPost(data: Prisma.PostCreateInput): Promise<Post> {
    return this.prisma.write.post.create({
      data,
      include: {
        author: true,
      },
    });
  }

  async findAllPosts(): Promise<Post[]> {
    return this.prisma.read.post.findMany({
      include: {
        author: true,
      },
    });
  }

  async deletePost(id: number): Promise<Post> {
    return this.prisma.write.post.delete({
      where: { id },
    });
  }
}