import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { BlogService } from './blog.service';
import { UploadsService } from '../uploads/uploads.service';
import { CreateBlogPostDto } from './dto/create-blog-post.dto';
import { UpdateBlogPostDto } from './dto/update-blog-post.dto';

@Controller('blog')
export class BlogController {
  constructor(
    private readonly blogService: BlogService,
    private readonly uploadsService: UploadsService,
  ) {}

  // ══════════════════════════════════════════════════════════════
  // PUBLIC ENDPOINTS (no auth)
  // ══════════════════════════════════════════════════════════════

  @Get()
  findPublished(
    @Query('category') category?: string,
    @Query('tag') tag?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.blogService.findPublished({
      category,
      tag,
      search,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? Math.min(parseInt(limit, 10), 50) : undefined,
    });
  }

  @Get('categories')
  getCategories() {
    return this.blogService.getCategories();
  }

  @Get('tags')
  getTags() {
    return this.blogService.getTags();
  }

  @Get('sitemap')
  getSitemap() {
    return this.blogService.getSitemapEntries();
  }

  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.blogService.findBySlug(slug);
  }

  @Get('slug/:slug/related')
  getRelated(@Param('slug') slug: string, @Query('limit') limit?: string) {
    return this.blogService.getRelated(slug, limit ? parseInt(limit, 10) : 3);
  }

  // ══════════════════════════════════════════════════════════════
  // ADMIN ENDPOINTS (admin only)
  // ══════════════════════════════════════════════════════════════

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  findAllAdmin(
    @Query('status') status?: string,
    @Query('category') category?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.blogService.findAllAdmin({
      status,
      category,
      search,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get('admin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  findOneAdmin(@Param('id') id: string) {
    return this.blogService.findOneAdmin(id);
  }

  @Post('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  create(@CurrentUser('id') userId: string, @Body() dto: CreateBlogPostDto) {
    return this.blogService.create(userId, dto);
  }

  @Patch('admin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  update(@Param('id') id: string, @Body() dto: UpdateBlogPostDto) {
    return this.blogService.update(id, dto);
  }

  @Delete('admin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.blogService.remove(id);
  }

  // ══════════════════════════════════════════════════════════════
  // IMAGE UPLOAD (admin only, with auto-optimization)
  // ══════════════════════════════════════════════════════════════

  @Post('admin/upload-image')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Throttle({ default: { ttl: 60_000, limit: 20 } })
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 10 * 1024 * 1024 } }))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file provided');
    return this.uploadsService.uploadBlogImage(file);
  }
}
