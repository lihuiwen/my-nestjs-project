// src/database/database.controller.ts
import { 
  Controller, 
  Get, 
  Post, 
  Delete, 
  Body, 
  Param, 
  ParseIntPipe 
} from '@nestjs/common';
import { DatabaseService } from './database.service';

@Controller('database')
export class DatabaseController {
  constructor(private readonly databaseService: DatabaseService) {}

  // ==================== 用户接口 ====================

  // 创建用户（基础版本）
  @Post('users')
  async createUser(@Body() userData: { name?: string; email: string }) {
    return this.databaseService.createUser(userData);
  }

  // 获取所有用户
  @Get('users')
  async getUsers() {
    return this.databaseService.findAllUsers();
  }

  // 创建用户同时创建多篇文章
  @Post('users-with-posts')
  async createUserWithPosts(@Body() userData: {
    name?: string;
    email: string;
    posts?: {
      title: string;
      content?: string;
      published?: boolean;
    }[];
  }) {
    return this.databaseService.createUserWithPosts(userData);
  }

  // 为现有用户批量添加文章
  @Post('users/:id/posts-batch')
  async addPostsToUser(
    @Param('id', ParseIntPipe) userId: number,
    @Body() postsData: {
      posts: {
        title: string;
        content?: string;
        published?: boolean;
      }[];
    }
  ) {
    return this.databaseService.addPostsToExistingUser(userId, postsData.posts);
  }

  // ==================== 文章接口 ====================

  // 创建文章
  @Post('posts')
  async createPost(@Body() postData: { 
    title: string; 
    content?: string; 
    authorId: number;
    published?: boolean;
  }) {
    return this.databaseService.createPost({
      title: postData.title,
      content: postData.content,
      published: postData.published || false,
      author: {
        connect: { id: postData.authorId }
      }
    });
  }

  // 获取所有文章
  @Get('posts')
  async getPosts() {
    return this.databaseService.findAllPosts();
  }

  // 删除文章
  @Delete('posts/:id')
  async deletePost(@Param('id', ParseIntPipe) id: number) {
    return this.databaseService.deletePost(id);
  }
}