// src/database/database.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaReadWriteService } from './prisma-read-write.service';
import { User, Post, Prisma } from '@prisma/client';

@Injectable()
export class DatabaseService {
  constructor(private prisma: PrismaReadWriteService) { }

  // ==================== 用户相关操作 ====================

  // 创建用户 - 写操作
  async createUser(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.write.user.create({
      data,
    });
  }

  // 获取所有用户 - 读操作
  async findAllUsers(): Promise<User[]> {
    return this.prisma.read.user.findMany({
      include: {
        posts: true, // 包含用户的文章
      },
    });
  }

  // 创建用户同时创建多篇文章 - 写操作
  async createUserWithPosts(data: {
    name?: string;
    email: string;
    posts?: {
      title: string;
      content?: string;
      published?: boolean;
    }[];
  }): Promise<User & { posts: Post[] }> {
    return this.prisma.write.user.create({
      data: {
        name: data.name,
        email: data.email,
        posts: {
          create: data.posts || [], // 如果没有提供文章，创建空数组
        },
      },
      include: {
        posts: true, // 返回结果中包含创建的文章
      },
    });
  }

  // ==================== 文章相关操作 ====================

  // 创建文章 - 写操作
  async createPost(data: Prisma.PostCreateInput): Promise<Post> {
    return this.prisma.write.post.create({
      data,
      include: {
        author: true,
      },
    });
  }

  // 为现有用户批量添加文章 - 写操作
  async addPostsToExistingUser(userId: number, posts: {
    title: string;
    content?: string;
    published?: boolean;
  }[]): Promise<User & { posts: Post[] }> {
    return this.prisma.write.user.update({
      where: { id: userId },
      data: {
        posts: {
          create: posts,
        },
      },
      include: {
        posts: true,
      },
    });
  }

  // 获取所有文章 - 读操作
  async findAllPosts(): Promise<Post[]> {
    return this.prisma.read.post.findMany({
      include: {
        author: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // 删除文章 - 写操作
  async deletePost(id: number): Promise<Post> {
    return this.prisma.write.post.delete({
      where: { id },
      include: {
        author: true,
      },
    });
  }
}